import { useCallback, useEffect, useState } from "react";
import { art } from "../../lib/assets.js";
import { sfxJumpscare, sfxTick } from "../../audio/sound.js";

const BEST_KEY = "fnaf_mg_foxydash_best";
const TICK_MS = 60;
const START_SPEED = 1;
const MAX_SPEED = 2.8;
const SPEED_RAMP = 0.0035;
const FALL_FACTOR = 2.2;
const ZONE_TOP = 74;
const ZONE_BOTTOM = 92;
const COIN_BONUS = 25;

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
  lane: 1,
  distance: 0,
  speed: START_SPEED,
  tick: 0,
  coins: 0,
  entities: [],
  nextId: 1,
  caught: false,
});

/* One simulation step: entities fall, Foxy collects coins, barrels catch him. */
const stepRun = (prev) => {
  if (prev.caught) return prev;
  const speed = Math.min(MAX_SPEED, prev.speed + SPEED_RAMP);
  const tick = prev.tick + 1;
  let distance = prev.distance + speed;
  let coins = prev.coins;
  let caught = false;
  let nextId = prev.nextId;

  const entities = [];
  for (const entity of prev.entities) {
    const next = { ...entity, y: entity.y + speed * FALL_FACTOR };
    if (next.y > 118) continue;
    if (next.lane === prev.lane && next.y >= ZONE_TOP && next.y <= ZONE_BOTTOM) {
      if (next.kind === "barrel") {
        caught = true;
        continue;
      }
      if (next.kind === "coin") {
        coins += 1;
        distance += COIN_BONUS;
        continue;
      }
    }
    entities.push(next);
  }

  const gap = Math.max(14, Math.round(40 / speed));
  if (!caught && tick % gap === 0) {
    const lane = Math.floor(Math.random() * 3);
    const crowded = entities.some((e) => e.lane === lane && e.y < 16);
    if (!crowded) {
      entities.push({
        id: nextId,
        kind: Math.random() < 0.32 ? "coin" : "barrel",
        lane,
        y: -6,
      });
      nextId += 1;
    }
  }

  return { lane: prev.lane, distance, speed, tick, coins, entities, nextId, caught };
};

export default function FoxyDash({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [run, setRun] = useState(newRun);
  const [message, setMessage] = useState(
    "Stay in the clear: dodge the barrels and grab the coins."
  );
  const [best, setBest] = useState(readBest);

  const score = Math.floor(run.distance);
  const reduced = prefersReducedMotion();

  const start = useCallback(() => {
    setRun(newRun());
    setPhase("playing");
    setMessage("Foxy is running. Left/right to switch lanes — barrels hurt.");
    setBest(readBest());
  }, []);

  const moveLane = useCallback(
    (delta) => {
      if (phase !== "playing") return;
      const lane = Math.min(2, Math.max(0, run.lane + delta));
      if (lane === run.lane) return;
      sfxTick();
      setRun((prev) => (prev.caught || prev.lane === lane ? prev : { ...prev, lane }));
    },
    [phase, run.lane]
  );

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const id = window.setInterval(() => setRun(stepRun), TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && run.caught) {
      sfxJumpscare();
      setPhase("lost");
      setMessage(`Foxy caught you at ${Math.floor(run.distance)}m.`);
    }
  }, [phase, run.caught, run.distance]);

  useEffect(() => {
    if (phase !== "lost") return;
    setBest((current) => {
      const next = Math.max(current, score);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, score]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft" || event.key === "a") {
        event.preventDefault();
        moveLane(-1);
      } else if (event.key === "ArrowRight" || event.key === "d") {
        event.preventDefault();
        moveLane(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane]);

  return (
    <section className="mg-shell" aria-labelledby="foxy-dash-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FNAF 3 · Endless escape</span>
          <h2 id="foxy-dash-title">Foxy&apos;s Dock Dash</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div
        className={`mg-stage fd-stage ${phase === "lost" ? "is-caught" : ""} ${
          phase === "lost" && !reduced ? "is-shaking" : ""
        }`}
        style={{ "--mg-backdrop": `url("${art("game-fnaf-3")}")` }}
      >
        <div className="fd-hud">
          <span>DIST {score}m</span>
          <span>COINS {run.coins}</span>
          <span>BEST {best || "—"}</span>
        </div>

        <div
          className="fd-track"
          role="img"
          aria-label={`Foxy's lane. Distance ${score} meters, ${run.coins} coins collected.`}
        >
          <span className="fd-lines" aria-hidden="true" />
          {run.entities.map((entity) => (
            <span
              key={entity.id}
              className={`fd-token fd-token--${entity.kind}`}
              style={{ "--fd-lane": entity.lane, "--fd-y": entity.y }}
              aria-hidden="true"
            />
          ))}
          <span className="fd-foxy" style={{ "--fd-lane": run.lane, "--fd-y": 82 }} aria-hidden="true">
            <img src={art("jumpscare-foxy")} alt="" />
          </span>
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Pirate cove, after hours</span>
            <p>
              Foxy is sprinting down the dock and the harbor is full of barrels. Switch
              lanes with <strong>arrow keys / A·D</strong> or the buttons, grab coins for
              bonus distance, and do not get caught.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Start the run
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">CAUGHT</span>
            <p>
              {message} Best run: {best}m. Watch the spawn point — one lane is always
              left open.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Run again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls">
        <div className="fd-side">
          <button
            type="button"
            onClick={() => moveLane(-1)}
            disabled={phase !== "playing"}
            aria-label="Move one lane left"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => moveLane(1)}
            disabled={phase !== "playing"}
            aria-label="Move one lane right"
          >
            ▶
          </button>
        </div>
        <p className="mg-hint" aria-live="polite">
          {message}
        </p>
      </div>
    </section>
  );
}
