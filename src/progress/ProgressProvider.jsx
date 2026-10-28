import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { sfxVictory } from "../audio/sound.js";
import {
  trackRoute,
  markSession,
  addTime,
  recordEarned,
  clearRecord,
  computeSnapshot,
} from "./record.js";
import { ACHIEVEMENTS, evaluateAchievements, rankFor } from "./achievements.js";

/* Progress context — dashboard stats, badge catalog, rank and reset. */
const ProgressContext = createContext(null);
export const useProgress = () => useContext(ProgressContext);

const TICK_MS = 15000;
const TOAST_MS = 4500;

export function ProgressProvider({ children }) {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState(() => computeSnapshot());
  const [toast, setToast] = useState(null); // { badge, earnedCount }
  const lastPathRef = useRef(null);
  const tickRef = useRef(Date.now());
  const queueRef = useRef([]);
  const toastTimer = useRef(null);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToast(null);
    queueRef.current = [];
  }, []);

  const showNextToast = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const next = queueRef.current.shift();
    setToast(next);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
      showNextToast();
    }, TOAST_MS);
  }, []);

  /* Re-read every store, evaluate the catalog, and announce anything new. */
  const recompute = useCallback(() => {
    const current = computeSnapshot();
    const newly = evaluateAchievements(current);
    if (newly.length === 0) {
      setSnapshot(current);
      return;
    }
    recordEarned(newly.map((badge) => badge.id));
    const fresh = computeSnapshot();
    setSnapshot(fresh);
    for (const badge of newly) {
      queueRef.current.push({ badge, earnedCount: Object.keys(fresh.earned).length });
    }
    sfxVictory();
    showNextToast();
  }, [showNextToast]);

  /* One shift per real app load (StrictMode/HMR safe via sessionStorage). */
  useEffect(() => {
    markSession();
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Track navigation: character/game detail ids, small-hours visits, counts. */
  useEffect(() => {
    if (lastPathRef.current === location.pathname) return;
    trackRoute(location.pathname, lastPathRef);
    recompute();
  }, [location.pathname, recompute]);

  /* Visible-tab time + periodic re-check (picks up scores, secrets, posts). */
  useEffect(() => {
    const flush = () => {
      const now = Date.now();
      const delta = now - tickRef.current;
      tickRef.current = now;
      if (delta > 0 && !document.hidden) addTime(delta);
    };
    const onVisibility = () => {
      if (document.hidden) flush();
      else tickRef.current = Date.now();
    };
    const id = setInterval(() => {
      if (document.hidden) return;
      flush();
      recompute();
    }, TICK_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [recompute]);

  const earnedCount = Object.keys(snapshot.earned).length;
  const rank = useMemo(() => rankFor(earnedCount, ACHIEVEMENTS.length), [earnedCount]);

  const value = useMemo(
    () => ({
      snapshot,
      achievements: ACHIEVEMENTS,
      total: ACHIEVEMENTS.length,
      earnedCount,
      rank,
      toast,
      dismissToast,
      reset: () => {
        clearRecord();
        setToast(null);
        queueRef.current = [];
        setSnapshot(computeSnapshot());
      },
    }),
    [snapshot, earnedCount, rank, toast, dismissToast]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}

      {toast && (
        <div
          className="badge-toast"
          role="status"
          aria-live="polite"
          onClick={dismissToast}
        >
          <span className="badge-toast-icon" aria-hidden="true">
            {toast.badge.icon}
          </span>
          <span className="badge-toast-body">
            <span className="badge-toast-label">🏅 BADGE UNLOCKED</span>
            <span className="badge-toast-title">{toast.badge.title}</span>
            <span className="badge-toast-text">{toast.badge.desc}</span>
            <span className="badge-toast-count">
              {toast.earnedCount} / {ACHIEVEMENTS.length} BADGES EARNED
            </span>
          </span>
        </div>
      )}
    </ProgressContext.Provider>
  );
}
