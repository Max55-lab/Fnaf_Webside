import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { games } from "../data/games.js";
import { gameTutorials, gameEasterEggs } from "../data/gameExtras.js";
import PageMeta from "../components/PageMeta.jsx";
import { useSettings } from "../components/Layout.jsx";

export default function Games() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("timeline"); // timeline | az
  const [savedOnly, setSavedOnly] = useState(false);
  const { bookmarks, isBookmarked } = useSettings();
  const savedCount = bookmarks.filter((item) => item.kind === "game").length;

  const list = useMemo(() => {
    const needle = q.toLowerCase().trim();
    let l = games.filter(
      (g) =>
        (!savedOnly || isBookmarked("game", g.id)) &&
        (!needle ||
          g.title.toLowerCase().includes(needle) ||
          g.setting.toLowerCase().includes(needle) ||
          g.tagline.toLowerCase().includes(needle))
    );
    l = [...l];
    if (sort === "az") l.sort((a, b) => a.title.localeCompare(b.title));
    else l.sort((a, b) => a.year - b.year);
    return l;
  }, [q, sort, savedOnly, isBookmarked]);

  return (
    <div className="page">
      <PageMeta
        title="Games"
        description="Every mainline Five Nights at Freddy's game — settings, mechanics, hidden secrets and legacy, from FNAF 1 to Secret of the Mimic."
      />
      <h1 className="page-title">Games</h1>
      <p className="page-subtitle">
        The complete mainline series — settings, mechanics, secrets, and legacy.
        Every game from 2014 to 2025.
      </p>

      <div className="search-box">
        <input
          className="search-input"
          placeholder="Search games... (try 'vr', 'tycoon', 'pizza')"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="filter-row">
        <button className={`pill ${sort === "timeline" ? "active" : ""}`} onClick={() => setSort("timeline")}>
          By Release Year
        </button>
        <button className={`pill ${sort === "az" ? "active" : ""}`} onClick={() => setSort("az")}>
          A → Z
        </button>
        <button
          type="button"
          className={`pill saved-filter-pill ${savedOnly ? "active" : ""}`}
          onClick={() => setSavedOnly((value) => !value)}
          aria-pressed={savedOnly}
          disabled={!savedCount && !savedOnly}
        >
          ★ Saved <span className="pill-count">{savedCount}</span>
        </button>
      </div>

      <div className="grid grid-2">
        {list.map((g) => {
          const saved = isBookmarked("game", g.id);
          return (
            <Link
              to={`/games/${g.id}`}
              key={g.id}
              className={`card game-list-card ${saved ? "is-saved" : ""}`}
              style={{ borderTop: `3px solid ${g.accent}` }}
            >
              {saved && (
                <span className="card-saved-flag" aria-label="Saved to your vault">
                  ★
                </span>
              )}
              <div
                className="game-card-head"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(5, 6, 10, 0.08), rgba(5, 6, 10, 0.92)), url("${g.image}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="game-card-short" style={{ color: g.accent }}>
                  {g.short}
                </span>
                <span className="game-card-year">{g.year}</span>
              </div>
              <div className="game-tagline">"{g.tagline}"</div>
              <div className="card-text">{g.description.slice(0, 140)}…</div>
              <div className="tags">
                <span className="tag">{g.setting}</span>
                <span className="tag">{g.characters.length} chars</span>
                {gameTutorials[g.id] && <span className="tag">📖 Tutorial</span>}
                {gameEasterEggs[g.id]?.length > 0 && (
                  <span className="tag">🥚 {gameEasterEggs[g.id].length} eggs</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="empty-state">
          <span className="big">📼</span>
          {savedOnly ? "NO SAVED GAMES YET — OPEN A GAME AND PRESS SAVE." : "NO TAPES FOUND"}
          {savedOnly && (
            <>
              <br />
              <br />
              <button className="btn" onClick={() => setSavedOnly(false)}>
                Show all games
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
