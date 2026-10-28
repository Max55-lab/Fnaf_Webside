import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import {
  startAmbient,
  stopAmbient,
  setMuted as setAudioMuted,
  setVolume as setAudioVolume,
  sfxJumpscare,
  sfxJumpscareClip,
  sfxToreador,
  sfxPowerWarning,
  sfxTick,
  sfxConfirm,
  sfxPageIn,
  sfxUiHover,
  sfxUiClick,
  wasSfxRecent,
} from "../audio/sound.js";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";
import { getCharacter } from "../data/characters.js";
import { jumpscareFor, globalJumpscares } from "../data/jumpscares.js";
import CommandPalette from "./CommandPalette.jsx";

/* ============ Jumpscare context ============ */
const JumpscareContext = createContext(null);
export const useJumpscare = () => useContext(JumpscareContext);

/* ============ Power + clock context ============ */
const PowerContext = createContext(null);
export const usePower = () => useContext(PowerContext);

/* ============ Global preferences + bookmarks context ============ */
const SettingsContext = createContext(null);
export const useSettings = () => useContext(SettingsContext);

const PREFS_KEY = "fnaf_prefs_v2";
const DEFAULT_PREFS = {
  muted: true,
  volume: 0.45,
  scareLevel: "normal",
  ambient: true,
  effects: true,
  bookmarks: [],
};

const SCARE_LEVELS = ["off", "gentle", "normal"];

function readPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (!stored || typeof stored !== "object") return DEFAULT_PREFS;
    return {
      muted: typeof stored.muted === "boolean" ? stored.muted : DEFAULT_PREFS.muted,
      volume: Number.isFinite(Number(stored.volume))
        ? Math.min(1, Math.max(0, Number(stored.volume)))
        : DEFAULT_PREFS.volume,
      scareLevel: SCARE_LEVELS.includes(stored.scareLevel)
        ? stored.scareLevel
        : DEFAULT_PREFS.scareLevel,
      ambient: typeof stored.ambient === "boolean" ? stored.ambient : DEFAULT_PREFS.ambient,
      effects: typeof stored.effects === "boolean" ? stored.effects : DEFAULT_PREFS.effects,
      bookmarks: Array.isArray(stored.bookmarks)
        ? stored.bookmarks.filter((item) => item && item.kind && item.id)
        : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const onChange = (event) => setReduced(event.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  return Boolean(reduced);
}

function BootScreen({ onSkip, reduced, muted }) {
  const [pct, setPct] = useState(reduced ? 100 : 0);

  /* Numeric load counter that tracks the CSS progress bar (2.05s). */
  useEffect(() => {
    if (reduced) return undefined;
    const started = Date.now();
    const id = window.setInterval(() => {
      const next = Math.min(100, Math.round(((Date.now() - started) / 2050) * 100));
      setPct(next);
      if (next >= 100) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div
      className="boot-screen"
      role="status"
      aria-live="polite"
      onClick={onSkip}
      title="Click to enter"
    >
      <div className="boot-static" aria-hidden="true" />
      <div className="boot-inner">
        <img
          className="boot-face"
          src={getCharacter("freddy-fazbear").image}
          alt=""
          width="72"
          height="72"
          decoding="async"
        />
        <div className="boot-brand">
          <span className="boot-brand-main">FAZBEAR</span>
          <span className="boot-brand-sub">ENTERTAINMENT</span>
        </div>
        <p className="boot-terminal">NIGHT SHIFT TERMINAL · SYSTEM START</p>
        <div className="boot-lines" aria-hidden="true">
          <span>CAMERA BUS ................ ONLINE</span>
          <span>DOOR SERVOS ............... ONLINE</span>
          <span>POWER GRID ................ 100%</span>
          <span>ANIMATRONIC TRACKING ...... SIGNAL LOST</span>
          <span>AUDIO BUS ................. STANDBY</span>
          <span>ARCADE LINK ............... READY</span>
        </div>
        <div className="boot-progress-row">
          <div className="boot-progress" aria-hidden="true">
            <span />
          </div>
          <span className="boot-pct" aria-hidden="true">{pct}%</span>
        </div>
        <div className="boot-foot">
          <span>FAN WIKI · NOT AFFILIATED WITH SCOTT CAWTHON OR STEEL WOOL STUDIOS</span>
          <button
            type="button"
            className="boot-skip"
            onClick={(event) => {
              event.stopPropagation();
              onSkip();
            }}
          >
            SKIP INTRO →
          </button>
        </div>
        <p className="boot-hint" aria-hidden="true">CLICK OR PRESS ANY KEY TO ENTER</p>
        {muted && (
          <p className="boot-mute-tip">
            🔇 SOUND IS OFF — TOGGLE THE SPEAKER IN THE TOP BAR AFTER THE SHIFT STARTS
          </p>
        )}
      </div>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const { discover, count, total } = useSecrets();
  const { signedIn, role, meta: roleMeta } = useAuth();
  const reducedMotion = useReducedMotion();
  const [prefs] = useState(readPrefs);

  const [power, setPower] = useState(100);
  const [hour, setHour] = useState(12);
  const [navOpen, setNavOpen] = useState(false);
  const [jumpscare, setJumpscare] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [muted, setMutedState] = useState(prefs.muted);
  const [volume, setVolumeState] = useState(prefs.volume);
  const [scareLevel, setScareLevel] = useState(prefs.scareLevel);
  const [ambient, setAmbient] = useState(prefs.ambient);
  const [effects, setEffects] = useState(prefs.effects);
  const [bookmarks, setBookmarks] = useState(prefs.bookmarks);
  const [audioReady, setAudioReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState("");

  const jumpTimeout = useRef(null);
  const noticeTimeout = useRef(null);
  const warnedRef = useRef(false);
  const hourRef = useRef(12);
  const noseTimer = useRef(null);

  const announce = useCallback((message) => {
    setNotice(message);
    if (noticeTimeout.current) clearTimeout(noticeTimeout.current);
    noticeTimeout.current = setTimeout(() => setNotice(""), 2600);
  }, []);

  const toggleBookmark = useCallback(
    (item) => {
      if (!item?.kind || !item?.id) return;
      const exists = bookmarks.some(
        (bookmark) => bookmark.kind === item.kind && bookmark.id === item.id
      );
      setBookmarks((current) =>
        exists
          ? current.filter(
              (bookmark) => !(bookmark.kind === item.kind && bookmark.id === item.id)
            )
          : [
              ...current,
              {
                kind: item.kind,
                id: item.id,
                label: item.label || item.id,
                to: item.to || "/",
                savedAt: new Date().toISOString(),
              },
            ]
      );
      sfxConfirm();
      announce(
        exists ? `${item.label || "Item"} removed from saved.` : `${item.label || "Item"} saved to the Vault.`
      );
    },
    [bookmarks, announce]
  );

  /* ---- First user interaction unlocks audio ---- */
  useEffect(() => {
    const unlock = () => setAudioReady(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  /* ---- Global UI sound layer ----
     Every button, link and role=button gets a hover tick and a console
     clack. Components that already play their own sfx win the race:
     wasSfxRecent() suppresses the global layer for 90ms after any blip.
     Gated by the "CRT effects" pref so the toggle silences the lot. */
  useEffect(() => {
    if (!effects) return undefined;
    let lastHoverEl = null;
    let lastHoverAt = 0;
    const onClick = (event) => {
      if (wasSfxRecent(90)) return;
      const el = event.target?.closest?.("button, a, [role='button']");
      if (!el || el.closest("[data-silent]")) return;
      sfxUiClick();
    };
    const onOver = (event) => {
      const el = event.target?.closest?.("button, a, [role='button']");
      if (!el || el === lastHoverEl || el.closest("[data-silent]")) return;
      lastHoverEl = el;
      const now = performance.now();
      if (now - lastHoverAt < 80) return;
      lastHoverAt = now;
      if (wasSfxRecent(90)) return;
      sfxUiHover();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onOver);
    };
  }, [effects]);

  /* ---- Page transition whoosh (skips the very first paint) ---- */
  const firstPageRef = useRef(true);
  useEffect(() => {
    if (firstPageRef.current) {
      firstPageRef.current = false;
      return;
    }
    sfxPageIn();
  }, [location.pathname]);

  /* ---- Persist preferences and bookmarks locally ---- */
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ muted, volume, scareLevel, ambient, effects, bookmarks })
      );
    } catch {
      // Private mode can refuse storage. The session still behaves normally.
    }
  }, [muted, volume, scareLevel, ambient, effects, bookmarks]);

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  useEffect(() => {
    setAudioVolume(volume);
  }, [volume]);

  /* ---- New page: start at the top, close mobile/settings ---- */
  useEffect(() => {
    window.scrollTo(0, 0);
    setNavOpen(false);
    setShowSettings(false);
  }, [location.pathname]);

  /* ---- Boot sequence: auto-fades, but any key or click enters early ---- */
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), reducedMotion ? 650 : 2100);
    const onKey = () => setBooting(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!booting) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [booting]);

  const skipBoot = useCallback(() => {
    setBooting(false);
    sfxTick();
  }, []);

  /* ---- Ambient hum once audio is enabled ---- */
  useEffect(() => {
    if (audioReady && !muted && ambient) startAmbient();
    else stopAmbient();
    return () => stopAmbient();
  }, [audioReady, muted, ambient]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setAudioMuted(next);
    if (!next) {
      setTimeout(() => sfxTick(), 30);
      announce("Sound on · office ambience active — each game page has its own room tone.");
    }
  }, [muted, announce]);

  const triggerJumpscare = useCallback(
    (override) => {
      if (scareLevel === "off" && !override?.force) return;
      const source =
        override || globalJumpscares[Math.floor(Math.random() * globalJumpscares.length)];
      const clip = jumpscareFor(source.char || "freddy-fazbear");
      const next = {
        ...clip,
        ...source,
        image: source.image || clip.image,
        still: source.still || clip.still,
        text: source.text || clip.text,
        sound: source.sound || clip.sound,
      };
      /* Real scream clip first; procedural synth if it can't play. */
      sfxJumpscareClip(next.sound).then((real) => {
        if (!real) sfxJumpscare(next.char);
      });
      setJumpscare(next);
      if (jumpTimeout.current) clearTimeout(jumpTimeout.current);
      jumpTimeout.current = setTimeout(() => setJumpscare(null), reducedMotion ? 1200 : 1600);
    },
    [scareLevel, reducedMotion]
  );

  /* Night clock: 1 real minute = 1 in-game hour. 12 → 1 → 2 → 3 → 4 → 5 → 6 → 12 */
  useEffect(() => {
    const timer = setInterval(() => {
      const current = hourRef.current;
      const next = current === 12 ? 1 : current === 6 ? 12 : current + 1;
      hourRef.current = next;
      setHour(next);
      if (next === 6) discover("night-watch");
    }, 60000);
    return () => clearInterval(timer);
  }, [discover]);

  /* Power drain */
  useEffect(() => {
    const timer = setInterval(() => {
      setPower((current) => {
        const drain = cameraMode ? 2 : 0.4;
        const next = Math.max(0, +(current - drain).toFixed(1));

        if (next <= 20 && next > 0 && !warnedRef.current) {
          warnedRef.current = true;
          sfxPowerWarning();
        }
        if (next === 0) {
          sfxToreador();
          discover("toreador-power", true);
          if (scareLevel !== "off" && Math.random() < 0.6) {
            triggerJumpscare({ char: "freddy-fazbear", text: "POWER OUT", force: true });
          }
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [cameraMode, triggerJumpscare, scareLevel, discover]);

  /* Power out -> recovery */
  useEffect(() => {
    if (power === 0) {
      const timer = setTimeout(() => {
        setPower(100);
        warnedRef.current = false;
      }, 6000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [power]);

  /* Rare ambient jumpscare while browsing */
  useEffect(() => {
    if (scareLevel === "off" || booting) return undefined;
    const chance = scareLevel === "gentle" ? 0.008 : 0.02;
    const timer = setInterval(() => {
      if (Math.random() < chance) triggerJumpscare();
    }, 90000);
    return () => clearInterval(timer);
  }, [triggerJumpscare, scareLevel, booting]);

  const powerClass = power <= 20 ? "critical" : power <= 50 ? "warn" : "";
  const displayHour = hour === 12 ? "12 AM" : `${hour} AM`;
  const jumpFallbackSrc = jumpscare ? jumpscare.still || jumpscare.image : null;
  /* Animated jumpscare WebP when motion is OK; reduced-motion visitors get the
     still frame. Both are local, and onError swaps to the still so an
     interrupted decode still scares. */
  const jumpSrc = jumpscare
    ? reducedMotion
      ? jumpscare.still || jumpscare.image
      : jumpscare.image
    : null;

  /* Logo triple-click secret */
  const logoTaps = useRef([]);
  const onLogoTap = useCallback(() => {
    const now = Date.now();
    logoTaps.current = [...logoTaps.current, now].filter((time) => now - time < 1200);
    if (logoTaps.current.length >= 3) {
      logoTaps.current = [];
      discover("logo-triple");
    }
  }, [discover]);

  const resetPreferences = () => {
    if (!window.confirm("Reset sound, scare level and saved items for this browser?")) return;
    setMutedState(true);
    setVolumeState(DEFAULT_PREFS.volume);
    setScareLevel(DEFAULT_PREFS.scareLevel);
    setAmbient(DEFAULT_PREFS.ambient);
    setEffects(DEFAULT_PREFS.effects);
    setBookmarks([]);
    announce("Preferences reset.");
  };

  return (
    <SettingsContext.Provider
      value={{
        scareLevel,
        setScareLevel,
        muted,
        toggleMute,
        volume,
        setVolume: setVolumeState,
        ambient,
        setAmbient,
        effects,
        setEffects,
        bookmarks,
        toggleBookmark,
        isBookmarked: (kind, id) =>
          bookmarks.some((bookmark) => bookmark.kind === kind && bookmark.id === id),
        cameraMode,
      }}
    >
      <JumpscareContext.Provider value={triggerJumpscare}>
        <PowerContext.Provider value={{ power, setCameraMode }}>
          <div className={`app-shell ${effects ? "" : "effects-off"}`}>
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <div className="crt-overlay" aria-hidden="true" />
            <div className="atmosphere" aria-hidden="true">
              <span className="atmosphere-curtain left" />
              <span className="atmosphere-curtain right" />
              <span className="atmosphere-checkers" />
            </div>

            {booting && (
              <BootScreen onSkip={skipBoot} reduced={reducedMotion} muted={muted} />
            )}

            <nav className="navbar" aria-label="Main navigation">
              <Link to="/" className="nav-logo" onClick={onLogoTap} aria-label="FNAF Wiki home">
                <img
                  className="nav-logo-face"
                  src={getCharacter("freddy-fazbear").image}
                  alt=""
                  width="30"
                  height="30"
                />
                <span>FNAF WIKI</span>
              </Link>

              <button
                className="nav-search-btn"
                onClick={() => {
                  sfxTick();
                  window.dispatchEvent(new CustomEvent("fnaf:command"));
                }}
                aria-label="Search the wiki"
                title="Search the wiki (Ctrl+K)"
              >
                ⌕ <span className="nav-search-label">SEARCH</span>
                <kbd className="nav-search-kbd">CTRL K</kbd>
              </button>

              <div className={`nav-links ${navOpen ? "open" : ""}`} id="primary-navigation">
                <NavLink to="/" end className="nav-link">Home</NavLink>
                <NavLink to="/characters" className="nav-link">Characters</NavLink>
                <NavLink to="/games" className="nav-link">Games</NavLink>
                <NavLink to="/lore" className="nav-link">Lore</NavLink>
                <NavLink to="/media" className="nav-link">Media</NavLink>
                <NavLink to="/play" className="nav-link">Arcade</NavLink>
                <NavLink to="/community" className="nav-link">Community</NavLink>
                <NavLink to="/secrets" className="nav-link">Secrets</NavLink>
                <NavLink to="/achievements" className="nav-link">Record</NavLink>
                <NavLink to="/vault" className="nav-link nav-vault">
                  Vault
                  <span className="nav-badge" aria-label={`${count} of ${total} secrets found`}>
                    {count}
                  </span>
                </NavLink>
              </div>

              <button
                className={`nav-burger ${navOpen ? "open" : ""}`}
                onClick={() => {
                  setNavOpen((open) => !open);
                  sfxTick();
                }}
                aria-label={navOpen ? "Close menu" : "Open menu"}
                aria-expanded={navOpen}
                aria-controls="primary-navigation"
              >
                <span /><span /><span />
              </button>

              <div className="nav-tools">
                {signedIn && roleMeta && (
                  <Link
                    to="/login"
                    className="nav-role-chip"
                    data-role-chip={role}
                    title={`${roleMeta.label} · open the staff terminal`}
                  >
                    {roleMeta.chip}
                  </Link>
                )}
                <button
                  className="audio-btn"
                  onClick={toggleMute}
                  title={muted ? "Enable sound" : "Mute sound"}
                  aria-label={muted ? "Enable sound" : "Mute sound"}
                  aria-pressed={!muted}
                >
                  {muted ? "🔇" : "🔊"}
                </button>
                <button
                  className="audio-btn"
                  onClick={() => {
                    setShowSettings((open) => !open);
                    sfxTick();
                  }}
                  title="Settings"
                  aria-label="Open settings"
                  aria-expanded={showSettings}
                  aria-controls="settings-panel"
                >
                  ⚙
                </button>
                <div className="clock-display" aria-label={`In-game time ${displayHour}`}>
                  {displayHour}
                </div>
                <div className="power-display" aria-label={`Power ${Math.round(power)} percent`}>
                  <span className="power-label">POWER</span>
                  <div className="power-bar">
                    <div className={`power-fill ${powerClass}`} style={{ width: `${power}%` }} />
                  </div>
                  <span>{Math.round(power)}%</span>
                </div>
              </div>
            </nav>

            {showSettings && (
              <div
                className="settings-panel"
                id="settings-panel"
                role="dialog"
                aria-label="Sound and display settings"
              >
                <div className="settings-head">
                  <span className="card-title">Settings</span>
                  <button
                    type="button"
                    className="settings-close"
                    onClick={() => setShowSettings(false)}
                    aria-label="Close settings"
                  >
                    ✕
                  </button>
                </div>

                <label className="settings-volume" htmlFor="master-volume">
                  <span>
                    Master volume <b>{Math.round(volume * 100)}%</b>
                  </span>
                  <input
                    id="master-volume"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(volume * 100)}
                    onChange={(event) => setVolumeState(Number(event.target.value) / 100)}
                  />
                </label>

                <div className="settings-row settings-row-block">
                  <span>Scare intensity</span>
                  <div className="filter-row" style={{ margin: 0 }}>
                    {SCARE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`pill ${scareLevel === level ? "active" : ""}`}
                        onClick={() => setScareLevel(level)}
                        aria-pressed={scareLevel === level}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row">
                  <span>Sound</span>
                  <button
                    type="button"
                    className={`pill ${!muted ? "active" : ""}`}
                    onClick={() => {
                      if (muted) toggleMute();
                    }}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    className={`pill ${muted ? "active" : ""}`}
                    onClick={() => {
                      if (!muted) toggleMute();
                    }}
                  >
                    Off
                  </button>
                </div>

                <div className="settings-row">
                  <span>Office ambience</span>
                  <button
                    type="button"
                    className={`pill ${ambient ? "active" : ""}`}
                    onClick={() => setAmbient((value) => !value)}
                    aria-pressed={ambient}
                  >
                    {ambient ? "On" : "Off"}
                  </button>
                </div>

                <div className="settings-row">
                  <span>CRT effects</span>
                  <button
                    type="button"
                    className={`pill ${effects ? "active" : ""}`}
                    onClick={() => setEffects((value) => !value)}
                    aria-pressed={effects}
                  >
                    {effects ? "On" : "Off"}
                  </button>
                </div>

                <div className="settings-saved">
                  <span>Saved items</span>
                  <Link to="/vault" onClick={() => setShowSettings(false)}>
                    {bookmarks.length} in the Vault →
                  </Link>
                </div>

                <button type="button" className="settings-reset" onClick={resetPreferences}>
                  Reset preferences
                </button>
                <p className="settings-note">
                  Sound starts muted so the browser does not autoplay at you. Volume, scares,
                  bookmarks and effects are stored in this browser.
                </p>
              </div>
            )}

            <main id="main-content" className="route-stage" key={location.pathname}>
              <Outlet />
            </main>

            <footer className="footer">
              <div className="footer-inner">
                <div className="footer-brand">
                  <Link to="/" className="footer-logo">FNAF WIKI</Link>
                  <p>
                    A fan-made encyclopedia and playable archive. Not affiliated with Scott
                    Cawthon or Steel Wool Studios.
                  </p>
                  <span className="footer-status">
                    <span className="status-dot" aria-hidden="true" />
                    NIGHT 03 · SYSTEM NOMINAL
                  </span>
                </div>

                <nav className="footer-col" aria-label="Explore the wiki">
                  <strong>Explore</strong>
                  <Link to="/characters">Characters</Link>
                  <Link to="/games">Games</Link>
                  <Link to="/lore">Lore timeline</Link>
                  <Link to="/media">Films &amp; books</Link>
                  <Link to="/secrets">Secrets</Link>
                  <Link to="/achievements">Service Record</Link>
                  <Link to="/login">Staff terminal</Link>
                </nav>

                <nav className="footer-col" aria-label="Play and community">
                  <strong>After hours</strong>
                  <Link to="/play">The Arcade</Link>
                  <Link to="/play/web/fnaf-1">FNAF 1 Web Edition</Link>
                  <Link to="/community?tab=news">Newsroom</Link>
                  <Link to="/community?tab=forum">Forum</Link>
                </nav>

                <nav className="footer-col" aria-label="Sources and credits">
                  <strong>Sources</strong>
                  <a href="https://freddy-fazbears-pizza.fandom.com" target="_blank" rel="noopener noreferrer">
                    FNAF Fandom ↗
                  </a>
                  <a href="https://www.steelwoolstudios.com" target="_blank" rel="noopener noreferrer">
                    Steel Wool ↗
                  </a>
                  <a href="https://news.google.com" target="_blank" rel="noopener noreferrer">
                    Google News ↗
                  </a>
                  <Link to="/vault">The Vault</Link>
                </nav>
              </div>

              <div className="footer-bottom">
                <span>ART CREDITED TO THE FNAF WIKI · NEWS LINKS TO ORIGINAL PUBLISHERS</span>
                <span className="footer-bottom-right">
                  <button
                    className="footer-vault"
                    type="button"
                    onClick={() => announce("The nose has been honked. It is not a button.")}
                  >
                    EMPLOYEE HANDBOOK
                  </button>
                  <span
                    className="nose"
                    role="button"
                    tabIndex={0}
                    aria-label="Honk the nose"
                    title="Honk — or hold it"
                    onPointerDown={() => {
                      clearTimeout(noseTimer.current);
                      noseTimer.current = setTimeout(() => {
                        discover("long-press");
                        triggerJumpscare({ char: "springtrap", text: "you held on too long" });
                      }, 1300);
                    }}
                    onPointerUp={() => clearTimeout(noseTimer.current)}
                    onPointerLeave={() => clearTimeout(noseTimer.current)}
                    onClick={(event) => {
                      event.preventDefault();
                      discover("nose-honk");
                      triggerJumpscare({ char: "freddy-fazbear", text: "*honk*", force: true });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        discover("nose-honk");
                        triggerJumpscare({ char: "freddy-fazbear", text: "*honk*", force: true });
                      }
                    }}
                  >
                    🔴
                  </span>
                </span>
              </div>
            </footer>

            <CommandPalette />

            {notice && (
              <div className="app-toast" role="status">
                {notice}
              </div>
            )}

            {jumpscare && (
              <div
                className={`jumpscare jumpscare-char-${jumpscare.char || "freddy-fazbear"} ${
                  reducedMotion ? "jumpscare-still" : "shake"
                }`}
              >
                <div className="jumpscare-static" />
                {jumpSrc && (
                  <img
                    className="jumpscare-face jumpscare-face-img"
                    src={jumpSrc}
                    alt=""
                    width="1280"
                    height="720"
                    decoding="async"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (jumpFallbackSrc && el.dataset.fallback !== "1") {
                        el.dataset.fallback = "1";
                        el.src = jumpFallbackSrc;
                      }
                    }}
                  />
                )}
                <div className="jumpscare-text">{jumpscare.text}</div>
              </div>
            )}
          </div>
        </PowerContext.Provider>
      </JumpscareContext.Provider>
    </SettingsContext.Provider>
  );
}
