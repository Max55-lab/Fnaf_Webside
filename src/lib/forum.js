// Browser-local forum storage. There is no server here on purpose: every post
// stays in this browser, and the UI labels that clearly.
// All user text is sanitised (DOMPurify) at the storage boundary on the way
// in and on the way out, so localStorage never holds markup.
import { sanitizeText } from "../security/sanitize.js";

export const FORUM_KEY = "fnaf_forum_v1";
export const FORUM_AUTHOR_KEY = "fnaf_forum_author";

export const THREAD_CATEGORIES = [
  "Lore",
  "Theories",
  "Games",
  "Movies & Books",
  "Off-topic",
];

export const FORUM_CATEGORIES = ["All", ...THREAD_CATEGORIES];

const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

export const SEED_THREADS = [
  {
    id: "thread-welcome",
    title: "Welcome to the night shift — start here",
    category: "Off-topic",
    author: "Fazbear Archivist",
    createdAt: hoursAgo(19),
    body:
      "This is the community desk for the fan wiki. Introduce yourself, share a favourite scare, or ask where to start with the series. Keep spoilers behind the spoiler buttons and cite the game, book or film you are drawing from.",
    replies: [
      {
        id: "reply-welcome-1",
        author: "GoldenPlush",
        createdAt: hoursAgo(17),
        body:
          "FNAF 4 is still the one that gets me. The breathing cues are so much worse than a camera jump.",
      },
      {
        id: "reply-welcome-2",
        author: "PizzaplexIntern",
        createdAt: hoursAgo(13),
        body:
          "Here for the Ruin theories. The Mimic reveal completely changed how I read the older games.",
      },
    ],
  },
  {
    id: "thread-mimic-timeline",
    title: "Does the Mimic secretly fix the timeline?",
    category: "Theories",
    author: "CircuitBoard",
    createdAt: hoursAgo(31),
    body:
      "Secret of the Mimic puts Edwin Murray decades before Freddy's. Does that make the Mimic the oldest force in the story, or is it just one more unreliable narrator? I keep going back and forth on whether it explains the haunted endoskeletons or deliberately muddies them.",
    replies: [
      {
        id: "reply-mimic-1",
        author: "HenrySaidSo",
        createdAt: hoursAgo(27),
        body:
          "I think it is intentionally both. The games use unreliable memories, and the Mimic gives the writers a way to make every earlier assumption unstable.",
      },
      {
        id: "reply-mimic-2",
        author: "Springlocked",
        createdAt: hoursAgo(21),
        body:
          "The important distinction is that mimicry is not possession. That does not erase Afton; it gives us a second kind of monster.",
      },
    ],
  },
  {
    id: "thread-first-game",
    title: "Which game should a first-timer actually play?",
    category: "Games",
    author: "NewGuard",
    createdAt: hoursAgo(52),
    body:
      "I have watched the movie and know the rough story, but I have never played one. Is FNAF 1 still the right entry point, or should I jump to Help Wanted for comfort? I am bad at jump scares but stubborn.",
    replies: [
      {
        id: "reply-first-1",
        author: "NightOneNerd",
        createdAt: hoursAgo(47),
        body:
          "Start with FNAF 1 on a small screen with headphones. It is short, the rules are readable, and every later game makes more sense once you have survived the original office.",
      },
      {
        id: "reply-first-2",
        author: "DawkoFan22",
        createdAt: hoursAgo(38),
        body:
          "If you are scared easily, Help Wanted's room-scale version is not the gentler option. Play the original first and keep the volume low until you learn the audio cues.",
      },
    ],
  },
  {
    id: "thread-movie-canon",
    title: "Film canon is its own timeline — and that is fine",
    category: "Movies & Books",
    author: "BlumhouseKid",
    createdAt: hoursAgo(70),
    body:
      "The films keep getting judged against the game timeline. They are clearly their own continuity. The practical animatronics, the Abby plot, the different role for Mike — those are choices, not mistakes. Compare them to the novels instead.",
    replies: [
      {
        id: "reply-movie-1",
        author: "SilverEyesClub",
        createdAt: hoursAgo(64),
        body:
          "The novel trilogy is the best comparison. Same characters, different rules, different emotional centre. The Silver Eyes is still my favourite non-game FNAF story.",
      },
    ],
  },
  {
    id: "thread-foxy-power",
    title: "Foxy is the real power meter",
    category: "Lore",
    author: "PirateCovePilot",
    createdAt: hoursAgo(91),
    body:
      "Everyone talks about the doors draining power, but Foxy's stage timer changes how you spend the night. A single camera check resets his momentum. It is the cleanest example of FNAF teaching a habit through fear instead of a tutorial box.",
    replies: [
      {
        id: "reply-foxy-1",
        author: "CheckTheCams",
        createdAt: hoursAgo(88),
        body:
          "The first time you see him sprint down the hall, every future camera sweep gets faster. That is the whole design.",
      },
    ],
  },
];

function normaliseThread(thread) {
  if (!thread || typeof thread !== "object" || !thread.title || !thread.body) {
    return null;
  }
  const title = sanitizeText(thread.title, 160);
  const body = sanitizeText(thread.body, 4000);
  if (!title || !body) return null;
  return {
    id: String(thread.id || `thread-${Math.random().toString(36).slice(2)}`),
    title,
    category: THREAD_CATEGORIES.includes(thread.category)
      ? thread.category
      : "Off-topic",
    author: sanitizeText(thread.author, 40) || "Anonymous",
    createdAt: thread.createdAt || new Date().toISOString(),
    body,
    replies: Array.isArray(thread.replies)
      ? thread.replies
          .filter((reply) => reply && reply.body)
          .map((reply, index) => {
            const replyBody = sanitizeText(reply.body, 2400);
            return {
              id: String(
                reply.id ||
                  `reply-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`
              ),
              author: sanitizeText(reply.author, 40) || "Anonymous",
              createdAt: reply.createdAt || new Date().toISOString(),
              body: replyBody,
            };
          })
          .filter((reply) => reply.body)
      : [],
  };
}

export function loadThreads() {
  try {
    const raw = localStorage.getItem(FORUM_KEY);
    if (!raw) return SEED_THREADS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_THREADS;
    const clean = parsed.map(normaliseThread).filter(Boolean);
    return clean.length ? clean : SEED_THREADS;
  } catch {
    return SEED_THREADS;
  }
}

export function saveThreads(threads) {
  try {
    /* Normalise on the way out too — whatever the caller hands us
       (state, an import, a future module) is sanitised before it
       becomes part of the stored archive. */
    const clean = Array.isArray(threads)
      ? threads.map(normaliseThread).filter(Boolean)
      : [];
    localStorage.setItem(FORUM_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

export function resetThreads() {
  try {
    localStorage.removeItem(FORUM_KEY);
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return SEED_THREADS;
}

export function loadAuthor() {
  try {
    return localStorage.getItem(FORUM_AUTHOR_KEY) || "";
  } catch {
    return "";
  }
}

export function saveAuthor(author) {
  try {
    localStorage.setItem(FORUM_AUTHOR_KEY, sanitizeText(author, 40));
  } catch {
    // The form still works for this session when storage is blocked.
  }
}

export function newId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
