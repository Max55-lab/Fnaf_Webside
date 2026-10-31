import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { sfxJumpscare, sfxConfirm, sfxTick } from "../audio/sound.js";

/* ============================================================
   SECRETS & EASTER EGGS ENGINE
   A global system that discovers typed codes, click sequences,
   and hidden interactions — and remembers what you've found.
   ============================================================ */

const SecretContext = createContext(null);
export const useSecrets = () => useContext(SecretContext);

/* ---------------- The secret registry ---------------- */
export const SECRETS = {
  "code-1987": {
    title: "The Bite of '87",
    icon: "🦷",
    hint: "Type the year the Bite happened",
    discovered: "You typed 1987. The Bite of '87 took a security guard's frontal lobe — and the animatronics were never the same.",
  },
  "code-1983": {
    title: "The Bite of '83",
    icon: "🎈",
    hint: "Type the year of the other bite",
    discovered:
      "You typed 1983. The crying child, the bullies, and Fredbear's jaw. The first tragedy was never the one everyone remembers.",
  },
  "code-itsme": {
    title: "IT'S ME",
    icon: "👁",
    hint: "Type what the ghost keeps saying",
    discovered: "You typed IT'S ME. Golden Freddy was watching the whole time.",
  },
  "code-freddy": {
    title: "The Bear Awakens",
    icon: "🐻",
    hint: "Type the name of the star of the show",
    discovered: "You called Freddy by name. He heard you.",
  },
  "code-afton": {
    title: "I Always Come Back",
    icon: "💀",
    hint: "Type the surname of the killer",
    discovered: "You summoned Afton. He always comes back — you should know that by now.",
  },
  "code-mimic": {
    title: "The First Horror",
    icon: "🎭",
    hint: "Type the name of the thing that came before Freddy's",
    discovered: "You found the Mimic. It was here before the pizzeria. It never left.",
  },
  "code-purple": {
    title: "The Purple Guy",
    icon: "🟣",
    hint: "Type the colour of the man in the minigames",
    discovered: "You typed PURPLE. The man behind the slaughter was always purple.",
  },
  "code-henry": {
    title: "Henry's Promise",
    icon: "🔥",
    hint: "Type the co-founder's first name",
    discovered: "You typed HENRY. 'I am going to try to save every soul I can... and then, I will set this place on fire.'",
  },
  "code-toreador": {
    title: "The Toreador March",
    icon: "🎵",
    hint: "Type the song Freddy plays",
    discovered: "You found the Toreador March — the melody that plays when the power runs out.",
  },
  "code-6am": {
    title: "Six A.M.",
    icon: "🌅",
    hint: "Type the hour you survive until",
    discovered: "You typed 6AM. You survived the night. The morning shift arrives.",
  },
  "code-foxy": {
    title: "Out of Order",
    icon: "🦊",
    hint: "Type the pirate fox's name",
    discovered: "You called Foxy. He was never out of order — he was waiting.",
  },
  "code-springtrap": {
    title: "The Springlock Failure",
    icon: "⚙",
    hint: "Type the name of the suit Afton died in",
    discovered:
      "You typed SPRINGTRAP. The springlocks gave out in a single, wet second — and the suit became a coffin.",
  },
  "code-phone": {
    title: "Phone Guy",
    icon: "📞",
    hint: "Type the job title of the man who never stops calling",
    discovered:
      "\"Uh, hello? Hello, hello?\" You summoned Phone Guy. He has been leaving you messages since 1987 — and he is very sorry about the smell.",
  },
  "code-fazbear": {
    title: "The Company",
    icon: "🏢",
    hint: "Type the name of the company that owns everything",
    discovered:
      "You typed FAZBEAR. Fazbear Entertainment accepts no liability for injury, disappearance, or death. Please enjoy your pizza.",
  },
  "konami": {
    title: "The Konami Code",
    icon: "🎮",
    hint: "The classic cheat code",
    discovered: "You know the old ways. ↑↑↓↓←→←→BA. Some things never die.",
  },
  "logo-triple": {
    title: "Three Taps",
    icon: "⬡",
    hint: "Tap the logo three times, quickly",
    discovered: "You knocked on Fazbear Entertainment's door three times. Nobody should have answered.",
  },
  "nose-honk": {
    title: "Honk",
    icon: "👃",
    hint: "Something red at the bottom of every page",
    discovered: "You honked the nose. Even in a horror wiki, a clown nose demands respect.",
  },
  "fan-click": {
    title: "The Desk Fan",
    icon: "🌀",
    hint: "Click the fan in an office",
    discovered: "You clicked the desk fan. It spins endlessly — the only thing in the building that never stops.",
  },
  "cupcake-click": {
    title: "The Cupcake Watches",
    icon: "🧁",
    hint: "Click the cupcake on Chica's plate",
    discovered: "You clicked the cupcake. Its eyes followed your cursor. It always does.",
  },
  "shadow-bonnie": {
    title: "Shadow Bonnie",
    icon: "🐰",
    hint: "Finish the arcade's cake run",
    discovered: "You caught Shadow Bonnie. He never attacks — he only watches. Nobody knows why.",
  },
  "phantom-flash": {
    title: "Phantom Foxy",
    icon: "⚡",
    hint: "Something flashes in the dark",
    discovered: "You saw a phantom flash across the screen. The FNAF 3 phantoms leave no trace.",
  },
  "reversed-audio": {
    title: "Reversed Audio",
    icon: "📻",
    hint: "Some messages are played backwards",
    discovered: "You heard the reversed audio. In FNAF, the truth is always spoken backwards.",
  },
  "glitch-load": {
    title: "The Glitch",
    icon: "📺",
    hint: "A 1-in-100 chance on arriving",
    discovered: "You arrived during a glitch. The screen tore itself apart — then pretended nothing happened.",
  },
  "toreador-power": {
    title: "Power Out",
    icon: "🔌",
    hint: "Let the power meter hit zero",
    discovered: "You let the power run out. The Toreador March played. You know what comes next.",
  },
  "night-watch": {
    title: "The Long Shift",
    icon: "🕛",
    hint: "Stay on the site as the clock passes the hours",
    discovered: "You stayed through the small hours. Most guards don't last half a shift.",
  },
  "eyes-hover": {
    title: "Don't Stare",
    icon: "👁",
    hint: "Hold your cursor on a character's face",
    discovered:
      "You stared at the portrait until it stared back. Three seconds is all it takes — and now it knows your face too.",
  },
  "long-press": {
    title: "Hold the Honk",
    icon: "🫳",
    hint: "Press and hold something silly in the footer",
    discovered:
      "You held the nose down for over a second. It honked. Then it kept honking, long after you let go.",
  },
  "midnight": {
    title: "The 3 AM Shift",
    icon: "🌙",
    hint: "Visit at 3:00 in the morning",
    discovered:
      "It's 3 AM where you are. You're browsing a wiki about murdered children at the exact hour the animatronics move. Nothing bad will happen.",
  },
  "title-click": {
    title: "Don't Touch That",
    icon: "❌",
    hint: "Poke the homepage title five times",
    discovered: "You poked the title until it fought back. Curiosity killed the night guard.",
  },
  "static-field": {
    title: "Signal Breach",
    icon: "📺",
    hint: "Poke the static field on the homepage seven times",
    discovered:
      "You slapped the static field seven times and it slapped back. Somewhere, a monitor blinked.",
  },
  "role-guest": {
    title: "Clock In: Visitor",
    icon: "🪪",
    hint: "Sign in at the staff terminal as a Guest",
    discovered:
      "You clocked in as a Guest. The turnstile beeped, the badge printer whirred, and nobody checked your photo.",
  },
  "role-user": {
    title: "Registered Crew",
    icon: "🎫",
    hint: "Register a Crew account (the User badge) at the staff terminal",
    discovered:
      "You registered a real crew account. The badge printer hummed a little longer this time — it had your name pre-loaded. That is not how printers work.",
  },
  "role-admin": {
    title: "Staff Clearance",
    icon: "🗝",
    hint: "Sign in at the staff terminal as an Administrator",
    discovered:
      "You clocked in as an Administrator. The cameras flicker cyan now — and the Oversight Console opens.",
  },
  "role-super": {
    title: "Fazbear Oversight",
    icon: "👁",
    hint: "Sign in at the staff terminal as the Super Administrator",
    discovered:
      "You clocked in as the Super Administrator. Management would like to remind you that management does not exist.",
  },
  sudo: {
    title: "Because I Said So",
    icon: "🐧",
    hint: "Type sudo while wearing an admin badge",
    discovered:
      "You typed sudo as staff. Permission granted. The log will remember this — everything remembers this.",
  },
  "code-implant": {
    title: "Management's Accession",
    icon: "📟",
    hint: "Type 395248 into the Oversight implant field on the staff terminal",
    discovered:
      "The implant accepted the number management swore it never issued. Six were accounted for. The terminal insists there were seven.",
  },
};

