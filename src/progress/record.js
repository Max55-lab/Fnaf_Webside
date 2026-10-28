// Browser-local "service record" — the raw statistics layer behind the
// achievements dashboard. Pure storage + snapshot helpers: no React state,
// no timers, no side effects beyond localStorage/sessionStorage.
//
// The record tracks what THIS visitor has done (pages read, time on site,
// sessions started). Scores, secrets, bookmarks and forum posts stay in
// their own stores; computeSnapshot() reads them together so achievements
// can be evaluated from one flat object.
import { loadThreads, loadAuthor } from "../lib/forum.js";
import { SECRETS } from "../secrets/SecretsProvider.jsx";
import { characters } from "../data/characters.js";
import { games } from "../data/games.js";

export const PROGRESS_KEY = "fnaf_progress_v1";
const SESSION_KEY = "fnaf_shift_marked"; // sessionStorage — one mark per real load

const PREFS_KEY = "fnaf_prefs_v2";
const SECRETS_KEY = "fnaf_secrets_found";
const SCORE_KEYS = {
  plushtrap: "fnaf_mg_plushtrap_best",
  "shadow-bonnie": "fnaf_mg_shadowbonnie_best",
  "fruity-maze": "fnaf_mg_fruitymaze_best",
  "foxy-dash": "fnaf_mg_foxydash_best",
  "music-box": "fnaf_mg_musicbox_best",
  "pizza-toss": "fnaf_mg_pizzatoss_best",
  "golden-stare": "fnaf_mg_goldenstare_best",
};
const POLL_KEYS = ["fnaf_poll_era_v1", "fnaf_tier_list_v1"];

/* The ten top-level sections of the wiki. Section-scout style achievements
   compare against this list; detail pages count towards their parent. */
export const SECTIONS = [
  "/",
  "/characters",
  "/games",
  "/lore",
  "/media",
  "/play",
  "/community",
  "/secrets",
  "/vault",
  "/achievements",
];

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function emptyRecord() {
  return {
    v: 1,
    startedAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    sessions: 0,
    timeMs: 0,
    routes: {}, // pathname -> visit count
    characters: {}, // character id -> true
    games: {}, // game id -> true
    smallHours: false, // visited between 00:00 and 05:00
    earned: {}, // badge id -> ISO timestamp it was earned
  };
}

export function loadRecord() {
  const base = emptyRecord();
  const stored = safeParse(localStorage.getItem(PROGRESS_KEY), null);
  if (!stored || typeof stored !== "object") return base;
  return {
    ...base,
    ...stored,
    routes: stored.routes && typeof stored.routes === "object" ? stored.routes : {},
    characters: stored.characters && typeof stored.characters === "object" ? stored.characters : {},
    games: stored.games && typeof stored.games === "object" ? stored.games : {},
    earned: stored.earned && typeof stored.earned === "object" ? stored.earned : {},
  };
}

function saveRecord(record) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — the session still works, stats just won't persist */
  }
}

/* Record one navigation. Consecutive duplicate pathnames are skipped so
   React StrictMode's double-invoked mount effect never double-counts. */
export function trackRoute(pathname, lastTrackedRef) {
  if (!pathname) return;
  if (lastTrackedRef && lastTrackedRef.current === pathname) return;
  if (lastTrackedRef) lastTrackedRef.current = pathname;

  const record = loadRecord();
  record.routes[pathname] = (Number(record.routes[pathname]) || 0) + 1;

  const characterMatch = pathname.match(/^\/characters\/([^/]+)/);
  if (characterMatch) record.characters[decodeURIComponent(characterMatch[1])] = true;
  const gameMatch = pathname.match(/^\/games\/([^/]+)/);
  if (gameMatch) record.games[decodeURIComponent(gameMatch[1])] = true;

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) record.smallHours = true;

  record.lastSeenAt = new Date().toISOString();
  saveRecord(record);
}

/* Count one app boot ("shift started"). sessionStorage keeps StrictMode
   and hot-reloads from inflating the number. */
export function markSession() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* sessionStorage unavailable — still count the shift for this load */
  }
  const record = loadRecord();
  record.sessions += 1;
  record.lastSeenAt = new Date().toISOString();
  saveRecord(record);
}

/* Add visible-tab time. Callers pass the elapsed delta; a two-minute cap
   keeps a suspended laptop or a long sleep from inflating the total. */
export function addTime(ms) {
  const delta = Number(ms);
  if (!Number.isFinite(delta) || delta <= 0) return;
  const record = loadRecord();
  record.timeMs += Math.min(delta, 2 * 60 * 1000);
  saveRecord(record);
}

export function recordEarned(ids) {
  if (!ids.length) return;
  const record = loadRecord();
  const now = new Date().toISOString();
  for (const id of ids) {
    if (!record.earned[id]) record.earned[id] = now;
  }
  saveRecord(record);
}

/* Wipe the record only. Secrets, scores, bookmarks and forum posts live in
   their own stores and are left untouched (badges tied to them re-derive). */
export function clearRecord() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* storage unavailable */
  }
}

/* Flatten every store into one snapshot for achievement evaluation. */
export function computeSnapshot() {
  const record = loadRecord();

  const secretList = safeParse(localStorage.getItem(SECRETS_KEY), []);
  const prefs = safeParse(localStorage.getItem(PREFS_KEY), {});
  const bookmarks = Array.isArray(prefs.bookmarks) ? prefs.bookmarks.length : 0;
  /* Ignore ids of retired secrets so old profiles can't overcount. */
  const secretsFound = Array.isArray(secretList)
    ? secretList.filter((id) => typeof id === "string" && SECRETS[id]).length
    : 0;

  const bestScores = {};
  let scoredCount = 0;
  for (const [id, key] of Object.entries(SCORE_KEYS)) {
    const value = Number(localStorage.getItem(key)) || 0;
    bestScores[id] = value;
    if (value > 0) scoredCount += 1;
  }

  const threads = loadThreads();
  const author = loadAuthor();
  let threadsAuthored = 0;
  let repliesAuthored = 0;
  if (author) {
    for (const thread of threads) {
      if (thread.author === author) threadsAuthored += 1;
      for (const reply of thread.replies || []) {
        if (reply.author === author) repliesAuthored += 1;
      }
    }
  }

  const voted = POLL_KEYS.some(
    (key) => safeParse(localStorage.getItem(key), null) !== null
  );

  const routeKeys = Object.keys(record.routes);
  const sectionCount = SECTIONS.filter((section) =>
    routeKeys.some((path) => path === section || path.startsWith(`${section}/`))
  ).length;

  return {
    startedAt: record.startedAt,
    sessions: record.sessions,
    timeMs: record.timeMs,
    smallHours: Boolean(record.smallHours),
    routes: record.routes,
    characterIds: Object.keys(record.characters),
    characterCount: Object.keys(record.characters).length,
    characterTotal: characters.length,
    gameIds: Object.keys(record.games),
    gameCount: Object.keys(record.games).length,
    gameTotal: games.length,
    sectionCount,
    sectionTotal: SECTIONS.length,
    secretsFound,
    secretsTotal: Object.keys(SECRETS).length,
    bookmarks,
    bestScores,
    scoredCount,
    scoredTotal: Object.keys(SCORE_KEYS).length,
    signedIn: Boolean(safeParse(localStorage.getItem("fnaf_auth_v1"), null)?.role),
    forumPosts: threadsAuthored + repliesAuthored,
    threadsAuthored,
    voted,
    earned: record.earned,
    earnedCount: Object.keys(record.earned).length,
  };
}
