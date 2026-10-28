import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import ShaderBackdrop from "../components/ShaderBackdrop.jsx";
import { useAuth, ROLES } from "../auth/AuthProvider.jsx";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import { computeSnapshot } from "../progress/record.js";
import { setAmbientScene, sfxConfirm, sfxToggle } from "../audio/sound.js";
import "./../styles/auth.css";

const BROADCAST_KEY = "fnaf_auth_broadcasts";

/* A tiny in-world staff directory. The visitor is always row one. */
const DIRECTORY = [
  { handle: "PHONE_GUY", role: "administrator", last: "left a message · 1987", state: "ON CALL" },
  { handle: "MOOGLE", role: "administrator", last: "indexed the archives", state: "ON SHIFT" },
  { handle: "PURPLE_SHIFT", role: "administrator", last: "badge photo redacted", state: "UNKNOWN" },
  { handle: "CAM_WATCHER_03", role: "guest", last: "watching CAM 04", state: "ON SHIFT" },
  { handle: "THE_NEW_GUARD", role: "guest", last: "survived Night 4", state: "ON SHIFT" },
];

const CLASSIFIED = [
  "Incident 1987-02: frontal lobe removed. Management ruled it 'a workplace comedy accident'.",
  "The 'odor complaint' files are not about the suits. They were never about the suits.",
  "Golden Freddy is not on the employee roster. Golden Freddy has never been on any roster.",
  "Directive 00: if the building asks you to leave, the building is not authorized to speak.",
  "There is no Super Administrator above you. This page should not exist. Enjoy your clearance.",
];

export default function Oversight() {
  const { signedIn, role, handle, meta, isAdmin, isSuper, logout } = useAuth();
  const { count, total } = useSecrets();

  const [broadcasts, setBroadcasts] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem(BROADCAST_KEY) || "[]");
      return Array.isArray(list) ? list.slice(-8) : [];
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(0);

  const stats = useMemo(() => {
    try {
      return computeSnapshot();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setAmbientScene("sister-location");
    return () => setAmbientScene("site");
  }, []);

  const postBroadcast = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const entry = {
      id: `${Date.now()}`,
      text: text.slice(0, 140),
      by: handle || ROLES[role].chip,
      ts: new Date().toISOString(),
    };
    const next = [...broadcasts, entry].slice(-8);
    setBroadcasts(next);
    try {
      localStorage.setItem(BROADCAST_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setDraft("");
    sfxConfirm();
  };

  const revealNext = () => {
    setRevealed((n) => Math.min(n + 1, CLASSIFIED.length));
    sfxToggle(true);
  };

  /* ---- Access gate ---- */
  if (!signedIn || !isAdmin) {
    return (
      <div className="page auth-page">
        <PageMeta title="Oversight Console — Access Denied" description="Fazbear Oversight console (concept)." />
        <div className="auth-denied-panel" role="alert">
          <span className="auth-legend">CLEARANCE CHECK</span>
          <h1 className="page-title">Access denied</h1>
          <p className="card-text">
            This console requires staff clearance. Guests may admire the door.
          </p>
          <div className="auth-actions">
            <Link to="/login" className="btn btn-danger">Open the staff terminal →</Link>
            <Link to="/" className="btn">Back to the wiki</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page oversight-page">
      <PageMeta
        title="Fazbear Oversight Console"
        description="Concept admin console: shift stats, staff directory and broadcast notices."
      />
      <ShaderBackdrop className="auth-shader" tint={[0.5, 0.95, 0.9]} intensity={0.85} speed={0.8} />

      <header className="oversight-head">
        <div>
          <span className="auth-legend">Fazbear Entertainment · internal</span>
          <h1 className="page-title">Oversight Console</h1>
          <p className="page-subtitle">
            Signed in as {handle} · {meta.label} · {meta.clearance}
          </p>
        </div>
        <span className="auth-chip big" data-role-chip={role}>{meta.chip}</span>
      </header>

      <section className="oversight-stats" aria-label="Shift statistics">
        {[
          ["Secrets cracked", `${count} / ${total}`],
          ["Badges earned", `${stats?.earnedCount ?? 0}`],
          ["Shifts started", `${stats?.sessions ?? 0}`],
          ["Time on site", `${Math.round((stats?.timeMs ?? 0) / 60000)} min`],
          ["Characters read", `${stats?.characterCount ?? 0} / ${stats?.characterTotal ?? "?"}`],
          ["Forum posts", `${stats?.forumPosts ?? 0}`],
        ].map(([label, value]) => (
          <div className="oversight-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div className="oversight-columns">
        <section className="oversight-block" aria-labelledby="staff-dir-title">
          <h2 id="staff-dir-title" className="section-title">Staff directory</h2>
          <ul className="oversight-directory">
            <li className="oversight-row you">
              <span className="auth-chip" data-role-chip={role}>{meta.chip}</span>
              <strong>{handle}</strong>
              <span>{meta.label} · you</span>
              <span className="oversight-state">ON SHIFT</span>
            </li>
            {DIRECTORY.map((row) => (
              <li className="oversight-row" key={row.handle}>
                <span className="auth-chip small" data-role-chip={row.role}>
                  {ROLES[row.role].chip}
                </span>
                <strong>{row.handle}</strong>
                <span>{row.last}</span>
                <span className={`oversight-state ${row.state === "UNKNOWN" ? "warn" : ""}`}>
                  {row.state}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="oversight-block" aria-labelledby="broadcast-title">
          <h2 id="broadcast-title" className="section-title">Shift broadcast</h2>
          <p className="card-text">
            Notices posted here appear on the staff terminal's welcome screen.
          </p>
          <form className="oversight-compose" onSubmit={postBroadcast}>
            <input
              type="text"
              maxLength={140}
              value={draft}
              placeholder="e.g. CAM 04 is out again. It is never CAM 04."
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Broadcast text"
            />
            <button type="submit" className="btn">Post notice</button>
          </form>
          <ul className="oversight-broadcasts">
            {broadcasts.length === 0 && (
              <li className="oversight-empty">No notices on file. The board is clean.</li>
            )}
            {broadcasts
              .slice()
              .reverse()
              .map((b) => (
                <li key={b.id}>
                  <span className="oversight-broadcast-text">{b.text}</span>
                  <span className="oversight-broadcast-by">
                    — {b.by} · {new Date(b.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>

      {isSuper && (
        <section className="oversight-classified" aria-labelledby="classified-title">
          <h2 id="classified-title" className="section-title">
            ⚠ Classified addendum
          </h2>
          <p className="card-text">
            Your clearance exposes {Math.max(0, CLASSIFIED.length - revealed)} unreleased
            incident lines. Reveal them one at a time — management is counting.
          </p>
          <ul className="oversight-redacted">
            {CLASSIFIED.slice(0, revealed).map((line) => (
              <li key={line}>{line}</li>
            ))}
            {revealed < CLASSIFIED.length && (
              <li className="oversight-redacted-mask" aria-hidden="true">
                ████████████████████████████
              </li>
            )}
          </ul>
          {revealed < CLASSIFIED.length ? (
            <button type="button" className="btn btn-danger" onClick={revealNext}>
              Reveal next line
            </button>
          ) : (
            <p className="oversight-end">
              That is everything. Remember: there is no Super Administrator above you.
              <button type="button" className="btn" onClick={logout} style={{ marginLeft: "1rem" }}>
                Resign and clock out
              </button>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