/* ---------------- Persistence ---------------- */
const STORAGE_KEY = "fnaf_secrets_found";

const loadFound = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    /* Keep only ids that still exist in the registry — secrets retired along
       with old exhibits must not inflate the found/total count. */
    return new Set(
      Array.isArray(ids) ? ids.filter((id) => typeof id === "string" && SECRETS[id]) : []
    );
  } catch {
    return new Set();
  }
};

const saveFound = (set) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable */
  }
};

/* ---------------- Provider ---------------- */
export function SecretsProvider({ children, onDiscover }) {
  const [found, setFound] = useState(loadFound);
  const [popup, setPopup] = useState(null); // { key, ...secret }
  const [glitch, setGlitch] = useState(false);
  const [phantom, setPhantom] = useState(false);
  const [reversed, setReversed] = useState(false);
  const bufferRef = useRef("");
  const konamiRef = useRef([]);
  const popupTimer = useRef(null);
  /* Synchronous mirror of `found` so a secret is only ever announced once,
     even if `discover` fires twice in the same tick. */
  const foundRef = useRef(found);

  /* Random glitch on first arrival (1 in 100) */
  useEffect(() => {
    if (sessionStorage.getItem("fnaf_glitched")) return;
    sessionStorage.setItem("fnaf_glitched", "1");
    if (Math.random() < 0.01) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 1400);
      // eslint-disable-next-line no-use-before-define
      setTimeout(() => discover("glitch-load", true), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discover = useCallback(
    (key, silent = false) => {
      const secret = SECRETS[key];
      if (!secret) return;

      const isNew = !foundRef.current.has(key);
      if (isNew) {
        const next = new Set(foundRef.current);
        next.add(key);
        foundRef.current = next;
        setFound(next);
        saveFound(next);
      }

      if (isNew && !silent) {
        sfxConfirm();
        setPopup({ key, ...secret });
        if (popupTimer.current) clearTimeout(popupTimer.current);
        popupTimer.current = setTimeout(() => setPopup(null), 6000);
        if (onDiscover) onDiscover(key, secret);
      } else if (!silent && !isNew) {
        // Already known — a soft click, but stay quiet for background discoveries.
        sfxTick();
      }
    },
    [onDiscover]
  );

  /* 3 AM local time — the witching hour */
  useEffect(() => {
    if (new Date().getHours() === 3) discover("midnight", true);
  }, [discover]);

  /* A note for anyone who opens the console */
  useEffect(() => {
    const total = Object.keys(SECRETS).length;
    console.log(
      "%c⬡ FNAF WIKI",
      "color:#ffd600;font-size:20px;font-weight:bold;text-shadow:0 0 10px #ffd600"
    );
    console.log("%cIT'S ME.", "color:#00e5ff;font-size:14px;letter-spacing:5px");
    console.log(
      `%c${total} secrets are hidden here. Some are typed. Some are clicked. Some are held.\nType something. Anywhere.`,
      "color:#8b93a7;font-size:12px;line-height:1.6"
    );
  }, []);

  /* ---------------- Typed codes ---------------- */
  useEffect(() => {
    const CODE_MAP = {
      "1987": "code-1987",
      "1983": "code-1983",
      itsme: "code-itsme",
      freddy: "code-freddy",
      afton: "code-afton",
      mimic: "code-mimic",
      purple: "code-purple",
      henry: "code-henry",
      toreador: "code-toreador",
      "6am": "code-6am",
      foxy: "code-foxy",
      springtrap: "code-springtrap",
      phone: "code-phone",
      fazbear: "code-fazbear",
    };
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

    const isTyping = (target) =>
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    const onKey = (e) => {
      // Konami code works anywhere, even in inputs
      konamiRef.current = [...konamiRef.current, e.key].slice(-10);
      if (konamiRef.current.join("|").toLowerCase() === KONAMI.join("|").toLowerCase()) {
        konamiRef.current = [];
        discover("konami");
      }

      if (isTyping(e.target)) return;
      if (e.key.length !== 1) return;

      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-12);
      const buf = bufferRef.current;
      // Match longest code present at the end of the buffer
      const match = Object.keys(CODE_MAP).find((code) => buf.endsWith(code));
      if (match) {
        bufferRef.current = "";
        discover(CODE_MAP[match]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [discover]);

  /* ---------------- Random phantom flashes ---------------- */
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.06) {
        setPhantom(true);
        sfxJumpscare();
        setTimeout(() => setPhantom(false), 320);
        discover("phantom-flash");
      }
    }, 40000);
    return () => clearInterval(t);
  }, [discover]);

  /* ---------------- Rare reversed audio ---------------- */
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.07) {
        setReversed(true);
        setTimeout(() => setReversed(false), 4000);
        discover("reversed-audio");
      }
    }, 90000);
    return () => clearInterval(t);
  }, [discover]);

  const total = Object.keys(SECRETS).length;
  const count = found.size;

  /* Wipe progress — used by the Vault reset button. */
  const reset = useCallback(() => {
    const empty = new Set();
    foundRef.current = empty;
    setFound(empty);
    saveFound(empty);
    setPopup(null);
  }, []);

  return (
    <SecretContext.Provider value={{ discover, found, count, total, reset, SECRETS }}>
      {children}

      {/* ---- Discovery popup ---- */}
      {popup && (
        <div className="secret-popup" onClick={() => setPopup(null)}>
          <div className="secret-popup-inner">
            <div className="secret-popup-icon">{popup.icon}</div>
            <div>
              <div className="secret-popup-label">🔓 SECRET DISCOVERED</div>
              <div className="secret-popup-title">{popup.title}</div>
              <div className="secret-popup-text">{popup.discovered}</div>
              <div className="secret-popup-count">
                {count} / {total} SECRETS FOUND
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Full-screen glitch ---- */}
      {glitch && (
        <div className="glitch-overlay">
          <div className="glitch-text" data-text="ERROR">ERROR</div>
        </div>
      )}

      {/* ---- Phantom flash ---- */}
      {phantom && (
        <div className="phantom-flash">
          <span>🦊</span>
        </div>
      )}

      {/* ---- Reversed audio whisper ---- */}
      {reversed && (
        <div className="reversed-whisper">◀◀ ◀◀◀ ◀ ◀◀</div>
      )}
    </SecretContext.Provider>
  );
}
