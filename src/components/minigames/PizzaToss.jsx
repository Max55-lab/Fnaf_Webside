import { useCallback, useEffect, useRef, useState } from "react";
import { art } from "../../lib/assets.js";
import { sfxConfirm, sfxTick, sfxVictory } from "../../audio/sound.js";

const BEST_KEY = "fnaf_mg_pizzatoss_best";
const TOSS_COUNT = 10;
const WIN_SCORE = 250;
const TICK_MS = 40;
const BULLSEYE = { min: 64, max: 70, points: 50 };
const RING = { min: 60, max: 74, points: 20 };

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const newRun = () => ({
  power: 0,
  powerDir: 1,
  targetX: 50,
  targetDir: 1,
  tosses: 0,
  score: 0,
});

/* One simulation step: power meter and cupcake target both sweep back and forth. */
const stepRun = (prev) => {
  const powerStep = Math.min(4, 2.6 + prev.tosses * 0.12);
  let power = prev.power + prev.powerDir * powerStep;
  let powerDir = prev.powerDir;
  if (power >= 98) {
    power = 98;
    powerDir = -1;
  } else if (power <= 2) {
    power = 2;
    powerDir = 1;
  }
  const targetStep = Math.min(1.8, 0.9 + prev.tosses * 0.08);
  let targetX = prev.targetX + prev.targetDir * targetStep;
  let targetDir = prev.targetDir;
  if (targetX >= 92) {
    targetX = 92;
    targetDir = -1;
  } else if (targetX <= 8) {
    targetX = 8;
    targetDir = 1;
  }
  return { ...prev, power, powerDir, targetX, targetDir };
};

const judgeToss = (power) => {
  if (power >= BULLSEYE.min && power <= BULLSEYE.max) {
    return { points: BULLSEYE.points, label: "BULLSEYE" };
  }
  if (power >= RING.min && power <= RING.max) {
    return { points: RING.points, label: "RING" };
  }
  return { points: 0, label: "MISS" };
};

export default function PizzaToss({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [run, setRun] = useState(newRun);
  const [flight, setFlight] = useState(null);
  const [message, setMessage] = useState(
    "Land the pizza in the ring when the power meter hits the hot zone."
  );
  const [best, setBest] = useState(readBest);
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);
  const finalTimer = useRef(null);
  const reduced = prefersReducedMotion();

  const clearFinalTimer = () => {
    if (finalTimer.current) {
      window.clearTimeout(finalTimer.current);
      finalTimer.current = null;
    }
  };

  const start = useCallback(() => {
    clearFinalTimer();
    setRun(newRun());
    setFlight(null);
    setPhase("playing");
    setMessage("Ten tosses. Watch the meter — release in the hot zone.");
    setBest(readBest());
  }, []);

  const toss = useCallback(() => {
    if (phase !== "playing") return;
    const current = runRef.current;
    if (current.tosses >= TOSS_COUNT) return;
    const { points, label } = judgeToss(current.power);
    const tosses = current.tosses + 1;
    const score = current.score + points;

    if (label === "BULLSEYE") sfxConfirm();
    else sfxTick();

    setRun({ ...current, tosses, score });
    setFlight({ id: tosses, x: current.targetX, label });
    setMessage(
      points > 0
        ? `${label} — ${points} points. Toss ${tosses}/${TOSS_COUNT}.`
        : `Miss — the pizza hits the floor. Toss ${tosses}/${TOSS_COUNT}.`
    );

    if (tosses >= TOSS_COUNT) {
      clearFinalTimer();
      finalTimer.current = window.setTimeout(() => {
        if (score >= WIN_SCORE) {
          sfxVictory();
          setPhase("won");
        } else {
          setPhase("over");
        }
      }, 750);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const id = window.setInterval(() => setRun(stepRun), TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "won" && phase !== "over") return;
    setBest((current) => {
      const next = Math.max(current, run.score);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, run.score]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space") return;
      // A focused button handles Space itself; avoid double-firing the toss.
      if (event.target?.tagName === "BUTTON") return;
      if (phase !== "playing") return;
      event.preventDefault();
      toss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearFinalTimer();
    };
  }, [toss, phase]);

  return (
    <section className="mg-shell" aria-labelledby="pizza-toss-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FFPS · Kitchen duty</span>
          <h2 id="pizza-toss-title">Pizza Toss</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div
        className="mg-stage ptz-stage"
        style={{ "--mg-backdrop": `url("${art("game-ffps")}")` }}
      >
        <div className="ptz-hud">
          <span>
            TOSS {Math.min(run.tosses + 1, TOSS_COUNT)}/{TOSS_COUNT}
          </span>
          <span>SCORE {run.score}</span>
          <span>BEST {best || "—"}</span>
        </div>

        <div
          className="ptz-field"
          role="img"
          aria-label={`Pizza toss field. Score ${run.score} points, toss ${Math.min(run.tosses + 1, TOSS_COUNT)} of ${TOSS_COUNT}.`}
        >
          <span className="ptz-target" style={{ "--ptz-x": run.targetX }} aria-hidden="true">
            <span className="ptz-ring" />
            <span className="ptz-ring ptz-ring--inner" />
            <img className="ptz-cupcake" src={art("cupcake")} alt="" />
          </span>
          {flight && (
            <span
              key={flight.id}
              className={`ptz-pizza ${reduced ? "ptz-pizza--static" : ""}`}
              style={{ "--ptz-x": flight.x }}
              aria-hidden="true"
            >
              🍕
            </span>
          )}
          <div className="ptz-power" aria-hidden="true">
            <span className="ptz-power-hot" />
            <span className="ptz-power-bull" />
            <span className="ptz-power-needle" style={{ left: `${run.power}%` }} />
          </div>
          <span className="ptz-power-label" aria-hidden="true">
            POWER {Math.round(run.power)}
          </span>
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Order up</span>
            <p>
              Ten tosses, one moving cupcake target, and a power meter that never sits
              still. Press <strong>SPACE</strong> (or TOSS) in the hot zone: bullseye 50,
              ring 20, everything else is floor pizza. Hit 250 to clear the rush.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Start the rush
            </button>
          </div>
        )}
        {phase === "won" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Kitchen cleared</span>
            <p>
              {run.score} points from ten tosses. Every order made it to a box. Best
              rush: {best}.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Another rush
            </button>
          </div>
        )}
        {phase === "over" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Shift over</span>
            <p>
              {run.score} points — not enough for {WIN_SCORE}. Watch the needle, not the
              cupcake. Best rush: {best}.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Try the rush again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls">
        <button
          type="button"
          className="mg-action ptz-action"
          onClick={toss}
          disabled={phase !== "playing"}
        >
          <span>TOSS</span>
          <kbd>SPACE</kbd>
        </button>
        <p className="mg-hint" aria-live="polite">
          {message}
        </p>
      </div>
    </section>
  );
}
