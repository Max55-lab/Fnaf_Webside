import { useCallback, useEffect, useState } from "react";
import { art } from "../../lib/assets.js";
import { useSecrets } from "../../secrets/SecretsProvider.jsx";

const MAP = [
  "#########",
  "#S..C...#",
  "#.#####.#",
  "#.#...#.#",
  "#.#.#.#.#",
  "#...#...#",
  "#.#####.#",
  "#C..C..E#",
  "#########",
];

const CAKE_COUNT = MAP.join("").split("C").length - 1;
const BEST_KEY = "fnaf_mg_shadowbonnie_best";

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export default function ShadowBonnie({ onClose }) {
  const { discover } = useSecrets();
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [collected, setCollected] = useState(() => new Set());
  const [steps, setSteps] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("Collect all three cakes, then reach the child.");
  const [best, setBest] = useState(readBest);

  const start = useCallback(() => {
    setPlayer({ x: 1, y: 1 });
    setCollected(new Set());
    setSteps(0);
    setPhase("playing");
    setMessage("Collect all three cakes, then reach the child.");
    setBest(readBest());
  }, []);

  const move = useCallback(
    (dx, dy) => {
      if (phase !== "playing") return;
      const x = player.x + dx;
      const y = player.y + dy;
      if (MAP[y]?.[x] === undefined || MAP[y][x] === "#") return;

      const tile = MAP[y][x];
      const key = `${x},${y}`;
      const nextCollected = new Set(collected);
      if (tile === "C" && !nextCollected.has(key)) {
        nextCollected.add(key);
        setCollected(nextCollected);
        setMessage(
          nextCollected.size === CAKE_COUNT
            ? "All cakes found. Bring them to the child."
            : `Cake found — ${nextCollected.size}/${CAKE_COUNT}.`
        );
      }

      setPlayer({ x, y });
      setSteps((s) => s + 1);

      if (tile === "E") {
        if (nextCollected.size === CAKE_COUNT) {
          setPhase("won");
          setMessage("The child takes the cake. The room goes quiet.");
        } else {
          setMessage(
            `The child is still crying. Find ${CAKE_COUNT - nextCollected.size} more cake${
              CAKE_COUNT - nextCollected.size === 1 ? "" : "s"
            }.`
          );
        }
      }
    },
    [phase, player, collected]
  );

  useEffect(() => {
    if (phase !== "won") return;
    // Bringing all three cakes to the child reveals the secret watcher.
    discover("shadow-bonnie");
    setBest((current) => {
      const next = current === 0 ? steps : Math.min(current, steps);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, steps, discover]);

  useEffect(() => {
    const onKey = (event) => {
      const keys = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      const dir = keys[event.key];
      if (!dir) return;
      event.preventDefault();
      move(dir[0], dir[1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <section className="mg-shell" aria-labelledby="shadow-bonnie-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FNAF 3 · Hidden minigame</span>
          <h2 id="shadow-bonnie-title">Shadow Bonnie&apos;s Cake Run</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div className="mg-stage sb-stage" style={{ "--mg-backdrop": `url("${art("game-fnaf-3")}")` }}>
        <div className="sb-hud">
          <span>
            CAKE {collected.size}/{CAKE_COUNT}
          </span>
          <span>STEPS {steps}</span>
          <span>BEST {best || "—"}</span>
        </div>

        <div className="sb-board" role="grid" aria-label="Shadow Bonnie maze">
          {MAP.map((row, y) =>
            row.split("").map((tile, x) => {
              const key = `${x},${y}`;
              const isPlayer = player.x === x && player.y === y;
              const isCake = tile === "C" && !collected.has(key);
              return (
                <div
                  key={key}
                  className={`sb-cell ${tile === "#" ? "is-wall" : ""} ${
                    tile === "E" ? "is-exit" : ""
                  } ${isPlayer ? "is-player" : ""}`}
                  role="gridcell"
                >
                  {isPlayer && (
                    <img className="sb-player-img" src={art("shadow-bonnie")} alt="" />
                  )}
                  {isCake && <span className="sb-cake">🍰</span>}
                  {tile === "E" && <span className="sb-child">🕯</span>}
                </div>
              );
            })
          )}
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">A glitch in the memory</span>
            <p>
              Guide Shadow Bonnie through the static, collect all three cakes and bring them
              to the crying child. Arrow keys, WASD, or the buttons below.
            </p>
            <button type="button" className="btn" onClick={start}>
              Enter the minigame
            </button>
          </div>
        )}
        {phase === "won" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Memory complete</span>
            <p>You reached the child in {steps} steps. Best route: {best}.</p>
            <button type="button" className="btn" onClick={start}>
              Run it again
            </button>
          </div>
        )}
      </div>

      <div className="mg-controls sb-controls">
        <div className="mg-dpad" aria-label="Movement controls">
          <button type="button" onClick={() => move(0, -1)} aria-label="Move up">↑</button>
          <button type="button" onClick={() => move(-1, 0)} aria-label="Move left">←</button>
          <button type="button" onClick={() => move(0, 1)} aria-label="Move down">↓</button>
          <button type="button" onClick={() => move(1, 0)} aria-label="Move right">→</button>
        </div>
        <p className="mg-hint" aria-live="polite">{message}</p>
      </div>
    </section>
  );
}
