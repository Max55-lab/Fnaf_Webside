import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getGame, games } from "../data/games.js";
import { getCharacter } from "../data/characters.js";
import { getGuide } from "../data/guides.js";
import { gameTutorials, gameEasterEggs } from "../data/gameExtras.js";
import { setAmbientScene } from "../audio/sound.js";
import PageMeta from "../components/PageMeta.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";

const TAB_DEFS = [
  { id: "guide", label: "🌙 Night-shift guide" },
  { id: "tutorial", label: "🎓 How to play" },
  { id: "eggs", label: "🥚 Easter eggs" },
];

export default function GameDetail() {
  const { id } = useParams();
  const game = getGame(id);
  const [tab, setTab] = useState("guide");

  /* Each game page gets its own procedural room tone. */
  useEffect(() => {
    setAmbientScene(id);
    return () => setAmbientScene("site");
  }, [id]);

  if (!game) return <Navigate to="/games" replace />;

  const guide = getGuide(id);
  const tutorial = gameTutorials[id];
  const eggs = gameEasterEggs[id] || [];
  const tabs = TAB_DEFS.filter((def) => def.id !== "guide" || guide);
  const activeTab = tabs.some((def) => def.id === tab) ? tab : tabs[0].id;
  const related = games.filter((g) => g.id !== id).slice(0, 3);
  const gameUrl = `${window.location.origin}${window.location.pathname}#/games/${id}`;

  const onTabKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    setTab(tabs[nextIndex].id);
    document.getElementById(`game-tab-${tabs[nextIndex].id}`)?.focus();
  };

  const schema = [
    {
      "@type": "VideoGame",
      "@id": `${gameUrl}#videogame`,
      name: game.title,
      alternateName: game.short,
      description: game.description,
      image: new URL(game.image, window.location.href).href,
      url: gameUrl,
      datePublished: String(game.year),
      applicationCategory: "Game",
      gamePlatform: "Web browser",
      genre: ["Horror", "Survival horror", "Point-and-click"],
      inLanguage: "en",
      publisher: { "@type": "Organization", name: game.dev },
      about: game.characters
        .map((characterId) => getCharacter(characterId)?.name)
        .filter(Boolean),
      mainEntityOfPage: gameUrl,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FNAF Wiki",
          item: `${window.location.origin}${window.location.pathname}#/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Games",
          item: `${window.location.origin}${window.location.pathname}#/games`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: game.title,
          item: gameUrl,
        },
      ],
    },
  ];

  return (
    <div className="page game-detail-page">
      <PageMeta
        title={game.title}
        description={game.description.slice(0, 160)}
        image={game.image}
        type="article"
        keywords={`${game.title}, ${game.short}, FNAF, walkthrough, guide, tutorial, easter eggs, ${game.setting}`}
        schema={schema}
      />

      <div className="detail-back-row">
        <Link to="/games" className="back-link">
          ← Back to Games
        </Link>
        <BookmarkButton
          kind="game"
          id={game.id}
          label={game.title}
          to={`/games/${game.id}`}
        />
      </div>

      <header
        className="game-detail-header"
        style={{ "--game-accent": game.accent, borderLeftColor: game.accent }}
      >
        <div>
          <div className="game-detail-kicker">
            {game.year} — {game.dev.toUpperCase()}
          </div>
          <h1 className="page-title" style={{ color: game.accent }}>
            {game.title}
          </h1>
          <p className="game-tagline">“{game.tagline}”</p>
          <div className="tags">
            <span className="tag">📍 {game.setting}</span>
            <span className="tag">{game.characters.length} characters</span>
            {guide && <span className="tag tag-classic">{guide.difficulty} guide</span>}
            {tutorial && <span className="tag">🎓 Tutorial</span>}
            {eggs.length > 0 && <span className="tag">🥚 {eggs.length} eggs</span>}
          </div>
        </div>
        <div className="game-detail-actions">
          {guide?.minigame && (
            <Link to={`/play?mg=${guide.minigame.id}`} className="btn btn-danger">
              ▶ Play the minigame
            </Link>
          )}
          <Link to="/play" className="game-detail-play-link">
            Open the Arcade →
          </Link>
        </div>
      </header>

      <figure className="game-detail-hero">
        <img
          src={game.image}
          alt={`Official key art for ${game.title}`}
          loading="eager"
          decoding="async"
        />
        <figcaption>Official key art · FNAF Wiki</figcaption>
      </figure>

      <p className="bio-text" style={{ borderLeftColor: game.accent }}>
        {game.description}
      </p>

      {/* ---------- Field manual: guide / tutorial / easter eggs ---------- */}
      <div className="detail-tabs" role="tablist" aria-label={`${game.short} field manual`}>
        {tabs.map((def, index) => (
          <button
            key={def.id}
            type="button"
            role="tab"
            id={`game-tab-${def.id}`}
            aria-selected={activeTab === def.id}
            aria-controls={`game-panel-${def.id}`}
            tabIndex={activeTab === def.id ? 0 : -1}
            className={`detail-tab ${activeTab === def.id ? "is-active" : ""}`}
            style={{ "--tab-accent": game.accent }}
            onClick={() => setTab(def.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {def.label}
          </button>
        ))}
      </div>

      {activeTab === "guide" && guide && (
        <section
          className="guide-section detail-panel"
          id="game-panel-guide"
          role="tabpanel"
          aria-labelledby="game-tab-guide"
        >
          <div className="guide-head">
            <div>
              <span className="hub-kicker">Night shift guide</span>
              <h2 className="section-title">How to survive {game.short}</h2>
            </div>
            <div className="guide-meta">
              <span>
                <b>Difficulty</b>
                {guide.difficulty}
              </span>
              <span>
                <b>Length</b>
                {guide.length}
              </span>
            </div>
          </div>

          <p className="guide-overview">{guide.overview}</p>

          <div className="guide-quick">
            <span className="guide-quick-label">Quick start</span>
            <ul>
              {guide.quickStart.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="guide-walkthrough">
            {guide.walkthrough.map((part, index) => (
              <details className="guide-part" key={part.title} open={index === 0}>
                <summary>
                  <span className="guide-part-num">0{index + 1}</span>
                  <span>{part.title}</span>
                  <span className="guide-part-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <ol>
                  {part.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
            ))}
          </div>

          <div className="guide-columns">
            <div className="guide-tips">
              <h3>Pro tips</h3>
              <ul>
                {guide.proTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="guide-mistakes">
              <h3>Run-ending mistakes</h3>
              <ul>
                {guide.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>

          {guide.minigame && (
            <div className="guide-minigame-cta">
              <div>
                <span className="hub-kicker">Optional detour</span>
                <strong>{guide.minigame.label}</strong>
                <p>Play the browser version and see the scene for yourself.</p>
              </div>
              <Link className="btn btn-danger" to={`/play?mg=${guide.minigame.id}`}>
                ▶ Play now
              </Link>
            </div>
          )}
        </section>
      )}

      {activeTab === "tutorial" && tutorial && (
        <section
          className="guide-section detail-panel"
          id="game-panel-tutorial"
          role="tabpanel"
          aria-labelledby="game-tab-tutorial"
        >
          <div className="guide-head">
            <div>
              <span className="hub-kicker">How to play</span>
              <h2 className="section-title">Start here: {game.short} for beginners</h2>
            </div>
            <div className="guide-meta">
              <span>
                <b>Steps</b>
                {tutorial.steps.length}
              </span>
              <span>
                <b>Controls</b>
                {tutorial.controls.length} basics
              </span>
            </div>
          </div>

          <div className="guide-quick">
            <span className="guide-quick-label">Controls</span>
            <ul>
              {tutorial.controls.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="guide-walkthrough">
            <details className="guide-part" open>
              <summary>
                <span className="guide-part-num">01</span>
                <span>The game, step by step</span>
                <span className="guide-part-toggle" aria-hidden="true">
                  +
                </span>
              </summary>
              <ol>
                {tutorial.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          </div>

          <div className="guide-columns">
            <div className="guide-tips">
              <h3>Beginner tips</h3>
              <ul>
                {tutorial.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="guide-mistakes">
              <h3>Next up</h3>
              <ul>
                <li>
                  Once the steps feel automatic, open the{" "}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => setTab("guide")}
                  >
                    night-shift guide
                  </button>{" "}
                  for the full walkthrough, pro tips and mistakes to avoid.
                </li>
                <li>
                  Then hunt the{" "}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => setTab("eggs")}
                  >
                    easter eggs
                  </button>{" "}
                  hidden in this entry.
                </li>
                {guide?.minigame && (
                  <li>
                    Practice the scene in the browser:{" "}
                    <Link to={`/play?mg=${guide.minigame.id}`}>play the minigame →</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      {activeTab === "eggs" && (
        <section
          className="guide-section detail-panel"
          id="game-panel-eggs"
          role="tabpanel"
          aria-labelledby="game-tab-eggs"
        >
          <div className="guide-head">
            <div>
              <span className="hub-kicker">Easter eggs</span>
              <h2 className="section-title">What to hunt for in {game.short}</h2>
            </div>
            <div className="guide-meta">
              <span>
                <b>Eggs</b>
                {eggs.length}
              </span>
            </div>
          </div>

          <div className="egg-grid">
            {eggs.map((egg, index) => (
              <article className="egg-card" key={egg.name}>
                <span className="egg-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{egg.name}</h3>
                <p>{egg.how}</p>
              </article>
            ))}
          </div>

          <div className="guide-quick">
            <span className="guide-quick-label">More secrets from the archive</span>
            <ul>
              {game.secrets.map((secret) => (
                <li key={secret}>{secret}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="grid grid-2 game-detail-grid">
        <div>
          <h2 className="section-title" style={{ borderColor: game.accent, color: game.accent }}>
            Mechanics
          </h2>
          <ul className="list-clean">
            {game.mechanics.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-title" style={{ borderColor: game.accent, color: game.accent }}>
            Cast
          </h2>
          <div className="grid" style={{ gap: "0.5rem" }}>
            {game.characters.map((cid) => {
              const c = getCharacter(cid);
              if (!c) return null;
              return (
                <Link
                  to={`/characters/${c.id}`}
                  key={cid}
                  className="card game-cast-card"
                >
                  <span className="card-title" style={{ fontSize: "0.85rem", color: c.eyes }}>
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card game-legacy-card" style={{ borderLeft: `3px solid ${game.accent}` }}>
        <div className="card-title" style={{ color: game.accent }}>
          Legacy
        </div>
        <div className="card-text">{game.legacy}</div>
      </div>

      <h2 className="section-title" style={{ marginTop: "3rem" }}>
        More Games
      </h2>
      <div className="grid grid-3">
        {related.map((g) => (
          <Link
            to={`/games/${g.id}`}
            key={g.id}
            className="card game-mini-card"
            style={{ borderTop: `3px solid ${g.accent}` }}
          >
            <div
              className="game-mini-art"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(5, 6, 10, 0.05), rgba(5, 6, 10, 0.78)), url("${g.image}")`,
              }}
              aria-hidden="true"
            />
            <span className="game-year">{g.year}</span>
            <div className="card-title" style={{ color: g.accent }}>
              {g.short}
            </div>
            <div className="card-text" style={{ fontSize: "0.8rem" }}>
              {g.tagline}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
