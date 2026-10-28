import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { characters, characterEmoji as emojiFor } from "../data/characters.js";
import CharImage from "../components/CharImage.jsx";
import PageMeta from "../components/PageMeta.jsx";
import { useSettings } from "../components/Layout.jsx";

export default function Characters() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const { bookmarks, isBookmarked } = useSettings();

  const types = useMemo(() => ["all", ...new Set(characters.map((c) => c.type))], []);
  const savedCount = bookmarks.filter((item) => item.kind === "character").length;

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return characters.filter((c) => {
      const matchType = type === "all" || c.type === type;
      const matchSaved = !savedOnly || isBookmarked("character", c.id);
      const matchQ =
        !needle ||
        c.name.toLowerCase().includes(needle) ||
        (c.alias || "").toLowerCase().includes(needle) ||
        (c.bio || "").toLowerCase().includes(needle) ||
        c.tags.some((t) => t.includes(needle));
      return matchType && matchSaved && matchQ;
    });
  }, [q, type, savedOnly, isBookmarked]);

  return (
    <div className="page">
      <PageMeta
        title="Characters"
        description="Every Five Nights at Freddy's animatronic, victim and villain — Freddy, Bonnie, Chica, Foxy, Springtrap, the Puppet, Circus Baby and more."
      />
      <h1 className="page-title">Characters</h1>
      <p className="page-subtitle">
        Every animatronic, every victim, every villain. Search by name, alias, tag,
        or anything you remember from the games.
      </p>

      <div className="search-box">
        <input
          className="search-input"
          placeholder="Search characters... (try 'pirate', 'ghost', 'purple')"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      <div className="filter-row">
        {types.map((t) => (
          <button
            key={t}
            className={`pill ${type === t ? "active" : ""}`}
            onClick={() => setType(t)}
            aria-pressed={type === t}
          >
            {t}
          </button>
        ))}
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

      <p style={{ fontFamily: "var(--font-mono)", color: "var(--dim)", fontSize: "0.75rem", marginBottom: "1rem", letterSpacing: 2 }}>
        {filtered.length} / {characters.length} RESULTS
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="big">👁</span>
          {savedOnly
            ? "NO SAVED CHARACTERS YET — OPEN A FILE AND PRESS SAVE."
            : "NO RESULTS — THE HALLS ARE EMPTY..."}
          <br />
          <br />
          <button
            className="btn"
            onClick={() => {
              setQ("");
              setType("all");
              setSavedOnly(false);
            }}
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((c) => {
            const saved = isBookmarked("character", c.id);
            return (
              <Link
                to={`/characters/${c.id}`}
                key={c.id}
                className={`card character-card ${saved ? "is-saved" : ""}`}
                style={{ textAlign: "center", color: c.color }}
              >
                {saved && (
                  <span className="card-saved-flag" aria-label="Saved to your vault">
                    ★
                  </span>
                )}
                <div className="char-avatar" style={{ color: c.eyes }}>
                  <CharImage
                    char={c}
                    emoji={<span>{emojiFor(c.name)}</span>}
                    className="char-avatar-img"
                  />
                  {!c.image && <div className="eyes-glow"><span /><span /></div>}
                </div>
                <div className="card-title" style={{ color: "var(--text)" }}>{c.name}</div>
                <div className="card-text" style={{ fontSize: "0.78rem", fontStyle: "italic" }}>
                  {c.alias} — {c.game}
                </div>
                <div className="tags" style={{ justifyContent: "center" }}>
                  {c.tags.map((t) => (
                    <span key={t} className={`tag tag-${t}`}>{t}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
