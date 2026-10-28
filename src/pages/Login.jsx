import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import ShaderBackdrop from "../components/ShaderBackdrop.jsx";
import { useAuth, ROLES, ROLE_IDS } from "../auth/AuthProvider.jsx";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import { setAmbientScene, sfxDeny, sfxType, sfxKnock } from "../audio/sound.js";
import "./../styles/auth.css";

const BROADCAST_KEY = "fnaf_auth_broadcasts";

function loadNotice() {
  try {
    const list = JSON.parse(localStorage.getItem(BROADCAST_KEY) || "[]");
    if (!Array.isArray(list) || !list.length) return null;
    return list[list.length - 1];
  } catch {
    return null;
  }
}

/* Codes worth checking while you type in a real input — the global
   keyboard listener ignores form fields, so the terminal itself
   catches them. */
const CODE_EGGS = {
  "1987": { secret: "code-1987", line: "ACCESS LOG ANOMALY: subject referenced THE BITE. File it under 'why'." },
  afton: { secret: "code-afton", line: "⚠ RESTRICTED NAME FLAGGED. He always comes back. Badge him at the door." },
  purple: { secret: "code-purple", line: "⚠ RESTRICTED NAME FLAGGED. There is no staff member by that colour." },
  henry: { secret: "code-henry", line: "HENRY EMPLOYEE RECORD… [REDACTED BY ORDER OF MANAGEMENT]." },
};

