/* ============================================================
   LOGIN LOCKOUT — exponential backoff for failed attempts
   3 failures  -> 30 second cooldown
   4 failures  -> 2 minute cooldown
   5+ failures -> 5 minute cooldown
   State lives in localStorage (fnaf_lockout_v1) per scope, so a
   reload does not reset the counter. A successful attempt clears
   its scope.
   ============================================================ */

const KEY = "fnaf_lockout_v1";

/* Checked worst-first: first rule whose threshold is reached wins. */
const STEPS = [
  { fails: 5, ms: 5 * 60 * 1000 },
  { fails: 4, ms: 2 * 60 * 1000 },
  { fails: 3, ms: 30 * 1000 },
];

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — lockout is best-effort */
  }
}

function ruleFor(fails) {
  return STEPS.find((step) => fails >= step.fails) || null;
}

/* Milliseconds left on the given scope's cooldown (0 = free to try). */
export function lockRemaining(scope) {
  const entry = read()[scope];
  if (!entry) return 0;
  return Math.max(0, (entry.until || 0) - Date.now());
}

/* Record a failed attempt. Returns { fails, lockedForMs }. */
export function registerFail(scope) {
  const map = read();
  const entry = map[scope] || { fails: 0, until: 0 };
  entry.fails = (entry.fails || 0) + 1;
  const rule = ruleFor(entry.fails);
  entry.until = rule ? Date.now() + rule.ms : 0;
  map[scope] = entry;
  write(map);
  return { fails: entry.fails, lockedForMs: rule ? rule.ms : 0 };
}

/* Successful attempt — wipe the counter for this scope. */
export function clearFails(scope) {
  const map = read();
  if (map[scope]) {
    delete map[scope];
    write(map);
  }
}

/* "0:29" style clock label for countdown UIs. */
export function lockLabel(msLeft) {
  const total = Math.max(0, Math.ceil(msLeft / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
