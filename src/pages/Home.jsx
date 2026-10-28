import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { characters, characterEmoji as emojiFor } from "../data/characters.js";
import { games } from "../data/games.js";
import { fazFacts } from "../data/home.js";
import newsData from "../data/news.json";
import { timeAgo } from "../lib/community.js";
import CharImage from "../components/CharImage.jsx";
import PageMeta from "../components/PageMeta.jsx";
import ShaderBackdrop from "../components/ShaderBackdrop.jsx";
import { art, characterArt } from "../lib/assets.js";
import { sfxTick, sfxChannelSwitch } from "../audio/sound.js";
import { useSecrets } from "../secrets/SecretsProvider.jsx";

const PORTALS = [
  {
    to: "/characters",
    label: "Characters",
    kicker: "The roster",
    desc: "Every animatronic, ghost and night guard.",
    image: characterArt("freddy-fazbear"),
    accent: "#ffd600",
  },
  {
    to: "/games",
    label: "Games",
    kicker: "11 entries",
    desc: "From the original office to the Mimic.",
    image: art("game-fnaf-1"),
    accent: "#ff1744",
  },
  {
    to: "/lore",
    label: "Lore",
    kicker: "Three continuities",
    desc: "Games, novels and films, layer by layer.",
    image: characterArt("springtrap"),
    accent: "#76ff03",
  },
  {
    to: "/media",
    label: "Films & Books",
    kicker: "Outside canon",
    desc: "Blumhouse, the novel trilogy and beyond.",
    image: art("film-fnaf-movie"),
    accent: "#00e5ff",
  },
  {
    to: "/play",
    label: "The Arcade",
    kicker: "Insert coin",
    desc: "Playable minigames and the night shift.",
    image: art("plushtrap"),
    accent: "#e040fb",
  },
  {
    to: "/community",
    label: "Community",
    kicker: "News · forum · wire",
    desc: "Headlines, theories and live wiki activity.",
    image: art("office"),
    accent: "#ff9100",
  },
];

const PLAYABLE = [
  {
    id: "plushtrap",
    title: "Plushtrap's Flashlight",
    to: "/play?mg=plushtrap",
    image: art("plushtrap"),
    game: "FNAF 4",
  },
  {
    id: "shadow-bonnie",
    title: "Shadow Bonnie's Cake Run",
    to: "/play?mg=shadow-bonnie",
    image: art("shadow-bonnie"),
    game: "FNAF 3",
  },
  {
    id: "fruity-maze",
    title: "Fruity Maze",
    to: "/play?mg=fruity-maze",
    image: art("fruity-maze-arcade"),
    game: "FFPS",
  },
];

const FEATURED_IDS = [
  "freddy-fazbear",
  "the-puppet",
  "springtrap",
  "circus-baby",
  "glamrock-freddy",
  "the-mimic",
];

function formatNewsDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recent";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Home() {
  const { discover, total } = useSecrets();
  const [factIndex, setFactIndex] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  /* Five pokes at the hero title wake something up ("Don't Touch That"). */
  const titlePokesRef = useRef(0);
  const titlePokeTimerRef = useRef(null);
  const pokeTitle = () => {
    titlePokesRef.current += 1;
    if (titlePokeTimerRef.current) clearTimeout(titlePokeTimerRef.current);
    titlePokeTimerRef.current = setTimeout(() => {
      titlePokesRef.current = 0;
    }, 1600);
    if (titlePokesRef.current >= 5) {
      titlePokesRef.current = 0;
      discover("title-click");
    }
  };

  /* Seven pokes at the hero's static field ("Signal Breach"). */
  const [staticBurst, setStaticBurst] = useState(false);
  const staticPokesRef = useRef(0);
  const staticTimerRef = useRef(null);
  const pokeStatic = (event) => {
    if (event.target !== event.currentTarget) return;
    staticPokesRef.current += 1;
    if (staticTimerRef.current) clearTimeout(staticTimerRef.current);
    staticTimerRef.current = setTimeout(() => {
      staticPokesRef.current = 0;
    }, 1800);
    if (staticPokesRef.current >= 7) {
      staticPokesRef.current = 0;
      discover("static-field");
      setStaticBurst(true);
      sfxChannelSwitch();
      setTimeout(() => setStaticBurst(false), 460);
    } else {
      sfxTick();
    }
  };

  const featuredCharacters = useMemo(
    () =>
      FEATURED_IDS.map((id) => characters.find((character) => character.id === id)).filter(
        Boolean
      ),
    []
  );
  const featured = featuredCharacters[featuredIndex] || featuredCharacters[0];
  const news = newsData.items || [];
  const lead = news.find((item) => item.image) || news[0];
  const headlines = news.filter((item) => item.id !== lead?.id).slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => setFactIndex((value) => (value + 1) % fazFacts.length), 9000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setFeaturedIndex((value) => (value + 1) % featuredCharacters.length),
      8000
    );
    return () => clearInterval(timer);
  }, [featuredCharacters.length]);

  const nextFeatured = () =>
    setFeaturedIndex((value) => (value + 1) % featuredCharacters.length);
  const prevFeatured = () =>
    setFeaturedIndex(
      (value) => (value - 1 + featuredCharacters.length) % featuredCharacters.length
    );

  return (
    <>
      <PageMeta
        description="A fan-made Five Nights at Freddy's encyclopedia — characters, games, walkthroughs, the full lore timeline, films, books, real news and playable minigames."
        keywords="FNAF wiki, Five Nights at Freddy's, FNAF characters, FNAF lore, FNAF games, FNAF minigames"
      />

      <section
        className="home-hero"
        style={{ "--home-hero-art": `url("${art("office")}")` }}
        onClick={pokeStatic}
      >
        <ShaderBackdrop className="home-shader" tint={[0.55, 0.8, 1]} intensity={0.75} />
        {staticBurst && <span className="static-burst" aria-hidden="true" />}
        <div className="home-hero-copy">
          <span className="home-kicker">
            <span className="status-dot" aria-hidden="true" />
            Fan encyclopedia · night 03 · signal stable
          </span>
          <h1 className="home-title" onClick={pokeTitle}>
            <span>Five Nights</span>
            <span>at Freddy&apos;s</span>
          </h1>
          <p className="home-lede">
            Every animatronic. Every game. Every impossible timeline. A fan-built archive of
            the pizzeria that should have closed decades ago — with real jumpscares and
            playable minigames.
          </p>
          <div className="home-actions">
            <Link to="/play" className="btn btn-danger">Enter the Arcade</Link>
            <Link to="/characters" className="btn">Meet the animatronics</Link>
            <Link to="/community?tab=news" className="home-text-link">
              Tonight&apos;s newsroom →
            </Link>
          </div>
          <div className="home-hero-stats" aria-label="Wiki statistics">
            <span><b>{characters.length}</b> characters</span>
            <span><b>{games.length}</b> games</span>
            <span><b>{news.length}</b> news signals</span>
            <span><b>{total}</b> secrets</span>
          </div>
        </div>

        <div className="home-monitor" aria-hidden="true">
          <div className="home-monitor-head">
            <span>CAM 01 · SHOW STAGE</span>
            <span className="rec">● REC</span>
          </div>
          <div className="home-monitor-screen">
            <img src={art("office")} alt="" width="1280" height="720" decoding="async" />
            <span className="home-monitor-scan" />
            <span className="home-monitor-frame" />
            <span className="home-monitor-caption">OFFICE / 12:00 AM</span>
            <span className="home-monitor-corner tl" />
            <span className="home-monitor-corner tr" />
            <span className="home-monitor-corner bl" />
            <span className="home-monitor-corner br" />
          </div>
          <div className="home-monitor-foot">
            <span>PWR 100%</span>
            <span>SIGNAL 87%</span>
            <span>NIGHT 1 / 5</span>
          </div>
        </div>
      </section>

      <div className="page home-page">
        <section className="home-portals" aria-labelledby="portals-title">
          <div className="hub-section-head compact">
            <div>
              <span className="hub-kicker">Start anywhere</span>
              <h2 className="hub-section-title" id="portals-title">The archive</h2>
            </div>
            <span className="home-portals-note">Six doors. Pick the one that creaks.</span>
          </div>
          <div className="portal-grid">
            {PORTALS.map((portal) => (
              <Link
                to={portal.to}
                key={portal.to}
                className="portal-card"
                style={{ "--portal-accent": portal.accent }}
              >
                <img src={portal.image} alt="" loading="lazy" decoding="async" />
                <span className="portal-scrim" aria-hidden="true" />
                <span className="portal-body">
                  <span className="portal-kicker">{portal.kicker}</span>
                  <strong>{portal.label}</strong>
                  <span>{portal.desc}</span>
                </span>
                <span className="portal-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="home-columns">
          <section className="home-news" aria-labelledby="home-news-title">
            <div className="hub-section-head compact">
              <div>
                <span className="hub-kicker">Latest intel</span>
                <h2 className="hub-section-title" id="home-news-title">From the newsroom</h2>
              </div>
              <Link to="/community?tab=news" className="home-section-link">
                All stories →
              </Link>
            </div>

            {lead && (
              <Link to="/community?tab=news" className="home-lead">
                <div className="home-lead-art">
                  {lead.image ? (
                    <img src={art(lead.image)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="home-lead-fallback" aria-hidden="true">FNAF</span>
                  )}
                  <span className="home-lead-tag">{lead.tag}</span>
                </div>
                <div className="home-lead-body">
                  <span className="home-source">
                    {lead.source} · {formatNewsDate(lead.publishedAt)}
                  </span>
                  <h3>{lead.title}</h3>
                  <p>{lead.summary}</p>
                </div>
              </Link>
            )}

            <div className="home-headlines">
              {headlines.map((item) => (
                <a
                  className="home-headline"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={item.id}
                >
                  <span className="home-headline-time">{timeAgo(item.publishedAt)}</span>
                  <span className="home-headline-title">{item.title}</span>
                  <span className="home-headline-source">{item.source} ↗</span>
                </a>
              ))}
            </div>
          </section>

          <aside className="home-rail" aria-label="Featured content">
            <section className="home-featured" aria-labelledby="featured-character-title">
              <div className="home-featured-head">
                <span className="hub-kicker">Featured animatronic</span>
                <div className="home-featured-nav">
                  <button type="button" onClick={prevFeatured} aria-label="Previous featured character">←</button>
                  <button type="button" onClick={nextFeatured} aria-label="Next featured character">→</button>
                </div>
              </div>
              <Link to={`/characters/${featured.id}`} className="home-featured-link">
                <div className="home-featured-portrait" style={{ "--char-glow": featured.eyes }}>
                  <CharImage
                    char={featured}
                    emoji={<span>{emojiFor(featured.name)}</span>}
                    className="home-featured-img"
                    width={420}
                    height={520}
                  />
                  <span className="home-featured-vignette" aria-hidden="true" />
                </div>
                <h2 id="featured-character-title">{featured.name}</h2>
                <p className="home-featured-alias">“{featured.alias}”</p>
                <p className="home-featured-bio">{featured.bio.slice(0, 160)}…</p>
                <span className="home-text-link">Read the file →</span>
              </Link>
            </section>

            <section className="home-fact" aria-labelledby="home-fact-title">
              <div className="home-fact-head">
                <span className="hub-kicker">Faz-Fact</span>
                <span>{factIndex + 1}/{fazFacts.length}</span>
              </div>
              <h2 id="home-fact-title">Did you know?</h2>
              <p key={factIndex}>{fazFacts[factIndex]}</p>
              <button
                type="button"
                onClick={() => setFactIndex((value) => (value + 1) % fazFacts.length)}
              >
                Next fact →
              </button>
            </section>

            <Link to="/vault" className="home-vault">
              <span className="home-vault-icon" aria-hidden="true">🗄</span>
              <span>
                <strong>The Vault</strong>
                <small>{total} secrets hidden across this wiki</small>
              </span>
              <span className="home-vault-count" aria-hidden="true">{total}</span>
            </Link>
          </aside>
        </div>

        <section className="home-play" aria-labelledby="home-play-title">
          <div className="hub-section-head compact">
            <div>
              <span className="hub-kicker">After hours</span>
              <h2 className="hub-section-title" id="home-play-title">Play tonight</h2>
              <p className="hub-section-sub">
                Seven playable minigames, tutorials for every game, and the web edition
                cabinets.
              </p>
            </div>
            <Link to="/play" className="btn">Open the Arcade</Link>
          </div>
          <div className="home-play-grid">
            <Link to="/play/web/fnaf-1" className="home-play-lead">
              <img src={art("game-fnaf-1")} alt="" loading="lazy" decoding="async" />
              <span className="home-play-scrim" aria-hidden="true" />
              <span className="home-play-body">
                <span className="hub-kicker">Web edition</span>
                <strong>FNAF 1 — Web Edition</strong>
                <span>The complete original game, streamed straight into the arcade.</span>
                <span className="home-play-cta">Load the cabinet →</span>
              </span>
            </Link>
            <div className="home-play-minis">
              {PLAYABLE.map((game) => (
                <Link to={game.to} key={game.id} className="home-mini">
                  <img src={game.image} alt="" loading="lazy" decoding="async" />
                  <span className="home-mini-body">
                    <span>{game.game}</span>
                    <strong>{game.title}</strong>
                    <span className="home-mini-play">▶ Play</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-start" aria-labelledby="home-start-title">
          <div className="hub-section-head compact">
            <div>
              <span className="hub-kicker">New to the pizzeria?</span>
              <h2 className="hub-section-title" id="home-start-title">Three ways in</h2>
            </div>
          </div>
          <div className="home-start-grid">
            <Link to="/games/fnaf-1" className="home-start-card">
              <span className="home-start-num">01</span>
              <strong>Play the original</strong>
              <p>Start where the power meter did. The FNAF 1 office teaches the whole series.</p>
              <span>FNAF 1 →</span>
            </Link>
            <Link to="/lore" className="home-start-card">
              <span className="home-start-num">02</span>
              <strong>Untangle the lore</strong>
              <p>Games, novels and films are separate layers. Pick a continuity and follow it.</p>
              <span>Open the timeline →</span>
            </Link>
            <Link to="/community?tab=forum" className="home-start-card">
              <span className="home-start-num">03</span>
              <strong>Join the break room</strong>
              <p>Share a theory, vote in the pulse poll or build an animatronic tier list.</p>
              <span>Enter the forum →</span>
            </Link>
          </div>
        </section>

        <p className="home-disclaimer">
          Fan project. Not affiliated with Scott Cawthon or Steel Wool Studios. Character art
          and news imagery are credited to their original sources.
        </p>
      </div>
    </>
  );
}
