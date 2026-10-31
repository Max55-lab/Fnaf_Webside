import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import { sfxGrant, sfxToggle } from "../audio/sound.js";
import { idbGet, idbPut, logAudit } from "../lib/db.js";
import {
  constantTimeEqual,
  hashPassword,
  sha256Hex,
  subtleAvailable,
  verifyPassword,
} from "../security/crypto.js";
import { clearFails, lockLabel, lockRemaining, registerFail } from "../security/lockout.js";
import { sanitizeText } from "../security/sanitize.js";

/* ============================================================
   STAFF TERMINAL — four clearance tiers, all local

   guest / administrator: the original concept flow. Any access
   code works; the roleplay is the feature.

   user: a real local account. The password is salted and
   stretched with PBKDF2 (SHA-256, 310k iterations) before it
   touches IndexedDB — only { salt, hash, iterations } is ever
   stored, never the plaintext.

   super-administrator: the oversight implant. The six-digit
   code does not appear in this bundle — only its SHA-256
   digest. Input is hashed first and compared in constant time,
   and failures feed a shared exponential lockout
   (3 fails -> 30s, 4 -> 2min, 5+ -> 5min).

   Sessions live in fnaf_auth_v1 and paint <html data-role> so
   CSS restyles the whole wiki per clearance. Other tabs follow
   via the storage event.
   ============================================================ */

const AUTH_KEY = "fnaf_auth_v1";
const AUTH_LOCK_SCOPE = "auth";

/* SHA-256 of the oversight implant code. Plaintext lives nowhere
   in the source; unlockOversight() hashes input before compare. */
const SUPER_CODE_SHA256 =
  "bb1f1a8629de7a12b4a1f91c7e1935ecd54cc12bc72e01658cc673164ad8adf3";

/* Fixed dummy credential: sign-in attempts against unknown
   handles do the same PBKDF2 work as known ones, so response
   time cannot be used to enumerate registered names. */
const DUMMY_CREDENTIAL = {
  salt: "00000000000000000000000000000000",
  hash: "0000000000000000000000000000000000000000000000000000000000000000",
};

export const ROLES = {
  guest: {
    id: "guest",
    label: "Guest",
    chip: "GUEST",
    card: "VISITOR PASS",
    clearance: "CLEARANCE 0",
    tagline: "Walk-in. Pizza is complimentary. Archives are open.",
    accent: "#ffd600",
    secret: "role-guest",
  },
  user: {
    id: "user",
    label: "User",
    chip: "CREW",
    card: "CREW BADGE",
    clearance: "CLEARANCE 1",
    tagline: "Registered fan. Forum posts, boards and bookmarks are yours.",
    accent: "#00e676",
    secret: "role-user",
  },
  administrator: {
    id: "administrator",
    label: "Administrator",
    chip: "ADMIN",
    card: "STAFF KEYCARD",
    clearance: "CLEARANCE 2",
    tagline: "Night staff. Camera bus unlocked. Console access granted.",
    accent: "#00e5ff",
    secret: "role-admin",
  },
  "super-administrator": {
    id: "super-administrator",
    label: "Super Administrator",
    chip: "OVERSIGHT",
    card: "OVERSIGHT IMPLANT",
    clearance: "CLEARANCE ∞",
    tagline: "Fazbear Holdings oversight. You sign the incident reports.",
    accent: "#ff1744",
    secret: "role-super",
  },
};

export const ROLE_IDS = Object.keys(ROLES);

/* Lockout helpers for the terminal's shared "auth" scope. */
export const authLockRemaining = () => lockRemaining(AUTH_LOCK_SCOPE);
export const authLockLabel = (msLeft) => lockLabel(msLeft);

function readAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    if (!stored || typeof stored !== "object") return null;
    if (!ROLE_IDS.includes(stored.role)) return null;
    return {
      role: stored.role,
      handle: typeof stored.handle === "string" && stored.handle ? stored.handle : null,
      since: typeof stored.since === "string" ? stored.since : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function cleanHandle(handleRaw, fallbackPrefix) {
  const handle = sanitizeText(handleRaw, 20).trim();
  if (handle) return handle;
  return `${fallbackPrefix}_${String(Math.floor(Math.random() * 90) + 10)}`;
}

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { discover } = useSecrets();
  const [session, setSession] = useState(readAuth);

  /* Paint the role onto <html> so CSS can restyle the entire site. */
  useEffect(() => {
    document.documentElement.dataset.role = session?.role || "guest";
  }, [session]);

  /* Keep every tab in agreement: sign-in/out in one tab updates
     the others through the storage event. */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === AUTH_KEY) setSession(readAuth());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* One write path for every successful login. */
  const startSession = useCallback(
    (meta, handleRaw) => {
      const next = {
        role: meta.id,
        handle: cleanHandle(handleRaw, "GUARD"),
        since: new Date().toISOString(),
      };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      } catch {
        /* private mode — the session still works for this page load */
      }
      setSession(next);
      sfxGrant();
      discover(meta.secret);
      return next;
    },
    [discover]
  );

  /* Concept roles only — user and super-administrator must go
     through their verification paths below, never around them. */
  const login = useCallback(
    (roleId, handle) => {
      const meta = ROLES[roleId];
      if (!meta || meta.id === "user" || meta.id === "super-administrator") return null;
      return startSession(meta, handle);
    },
    [startSession]
  );

  /* ---- Local account: create (PBKDF2, salted) ---- */
  const createAccount = useCallback(
    async (handleRaw, password) => {
      if (!subtleAvailable()) {
        return {
          ok: false,
          error: "Web Crypto is unavailable here — account badges need a secure context (https:// or file://).",
        };
      }
      const handle = sanitizeText(handleRaw, 20).trim();
      if (handle.length < 3) return { ok: false, error: "Handle needs at least three characters." };
      const pw = String(password ?? "");
      if (pw.length < 6) return { ok: false, error: "Password needs at least six characters." };
      try {
        const key = handle.toLowerCase();
        const existing = await idbGet("accounts", key);
        if (existing) {
          return { ok: false, error: "That handle is registered already — switch to sign in." };
        }
        const creds = await hashPassword(pw);
        await idbPut("accounts", {
          handle: key,
          display: handle,
          ...creds,
          createdAt: new Date().toISOString(),
        });
        await logAudit("account-created", key);
        return { ok: true, session: startSession(ROLES.user, handle) };
      } catch (err) {
        if (err?.name === "QuotaExceededError") {
          return {
            ok: false,
            error: "Browser storage is full — the account could not be saved. Free some space and retry.",
          };
        }
        return { ok: false, error: `Account storage failed: ${String(err?.message || err)}` };
      }
    },
    [startSession]
  );

  /* ---- Local account: sign in (constant-time verify) ---- */
  const signInAccount = useCallback(
    async (handleRaw, password) => {
      if (!subtleAvailable()) {
        return {
          ok: false,
          error: "Web Crypto is unavailable here — account badges need a secure context (https:// or file://).",
        };
      }
      const lockedMs = lockRemaining(AUTH_LOCK_SCOPE);
      if (lockedMs > 0) {
        return { ok: false, locked: true, error: `Terminal locked — wait ${lockLabel(lockedMs)}.` };
      }
      const key = sanitizeText(handleRaw, 20).trim().toLowerCase();
      let record = null;
      try {
        record = await idbGet("accounts", key);
      } catch {
        record = null;
      }
      let valid = false;
      try {
        /* Unknown handles still burn a full PBKDF2 round so the
           response time reveals nothing about who is registered. */
        const probe = record || DUMMY_CREDENTIAL;
        valid = (await verifyPassword(password, probe)) && Boolean(record);
      } catch {
        valid = false;
      }
      if (!valid) {
        const { fails, lockedForMs } = registerFail(AUTH_LOCK_SCOPE);
        await logAudit("signin-failed", key || "(empty)");
        return {
          ok: false,
          locked: lockedForMs > 0,
          error: lockedForMs > 0
            ? `Wrong handle or password — terminal locked for ${lockLabel(lockedForMs)}.`
            : `Wrong handle or password (${fails}/3 before lockout).`,
        };
      }
      clearFails(AUTH_LOCK_SCOPE);
      await logAudit("signin", key);
      return { ok: true, session: startSession(ROLES.user, record.display || key) };
    },
    [startSession]
  );

  /* ---- Oversight implant: hashed, constant-time, lockout-backed ---- */
  const unlockOversight = useCallback(
    async (handleRaw, code) => {
      if (!subtleAvailable()) {
        return {
          ok: false,
          error: "Web Crypto is unavailable here — the implant field needs a secure context.",
        };
      }
      const lockedMs = lockRemaining(AUTH_LOCK_SCOPE);
      if (lockedMs > 0) {
        return { ok: false, locked: true, error: `Terminal locked — wait ${lockLabel(lockedMs)}.` };
      }
      let digest = "";
      try {
        digest = await sha256Hex(String(code ?? "").trim());
      } catch {
        digest = "";
      }
      /* Length gate first, then a compare that always walks both
         strings — the digest is a fixed 64 hex chars either way. */
      const ok =
        digest.length === SUPER_CODE_SHA256.length &&
        constantTimeEqual(digest, SUPER_CODE_SHA256);
      if (!ok) {
        const { fails, lockedForMs } = registerFail(AUTH_LOCK_SCOPE);
        await logAudit("oversight-rejected", `${fails} failed attempt(s)`);
        return {
          ok: false,
          locked: lockedForMs > 0,
          error: lockedForMs > 0
            ? `IMPLANT REJECTED — terminal locked for ${lockLabel(lockedForMs)}.`
            : `IMPLANT CODE REJECTED (${fails}/3 before lockout).`,
        };
      }
      clearFails(AUTH_LOCK_SCOPE);
      await logAudit("oversight-unlocked", "implant accepted");
      /* The typed code is the discovery: it is the only way in. */
      discover("code-implant");
      return {
        ok: true,
        session: startSession(ROLES["super-administrator"], cleanHandle(handleRaw, "OVERSIGHT")),
      };
    },
    [startSession, discover]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* storage unavailable */
    }
    setSession(null);
    sfxToggle(false);
  }, []);

  /* "sudo" easter egg — now strictly an administrator perk. */
  useEffect(() => {
    if (!session || (session.role !== "administrator" && session.role !== "super-administrator")) {
      return undefined;
    }
    let buffer = "";
    const onKey = (event) => {
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-4);
      if (buffer === "sudo") {
        buffer = "";
        discover("sudo");
        console.log(
          "%c[sudo] permission granted. nice try, we kept the log anyway.",
          "color:#ff1744;font-family:monospace"
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, discover]);

  const value = useMemo(() => {
    const meta = session ? ROLES[session.role] : null;
    return {
      session,
      signedIn: Boolean(session),
      role: session?.role || "guest",
      handle: session?.handle || null,
      meta,
      isUser: session?.role === "user",
      isAdmin: session?.role === "administrator" || session?.role === "super-administrator",
      isSuper: session?.role === "super-administrator",
      cryptoReady: subtleAvailable(),
      login,
      logout,
      createAccount,
      signInAccount,
      unlockOversight,
    };
  }, [session, login, logout, createAccount, signInAccount, unlockOversight]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
