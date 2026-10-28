// Shared client for the Five Nights at Freddy's Fandom wiki.
//
// MediaWiki supports anonymous CORS when `origin=*` is present, so the same
// helpers work in the browser (live Community Wire) and in Node (the agent).
// Nothing here writes content: the agent turns new pages into review drafts.

export const FANDOM_API = "https://freddy-fazbears-pizza.fandom.com/api.php";
export const FANDOM_WIKI = "https://freddy-fazbears-pizza.fandom.com/wiki/";
export const CACHE_KEY = "fnaf_community_cache_v2";
export const CACHE_TTL = 10 * 60 * 1000;

const TAGS = ["Film", "Book", "Game", "Character", "Location", "Lore", "Merch", "Wiki"];

async function api(params, timeout = 12000) {
  const search = new URLSearchParams({ format: "json", origin: "*", ...params });
  const res = await fetch(`${FANDOM_API}?${search}`, {
    signal: AbortSignal.timeout(timeout),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Fandom API responded ${res.status}`);
  return res.json();
}

export function wikiUrl(title) {
  return FANDOM_WIKI + encodeURIComponent(String(title).replace(/ /g, "_"));
}

/** First sentence or two of a plain-text intro, trimmed at a word boundary. */
export function summarize(text, max = 230) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = sentences.slice(0, 2).join(" ").trim();
  if (out.length > max) {
    out = out.slice(0, max);
    const cut = out.lastIndexOf(" ");
    if (cut > 80) out = out.slice(0, cut);
    out = out.replace(/[,;:\s]+$/, "") + "…";
  }
  return out;
}

/** Lightweight topic tag; the AI pass can override this when enabled. */
export function tagFor(title, text = "") {
  const name = String(title).toLowerCase();
  const hay = `${name} ${text}`.toLowerCase();

  if (/\bfilm\b|\bmovie\b|\(film\)/.test(name)) return "Film";
  if (/\bnovel\b|\bbook\b|frights|tales from the pizzaplex/.test(name)) return "Book";
  if (/^crossovers?$/.test(name)) return "Wiki";
  if (/\b(merchandise|merch|toys?|plush|figures?|jazwares|funko)\b/.test(hay)) return "Merch";
  if (/\b(pizza|pizzeria|pizzaplex|campground|restaurant|location|mall|facility|office)\b/.test(name)) {
    return "Location";
  }
  if (/\.exe$/.test(name)) return "Game";
  if (/\b(freddy|bonnie|chica|foxy|springtrap|puppet|afton|animatronic|mimic)\b/.test(name)) {
    return "Character";
  }
  if (/\b(video game|minigame|help wanted|security breach|secret of the mimic|fnaf\s?\d)\b/.test(hay)) {
    return "Game";
  }
  if (/\b(animatronic|freddy|bonnie|chica|foxy|springtrap|puppet|afton)\b/.test(hay)) return "Character";
  if (/\b(pizzeria|pizzaplex|restaurant|campground|location|mall|facility)\b/.test(hay)) return "Location";
  if (/\b(timeline|lore|theory|bite of|the mimic|henry emily)\b/.test(hay)) return "Lore";
  return "Wiki";
}

export function normalizeStats(payload) {
  const s = payload?.query?.statistics || {};
  return {
    articles: Number(s.articles) || 0,
    edits: Number(s.edits) || 0,
    activeUsers: Number(s.activeusers) || 0,
    images: Number(s.images) || 0,
  };
}

const ENTITIES = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(text) {
  return String(text).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    if (code[0] === "#") {
      const num = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Turn the lead-section HTML into readable prose (first substantive paragraph). */
export function htmlToIntro(html) {
  const paragraphs = [...String(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) =>
      decodeEntities(
        m[1]
          .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/<[^>]+>/g, "")
      )
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/\[\s*\d+\s*\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((text) => {
      if (text.length < 80) return false;
      if (/^this article is a stub/i.test(text)) return false;
      // Lead sections often open with a game quote or a "not what you were
      // looking for" note; neither makes a useful article summary.
      if (/^["“”'‘’]/.test(text)) return false;
      if (/^not what you were looking for/i.test(text)) return false;
      return true;
    });

  return paragraphs[0] || "";
}

async function fetchIntro(title) {
  const payload = await api(
    { action: "parse", page: title, prop: "text", section: "0" },
    15000
  );
  return htmlToIntro(payload?.parse?.text?.["*"] || "");
}

/** Run at most `limit` async jobs at once so we don't hammer the wiki. */
async function mapLimit(items, limit, job) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await job(items[index]);
      } catch {
        results[index] = "";
      }
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Recent community activity on the Fandom wiki, with article intros.
 * `withExtracts` also returns the raw intro (used by the drafting agent).
 */
export async function fetchCommunity({ limit = 12, withExtracts = false } = {}) {
  const [statsPayload, changesPayload] = await Promise.all([
    api({ action: "query", meta: "siteinfo", siprop: "statistics" }).catch(() => null),
    api({
      action: "query",
      list: "recentchanges",
      rclimit: "50",
      rcprop: "title|timestamp|user|comment|ids",
      rctype: "edit|new",
      rcnamespace: "0",
    }),
  ]);

  const recent = changesPayload?.query?.recentchanges || [];
  const byTitle = new Map();
  for (const rc of recent) {
    if (rc.ns !== 0 || !rc.title || byTitle.has(rc.title)) continue;
    byTitle.set(rc.title, rc);
  }
  const picked = [...byTitle.values()].slice(0, limit);

  const intros = await mapLimit(picked, 4, (rc) => fetchIntro(rc.title));
  const extracts = {};
  picked.forEach((rc, index) => {
    if (intros[index]) extracts[rc.title] = intros[index];
  });

  const items = picked.map((rc) => {
    const extract = extracts[rc.title] || "";
    const item = {
      id: String(rc.rcid ?? `${rc.title}-${rc.timestamp}`),
      title: rc.title,
      type: rc.type === "new" ? "new" : "edit",
      user: rc.user || "Anonymous",
      comment: String(rc.comment || "").trim(),
      timestamp: rc.timestamp,
      url: wikiUrl(rc.title),
      summary:
        summarize(extract) ||
        "This page has no intro text yet — open it on the Fandom wiki to read the latest.",
      tag: tagFor(rc.title, extract),
      ai: false,
    };
    if (withExtracts) item.extract = extract;
    return item;
  });

  return {
    generatedAt: new Date().toISOString(),
    stats: normalizeStats(statsPayload),
    items,
  };
}

export function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!cached?.fetchedAt || !Array.isArray(cached.items)) return null;
    return cached;
  } catch {
    return null;
  }
}

export function writeCache(payload) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...payload, fetchedAt: new Date().toISOString() })
    );
  } catch {
    // Storage can be full or disabled; the live data still renders.
  }
}

export function isFresh(cached, ttl = CACHE_TTL) {
  if (!cached?.fetchedAt) return false;
  const age = Date.now() - Date.parse(cached.fetchedAt);
  return Number.isFinite(age) && age >= 0 && age < ttl;
}

export function timeAgo(iso) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "recently";
  const seconds = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "just now";
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (abs >= size) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(seconds / size),
        unit
      );
    }
  }
  return "just now";
}

export function formatCount(n) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(n) || 0
  );
}

export { TAGS };
