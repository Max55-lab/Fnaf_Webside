import { Link } from "react-router-dom";
import { useSecrets, SECRETS } from "../secrets/SecretsProvider.jsx";
import { useSettings } from "../components/Layout.jsx";
import PageMeta from "../components/PageMeta.jsx";

const BOOKMARK_ICONS = {
  character: "👤",
  game: "🎮",
  guide: "📖",
  news: "📰",
  secret: "🗝",
  page: "🔖",
};

export default function SecretTracker() {
  const { found, count, total, reset } = useSecrets();
  const { bookmarks, toggleBookmark } = useSettings();
  const pct = Math.round((count / total) * 100);
  const allFound = count >= total;

  const handleReset = () => {
    if (window.confirm("Erase every secret you've found? This cannot be undone.")) {
      reset();
    }
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <PageMeta
        title="The Vault"
        description={`Track every secret and easter egg hidden in the FNAF Wiki — ${total} in total.`}
      />
      <h1 className="page-title">🗄 The Vault</h1>
      <p className="page-subtitle">
        Every secret, code, and easter egg hidden across this wiki. Find them all and
        you&apos;ll unlock something... but that&apos;s for you to discover.
      </p>

      <p style={{ marginBottom: "1.5rem" }}>
        <Link to="/achievements" className="btn">
          🏅 See your Service Record — badges &amp; stats →
        </Link>
      </p>

      <div className="card" style={{ borderLeft: "3px solid var(--accent)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="card-title" style={{ marginBottom: "0.2rem" }}>Progress</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--dim)", letterSpacing: 2 }}>
              {count} / {total} SECRETS DISCOVERED
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
            {pct}%
          </div>
        </div>
        <div className="power-bar" style={{ width: "100%", height: 16, marginTop: "0.8rem" }}>
          <div className="power-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.8rem" }}>
          <button className="vault-reset" onClick={handleReset}>Reset progress</button>
        </div>
      </div>

      <section className="vault-saved" aria-labelledby="vault-saved-title">
        <div className="vault-saved-head">
          <div>
            <span className="hub-kicker">Saved for later</span>
            <h2 id="vault-saved-title">Your bookmarks</h2>
          </div>
          <span className="vault-saved-count">
            {bookmarks.length} {bookmarks.length === 1 ? "item" : "items"}
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <p className="vault-saved-empty">
            Nothing saved yet. Press <strong>☆ Save</strong> on any character or game to keep it
            here. Bookmarks are stored in this browser only.
          </p>
        ) : (
          <ul className="vault-saved-list">
            {bookmarks.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link to={item.to || "/"} className="vault-saved-link">
                  <span className="vault-saved-icon" aria-hidden="true">
                    {BOOKMARK_ICONS[item.kind] || "🔖"}
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>
                      {item.kind}
                      {item.savedAt
                        ? ` · saved ${new Date(item.savedAt).toLocaleDateString()}`
                        : ""}
                    </small>
                  </span>
                </Link>
                <button
                  type="button"
                  className="vault-saved-remove"
                  onClick={() => toggleBookmark(item)}
                  aria-label={`Remove ${item.label} from saved items`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {allFound && (
        <div className="card" style={{ borderLeft: "3px solid var(--cyan)", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem" }}>🎉</div>
          <div className="card-title" style={{ color: "var(--cyan)" }}>You Found Everything</div>
          <div className="card-text">
            Every secret. Every code. Every ghost. You've seen it all. Golden Freddy
            finally stops staring — and files for the morning shift instead.
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {Object.entries(SECRETS).map(([key, s]) => {
          const isFound = found.has(key);
          return (
            <div
              key={key}
              className="card"
              style={{
                opacity: isFound ? 1 : 0.72,
                borderLeft: isFound ? "3px solid var(--accent)" : "3px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <div style={{ fontSize: "1.8rem", filter: isFound ? "none" : "grayscale(1) brightness(0.5)" }}>
                  {isFound ? s.icon : "❔"}
                </div>
                <div>
                  <div className="card-title" style={{ fontSize: "0.95rem", color: isFound ? "var(--text)" : "var(--dim)" }}>
                    {isFound ? s.title : "??? — undiscovered"}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--cyan)", letterSpacing: 1 }}>
                    HINT: {s.hint}
                  </div>
                </div>
              </div>
              {isFound && (
                <div className="card-text" style={{ marginTop: "0.7rem", fontSize: "0.82rem" }}>
                  {s.discovered}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: "2.5rem", borderTop: "3px solid var(--accent)" }}>
        <div className="card-title">💡 Where to Start Hunting</div>
        <ul className="list-clean" style={{ marginTop: "0.5rem" }}>
          <li>Type things. Words, years, names. The keyboard is a hidden input on every page.</li>
          <li>The old cheat code still works.</li>
          <li>Click things that look clickable but aren't labelled. Fans, cupcakes, noses.</li>
          <li>Hold the footer nose down instead of clicking it.</li>
          <li>Stare at a character's portrait for three full seconds.</li>
          <li>Some secrets only appear by chance — glitches, flashes, whispers. Stay a while.</li>
          <li>Tap the logo. Tap it again. Tap it a third time. Quickly.</li>
          <li>Some things only happen after midnight. Specifically, 3 AM.</li>
        </ul>
      </div>

      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/secrets" className="btn">← Back to Secrets &amp; Minigames</Link>
      </p>
    </div>
  );
}
