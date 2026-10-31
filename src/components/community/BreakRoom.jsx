import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { timeAgo } from "../../lib/community.js";
import { sanitizeText } from "../../security/sanitize.js";
import { sfxConfirm, sfxTick } from "../../audio/sound.js";
import "../../styles/breakroom.css";

/* ------------------------------------------------------------------ */
/* Storage + channel keys (browser-local; no server, no accounts)      */
/* ------------------------------------------------------------------ */
const CHAT_KEY = "fnaf_chat_v1";
const HANDLE_KEY = "fnaf_chat_handle";
const AUTH_KEY = "fnaf_auth_v1"; // read-only; only used for a colored chip
const CHANNEL_NAME = "fnaf_breakroom";

const MAX_MESSAGES = 120;
const MAX_TEXT = 500;
const PING_MS = 15000; // presence heartbeat
const PEER_TTL = 45000; // peers silent longer than this are "gone"
const SWEEP_MS = 2500; // prune peers + typing state
const TYPING_TTL = 3500; // a typing hint expires after this
const TYPING_THROTTLE = 1200;
const TICK_MS = 30000; // refresh relative timestamps

/* ------------------------------------------------------------------ */
/* Impure helpers live at module scope so render stays pure (oxlint)   */
/* ------------------------------------------------------------------ */
const nowMs = () => Date.now();
const nowIso = () => new Date().toISOString();
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

/* How many bot replies a plain message earns: 0, 1 or 2. */
const botReplyCount = () => {
  const roll = Math.random();
  if (roll < 0.35) return 0;
  return roll < 0.8 ? 1 : 2;
};

const newMsgId = () =>
  globalThis.crypto?.randomUUID
    ? `msg-${crypto.randomUUID()}`
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function initials(name) {
  const words = String(name || "?")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .slice(0, 2);
  if (!words.length) return String(name || "?").slice(0, 1).toUpperCase();
  return words.map((word) => word[0]).join("").toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Bot personas — the room is never dead, even offline at 4 AM         */
/* ------------------------------------------------------------------ */
const BOTS = ["NightBot · FREDDY", "PHONY PHONE", "CAM_WATCHER_03", "PIZZA_INTAKE"];

const BOT_LINES = {
  "NightBot · FREDDY": [
    "Good show, good show! The audience of one appreciates your vigilance.",
    "The stage lights flickered again. That is just the wiring. Probably.",
    "I counted the dining room chairs twice this shift. Still forty-two. Still forty-two.",
    "Someone left a slice of pizza on the prize counter. I have decided not to investigate.",
    "Remember: laughter is the second-best medicine. The first is checking the east hall.",
    "If the birthday party starts before midnight, kindly remind them about the noise ordinance.",
    "A customer once rated us four stars. Four! The fifth was 'missing'. We are working on it.",
    "Maintenance says the hall lights dim on purpose now. It sets the mood. Do not fix it.",
  ],
  "PHONY PHONE": [
    "Uh, hello? Hello, hello! If you are hearing this, the break room mic still works. That is good.",
    "Quick tip from management: if the power drops below five percent, uh, do not. That is the whole tip.",
    "I recorded this message six hours ago. If anything has gone wrong since then, I am sure it is fine.",
    "About the smell in the supply closet — officially that is 'vintage'. Unofficially, do not open it.",
    "If someone asks why the cameras loop between three and four, tell them it is scheduled maintenance.",
    "Compliance update: the smiley-face banners are 'festive', not 'ominous'. Filed and archived.",
  ],
  CAM_WATCHER_03: [
    "Static spike on CAM 4. Recalibrating. That is the fourth recalibration this shift.",
    "Motion detected: east hall. Correction: motion detected: a mop.",
    "All cameras nominal. One (1) broom remains unaccounted for.",
    "Night log: ambient humming near the parts room up twelve decibels. Filed under 'normal'.",
    "Foxy's curtain twitched. Loop confirms: curtain twitched. Recommendation: keep watching.",
    "Camera 2A is showing yesterday's feed again. Nobody tell it. It gets embarrassed.",
    "Rotation complete. West hall clear, supply closet clear, supply closet again (double-check).",
  ],
  PIZZA_INTAKE: [
    "Fresh pepperoni batch out of the oven. Inventory updated: one (1) slice missing. Suspicious.",
    "The oven thermostat is doing that thing again where it screams quietly.",
    "Reminder: the mystery-meat bin is for display pizzas only. Display. Only.",
    "Kitchen status: warm, greasy, faintly humming. In other words, a normal night.",
    "Someone ordered twelve pizzas to the security office. The order form was just signed 'F'.",
    "Dough rise check: nominal. Sauce level: nominal. Grease trap: spiritually not nominal.",
  ],
};

const PINBOARD_OPENERS = [
  {
    user: "NIGHT SHIFT RELAY",
    bot: true,
    role: "BOT",
    minutes: 96,
    text:
      "PINBOARD — Welcome to the break room. This chat lives in your browser: messages persist locally and travel live to every other tab you have open. Commands: !roll, !cams, !power, !pizza, !help.",
  },
  {
    user: "CAM_WATCHER_03",
    bot: true,
    role: "BOT",
    minutes: 74,
    text:
      "Camera sync established. All twelve loops running. The curtain is moving again. It is always moving.",
  },
  {
    user: "PHONY PHONE",
    bot: true,
    role: "BOT",
    minutes: 41,
    text:
      "Uh, hello? New guard, right? Tip number one: the freezers do not 'growl'. Write that down.",
  },
];

const CAM_LINES = [
  "ALL CAMERAS NOMINAL — twelve loops, zero anomalies. Enjoy it while it lasts.",
  "ALL CAMERAS NOMINAL — correction: CAM 9 is showing yesterday's feed. Nominally nominal.",
  "ALL CAMERAS NOMINAL — motion sensors report one (1) brave moth near the kitchen.",
];

const ROLL_FLAVOR = [
  "The dice scream as they land.",
  "House advantage intact.",
  "A survivable number.",
  "The fox approves.",
  "Management denies everything.",
];

const HELP_LINE =
  "Commands online: !roll (d20 fate check), !cams (camera sweep), !power (reserve reading), !pizza (kitchen report), !help (this list). Plain messages get answered by the night crew.";

/* ------------------------------------------------------------------ */
/* Message plumbing                                                    */
/* ------------------------------------------------------------------ */
function normaliseMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  /* Sanitise UGC on load — stored history may predate DOMPurify. */
  const text = sanitizeText(raw.text, MAX_TEXT);
  if (!text) return null;
  return {
    id: String(raw.id || newMsgId()),
    user: sanitizeText(raw.user, 24) || "ANON",
    role: typeof raw.role === "string" ? raw.role.slice(0, 24) : "",
    text,
    ts: typeof raw.ts === "string" && !Number.isNaN(Date.parse(raw.ts)) ? raw.ts : nowIso(),
    bot: Boolean(raw.bot),
  };
}

