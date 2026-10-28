import { useCallback, useEffect, useState } from "react";
import { art } from "../../lib/assets.js";
import { sfxConfirm, sfxJumpscare, sfxTick } from "../../audio/sound.js";

const BEST_KEY = "fnaf_mg_goldenstare_best";

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

const faceDelay = (streak) => Math.round(900 + Math.random() * 1700 - streak * 80);
const reactionWindow = (streak) => Math.max(450, 1350 - streak * 60);

export default function GoldenStare({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState(
    "Golden Freddy only appears when you stop looking. Look away the moment he flickers."
  );
  const [best, setBest] = useState(readBest);
  const reduced = prefersReducedMotion();

  const start = useCallback(() => {
    setStreak(0);
    setPhase("waiting");
    setMessage("The room dims. Do not look at the corner... wait for the flicker.");
    setBest(readBest());
  }, []);

  const lookAway = useCallback(() => {
    if (phase === "idle" || phase === "lost") {
      start();
      return;
    }
    if (phase === "waiting") {
      setMessage("Too soon — you kept staring into the dark.");
      setPhase("lost");
      return;
    }
    // phase === "face": the reaction lands.
    sfxConfirm();
    const next = streak + 1;
    setMessage(`You looked away in time. Streak: ${next}. He is getting closer.`);
    setStreak(next);
    setPhase("waiting");
  }, [phase, streak, start]);

  /* Waiting → the face flickers in after a delay that shrinks with the streak. */
  useEffect(() => {
    if (phase !== "waiting") return undefined;
    const id = window.setTimeout(() => setPhase("face"), Math.max(550, faceDelay(streak)));
    return () => window.clearTimeout(id);
  }, [phase, streak]);

  /* Face → the reaction window shrinks; letting it close is a jumpscare. */
  useEffect(() => {
    if (phase !== "face") return undefined;
    const id = window.setTimeout(() => {
      sfxTick();
      setPhase("lost");
    }, reactionWindow(streak));
    return () => window.clearTimeout(id);
  }, [phase, streak]);

  useEffect(() => {
    if (phase !== "lost") return;
    sfxJumpscare();
    setBest((current) => {
      const next = Math.max(current, streak);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, streak]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space") return;
      // A focused button handles Space itself; avoid double-firing the look-away.
      if (event.target?.tagName === "BUTTON") return;
      event.preventDefault();
      lookAway();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lookAway]);

  const dimming = phase === "waiting" || phase === "face";

  return (
    <section className="mg-shell" aria-labelledby="golden-stare-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FNAF 4 · Empty room protocol</span>
          <h2 id="golden-stare-title">Golden Freddy Stare</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div
        className={`mg-stage gs-stage ${dimming ? "is-dim" : ""}`}
        style={{ "--mg-backdrop": `url("${art("game-fnaf-4")}")` }}
      >
        <div className="gs-hud">
          <span>STREAK {streak}</span>
          <span>BEST {best || "—"}</span>
          <span>{phase === "face" ? "NOW!" : dimming ? "DARK" : "—"}</span>
        </div>

        <div
          className="gs-field"
          role="img"
          aria-label={`Golden Freddy stare field. Current streak ${streak}, best ${best}.`}
        >
          {dimming && <span className="gs-veil" aria-hidden="true" />}
          {phase === "face" && (
            <>
              <img
                className={`gs-face ${reduced ? "gs-face--steady" : "gs-face--flicker"}`}
                src={art("jumpscare-golden-freddy")}
                alt=""
              />
              {!reduced && (
                <span
                  className="gs-window"
                  style={{ "--gs-window": `${reactionWindow(streak)}ms` }}
                  aria-hidden="true"
                />
              )}
            </>
          )}
          {phase === "waiting" && (
            <span className="gs-wait" aria-hidden="true">
              · · ·
            </span>
          )}
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Don&apos;t stare</span>
            <p>
              The room dims, and somewhere in the dark a face flickers in. Hit{" "}
              <strong>SPACE</strong> (or LOOK AWAY) within the shrinking window. Look away
              too early and you were staring after all. One missed flicker and he fills
              the screen.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Sit in the dark
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="mg-overlay gs-overlay-lost">
            <img
              className={`gs-jump ${reduced ? "" : "gs-jump--shake"}`}
              src={art("jumpscare-golden-freddy")}
              alt=""
            />
            <span className="mg-overlay-kicker">IT&apos;S ME</span>
            <p>
              {message} Streak survived: {streak}. Best: {best}.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Look again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls">
        <button
          type="button"
          className="mg-action gs-action"
          onClick={lookAway}
          disabled={phase === "lost"}
        >
          <span>LOOK AWAY</span>
          <kbd>SPACE</kbd>
        </button>
        <p className="mg-hint" aria-live="polite">
          {message}
        </p>
      </div>
    </section>
  );
}
