import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import ShaderBackdrop from "../components/ShaderBackdrop.jsx";
import {
  useAuth,
  ROLES,
  ROLE_IDS,
  authLockLabel,
  authLockRemaining,
} from "../auth/AuthProvider.jsx";
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
   catches them. Only the concept (guest/admin) code field listens. */
const CODE_EGGS = {
  "1987": { secret: "code-1987", line: "ACCESS LOG ANOMALY: subject referenced THE BITE. File it under 'why'." },
  afton: { secret: "code-afton", line: "⚠ RESTRICTED NAME FLAGGED. He always comes back. Badge him at the door." },
  purple: { secret: "code-purple", line: "⚠ RESTRICTED NAME FLAGGED. There is no staff member by that colour." },
  henry: { secret: "code-henry", line: "HENRY EMPLOYEE RECORD… [REDACTED BY ORDER OF MANAGEMENT]." },
};

export default function Login() {
  const {
    signedIn,
    session,
    handle: authHandle,
    meta,
    isAdmin,
    isSuper,
    isUser,
    login,
    logout,
    createAccount,
    signInAccount,
    unlockOversight,
  } = useAuth();
  const { discover } = useSecrets();
  const navigate = useNavigate();

  const [rolePick, setRolePick] = useState("guest");
  const [handle, setHandle] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("create"); // "create" | "signin"
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [denied, setDenied] = useState(false);
  const [restricted, setRestricted] = useState("");
  const codeRef = useRef(null);
  const restrictedTimer = useRef(null);

  /* Shared exponential lockout (3 fails -> 30s, 4 -> 2min, 5+ -> 5min).
     A 250ms tick keeps the countdown honest while locked. */
  const [lockMs, setLockMs] = useState(() => authLockRemaining());
  const locked = lockMs > 0;
  useEffect(() => {
    if (!locked) return undefined;
    const timer = setInterval(() => setLockMs(authLockRemaining()), 250);
    return () => clearInterval(timer);
  }, [locked]);

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
    setFormError("");
    const low = value.trim().toLowerCase();
    const egg = CODE_EGGS[low];
    if (egg) flashRestricted(egg.line, egg.secret);
  };

  const switchRole = (id) => {
    setRolePick(id);
    setFormError("");
    setDenied(false);
    sfxType();
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormError("");
    setDenied(false);
    sfxType();
  };

  const fail = (message) => {
    setFormError(message);
    setDenied(true);
    setLockMs(authLockRemaining());
    sfxDeny();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy || locked) return;

    /* ---- Registered crew: PBKDF2 local account ---- */
    if (rolePick === "user") {
      if (!handle.trim() || !password) {
        fail("Enter your crew handle and password.");
        return;
      }
      setBusy(true);
      setFormError("");
      try {
        const result =
          mode === "create"
            ? await createAccount(handle, password)
            : await signInAccount(handle, password);
        if (!result.ok) {
          fail(result.error);
          return;
        }
        setDenied(false);
        setPassword("");
        setHandle("");
      } finally {
        setBusy(false);
      }
      return;
    }

    /* ---- Oversight implant: hashed six-digit code ---- */
    if (rolePick === "super-administrator") {
      if (!code.trim()) {
        fail("IMPLANT FIELD EMPTY — management's number is six digits. The Vault remembers which.");
        return;
      }
      setBusy(true);
      setFormError("");
      try {
        const result = await unlockOversight(handle, code);
        if (!result.ok) {
          fail(result.error);
          return;
        }
        setDenied(false);
        setCode("");
        setHandle("");
      } finally {
        setBusy(false);
      }
      return;
    }

    /* ---- Guest / Administrator: the concept flow ---- */
    if (!code.trim()) {
      fail("AUTHORIZATION DENIED — a code is required. Any code. This is a concept.");
      return;
    }
    const next = login(rolePick, handle);
    if (!next) {
      fail("The badge printer jammed. Pick a badge and try again.");
      return;
    }
    setDenied(false);
    setCode("");
    setHandle("");
  };

  const clockOut = () => {
    logout();
    setRestricted("");
  };

  const submitLabel =
    rolePick === "user"
      ? mode === "create"
        ? "▶ Create badge"
        : "▶ Clock in"
      : rolePick === "super-administrator"
        ? "▶ Verify implant"
        : "▶ Clock in";

  const fineprintByRole = () => {
    if (rolePick === "user") {
      return mode === "create"
        ? "Passwords are salted and hashed with PBKDF2 in this browser — never transmitted, never stored raw. Your badge lives here only."
        : "Signing in verifies your salted password hash locally. Lost passwords cannot be recovered — clear the account's browser data or use another badge.";
    }
    if (rolePick === "super-administrator") {
      return "Oversight implants answer to a six-digit accession number management swears it never issued. The Vault has one memory of it. Three wrong guesses buys you a lockout.";
    }
    return "Fazbear Entertainment is not responsible for what your badge unlocks. Try 1987, afton, purple or henry in the code field — the terminal is listening.";
  };

  return (
    <div className="page auth-page">
      <PageMeta
        title="Staff Terminal — Concept"
        description="A concept-only FNAF Entertainment staff terminal: sign in as Guest, User, Administrator or Super Administrator and the whole wiki restyles to your clearance."
        keywords="FNAF login, staff terminal, roleplay"
      />
      <ShaderBackdrop className="auth-shader" tint={[0.35, 0.9, 0.85]} intensity={0.9} />

      <h1 className="page-title auth-title">Fazbear Security Terminal</h1>
      <p className="page-subtitle">
        Four clearance tiers, all local. Guest and staff badges are concept codes; the
        Crew badge is a real account hashed inside this browser. Every level restyles
        the whole wiki.
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
          {isAdmin && !isSuper && (
            <p className="auth-super-note">
              Try typing <code>sudo</code> somewhere while wearing this badge. Somewhere.
            </p>
          )}
          {isUser && (
            <p className="auth-super-note">
              Registered crew: forum posting and break-room chat recognise your badge. Your
              password stays a salted hash in this browser — see the Save file panel on your
              Service Record to back everything up.
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
                    onChange={() => switchRole(id)}
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

            {rolePick === "user" && (
              <>
                <div className="auth-modes" role="group" aria-label="Account mode">
                  <button
                    type="button"
                    className={`auth-mode ${mode === "create" ? "active" : ""}`}
                    aria-pressed={mode === "create"}
                    onClick={() => switchMode("create")}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    className={`auth-mode ${mode === "signin" ? "active" : ""}`}
                    aria-pressed={mode === "signin"}
                    onClick={() => switchMode("signin")}
                  >
                    Sign in
                  </button>
                </div>
                <label className="auth-field" htmlFor="auth-password">
                  <span>Password{mode === "create" ? " · six characters minimum" : ""}</span>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === "create" ? "new-password" : "current-password"}
                    placeholder="hashed with PBKDF2 before storage"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setDenied(false);
                      setFormError("");
                    }}
                    onKeyDown={(e) => e.key.length === 1 && sfxType()}
                    disabled={locked || busy}
                    aria-invalid={denied}
                  />
                </label>
              </>
            )}

            {rolePick !== "user" && rolePick !== "super-administrator" && (
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
            )}

            {rolePick === "super-administrator" && (
              <label className="auth-field" htmlFor="auth-implant">
                <span>Oversight implant code</span>
                <input
                  id="auth-implant"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="management never writes it down"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setDenied(false);
                    setFormError("");
                  }}
                  onKeyDown={(e) => e.key.length === 1 && sfxType()}
                  disabled={locked || busy}
                  aria-invalid={denied}
                />
              </label>
            )}

            {locked && (
              <div className="auth-lockout" role="alert">
                ⛔ TERMINAL LOCKED — too many failed attempts. Retrying in{" "}
                <strong>{authLockLabel(lockMs)}</strong>.
              </div>
            )}
            {formError && (
              <div className="auth-denied" role="alert">
                {formError}
              </div>
            )}
            {restricted && (
              <div className="auth-restricted" role="alert">
                {restricted}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-danger auth-submit"
              disabled={busy || locked}
            >
              {busy ? "Verifying…" : submitLabel}
            </button>
            <p className="auth-fineprint">{fineprintByRole()}</p>
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