function capMessages(list) {
  return list.length > MAX_MESSAGES ? list.slice(-MAX_MESSAGES) : list;
}

function seedMessages() {
  return PINBOARD_OPENERS.map((entry, index) => ({
    id: `seed-${index}`,
    user: entry.user,
    role: entry.role,
    text: entry.text,
    ts: new Date(nowMs() - entry.minutes * 60000).toISOString(),
    bot: true,
  }));
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return seedMessages();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedMessages();
    const clean = parsed.map(normaliseMessage).filter(Boolean);
    return capMessages(clean.length ? clean : seedMessages());
  } catch {
    return seedMessages();
  }
}

function saveMessages(messages) {
  try {
    /* Normalise on save as well as load — the stored log is the
       single source of truth for every tab and future import. */
    const clean = Array.isArray(messages)
      ? capMessages(messages.map(normaliseMessage).filter(Boolean))
      : [];
    localStorage.setItem(CHAT_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

function loadHandle() {
  try {
    const saved = sanitizeText(localStorage.getItem(HANDLE_KEY), 24);
    if (saved) return saved;
  } catch {
    // Private mode: fall through to a generated handle.
  }
  return `GUARD_${randInt(10, 99)}`;
}

function saveHandle(handle) {
  try {
    localStorage.setItem(HANDLE_KEY, sanitizeText(handle, 24));
    return true;
  } catch {
    return false;
  }
}

/* Read the account role defensively — the auth store may not exist yet. */
function loadRole() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return "guest";
    const role = JSON.parse(raw)?.role;
    if (
      role === "user" ||
      role === "administrator" ||
      role === "super-administrator"
    )
      return role;
  } catch {
    // Missing or corrupt auth data just means "guest" here.
  }
  return "guest";
}

const ROLE_LABELS = {
  guest: "GUEST",
  user: "CREW",
  administrator: "ADMIN",
  "super-administrator": "SUPER ADMIN",
};

function roleChipClass(role) {
  if (role === "super-administrator") return "br-chip br-chip-super";
  if (role === "administrator") return "br-chip br-chip-admin";
  if (role === "user") return "br-chip br-chip-user";
  return "br-chip br-chip-guest";
}

function commandReply(lower) {
  const persona = pickOne(BOTS);
  if (lower.startsWith("!roll")) {
    return {
      persona,
      text: `d20 fate check: ${randInt(1, 20)} out of 20. ${pickOne(ROLL_FLAVOR)}`,
    };
  }
  if (lower.startsWith("!cams")) return { persona, text: pickOne(CAM_LINES) };
  if (lower.startsWith("!power")) {
    const pct = randInt(12, 97);
    return {
      persona,
      text: `Power reserve: ${pct}%${pct < 25 ? " — might want to ease off the doors." : ". Doors and lights holding."}`,
    };
  }
  if (lower.startsWith("!pizza")) {
    return {
      persona,
      text: `Kitchen report: ${randInt(2, 9)} pies in the warmer, coffee level ${randInt(1, 3)}/3, one slice formally reported missing.`,
    };
  }
  if (lower.startsWith("!help")) return { persona, text: HELP_LINE };
  return null;
}

/* BroadcastChannel is optional: private mode and old browsers just get
 * same-tab chat plus the bots. Never let it throw. */
function channelSupported() {
  try {
    return typeof BroadcastChannel !== "undefined";
  } catch {
    return false;
  }
}

function openChannel(name) {
  try {
    if (!channelSupported()) return null;
    return new BroadcastChannel(name);
  } catch {
    return null;
  }
}

function postTo(channel, payload) {
  try {
    channel?.postMessage(payload);
  } catch {
    // A closed or restricted channel must not break sending.
  }
}

function pruneMap(map, isDead) {
  let changed = false;
  const next = {};
  for (const [key, value] of Object.entries(map)) {
    if (isDead(value)) changed = true;
    else next[key] = value;
  }
  return changed ? next : map;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function BreakRoom() {
  const [messages, setMessages] = useState(loadMessages);
  const [handle, setHandle] = useState(loadHandle);
  const [role] = useState(loadRole);
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [peers, setPeers] = useState({});
  const [typingMap, setTypingMap] = useState({});
  const [storageWarn, setStorageWarn] = useState("");
  const [channelLive, setChannelLive] = useState(channelSupported);
  const [, setTick] = useState(0);

  const handleRef = useRef(handle);
  const logRef = useRef(null);
  const nearBottomRef = useRef(true);
  const channelRef = useRef(null);
  const timersRef = useRef([]);
  const lastTypingRef = useRef(0);
  const messagesRef = useRef(messages);

  const pushTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  /* Commit pattern mirrors Forum.jsx: persist here, warn in the handler.
   * Runs from event handlers and message callbacks, never during render. */
  const commit = useCallback((updater) => {
    const next = capMessages(updater(messagesRef.current));
    messagesRef.current = next;
    setMessages(next);
    if (!saveMessages(next)) {
      setStorageWarn(
        "This browser refused local storage, so the shift log only lasts this visit."
      );
    }
  }, []);

  const botSay = useCallback(
    (user, text) => {
      const msg = { id: newMsgId(), user, role: "BOT", text, ts: nowIso(), bot: true };
      commit((prev) => [...prev, msg]);
      postTo(channelRef.current, { type: "msg", user, message: msg });
      sfxConfirm();
    },
    [commit]
  );

  /* Bots answer only in the tab where a human typed, so multiple tabs
   * never double-reply. Bot messages are broadcast for the other tabs. */
  const scheduleBots = useCallback(
    (text) => {
      const lower = text.toLowerCase();
      if (lower.startsWith("!")) {
        const reply = commandReply(lower);
        if (reply) pushTimer(() => botSay(reply.persona, reply.text), randInt(500, 1400));
        return;
      }
      const count = botReplyCount();
      let delay = randInt(1000, 2400); // first reply lands 1-2.4s out
      for (let i = 0; i < count; i += 1) {
        const persona = pickOne(BOTS);
        const line = pickOne(BOT_LINES[persona] || []);
        if (line) pushTimer(() => botSay(persona, line), delay);
        delay += randInt(700, 1400); // follow-up keeps every reply inside 1-4s
      }
    },
    [botSay, pushTimer]
  );

  const sendMessage = (event) => {
    event.preventDefault();
    const text = sanitizeText(draft, MAX_TEXT);
    if (!text) return;
    const msg = { id: newMsgId(), user: handle, role, text, ts: nowIso() };
    commit((prev) => [...prev, msg]);
    postTo(channelRef.current, { type: "msg", user: handle, message: msg });
    postTo(channelRef.current, { type: "typing", user: handle, stop: true });
    setDraft("");
    sfxTick();
    scheduleBots(text);
  };

  const renameHandle = (event) => {
    event.preventDefault();
    const next = sanitizeText(nameDraft, 24) || `GUARD_${randInt(10, 99)}`;
    setHandle(next);
    saveHandle(next);
    postTo(channelRef.current, { type: "ping", user: next });
    setRenaming(false);
  };

  /* Incoming payloads from other tabs. Kept stable via useCallback so the
   * BroadcastChannel listener is attached once. */
  const handleChannelEvent = useCallback((data) => {
    if (!data || typeof data !== "object") return;
    const user = typeof data.user === "string" ? data.user.slice(0, 24) : "";

    if (data.type === "ping") {
      if (!user || user === handleRef.current) return;
      setPeers((prev) => ({ ...prev, [user]: nowMs() }));
      return;
    }

    if (data.type === "typing") {
      if (!user || user === handleRef.current) return;
      if (data.stop) {
        setTypingMap((prev) => {
          if (!(user in prev)) return prev;
          const next = { ...prev };
          delete next[user];
          return next;
        });
      } else {
        setTypingMap((prev) => ({ ...prev, [user]: nowMs() + TYPING_TTL }));
      }
      return;
    }

    if (data.type === "msg" && data.message) {
      const incoming = normaliseMessage(data.message);
      if (!incoming) return;
      if (user) setPeers((prev) => ({ ...prev, [user]: nowMs() }));
      setTypingMap((prev) => {
        if (!(incoming.user in prev)) return prev;
        const next = { ...prev };
        delete next[incoming.user];
        return next;
      });
      commit((prev) =>
        prev.some((item) => item.id === incoming.id) ? prev : [...prev, incoming]
      );
      sfxConfirm();
    }
  }, [commit]);

  /* Presence + live sync. Everything degrades silently without a channel. */
  useEffect(() => {
    const channel = openChannel(CHANNEL_NAME);
    channelRef.current = channel;
    if (channel) {
      channel.onmessage = (event) => handleChannelEvent(event.data);
      postTo(channel, { type: "ping", user: handleRef.current });
    }
    const ping = setInterval(() => {
      if (!document.hidden) postTo(channel, { type: "ping", user: handleRef.current });
    }, PING_MS);
    const sweep = setInterval(() => {
      // Async correction for the rare "constructor threw" case.
      setChannelLive((prev) => (prev === Boolean(channel) ? prev : Boolean(channel)));
      const now = nowMs();
      setPeers((prev) => pruneMap(prev, (ts) => now - ts > PEER_TTL));
      setTypingMap((prev) => pruneMap(prev, (expires) => expires < now));
    }, SWEEP_MS);
    return () => {
      clearInterval(ping);
      clearInterval(sweep);
      try {
        channel?.close();
      } catch {
        // Already closed.
      }
      channelRef.current = null;
    };
  }, [handleChannelEvent]);

  useEffect(() => {
    handleRef.current = handle;
  }, [handle]);

  /* Relative timestamps, like the Wiki Wire ticker. */
  useEffect(() => {
    const ticker = setInterval(() => setTick((value) => value + 1), TICK_MS);
    return () => clearInterval(ticker);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    },
    []
  );

  /* Follow the conversation, but never yank the view if the reader scrolled up. */
  useEffect(() => {
    const el = logRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onLogScroll = () => {
    const el = logRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  };

  const onDraftChange = (event) => {
    setDraft(event.target.value);
    const now = nowMs();
    if (now - lastTypingRef.current > TYPING_THROTTLE) {
      lastTypingRef.current = now;
      postTo(channelRef.current, { type: "typing", user: handleRef.current });
    }
  };

  const onlineNames = useMemo(() => Object.keys(peers), [peers]);
  const onlineCount = 1 + onlineNames.length;
  const typingNames = useMemo(() => Object.keys(typingMap), [typingMap]);

  return (
    <div className="breakroom">
      <div className="hub-section-head">
        <div>
          <span className="hub-kicker">Live shift channel</span>
          <h2 className="hub-section-title">Break room chat</h2>
          <p className="hub-section-sub">
            Talk shift-to-shift across every tab of this browser. Messages stay local, the night
            crew of bots always answers, and nothing leaves your machine.
          </p>
        </div>
        <div className="br-head-right">
          <span
            className="hub-status br-presence"
            title={`On shift: you (${handle})${onlineNames.length ? `, ${onlineNames.join(", ")}` : ""}`}
          >
            <span className="status-dot" aria-hidden="true" />
            {onlineCount} ON SHIFT
          </span>
          <span className="local-badge">
            {channelLive ? "CROSS-TAB LIVE" : "LOCAL ONLY"}
          </span>
        </div>
      </div>

      {onlineNames.length > 0 && (
        <div className="br-roster" aria-label="Also on shift">
          {onlineNames.map((name) => (
            <span className="br-roster-chip" key={name} title={`${name} · on shift`}>
              <span className="br-avatar br-avatar-sm" aria-hidden="true">
                {initials(name)}
              </span>
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="br-identity">
        <span className={roleChipClass(role)}>{ROLE_LABELS[role] || "GUEST"}</span>
        {renaming ? (
          <form className="br-rename" onSubmit={renameHandle}>
            <label className="br-rename-label">
              <span className="sr-only">New handle</span>
              <input
                type="text"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                maxLength={24}
                placeholder="HANDLE"
                autoFocus
              />
            </label>
            <button type="submit" className="btn">
              Save
            </button>
            <button type="button" className="br-link" onClick={() => setRenaming(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <span className="br-handle">{handle}</span>
            <button
              type="button"
              className="br-link"
              onClick={() => {
                setNameDraft(handle);
                setRenaming(true);
              }}
            >
              Rename
            </button>
          </>
        )}
        <span className="br-identity-note">handle stored locally · fnaf_chat_handle</span>
      </div>

      {storageWarn && (
        <div className="form-alert" role="alert">
          {storageWarn}
        </div>
      )}

      <div
        className="br-log"
        ref={logRef}
        onScroll={onLogScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Break room messages"
        tabIndex={0}
      >
        {messages.map((message) => (
          <article
            className={`br-msg${message.bot ? " is-bot" : ""}${
              !message.bot && message.user === handle ? " is-mine" : ""
            }`}
            key={message.id}
          >
            <span className="br-avatar" aria-hidden="true">
              {initials(message.user)}
            </span>
            <div className="br-bubble">
              <div className="br-meta">
                <strong>{message.user}</strong>
                {message.bot && <span className="br-chip br-chip-bot">BOT</span>}
                {!message.bot && message.role && message.role !== "guest" && (
                  <span className={roleChipClass(message.role)}>
                    {ROLE_LABELS[message.role] || "GUEST"}
                  </span>
                )}
                <time dateTime={message.ts}>{timeAgo(message.ts)}</time>
              </div>
              <p className="br-text">{message.text}</p>
            </div>
          </article>
        ))}
      </div>

      <p className={`br-typing${typingNames.length ? " is-on" : ""}`}>
        <span className="br-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          {typingNames.length
            ? `${typingNames.join(", ")} ${typingNames.length === 1 ? "is" : "are"} typing…`
            : ""}
        </span>
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {typingNames.length ? `${typingNames.join(", ")} typing` : ""}
      </p>

      <form className="br-composer" onSubmit={sendMessage}>
        <label className="br-input-wrap">
          <span className="sr-only">Message the break room</span>
          <input
            type="text"
            value={draft}
            onChange={onDraftChange}
            maxLength={MAX_TEXT}
            placeholder="Say something to the night shift…"
            autoComplete="off"
          />
        </label>
        <button type="submit" className="btn br-send" disabled={!draft.trim()}>
          SEND
        </button>
      </form>
      <p className="br-hint">
        Enter sends · try <code>!roll</code>, <code>!cams</code>, <code>!power</code>,{" "}
        <code>!pizza</code> — the bots answer. Open this page in a second tab and messages
        sync instantly.
      </p>
    </div>
  );
}
