import { useCallback, useEffect, useState } from "react";
import { art } from "../../lib/assets.js";

const MAP = [
  "#########",
  "#S..F...#",
  "#.#####.#",
  "#.#...#.#",
  "#.#.#.#.#",
  "#F..#..F#",
  "#.#####.#",
  "#...F...#",
  "####E####",
];

const FRUIT_COUNT = MAP.join("").split("F").length - 1;
const BEST_KEY = "fnaf_mg_fruitymaze_best";
const FRUIT_ICONS = ["🍎", "🍓", "🍒", "🍊"];

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const stepToward = (from, to) => {
  const options = [];
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  if (dx) options.push([dx, 0]);
  if (dy) options.push([0, dy]);
  for (const [mx, my] of options) {
    if (MAP[from.y + my]?.[from.x + mx] !== "#") {
      return { x: from.x + mx, y: from.y + my };
    }
  }
  return from;
};

export default function FruityMaze({ onClose }) {
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [rabbit, setRabbit] = useState(null);
  const [fruit, setFruit] = useState(() => new Set());
  const [steps, setSteps] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("Collect every piece of fruit.");
  const [best, setBest] = useState(readBest);

  const start = useCallback(() => {
    setPlayer({ x: 1, y: 1 });
    setRabbit(null);
    setFruit(new Set());
    setSteps(0);
    setPhase("playing");
    setMessage("Collect every piece of fruit. Something is following the music.");
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
      const nextFruit = new Set(fruit);
      if (tile === "F" && !nextFruit.has(key)) {
        nextFruit.add(key);
        setFruit(nextFruit);
        setMessage(
          nextFruit.size === FRUIT_COUNT
            ? "The music changes. The yellow rabbit is behind you."
            : `Fruit collected — ${nextFruit.size}/${FRUIT_COUNT}.`
        );
      }

      let nextRabbit = rabbit;
      if (rabbit) {
        nextRabbit = stepToward(rabbit, { x, y });
      } else if (nextFruit.size === FRUIT_COUNT) {
        nextRabbit = { x: 7, y: 1 };
      }

      setPlayer({ x, y });
      setSteps((s) => s + 1);
      setRabbit(nextRabbit);

      if (nextRabbit && nextRabbit.x === x && nextRabbit.y === y) {
        setPhase("lost");
        setMessage("The yellow rabbit caught you.");
        return;
      }

      if (tile === "E") {
        if (nextFruit.size === FRUIT_COUNT) {
          setPhase("won");
          setMessage("You reach the exit with the fruit. The music stops.");
        } else {
          setMessage(`The exit is locked. ${FRUIT_COUNT - nextFruit.size} fruit still missing.`);
        }
      }
    },
    [phase, player, fruit, rabbit]
  );

  useEffect(() => {
    if (phase !== "won") return;
    setBest((current) => {
      const next = current === 0 ? steps : Math.min(current, steps);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
      return next;
    });
  }, [phase, steps]);

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
    <section className="mg-shell" aria-labelledby="fruity-title">
      <div className="mg-head">
        <div>
          <span className="mg-kicker">FFPS · Arcade minigame</span>
          <h2 id="fruity-title">Fruity Maze</h2>
        </div>
        <button type="button" className="mg-close" onClick={onClose} aria-label="Close minigame">
          ✕
        </button>
      </div>

      <div className="mg-stage fm-stage" style={{ "--mg-backdrop": `url("${art("fruity-maze-arcade")}")` }}>
        <div className="fm-hud">
          <span>
            FRUIT {fruit.size}/{FRUIT_COUNT}
          </span>
          <span>STEPS {steps}</span>
          <span>BEST {best || "—"}</span>
        </div>

        <div className="fm-board" role="grid" aria-label="Fruity Maze">
          {MAP.map((row, y) =>
            row.split("").map((tile, x) => {
              const key = `${x},${y}`;
              const isPlayer = player.x === x && player.y === y;
              const isRabbit = rabbit?.x === x && rabbit?.y === y;
              const isFruit = tile === "F" && !fruit.has(key);
              return (
                <div
                  key={key}
                  className={`fm-cell ${tile === "#" ? "is-wall" : ""} ${
                    tile === "E" ? "is-exit" : ""
                  }`}
                  role="gridcell"
                >
                  {isFruit && (
                    <span className="fm-fruit">
                      {FRUIT_ICONS[(x + y) % FRUIT_ICONS.length]}
                    </span>
                  )}
                  {tile === "E" && <span className="fm-exit">EXIT</span>}
                  {isPlayer && <span className="fm-player">👧</span>}
                  {isRabbit && <span className="fm-rabbit">🐰</span>}
                </div>
              );
            })
          )}
        </div>

        {phase === "idle" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Insert coin</span>
            <p>
              A tiny arcade cabinet with a very bad ending. Collect four pieces of fruit,
              then reach the exit. Once the fruit is gone, something starts following you.
            </p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Start Fruity Maze
            </button>
          </div>
        )}
        {phase === "lost" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">Game over</span>
            <p>{message}</p>
            <button type="button" className="btn btn-danger" onClick={start}>
              Try again
            </button>
          </div>
        )}
        {phase === "won" && (
          <div className="mg-overlay">
            <span className="mg-overlay-kicker">High score</span>
            <p>You escaped in {steps} steps. Best route: {best}.</p>
            <button type="button" className="btn btn-danger" onClick={start}>
              One more run
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
