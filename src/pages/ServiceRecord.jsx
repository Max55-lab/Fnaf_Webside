import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import SaveTransfer from "../components/SaveTransfer.jsx";
import { useProgress } from "../progress/ProgressProvider.jsx";

const TIER_LABEL = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

function formatTime(ms) {
  const minutes = Math.floor((ms || 0) / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours && minutes % 60) return `${hours}h ${minutes % 60}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ServiceRecord() {
  const { snapshot, achievements, total, earnedCount, rank, reset } = useProgress();
  const [filter, setFilter] = useState("all");

  const pct = Math.round((earnedCount / total) * 100);
  const complete = earnedCount >= total;

  const visible = useMemo(() => {
    if (filter === "earned") return achievements.filter((a) => snapshot.earned[a.id]);
    if (filter === "locked") return achievements.filter((a) => !snapshot.earned[a.id]);
    return achievements;
  }, [achievements, snapshot.earned, filter]);

  const stats = [
    { label: "Shifts started", value: snapshot.sessions, sub: "sessions" },
    { label: "Time on site", value: formatTime(snapshot.timeMs), sub: "tab visible" },
    { label: "Sections explored", value: `${snapshot.sectionCount}/${snapshot.sectionTotal}`, sub: "wiki areas" },
    { label: "Characters read", value: `${snapshot.characterCount}/${snapshot.characterTotal}`, to: "/characters" },
    { label: "Game files opened", value: `${snapshot.gameCount}/${snapshot.gameTotal}`, to: "/games" },
    { label: "Secrets found", value: `${snapshot.secretsFound}/${snapshot.secretsTotal}`, to: "/vault" },
    { label: "Saved items", value: snapshot.bookmarks, to: "/vault" },
    { label: "Forum posts", value: snapshot.forumPosts, to: "/community?tab=forum" },
    { label: "Polls voted", value: snapshot.voted ? "Yes" : "—", to: "/community?tab=forum" },
    { label: "Arcade bests", value: `${snapshot.scoredCount}/${snapshot.scoredTotal || 3}`, to: "/play" },
  ];

  const handleReset = () => {
    if (
      window.confirm(
        "Erase your service record (stats and badges)? Secrets in the Vault, arcade scores, bookmarks and forum posts are stored separately and stay untouched — badges tied to them will re-derive."
      )
    ) {
      reset();
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <PageMeta
        title="Service Record"
        description="Your night-shift statistics and every achievement badge earned on the FNAF Wiki."
      />
      <h1 className="page-title">🏅 Service Record</h1>
      <p className="page-subtitle">
        Everything you&apos;ve done on this wiki — files read, secrets cracked, shifts
        survived — filed as badges. Stored in this browser only, like the rest of your
        night.
      </p>

      {/* ---------- Rank card ---------- */}
      <section className="card sr-rank-card" aria-labelledby="sr-rank-title">
        <div className="sr-rank-head">
          <div className="sr-rank-main">
            <span className="hub-kicker">Current clearance</span>
            <h2 id="sr-rank-title" className="sr-rank-title">
              {rank.title}
            </h2>
            <p className="sr-rank-blurb">{rank.blurb}</p>
          </div>
          <div className="sr-rank-count">
            <span className="sr-rank-number">{earnedCount}</span>
            <span className="sr-rank-of">/ {total}</span>
            <span className="sr-rank-label">BADGES</span>
          </div>
        </div>
        <div className="power-bar" style={{ width: "100%", height: 14 }} aria-hidden="true">
          <div className="power-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="sr-rank-foot">
          <span className="sr-rank-pct">{pct}% OF THE FILE COMPLETE</span>
          <button type="button" className="vault-reset" onClick={handleReset}>
            Reset record
          </button>
        </div>
      </section>

      {/* ---------- Report card ---------- */}
      <section aria-labelledby="sr-stats-title">
        <div className="sr-section-head">
          <span className="hub-kicker">Night guard report card</span>
          <h2 id="sr-stats-title" className="sr-section-title">
            Your numbers
          </h2>
        </div>
        <div className="sr-stats">
          {stats.map((stat) => (
            <div className="sr-stat" key={stat.label}>
              {stat.to ? (
                <Link to={stat.to} className="sr-stat-link">
                  <span className="sr-stat-value">{stat.value}</span>
                  <span className="sr-stat-label">{stat.label}</span>
                </Link>
              ) : (
                <>
                  <span className="sr-stat-value">{stat.value}</span>
                  <span className="sr-stat-label">{stat.label}</span>
                </>
              )}
              <span className="sr-stat-sub">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Badge collection ---------- */}
      <section aria-labelledby="sr-badges-title">
        <div className="sr-section-head">
          <span className="hub-kicker">Commendations</span>
          <h2 id="sr-badges-title" className="sr-section-title">
            Badges
          </h2>
        </div>

        <div className="filter-row">
          <button
            type="button"
            className={`pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            All <span className="pill-count">{total}</span>
          </button>
          <button
            type="button"
            className={`pill ${filter === "earned" ? "active" : ""}`}
            onClick={() => setFilter("earned")}
            aria-pressed={filter === "earned"}
          >
            Unlocked <span className="pill-count">{earnedCount}</span>
          </button>
          <button
            type="button"
            className={`pill ${filter === "locked" ? "active" : ""}`}
            onClick={() => setFilter("locked")}
            aria-pressed={filter === "locked"}
          >
            Locked <span className="pill-count">{total - earnedCount}</span>
          </button>
        </div>

        {visible.length === 0 && (
          <p className="sr-empty">
            {filter === "locked"
              ? "Nothing locked. Every badge on the file is yours."
              : "Nothing here yet — go earn your first badge."}
          </p>
        )}

        <div className="sr-grid">
          {visible.map((badge) => {
            const earnedAt = snapshot.earned[badge.id];
            return (
              <article
                key={badge.id}
                className={`sr-badge sr-tier-${badge.tier} ${earnedAt ? "is-earned" : ""}`}
              >
                <span className="sr-badge-tier" aria-hidden="true">
                  {TIER_LABEL[badge.tier]}
                </span>
                <span className="sr-badge-icon" aria-hidden="true">
                  {earnedAt ? badge.icon : "🔒"}
                </span>
                <h3 className="sr-badge-title">{badge.title}</h3>
                <p className="sr-badge-text">{earnedAt ? badge.desc : badge.hint}</p>
                <span className="sr-badge-date">
                  {earnedAt ? `EARNED ${formatDate(earnedAt)}` : "LOCKED"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- Backup & restore (save export/import) ---------- */}
      <SaveTransfer />

      {complete && (
        <div className="sr-complete">
          <span aria-hidden="true">👑</span>
          <div>
            <strong>Employee of the Month</strong>
            <p>
              Every badge on the record is yours. Fazbear Entertainment has nothing left
              to teach you — which, historically, is when things go wrong.
            </p>
          </div>
        </div>
      )}

      <div className="sr-links">
        <Link to="/vault" className="btn">
          🗄 The Vault
        </Link>
        <Link to="/secrets" className="btn">
          🔍 Secrets &amp; Minigames
        </Link>
        <Link to="/play" className="btn">
          🕹 The Arcade
        </Link>
      </div>
    </div>
  );
}
