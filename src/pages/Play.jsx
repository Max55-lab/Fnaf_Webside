import { useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { art } from "../lib/assets.js";
import Plushtrap from "../components/minigames/Plushtrap.jsx";
import ShadowBonnie from "../components/minigames/ShadowBonnie.jsx";
import FruityMaze from "../components/minigames/FruityMaze.jsx";
import { EXTRA_MINIGAMES } from "../data/extraMinigames.jsx";
import { guides } from "../data/guides.js";
import { webGames } from "../data/webGames.js";
import { minigameGuides } from "../data/gameExtras.js";
import { setAmbientScene } from "../audio/sound.js";

const jumpTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const MINIGAMES = [
  {
    id: "plushtrap",
    title: "Plushtrap's Flashlight",
    game: "FNAF 4",
    gameId: "fnaf-4",
    art: "plushtrap",
    accent: "#e040fb",
    label: "Reaction · timing",
    description:
      "Wait for the toy rabbit to reach the X, then flash. Three clean hits earn the 6 AM bonus. Two misses and he reaches the door.",
    Component: Plushtrap,
  },
  {
    id: "shadow-bonnie",
    title: "Shadow Bonnie's Cake Run",
    game: "FNAF 3",
    gameId: "fnaf-3",
    art: "shadow-bonnie",
    accent: "#00e5ff",
    label: "Maze · memory",
    description:
      "Guide the glitch through a static maze, collect three cakes and bring them to the crying child. Arrow keys or WASD.",
    Component: ShadowBonnie,
  },
  {
    id: "fruity-maze",
    title: "Fruity Maze",
    game: "FFPS",
    gameId: "ffps",
    art: "fruity-maze-arcade",
    accent: "#76ff03",
    label: "Arcade · survival",
    description:
      "Collect every piece of fruit, then reach the exit. Once the music changes, the yellow rabbit starts hunting.",
    Component: FruityMaze,
  },
  ...EXTRA_MINIGAMES,
];

const PLAY_SCHEMA = {
  "@type": "CollectionPage",
  name: "The Arcade — FNAF Wiki",
  description:
    "Playable FNAF browser minigames with tutorials, plus full web editions of the Clickteam games.",
  about: ["Five Nights at Freddy's", "browser games", "minigames"],
};

export default function Play() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("mg");
  const active = MINIGAMES.find((game) => game.id === requested) || null;
  const overlayRef = useRef(null);

  const openGame = useCallback(
    (id) => setSearchParams({ mg: id }, { replace: true }),
    [setSearchParams]
  );

  const closeGame = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlayRef.current?.querySelector("button")?.focus());

    const onKey = (event) => {
      if (event.key === "Escape") closeGame();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [active, closeGame]);

  /* The arcade gets its own blip-and-hum room tone. */
  useEffect(() => {
    setAmbientScene("arcade");
    return () => setAmbientScene("site");
  }, []);

  return (
    <div className="page play-page">
      <PageMeta
        title="The Arcade"
        description="Play FNAF minigames in your browser: Plushtrap's flashlight, Shadow Bonnie's cake run, Fruity Maze, Foxy's dock dash, the music box, Pizza Toss and Golden Freddy Stare — each with how-to-activate notes, tutorials and easter eggs, plus full web editions."
        keywords="FNAF minigames, play FNAF, FNAF browser game, Five Nights at Freddy's arcade"
        schema={PLAY_SCHEMA}
      />

      <header className="arcade-hero" style={{ "--arcade-art": `url("${art("office")}")` }}>
        <div className="arcade-hero-copy">
          <span className="hub-kicker">Fazbear Entertainment · after hours</span>
          <h1 className="page-title">The Arcade</h1>
          <p className="page-subtitle">
            {MINIGAMES.length} playable minigames with full tutorials — flashlight timing,
            glitch mazes, music-box rhythm, dock dashes and more — plus full web editions of
            the Clickteam games on loan from the community&apos;s own racks. Everything
            marked LOCAL runs in this browser.
          </p>
          <div className="arcade-actions">
            <button type="button" className="btn btn-danger" onClick={() => jumpTo("arcade-machines")}>
              ▶ Play minigames
            </button>
            <button type="button" className="btn arcade-jump" onClick={() => jumpTo("arcade-guides")}>
              Tutorials &amp; guides
            </button>
            <button type="button" className="btn arcade-jump" onClick={() => jumpTo("web-editions")}>
              Web editions
            </button>
          </div>
        </div>
        <div className="arcade-hero-monitor" aria-hidden="true">
          <span className="arcade-rec">● REC</span>
          <span className="arcade-cam-label">CAM 01 · OFFICE</span>
          <span className="arcade-scan" />
          <span className="arcade-signal">SIGNAL 87%</span>
        </div>
      </header>

      <section id="arcade-machines" className="arcade-machines" aria-labelledby="arcade-machines-title">
        <div className="hub-section-head compact">
          <div>
            <span className="hub-kicker">Insert coin</span>
            <h2 className="hub-section-title" id="arcade-machines-title">
              Playable minigames
            </h2>
            <p className="hub-section-sub">
              Keyboard and touch controls. High scores stay on this device.
            </p>
          </div>
          <span className="hub-status">
            <span className="status-dot" aria-hidden="true" />
            {MINIGAMES.length} MACHINES ONLINE
          </span>
        </div>

        <div className="minigame-grid">
          {MINIGAMES.map((game, index) => {
            const guide = guides[game.gameId];
            return (
              <article
                className="minigame-card"
                key={game.id}
                style={{ "--mg-accent": game.accent }}
              >
                <div className="minigame-art">
                  <img
                    src={art(game.art)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="minigame-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="minigame-badge">PLAYABLE</span>
                </div>
                <div className="minigame-body">
                  <div className="minigame-meta">
                    <span>{game.game}</span>
                    <span>{game.label}</span>
                  </div>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  {minigameGuides[game.id] && (
                    <details className="mg-field-guide">
                      <summary>🎯 How to activate · How to beat</summary>
                      <div className="mg-field-guide-body">
                        <p>
                          <b>In the original game:</b> {minigameGuides[game.id].activate}
                        </p>
                        <b className="mg-field-guide-label">How to beat it</b>
                        <ol>
                          {minigameGuides[game.id].tutorial.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        <b className="mg-field-guide-label">Easter eggs</b>
                        <ul>
                          {minigameGuides[game.id].eggs.map((egg) => (
                            <li key={egg}>{egg}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )}
                  <div className="minigame-actions">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => openGame(game.id)}
                    >
                      ▶ Play now
                    </button>
                    <Link to={`/games/${game.gameId}`} className="minigame-guide-link">
                      {guide ? "Read the walkthrough" : "Game details"} →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="web-editions" className="web-editions" aria-labelledby="web-editions-title">
        <div className="hub-section-head compact">
          <div>
            <span className="hub-kicker">Courier delivers</span>
            <h2 className="hub-section-title" id="web-editions-title">
              Web editions
            </h2>
            <p className="hub-section-sub">
              Full third-party HTML5 builds, streamed from GitHub Pages with credit to
              the porters. These cabinets need an internet connection — the rest of
              this arcade stays offline-first.
            </p>
          </div>
          <span className="hub-status">
            <span className="status-dot" aria-hidden="true" />
            9 CABINETS PLUGGED IN
          </span>
        </div>

        <div className="minigame-grid">
          {webGames.map((game, index) => (
            <article
              className="minigame-card webgame-card"
              key={game.slug}
              style={{ "--mg-accent": game.accent }}
            >
              <div className="minigame-art">
                <img src={art(game.art)} alt="" loading="lazy" decoding="async" />
                <span className="minigame-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="minigame-badge">{game.badge}</span>
              </div>
              <div className="minigame-body">
                <div className="minigame-meta">
                  <span>{game.source === "hd_fnaf" ? "hd_fnaf · HTML5" : "FNAF-Web · React"}</span>
                  <span>{game.meta}</span>
                </div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="minigame-actions">
                  <Link to={`/play/web/${game.slug}`} className="btn btn-danger">
                    ▶ Load cabinet
                  </Link>
                  <a
                    className="minigame-guide-link"
                    href={game.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Direct link ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="web-editions-legal">
          FAN-MADE WEB PORTS. Clickteam editions by irv77/hd_fnaf; FNAF-Web by Dorukyum
          (recreation of Wendell Sousa's 2020 build). Five Nights at Freddy's © Scott
          Cawthon / Steel Wool Studios. Not official, not approved by or associated with
          Scott Cawthon. Each cabinet credits and links back to its own source project.
        </p>
      </section>

      <section id="arcade-guides" className="arcade-guides" aria-labelledby="arcade-guides-title">
        <div className="card arcade-guide-card">
          <span className="hub-kicker">Stuck before 6 AM?</span>
          <h2 id="arcade-guides-title">Every game has a field manual.</h2>
          <p>
            Quick-start habits, full night-by-night walkthroughs, pro tips, a step-by-step
            how-to-play tutorial and an easter-egg list — all written for this wiki, on
            every game page.
          </p>
          <div className="arcade-guide-links">
            {["fnaf-1", "fnaf-2", "fnaf-4", "security-breach"].map((id) => {
              const guide = guides[id];
              if (!guide) return null;
              return (
                <Link key={id} to={`/games/${id}`} className="arcade-guide-chip">
                  {id.replace("fnaf-", "FNAF ").replace("security-breach", "Security Breach")}
                  <span>{guide.difficulty}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {active && (
        <div className="minigame-overlay" ref={overlayRef} onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeGame();
        }}>
          <div
            className="minigame-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} minigame`}
          >
            <active.Component onClose={closeGame} />
          </div>
        </div>
      )}
    </div>
  );
}
