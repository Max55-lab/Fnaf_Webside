import { useCallback, useEffect, useRef, useState } from "react";
import { art } from "../../lib/assets.js";

const BEST_KEY = "fnaf_mg_plushtrap_best";
const TARGET_SCORE = 3;

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export default function Plushtrap({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [position, setPosition] = useState(0);
  const [target, setTarget] = useState(2);
  const [score, setScore] = useState(0);
  const [fails, setFails] = useState(0);
  const [flash, setFlash] = useState(false);
  const [best, setBest] = useState(readBest);
  const flashTimer = useRef(null);

  const speed = Math.max(620, 1500 - score * 260);

  const start = useCallback(() => {
    setPhase("playing");
    setPosition(0);
    setTarget(1 + Math.floor(Math.random() * 3));
    setScore(0);
    setFails(0);
    setBest(readBest());
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setPosition((p) => Math.min(4, p + 1));
    }, speed);
    return () => window.clearInterval(id);
  }, [phase, speed]);

  useEffect(() => {
    if (phase === "playing" && position >= 4) setPhase("lost");
  }, [phase, position]);

  useEffect(() => {
    if (phase !== "won") return;
    setBest((current) => {
      const next = Math.max(current, score);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Private mode can refuse storage. The game still works.
      }
      return next;
    });
  }, [phase, score]);

  const flashNow = useCallback(() => {
    if (phase !== "playing") return;
    setFlash(true);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 320);

    if (position === target) {
      if (score + 1 >= TARGET_SCORE) {
        setScore(score + 1);
        setPhase("won");
      } else {
        setScore(score + 1);
        setPosition(0);
        setTarget(1 + Math.floor(Math.random() * 3));
        setFails(0);
      }
    } else {
      const next = fails + 1;
      setFails(next);
      if (next >= 2) setPhase("lost");
    }
  }, [phase, position, target, score, fails]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        flashNow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, [flashNow]);

  return (
    <section className="mg-shell" aria-labelledby="plushtrap-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FNAF 4 · Nightmare minigame</span>
          <h2 id="plushtrap-title">Plushtrap&apos;s Flashlight</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div
        className={`mg-stage pt-stage ${flash ? "is-flashing" : ""} ${phase === "lost" ? "is-lost" : ""}`}
        style={{ "--mg-backdrop": `url("${art("game-fnaf-4")}")` }}
      >
        <div className="pt-hall" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((spot) => (
            <span key={spot} className={`pt-spot ${spot === target ? "is-target" : ""}`}>
              {spot === target ? "X" : spot === 0 ? "START" : spot === 4 ? "YOU" : ""}
            </span>
          ))}
          <img
            className={`pt-plush ${phase === "lost" ? "pt-plush-attack" : ""}`}
            src={art("plushtrap")}
            alt=""
            style={{ "--pt-left": `${position * 20 + 10}%` }}
          />
        </div>
        {flash && <span className="pt-cone" aria-hidden="true" />}
        <div className="pt-hud">
          <span>ROUND {Math.min(score + 1, TARGET_SCORE)}/{TARGET_SCORE}</span>
          <span>MISSES {fails}/2</span>
          <span>BEST {best}</span>
        </div>
        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Toy box protocol</span>
            <p>
              Plushtrap advances in the dark. Flash when he is standing on the glowing
              <strong> X</strong>. Three correct flashes win. Two misses and he reaches you.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Start the game
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">He reached the door</span>
            <p>Plushtrap wins. The trick is patience: wait for the X, then flash.</p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Try again
            </button>
          </div>
        )}
        {phase === "won" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">6 AM bonus unlocked</span>
            <p>Three clean flashes. You bought yourself a little more time.</p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Play again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls">
        <button
          type="button"
          className="mg-action"
          onClick={flashNow}
          disabled={phase !== "playing"}
        >
          <span>FLASH</span>
          <kbd>SPACE</kbd>
        </button>
        <p className="mg-hint" aria-live="polite">
          {phase === "playing"
            ? position === target
              ? "NOW — he is on the X."
              : "Wait for the X. Do not waste the flashlight."
            : "Click start, then use the flashlight or the space bar."}
        </p>
      </div>
    </section>
  );
}
