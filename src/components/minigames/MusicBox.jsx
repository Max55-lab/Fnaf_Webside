import { useCallback, useEffect, useRef, useState } from "react";
import { art } from "../../lib/assets.js";
import { sfxConfirm, sfxJumpscare, sfxTick } from "../../audio/sound.js";

const BEST_KEY = "fnaf_mg_musicbox_best";
const TICK_MS = 50;
const START_GAUGE = 60;
const GAIN_PER_WIND = 20;
const MISS_PENALTY = 9;

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
  marker: 0,
  dir: 1,
  gauge: START_GAUGE,
  winds: 0,
  zoneStart: 34,
  zoneWidth: 18,
});

/* One simulation step: the marker sweeps, the box drains a little faster every wind. */
const stepRun = (prev) => {
  const stepSize = Math.min(3.4, 1.1 + prev.winds * 0.09);
  let marker = prev.marker + prev.dir * stepSize;
  let dir = prev.dir;
  if (marker >= 100) {
    marker = 100;
    dir = -1;
  } else if (marker <= 0) {
    marker = 0;
    dir = 1;
  }
  const drain = 0.2 + Math.min(0.4, prev.winds * 0.02);
  return { ...prev, marker, dir, gauge: Math.max(0, prev.gauge - drain) };
};

export default function MusicBox({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [run, setRun] = useState(newRun);
  const [message, setMessage] = useState(
    "Keep the melody alive: wind inside the safe zone before the box runs dry."
  );
  const [best, setBest] = useState(readBest);
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);
  const reduced = prefersReducedMotion();

  const start = useCallback(() => {
    setRun(newRun());
    setPhase("playing");
    setMessage("The box is winding down. Wait for the green zone, then wind.");
    setBest(readBest());
  }, []);

  const wind = useCallback(() => {
    if (phase !== "playing") return;
    const current = runRef.current;
    const inZone =
      current.marker >= current.zoneStart &&
      current.marker <= current.zoneStart + current.zoneWidth;
    if (inZone) {
      sfxConfirm();
      const winds = current.winds + 1;
      const zoneWidth = Math.max(9, 18 - winds * 0.5);
      const zoneStart = 3 + Math.random() * (94 - zoneWidth);
      setRun({
        ...current,
        winds,
        gauge: Math.min(100, current.gauge + GAIN_PER_WIND),
        zoneStart,
        zoneWidth,
      });
      setMessage(`Wound it — ${winds} wind${winds === 1 ? "" : "s"}. The tune plays on.`);
    } else {
      sfxTick();
      setRun({ ...current, gauge: Math.max(0, current.gauge - MISS_PENALTY) });
      setMessage("Missed the zone — the melody stumbles.");
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const id = window.setInterval(() => setRun(stepRun), TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && run.gauge <= 0) {
      sfxJumpscare();
      setPhase("lost");
      setMessage(`The music box stopped after ${run.winds} winds. He is here.`);
    }
  }, [phase, run.gauge, run.winds]);

  useEffect(() => {
    if (phase !== "lost") return;
    setBest((current) => {
      const next = Math.max(current, run.winds);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, run.winds]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space") return;
      // A focused button handles Space itself; avoid double-firing the wind.
      if (event.target?.tagName === "BUTTON") return;
      if (phase !== "playing") return;
      event.preventDefault();
      wind();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wind, phase]);

  const gauge = Math.round(run.gauge);

  return (
    <section className="mg-shell" aria-labelledby="music-box-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FNAF 3 · Prize Corner protocol</span>
          <h2 id="music-box-title">Wind the Music Box</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div
        className="mg-stage mb-stage"
        style={{ "--mg-backdrop": `url("${art("game-fnaf-3")}")` }}
      >
        <div className="mb-hud">
          <span>WINDS {run.winds}</span>
          <span>BOX {gauge}%</span>
          <span>BEST {best || "—"}</span>
        </div>

        <div
          className="mb-field"
          role="img"
          aria-label={`Music box wind gauge at ${gauge} percent, ${run.winds} winds completed.`}
        >
          <div className="mb-bar">
            <span
              className="mb-zone"
              style={{ left: `${run.zoneStart}%`, width: `${run.zoneWidth}%` }}
              aria-hidden="true"
            />
            <span className="mb-marker" style={{ left: `${run.marker}%` }} aria-hidden="true" />
          </div>
          <div className="mb-gauge" aria-hidden="true">
            <span
              className={`mb-gauge-fill ${gauge < 25 ? "is-low" : ""}`}
              style={{ width: `${gauge}%` }}
            />
          </div>
          <span className="mb-gauge-label" aria-hidden="true">
            MUSIC BOX {gauge}%
          </span>
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Prize Corner</span>
            <p>
              The melody keeps him in his corner. Wind the box with <strong>SPACE</strong>{" "}
              (or the WIND button) while the marker is inside the green zone. Every wind
              moves the zone and quickens the tempo — one dry box and the Puppet comes.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Start winding
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="mg-overlay">
            <img
              className={`mb-puppet ${reduced ? "" : "mb-puppet--flicker"}`}
              src={art("jumpscare-the-puppet")}
              alt=""
            />
            <span className="mg-overlay-kicker">THE MUSIC BOX STOPPED</span>
            <p>
              {message} Best run: {best} winds. The trick is patience — wind only inside
              the zone.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Wind it again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls">
        <button
          type="button"
          className="mg-action mb-action"
          onClick={wind}
          disabled={phase !== "playing"}
        >
          <span>WIND</span>
          <kbd>SPACE</kbd>
        </button>
        <p className="mg-hint" aria-live="polite">
          {message}
        </p>
      </div>
    </section>
  );
}