export default function Login() {
  const { signedIn, session, handle: authHandle, meta, isAdmin, isSuper, login, logout } = useAuth();
  const { discover } = useSecrets();
  const navigate = useNavigate();

  const [rolePick, setRolePick] = useState("guest");
  const [handle, setHandle] = useState("");
  const [code, setCode] = useState("");
  const [denied, setDenied] = useState(false);
  const [restricted, setRestricted] = useState("");
  const codeRef = useRef(null);
  const restrictedTimer = useRef(null);

  const hintLine = useMemo(() => {
    if (signedIn) return null;
    const n = loadNotice();
    return n && typeof n.text === "string" ? n : null;
  }, [signedIn]);

  useEffect(() => {
    setAmbientScene("fnaf-1");
    return () => setAmbientScene("site");
  }, []);

  /* Two knocks as the terminal paints — nobody else is on shift. */
  useEffect(() => {
    const t = setTimeout(() => sfxKnock(), 500);
    return () => {
      clearTimeout(t);
      clearTimeout(restrictedTimer.current);
    };
  }, []);

  const flashRestricted = (line, secret) => {
    setRestricted(line);
    if (secret) discover(secret);
    if (restrictedTimer.current) clearTimeout(restrictedTimer.current);
    restrictedTimer.current = setTimeout(() => setRestricted(""), 4200);
  };

  const onCodeChange = (value) => {
    setCode(value);
    setDenied(false);
    const low = value.trim().toLowerCase();
    const egg = CODE_EGGS[low];
    if (egg) flashRestricted(egg.line, egg.secret);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!code.trim()) {
      setDenied(true);
      sfxDeny();
      return;
    }
    const next = login(rolePick, handle);
    setCode("");
    setHandle("");
    return next;
  };

  const clockOut = () => {
    logout();
    setRestricted("");
  };

  return (
    <div className="page auth-page">
      <PageMeta
        title="Staff Terminal — Concept"
        description="A concept-only Fazbear Entertainment staff terminal: sign in as Guest, Administrator or Super Administrator and the whole wiki restyles to your clearance."
        keywords="FNAF login, staff terminal, roleplay"
      />
      <ShaderBackdrop className="auth-shader" tint={[0.35, 0.9, 0.85]} intensity={0.9} />

      <h1 className="page-title auth-title">Fazbear Security Terminal</h1>
      <p className="page-subtitle">
        Concept terminal · clearance roleplay. No real accounts — your badge lives in this
        browser only, and every clearance level restyles the whole wiki.
      </p>

      {!signedIn && hintLine && (
        <div className="auth-notice" role="status">
          <span className="auth-notice-label">SHIFT NOTICE</span>
          <span>{hintLine.text}</span>
          {hintLine.by && <span className="auth-notice-by">— {hintLine.by}</span>}
        </div>
      )}

      {signedIn ? (
        <section className={`auth-signed auth-clearance-${session.role}`} aria-label="Active session">
          <div className="auth-card-head">
            <span className="auth-chip" data-role-chip={session.role}>{meta.chip}</span>
            <span className="auth-clearance">{meta.clearance}</span>
          </div>
          <div className="auth-card-name">{authHandle}</div>
          <div className="auth-card-role">{meta.label} · {meta.card}</div>
          <p className="auth-card-tag">{meta.tagline}</p>
          <div className="auth-card-meta">
            <span>Badge issued {new Date(session.since).toLocaleString()}</span>
            <span>Session stored locally · fnaf_auth_v1</span>
          </div>
          <div className="auth-actions">
            {isAdmin && (
              <button type="button" className="btn btn-danger" onClick={() => navigate("/admin")}>
                Open Oversight Console →
              </button>
            )}
            <button type="button" className="btn" onClick={clockOut}>
              Clock out
            </button>
          </div>
          {isSuper && (
            <p className="auth-super-note">
              ⚠ Oversight note: typing <code>sudo</code> anywhere on this site now works.
              Management regrets this.
            </p>
          )}
          {!isSuper && (
            <p className="auth-super-note">
              Try typing <code>sudo</code> somewhere while wearing this badge. Somewhere.
            </p>
          )}
        </section>
      ) : (
        <form className="auth-grid" onSubmit={submit} noValidate>
          <fieldset className="auth-keycards">
            <legend className="auth-legend">Choose your badge</legend>
            {ROLE_IDS.map((id) => {
              const role = ROLES[id];
              const active = rolePick === id;
              return (
                <label
                  key={id}
                  className={`auth-keycard ${active ? "active" : ""}`}
                  style={{ "--role-accent": role.accent }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={id}
                    checked={active}
                    onChange={() => {
                      setRolePick(id);
                      sfxType();
                    }}
                  />
                  <span className="auth-keycard-chip">{role.chip}</span>
                  <strong className="auth-keycard-label">{role.label}</strong>
                  <span className="auth-keycard-clear">{role.clearance}</span>
                  <span className="auth-keycard-tag">{role.tagline}</span>
                </label>
              );
            })}
          </fieldset>

          <div className="auth-form">
            <label className="auth-field" htmlFor="auth-handle">
              <span>Handle</span>
              <input
                id="auth-handle"
                type="text"
                maxLength={20}
                autoComplete="off"
                placeholder="e.g. NIGHT_GUARD_03"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key.length === 1 && sfxType()}
              />
            </label>
            <label className="auth-field" htmlFor="auth-code">
              <span>Access code</span>
              <input
                id="auth-code"
                ref={codeRef}
                type="text"
                autoComplete="off"
                placeholder="any code works — this is a concept"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                onKeyDown={(e) => e.key.length === 1 && sfxType()}
                aria-invalid={denied}
              />
            </label>

            {denied && (
              <div className="auth-denied" role="alert">
                AUTHORIZATION DENIED — a code is required. Any code. This is a concept.
              </div>
            )}
            {restricted && (
              <div className="auth-restricted" role="alert">
                {restricted}
              </div>
            )}

            <button type="submit" className="btn btn-danger auth-submit">
              ▶ Clock in
            </button>
            <p className="auth-fineprint">
              Fazbear Entertainment is not responsible for what your badge unlocks. Try 1987,
              afton, purple or henry in the code field — the terminal is listening.
            </p>
            <p className="auth-fineprint">
              <Link to="/admin">Oversight console</Link> requires staff clearance ·{" "}
              <Link to="/">back to the wiki</Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
