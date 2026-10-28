import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import seed from "../../data/community.json";
import {
  fetchCommunity,
  formatCount,
  isFresh,
  readCache,
  timeAgo,
  wikiUrl,
  writeCache,
} from "../../lib/community.js";

const FILTERS = [
  { id: "all", label: "All activity" },
  { id: "new", label: "New pages" },
  { id: "edit", label: "Edits" },
];

const STATUS = {
  live: { label: "LIVE FROM FANDOM", hint: "Fetched just now from the public wiki API." },
  cached: { label: "CACHED", hint: "A recent fetch, saved in this browser for 10 minutes." },
  snapshot: { label: "OFFLINE SNAPSHOT", hint: "The live API was unavailable, so this is the last build snapshot." },
};

function cleanComment(comment) {
  return String(comment || "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/\/\*\s*(.*?)\s*\*\//g, "section: $1")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WikiWire() {
  const [cached] = useState(readCache);
  const [data, setData] = useState(cached?.items?.length ? cached : seed);
  const [status, setStatus] = useState(cached?.items?.length ? "cached" : "snapshot");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const initialised = useRef(false);
  const busyRef = useRef(false);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const live = await fetchCommunity({ limit: 12 });
      setData(live);
      setStatus("live");
      writeCache(live);
    } catch {
      setStatus((current) => (current === "live" || current === "cached" ? current : "snapshot"));
      setError("The Fandom API didn't answer. Showing the last saved copy.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  /* Show the cached copy immediately, then refresh if it is stale. */
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    // Fetching from an external API is the purpose of this effect; the state
    // update happens asynchronously as the request resolves.
    // eslint-disable-next-line react/set-state-in-effect
    if (!cached || !isFresh(cached)) refresh();
  }, [cached, refresh]);

  /* Keep the wire alive: auto-sync every 3 minutes while the tab is
     visible, and re-render relative timestamps every 30 seconds. */
  useEffect(() => {
    const poll = setInterval(() => {
      if (!document.hidden) refresh();
    }, 180000);
    const ticker = setInterval(() => setTick((value) => value + 1), 30000);
    return () => {
      clearInterval(poll);
      clearInterval(ticker);
    };
  }, [refresh]);

  const counts = useMemo(
    () => ({
      all: data.items?.length || 0,
      new: data.items?.filter((item) => item.type === "new").length || 0,
      edit: data.items?.filter((item) => item.type === "edit").length || 0,
    }),
    [data]
  );

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data.items || []).filter((item) => {
      if (filter !== "all" && item.type !== filter) return false;
      if (!needle) return true;
      return `${item.title} ${item.summary} ${item.user} ${item.comment} ${item.tag}`
        .toLowerCase()
        .includes(needle);
    });
  }, [data, filter, query]);

  const stats = [
    ["Articles", data.stats?.articles],
    ["Total edits", data.stats?.edits],
    ["Active editors", data.stats?.activeUsers],
    ["Files", data.stats?.images],
  ].filter(([, value]) => Number(value) > 0);

  const statusInfo = STATUS[status] || STATUS.snapshot;
  const lastSync = data.fetchedAt || data.generatedAt;

  return (
    <div className="community-page wire-page">
      <div className="wire-header">
        <div>
          <span className="hub-kicker">Fandom activity</span>
          <h2 className="hub-section-title">Wiki Wire</h2>
          <p className="page-subtitle">
            A live look at what the Five Nights at Freddy&apos;s wiki community is writing right
            now — pulled straight from Fandom&apos;s public API.
          </p>
        </div>
        <div className="wire-controls" aria-live="polite">
          <span className={`wire-status wire-status-${status}`} title={statusInfo.hint}>
            <span className="wire-dot" aria-hidden="true" />
            {statusInfo.label}
          </span>
          <button
            type="button"
            className={`btn wire-refresh ${busy ? "is-busy" : ""}`}
            onClick={refresh}
            disabled={busy}
          >
            {busy ? "SYNCING…" : "↻ REFRESH"}
          </button>
        </div>
      </div>

      <div className="wire-subline">
        <span>
          Last synced {lastSync ? formatDate(lastSync) : "unknown"} · auto-syncs every 3 min ·{" "}
          <a
            href="https://freddy-fazbears-pizza.fandom.com/wiki/Special:RecentChanges"
            target="_blank"
            rel="noopener noreferrer"
          >
            source: Fandom recent changes ↗
          </a>
        </span>
        <span className="wire-subline-note">
          Fan project — not affiliated with Scott Cawthon or Steel Wool Studios.
        </span>
      </div>

      {error && (
        <div className="wire-alert" role="status">
          <span aria-hidden="true">⚠</span> {error}
        </div>
      )}

      {stats.length > 0 && (
        <div className="community-stats">
          {stats.map(([label, value]) => (
            <div className="community-stat" key={label}>
              <b>{formatCount(value)}</b>
              <span>{label}</span>
            </div>
          ))}
          <div className="community-stat community-stat-note">
            <b>{counts.all}</b>
            <span>in this wire</span>
          </div>
        </div>
      )}

      <div className="wire-toolbar">
        <div className="filter-row wire-filters">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pill ${filter === option.id ? "active" : ""}`}
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
            >
              {option.label} <span className="wire-pill-count">{counts[option.id]}</span>
            </button>
          ))}
        </div>
        <input
          className="wire-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by title, editor, tag…"
          aria-label="Filter community activity"
        />
      </div>

      {busy && !data.items?.length ? (
        <div className="grid grid-2" aria-hidden="true">
          {[0, 1, 2, 3].map((n) => (
            <div className="card wire-card wire-skeleton" key={n}>
              <span className="wire-skel-line short" />
              <span className="wire-skel-line title" />
              <span className="wire-skel-line" />
              <span className="wire-skel-line" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-2 wire-grid">
          {items.map((item) => (
            <article className="card wire-card" key={item.id}>
              <div className="wire-top">
                <span className="wire-tag" data-tag={item.tag}>
                  {item.tag}
                </span>
                {item.type === "new" && <span className="wire-new">NEW PAGE</span>}
                {item.ai && (
                  <span
                    className="wire-ai"
                    title="This summary was drafted by the optional AI agent and is not checked by a human."
                  >
                    AI SUMMARY
                  </span>
                )}
                <time className="wire-time" dateTime={item.timestamp}>
                  {timeAgo(item.timestamp)}
                </time>
              </div>

              <h2 className="wire-title">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                  <span className="wire-ext" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </h2>

              <p className="wire-summary">{item.summary}</p>

              {cleanComment(item.comment) && (
                <p className="wire-comment">
                  <span className="wire-comment-label">edit note</span>
                  {cleanComment(item.comment)}
                </p>
              )}

              <div className="wire-meta">
                <span className="wire-avatar" aria-hidden="true">
                  {String(item.user || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="wire-user">{item.user}</span>
                <span className="wire-dot-sep" aria-hidden="true">
                  ·
                </span>
                <span>{item.type === "new" ? "created this page" : "edited this page"}</span>
                <a
                  className="wire-open"
                  href={wikiUrl(item.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="big" aria-hidden="true">
            📡
          </span>
          No activity matches that filter.
          <br />
          Try <strong>All activity</strong> or clear the search.
        </div>
      )}

      <section className="wire-policy" aria-labelledby="wire-policy-title">
        <h2 className="section-title" id="wire-policy-title">
          How the Wire works
        </h2>
        <div className="grid grid-3 wire-steps">
          <div className="card wire-step">
            <span className="wire-step-num">01</span>
            <h3>Collect</h3>
            <p>
              The site reads Fandom&apos;s public recent-changes API. Article intros are fetched
              from the wiki itself, and the response is cached in your browser for ten minutes.
            </p>
          </div>
          <div className="card wire-step">
            <span className="wire-step-num">02</span>
            <h3>Draft</h3>
            <p>
              <code>npm run agent</code> refreshes the shipped snapshot and turns brand-new pages
              into markdown drafts. An optional AI key adds neutral summaries; without one, the
              agent uses the article&apos;s own intro.
            </p>
          </div>
          <div className="card wire-step">
            <span className="wire-step-num">03</span>
            <h3>Review</h3>
            <p>
              New pages land in <code>content-inbox/</code> marked unreviewed. A human checks the
              sources before anything is added to the wiki. The agent never edits this site
              directly.
            </p>
          </div>
        </div>
        <div className="wire-note">
          <strong>Why the human step?</strong> Wiki edits can be vandalism, speculation, or
          fan-fiction presented as canon. Auto-publishing AI summaries would spread mistakes —
          so the Wire links to the source and the agent only prepares drafts. Fresh activity is
          shown as-is, clearly labelled, with every card linking back to Fandom.
        </div>
      </section>
    </div>
  );
}
