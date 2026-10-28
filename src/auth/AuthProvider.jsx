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

/* ============================================================
   CONCEPT AUTHENTICATION
   A fake, browser-local staff terminal. No real accounts, no
   network — the "roleplay" is the feature. Everything lives in
   localStorage under fnaf_auth_v1 and drives a data-role
   attribute on <html> so the whole site restyles per clearance.
   ============================================================ */

const AUTH_KEY = "fnaf_auth_v1";

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

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { discover } = useSecrets();
  const [session, setSession] = useState(readAuth);

  /* Paint the role onto <html> so CSS can restyle the entire site. */
  useEffect(() => {
    document.documentElement.dataset.role = session?.role || "guest";
  }, [session]);

  const login = useCallback(
    (roleId, handle) => {
      const meta = ROLES[roleId] || ROLES.guest;
      const next = {
        role: meta.id,
        handle: (handle || "").trim().slice(0, 20) || `GUARD_${String(Math.floor(Math.random() * 90) + 10)}`,
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

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* storage unavailable */
    }
    setSession(null);
    sfxToggle(false);
  }, []);

  /* "sudo" easter egg — only works while wearing an admin badge, anywhere. */
  useEffect(() => {
    if (!session || session.role === "guest") return undefined;
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
      isAdmin: session?.role === "administrator" || session?.role === "super-administrator",
      isSuper: session?.role === "super-administrator",
      login,
      logout,
    };
  }, [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
