import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import newsData from "../../data/news.json";
import { DISPATCHES } from "../../data/dispatches.js";
import { art } from "../../lib/assets.js";
import { fetchCommunity, timeAgo } from "../../lib/community.js";
import YouTubeModal from "./YouTubeModal.jsx";

const CATEGORY_ORDER = ["All", "Franchise", "Games", "Film", "Books", "Community"];

/* In-world wire trickle: fresh dispatches prepend themselves into the feed
 * shortly after mount and then every ~40s, capped to a few per session.
 * It runs regardless of the live API, so the desk keeps moving offline. */
const TRICKLE_FIRST_MS = 8000;
const TRICKLE_EVERY_MS = 40000;
const TRICKLE_MAX = 4;
const sessionDispatches = [];
const dispatchedIds = new Set();
const nowIso = () => new Date().toISOString();

/* Live headline feed: Google News RSS for FNAF, read through rss2json
 * (browser-safe JSON). If the network or the proxy is down, the desk
 * quietly falls back to the build-time snapshot. */
const LIVE_RSS =
  "https://news.google.com/rss/search?q=%22Five+Nights+at+Freddy%27s%22&hl=en-US&gl=US&ceid=US:en";
const LIVE_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(LIVE_RSS)}`;
const POLL_MS = 10 * 60 * 1000;

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tagFor = (title) => {
  const t = String(title || "").toLowerCase();
  if (/film|movie|blumhouse|box office|cinema|trailer/.test(t)) return "Film";
  if (/book|novel|fazbear frights|tales from|comic/.test(t)) return "Books";
  if (/game|update|dlc|release|steel wool|security breach|mimic|help wanted|arcade/.test(t))
    return "Games";
  if (/fans?|cosplay|reddit|community|convention|fandom/.test(t)) return "Community";
  return "Franchise";
};

const CHANGELOG = [
  {
    date: "2026-10-27",
    title: "Field manuals & live feeds",
    body: "How-to-play tutorials and easter-egg lists for every game, minigame field guides, deep-dive lore, richer film & book entries, and a newsroom that polls live headlines.",
  },
  {
    date: "2026-10-26",
    title: "Arcade, forum and newsroom online",
    body: "Seven playable minigames, browser-local discussion threads, and a source-linked news desk.",
  },
  {
    date: "2026-10-26",
    title: "Real jumpscares, real key art",
    body: "The warning overlay now uses actual FNAF clips, with reduced-motion stills and local assets.",
  },
  {
    date: "2026-10-25",
    title: "Night-shift guides",
    body: "Tutorials and walkthroughs for all eleven mainline games, including the newer Mimic chapter.",
  },
];

function formatDate(iso, withTime = false) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "date unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

function sourceMono(source) {
  return String(source || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function StoryImage({ item, className = "" }) {
  if (item.image) {
    return (
      <img
        className={className}
        src={art(item.image)}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <span className={`${className} is-fallback`} aria-hidden="true">
      <span>{sourceMono(item.source)}</span>
    </span>
  );
}

export default function Newsroom() {
  const [category, setCategory] = useState("All");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const closeVideo = useCallback(() => setVideo(null), []);

  /* ---- Live feed state ---- */
  const [liveItems, setLiveItems] = useState(null);
  const [liveStatus, setLiveStatus] = useState("snapshot"); // snapshot | updating | live | offline
  const [lastLive, setLastLive] = useState(null);
  const pollRef = useRef(null);

  /* ---- In-world wire trickle ----
   * Seeded from module-level session memory so switching tabs (unmount/remount)
   * neither duplicates nor loses already-dropped dispatches. */
  const [trickled, setTrickled] = useState(() => [...sessionDispatches]);

  const refreshLive = useCallback(async () => {
    setLiveStatus((current) => (current === "live" || current === "live-wiki" ? current : "updating"));
    // Tier 1: Google News headlines via the rss2json JSON proxy (works where
    // the free proxy tier is reachable).
    try {
      const res = await fetch(LIVE_URL);
      const json = await res.json();
      if (json.status !== "ok" || !Array.isArray(json.items)) throw new Error("bad payload");
      const mapped = json.items.slice(0, 12).map((item, index) => ({
        id: `live-${index}-${String(item.title || "").slice(0, 40)}`,
        kind: "news",
        title: String(item.title || "Untitled headline"),
        tag: tagFor(item.title),
        source: String(item.author || "Google News").replace(/^www\./, ""),
        url: item.link,
        publishedAt: item.pubDate,
        summary: stripHtml(item.description).slice(0, 240) || "Open the source for the full story.",
        sourceType: "outlet",
        live: true,
      }));
      if (!mapped.length) throw new Error("empty feed");
      setLiveItems(mapped);
      setLastLive(new Date().toISOString());
      setLiveStatus("live");
      return;
    } catch {
      /* fall through to the guaranteed Fandom tier */
    }
    // Tier 2: live activity from the Fandom wiki API (CORS-safe with
    // origin=*, so it works even when every news proxy is blocked).
    try {
      const live = await fetchCommunity({ limit: 8 });
      const mapped = (live.items || []).map((item) => ({
        id: `wiki-${item.id}`,
        kind: "news",
        title: item.title || "Wiki activity",
        tag:
          item.tag === "Film"
            ? "Film"
            : item.tag === "Book"
              ? "Books"
              : item.tag === "Game"
                ? "Games"
                : "Community",
        source: "Fandom wiki",
        url: item.url,
        publishedAt: item.timestamp,
        summary: `${item.type === "new" ? "New page" : "Edit"} by ${item.user}${
          item.comment ? ` — ${item.comment}` : ""
        }. ${item.summary}`.slice(0, 240),
        sourceType: "wiki",
        live: true,
        wiki: true,
      }));
      if (!mapped.length) throw new Error("empty feed");
      setLiveItems(mapped);
      setLastLive(new Date().toISOString());
      setLiveStatus("live-wiki");
      return;
    } catch {
      /* both tiers failed */
    }
    // Keep the last good live copy; otherwise label the snapshot honestly.
    setLiveStatus((current) => (current === "live" || current === "live-wiki" ? current : "offline"));
  }, []);

  /* Poll on mount, then every 10 minutes while the tab is visible. */
  useEffect(() => {
    // Fetching an external feed is the purpose of this effect; the state
    // updates happen asynchronously as the request resolves.
    // eslint-disable-next-line react/set-state-in-effect
    refreshLive();
    pollRef.current = setInterval(() => {
      if (!document.hidden) refreshLive();
    }, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [refreshLive]);

  /* In-world dispatch trickle: one fresh story shortly after mount, then one
   * every ~40s, capped per session. Independent of the live API, so the desk
   * keeps producing even fully offline. Timers are cleared on unmount. */
  useEffect(() => {
    const drop = () => {
      if (sessionDispatches.length >= TRICKLE_MAX) return;
      const next = DISPATCHES.find((item) => !dispatchedIds.has(item.id));
      if (!next) return;
      dispatchedIds.add(next.id);
      // Fresh stamp: the dispatch is arriving right now, not as old wire data.
      const stamped = { ...next, kind: "news", isNew: true, publishedAt: nowIso() };
      sessionDispatches.push(stamped);
      setTrickled([...sessionDispatches]);
    };
    const first = setTimeout(drop, TRICKLE_FIRST_MS);
    const loop = setInterval(drop, TRICKLE_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);

  const items = useMemo(() => {
    const snapshot = newsData.items || [];
    const base = (() => {
      if (!liveItems?.length) return snapshot;
      const key = (item) => String(item.title || "").toLowerCase().slice(0, 36);
      const seen = new Set(snapshot.map(key));
      const fresh = liveItems.filter((item) => !seen.has(key(item)));
      return [...fresh, ...snapshot];
    })();
    // Prepended wire dispatches sit above whatever the API returned; the
    // fetch logic above stays untouched.
    return trickled.length ? [...trickled, ...base] : base;
  }, [liveItems, trickled]);
  const videos = useMemo(() => items.filter((item) => item.kind === "video").slice(0, 6), [items]);

  const counts = useMemo(() => {
    const next = { All: items.length };
    for (const item of items) next[item.tag] = (next[item.tag] || 0) + 1;
    return next;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "All" && item.tag !== category) return false;
      if (kind === "article" && item.kind !== "news") return false;
      if (kind === "video" && item.kind !== "video") return false;
      if (!needle) return true;
      return `${item.title} ${item.summary} ${item.source} ${item.tag}`
        .toLowerCase()
        .includes(needle);
    });
  }, [items, category, kind, query]);

  const feature = filtered[0];
  const rest = filtered.slice(1);
  const briefing = newsData.briefing?.text || "";
  const briefingKind =
    newsData.briefing?.generatedBy === "openai" ? "AI-assisted draft" : "Extractive draft";

  return (
    <div className="newsroom">
      <div className="hub-section-head">
        <div>
          <span className="hub-kicker">Signal desk · {formatDate(newsData.generatedAt)}</span>
          <h2 className="hub-section-title">Tonight&apos;s newsroom</h2>
          <p className="hub-section-sub">
            FNAF headlines, official studio posts and creator videos — collected from public
            feeds, linked to the original source, and never auto-published without review.
          </p>
        </div>
        <div className="newsroom-status">
          <span className={`hub-status news-live news-live-${liveStatus}`}>
            <span className="status-dot" aria-hidden="true" />
            {liveStatus === "live"
              ? `LIVE · ${lastLive ? `updated ${timeAgo(lastLive)}` : "just now"}`
              : liveStatus === "live-wiki"
                ? `LIVE · FANDOM WIKI · ${lastLive ? `updated ${timeAgo(lastLive)}` : "just now"}`
                : liveStatus === "updating"
                  ? "SYNCING…"
                  : liveStatus === "offline"
                    ? "SNAPSHOT · LIVE FEED OFFLINE"
                    : "SNAPSHOT"}
          </span>
          <button
            type="button"
            className="btn news-refresh"
            onClick={refreshLive}
            disabled={liveStatus === "updating"}
          >
            {liveStatus === "updating" ? "SYNCING…" : "↻ REFRESH"}
          </button>
        </div>
      </div>

      <div className="briefing-card">
        <div className="briefing-label">
          <span aria-hidden="true">📼</span>
          <div>
            <strong>Desk briefing</strong>
            <span>
              {briefingKind} · {formatDate(newsData.briefing?.generatedAt || newsData.generatedAt, true)}
            </span>
          </div>
        </div>
        <p>{briefing}</p>
        <div className="briefing-foot">
          <span>
            Human review required before reuse. Headlines belong to their publishers.
          </span>
          <span>Sourced from Google News RSS, official studios and YouTube.</span>
        </div>
      </div>

      <div className="news-toolbar">
        <div className="filter-row news-filters" role="group" aria-label="Filter stories by category">
          {CATEGORY_ORDER.map((option) => (
            <button
              type="button"
              key={option}
              className={`pill ${category === option ? "active" : ""}`}
              onClick={() => setCategory(option)}
              aria-pressed={category === option}
            >
              {option}
              <span className="pill-count">{counts[option] || 0}</span>
            </button>
          ))}
        </div>
        <div className="news-toolbar-right">
          <div className="segmented" role="group" aria-label="Filter by story type">
            {[
              ["all", "All"],
              ["article", "Articles"],
              ["video", "Videos"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={kind === value ? "active" : ""}
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="news-search">
            <span className="sr-only">Search the newsroom</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search headlines…"
            />
          </label>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="news-layout">
          <article
            className={`news-feature${feature.isNew ? " newsroom-dispatch-in" : ""}`}
          >
            <div className={`news-feature-art ${feature.videoId ? "has-video" : ""}`}>
              <StoryImage item={feature} className="news-feature-img" />
              <span className="news-feature-scrim" aria-hidden="true" />
              <span className="news-feature-tag">{feature.tag}</span>
              {feature.kind === "video" && feature.videoId && (
                <button
                  type="button"
                  className="video-play video-play-large"
                  onClick={() => setVideo(feature)}
                  aria-label={`Play video: ${feature.title}`}
                >
                  <span aria-hidden="true">▶</span>
                </button>
              )}
            </div>
            <div className="news-feature-body">
              <span className="news-source-line">
                {feature.isNew && <span className="news-live-chip">NEW</span>}
                {feature.live && (
                  <span className="news-live-chip">{feature.wiki ? "WIKI" : "LIVE"}</span>
                )}
                {feature.source} · {formatDate(feature.publishedAt, true)}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.summary}</p>
              <div className="news-actions">
                {feature.kind === "video" && feature.videoId ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setVideo(feature)}
                  >
                    ▶ Watch video
                  </button>
                ) : null}
                <a
                  className="btn"
                  href={feature.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read at source ↗
                </a>
              </div>
            </div>
          </article>

          <aside className="news-sidebar" aria-label="Newsroom updates">
            <div className="card changelog-card">
              <div className="changelog-head">
                <span className="hub-kicker">Site patch notes</span>
                <h3>What changed</h3>
              </div>
              <ol className="changelog">
                {CHANGELOG.map((entry) => (
                  <li key={entry.title}>
                    <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                    <strong>{entry.title}</strong>
                    <p>{entry.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card standards-card">
              <span className="hub-kicker">Editorial rule</span>
              <h3>Collect. Draft. Review.</h3>
              <p>
                The agent prepares a snapshot. It does not publish unchecked claims. Every
                card links to its source so readers can verify the report themselves.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <span className="big" aria-hidden="true">📰</span>
          No stories match that filter. Try another category or clear the search.
        </div>
      )}

      {filtered.length > 1 && (
        <div className="story-grid">
          {rest.map((item) => (
            <article
              className={`news-card${item.isNew ? " newsroom-dispatch-in" : ""}`}
              key={item.id}
            >
              <div className="news-card-media">
                <StoryImage item={item} className="news-card-img" />
                {item.kind === "video" && item.videoId && (
                  <button
                    type="button"
                    className="video-play"
                    onClick={() => setVideo(item)}
                    aria-label={`Play video: ${item.title}`}
                  >
                    <span aria-hidden="true">▶</span>
                  </button>
                )}
                <span className="news-card-tag">{item.tag}</span>
              </div>
              <div className="news-card-body">
                <span className="news-source-line">
                  {item.isNew && <span className="news-live-chip">NEW</span>}
                  {item.live && (
                    <span className="news-live-chip">{item.wiki ? "WIKI" : "LIVE"}</span>
                  )}
                  {item.source} · {formatDate(item.publishedAt)}
                </span>
                <h3>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                <p>{item.summary}</p>
                <span className="news-card-foot">
                  {item.kind === "video" ? "Video commentary" : "External report"} ·{" "}
                  {item.sourceType === "official"
                    ? "official source"
                    : item.sourceType === "creator"
                      ? "creator"
                      : item.sourceType === "wiki"
                        ? "wiki editor"
                        : "outlet"}
                  <span aria-hidden="true"> ↗</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <section className="video-desk" aria-labelledby="video-desk-title">
          <div className="hub-section-head compact">
            <div>
              <span className="hub-kicker">Watch &amp; listen</span>
              <h2 className="hub-section-title" id="video-desk-title">
                Creator video desk
              </h2>
              <p className="hub-section-sub">
                Theory, analysis and community coverage. Embeds load only after you press play.
              </p>
            </div>
          </div>
          <div className="video-grid">
            {videos.map((item) => (
              <button
                type="button"
                className="video-card"
                key={item.id}
                onClick={() => setVideo(item)}
                aria-label={`Play ${item.title} by ${item.source}`}
              >
                <span className="video-thumb">
                  <StoryImage item={item} className="video-thumb-img" />
                  <span className="video-play" aria-hidden="true">▶</span>
                  <span className="video-duration">YOUTUBE</span>
                </span>
                <span className="video-info">
                  <span className="video-source">{item.source}</span>
                  <span className="video-title">{item.title}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="newsroom-disclaimer">
        Fan project. Headlines, trademarks and video thumbnails belong to their respective
        owners. This desk is an index, not a publisher.
      </p>

      {video && <YouTubeModal video={video} onClose={closeVideo} />}
    </div>
  );
}
