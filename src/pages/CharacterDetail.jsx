import { useEffect, useMemo, useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  getCharacter,
  characters,
  characterEmoji as emojiFor,
} from "../data/characters.js";
import { games } from "../data/games.js";
import { useJumpscare, useReducedMotion } from "../components/Layout.jsx";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import { preloadJumpscare } from "../data/jumpscares.js";
import CharImage from "../components/CharImage.jsx";
import PageMeta from "../components/PageMeta.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import { art } from "../lib/assets.js";

export default function CharacterDetail() {
  const { id } = useParams();
  const char = getCharacter(id);
  const triggerJumpscare = useJumpscare();
  const reducedMotion = useReducedMotion();
  const { discover } = useSecrets();
  const hoverTimer = useRef(null);

  /* Staring at a portrait for three seconds is a bad idea. */
  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  /* Warm the gallery GIF + scream for this character so the scare fires
     instantly when the visitor clicks the portrait (never while reduced
     motion — the still frame is used then). */
  useEffect(() => {
    if (!char || reducedMotion) return undefined;
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
    const handle = idle(() => preloadJumpscare(char.id));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, [char, reducedMotion]);

  const onPortraitEnter = () => {
    if (char && !reducedMotion) preloadJumpscare(char.id);
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => discover("eyes-hover"), 3000);
  };

  const onPortraitLeave = () => clearTimeout(hoverTimer.current);

  const appearsIn = useMemo(
    () => (char ? games.filter((g) => g.characters.includes(char.id)) : []),
    [char]
  );

  const related = useMemo(() => {
    if (!char) return [];
    const sameGame = characters.filter((c) => c.id !== char.id && c.game === char.game);
    const rest = characters.filter((c) => c.id !== char.id && c.game !== char.game);
    return [...sameGame, ...rest].slice(0, 4);
  }, [char]);

  if (!char) return <Navigate to="/characters" replace />;

  const index = characters.findIndex((c) => c.id === char.id);
  const prev = characters[(index - 1 + characters.length) % characters.length];
  const next = characters[(index + 1) % characters.length];
  const charUrl = `${window.location.origin}${window.location.pathname}#/characters/${char.id}`;
  const schema = {
    "@type": "Person",
    "@id": `${charUrl}#character`,
    name: char.name,
    alternateName: char.alias,
    description: char.bio,
    image: new URL(char.image || art("office"), window.location.href).href,
    url: charUrl,
    knowsAbout: char.tags,
    memberOf: { "@type": "Organization", name: "Fazbear Entertainment" },
    subjectOf: appearsIn.map((game) => ({
      "@type": "VideoGame",
      name: game.title,
      url: `${window.location.origin}${window.location.pathname}#/games/${game.id}`,
    })),
  };

  return (
    <div className="page character-detail-page">
      <PageMeta
        title={char.name}
        description={`${char.alias} — ${char.bio.slice(0, 150)}`}
        image={char.image || art("office")}
        type="article"
        keywords={`${char.name}, ${char.alias}, FNAF character, ${char.game}, ${char.tags.join(", ")}`}
        schema={schema}
      />

      <div className="detail-back-row">
        <Link to="/characters" className="back-link">
          ← Back to Characters
        </Link>
        <BookmarkButton
          kind="character"
          id={char.id}
          label={char.name}
          to={`/characters/${char.id}`}
        />
      </div>

      <div className="detail-header">
        <div
          className="detail-avatar"
          style={{ color: char.eyes }}
          onClick={() => triggerJumpscare({ char: char.id })}
          onMouseEnter={onPortraitEnter}
          onMouseLeave={onPortraitLeave}
          title="Click if you dare... or stare."
        >
          <CharImage
            char={char}
            emoji={<span>{emojiFor(char.name)}</span>}
            className="detail-avatar-img"
            width={480}
            height={620}
          />
          {!char.image && (
            <div className="eyes-glow"><span /><span /></div>
          )}
        </div>

        <div className="detail-meta">
          <h1>{char.name}</h1>
          <div className="alias">"{char.alias}" — {char.game}</div>
          <div className="tags">
            <span className="tag">{char.type}</span>
            {char.tags.map((t) => (
              <span key={t} className={`tag tag-${t}`}>{t}</span>
            ))}
          </div>
          <p className="card-text" style={{ marginTop: "1rem", maxWidth: "600px" }}>
            <em>Tip: click the portrait... or hold your cursor on it a little too long.</em>
          </p>
        </div>
      </div>

      <h2 className="section-title">Biography</h2>
      <p className="bio-text">{char.bio}</p>

      {char.backstory && (
        <>
          <h2 className="section-title">📖 Full Backstory &amp; Deep Dive</h2>
          <div className="backstory">
            {char.backstory.split("\n").map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : null
            )}
          </div>
        </>
      )}

      <div className="grid grid-2" style={{ marginTop: "1rem" }}>
        <div>
          <h2 className="section-title">Night Behavior</h2>
          <ul className="list-clean">
            {char.behavior.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-title">Trivia</h2>
          <ul className="list-clean">
            {char.trivia.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {appearsIn.length > 0 && (
        <>
          <h2 className="section-title">Appears In</h2>
          <div className="appears-list">
            {appearsIn.map((g) => (
              <Link key={g.id} to={`/games/${g.id}`} className="appears-link">
                {g.short} <span>{g.year}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ---- Clickable office strip (secret hotspots) ---- */}
      <h2 className="section-title">The Office</h2>
      <div className="office-strip">
        <div
          className="office-hotspot"
          role="button"
          tabIndex={0}
          aria-label="Click the desk fan"
          title="A fan that never stops"
          onClick={() => {
            discover("fan-click");
            triggerJumpscare({ char: "the-puppet", text: "whirrrr…" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              discover("fan-click");
              triggerJumpscare({ char: "the-puppet", text: "whirrrr…" });
            }
          }}
        >
          <span className="office-emoji" aria-hidden="true">
            <img className="office-art" src={art("fan")} alt="" />
          </span>
          <span className="office-label">DESK FAN</span>
        </div>
        <div
          className="office-hotspot"
          role="button"
          tabIndex={0}
          aria-label="Click the cupcake"
          title="It's watching"
          onClick={() => {
            discover("cupcake-click");
            triggerJumpscare({ char: "chica", text: "LET'S EAT!" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              discover("cupcake-click");
              triggerJumpscare({ char: "chica", text: "LET'S EAT!" });
            }
          }}
        >
          <span className="office-emoji" aria-hidden="true">
            <img className="office-art" src={art("cupcake")} alt="" />
          </span>
          <span className="office-label">CUPCAKE</span>
        </div>
        <div className="office-note">
          <div className="office-note-title">📻 Night Shift Notice</div>
          "Uh, hello? Hello, hello? Uh, welcome to your new job..." — some objects in
          this office respond to being clicked. You didn't hear that from me.
        </div>
      </div>

      <h2 className="section-title">You Might Also Fear</h2>
      <div className="grid grid-4">
        {related.map((c) => (
          <Link
            to={`/characters/${c.id}`}
            key={c.id}
            className="card"
            style={{ textAlign: "center", color: c.color }}
          >
            <div className="char-avatar" style={{ color: c.eyes, width: 70, height: 70, fontSize: "1.8rem" }}>
              <CharImage
                char={c}
                emoji={<span>{emojiFor(c.name)}</span>}
                className="char-avatar-img"
                width={140}
                height={140}
              />
              {!c.image && <div className="eyes-glow"><span /><span /></div>}
            </div>
            <div className="card-title" style={{ color: "var(--text)", fontSize: "0.9rem" }}>
              {c.name}
            </div>
          </Link>
        ))}
      </div>

      <div className="char-pager">
        <Link to={`/characters/${prev.id}`}>← {prev.name}</Link>
        <Link to={`/characters/${next.id}`} className="next">{next.name} →</Link>
      </div>
    </div>
  );
}
