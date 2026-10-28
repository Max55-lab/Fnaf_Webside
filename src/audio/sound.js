/**
 * Procedural audio engine — synthesizes all sounds with the Web Audio API.
 * No audio files required, so nothing can 404 and there are no licensing issues.
 */

let ctx = null;
let masterGain = null;
let ambientNodes = null;
let enabled = true;
let volume = 0.5;

const clampVolume = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0.5;
  return Math.min(1, Math.max(0, number));
};

const applyMasterVolume = () => {
  if (masterGain) masterGain.gain.value = enabled ? volume : 0;
};

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = enabled ? volume : 0;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

export const setMuted = (muted) => {
  enabled = !muted;
  applyMasterVolume();
  if (muted) stopAmbient();
};

export const setVolume = (next) => {
  volume = clampVolume(next);
  applyMasterVolume();
};

export const getVolume = () => volume;

export const isMuted = () => !enabled;

/* ---------------- Ambient scenes (per-page room tone) ----------------
 * Every page can set its own procedurally-generated ambience: a base hum,
 * filtered noise and a random one-shot event (thumps, plinks, ticks).
 * All of it is synthesized — no audio files, nothing to license.
 */
const SCENES = {
  site: { freq: 55, humVol: 0.045, noiseCut: 320, noiseVol: 0.026, event: { freq: 70, type: "sine", vol: 0.05, dur: 0.5, every: [18, 34] } },
  "fnaf-1": { freq: 47, humVol: 0.04, noiseCut: 430, noiseVol: 0.028, event: { freq: 55, type: "triangle", vol: 0.06, dur: 0.7, every: [9, 17] } },
  "fnaf-2": { freq: 60, humVol: 0.03, noiseCut: 520, noiseVol: 0.016, event: { freq: 1245, type: "sine", vol: 0.05, dur: 1.4, every: [7, 13] } },
  "fnaf-3": { freq: 45, humVol: 0.035, noiseCut: 700, noiseVol: 0.03, event: { freq: 190, type: "sawtooth", vol: 0.035, dur: 0.16, every: [11, 22] } },
  "fnaf-4": { freq: 38, humVol: 0.045, noiseCut: 240, noiseVol: 0.02, event: { freq: 45, type: "sine", vol: 0.07, dur: 0.9, every: [14, 26] } },
  "sister-location": { freq: 70, humVol: 0.03, noiseCut: 380, noiseVol: 0.02, event: { freq: 320, type: "square", vol: 0.03, dur: 0.08, every: [6, 12] } },
  ffps: { freq: 62, humVol: 0.03, noiseCut: 460, noiseVol: 0.02, event: { freq: 880, type: "triangle", vol: 0.04, dur: 0.25, every: [10, 19] } },
  ucn: { freq: 55, humVol: 0.04, noiseCut: 340, noiseVol: 0.022, event: { freq: 60, type: "sine", vol: 0.06, dur: 0.3, every: [5, 9] } },
  "security-breach": { freq: 64, humVol: 0.03, noiseCut: 520, noiseVol: 0.018, event: { freq: 1560, type: "square", vol: 0.02, dur: 0.1, every: [8, 15] } },
  "help-wanted": { freq: 80, humVol: 0.028, noiseCut: 640, noiseVol: 0.02, event: { freq: 660, type: "square", vol: 0.03, dur: 0.1, every: [6, 11] } },
  ruin: { freq: 40, humVol: 0.045, noiseCut: 260, noiseVol: 0.026, event: { freq: 920, type: "sine", vol: 0.035, dur: 0.5, every: [12, 24] } },
  "secret-of-the-mimic": { freq: 44, humVol: 0.04, noiseCut: 300, noiseVol: 0.02, event: { freq: 220, type: "triangle", vol: 0.045, dur: 0.1, every: [3.1, 3.5] } },
  media: { freq: 88, humVol: 0.025, noiseCut: 900, noiseVol: 0.024, event: { freq: 1320, type: "sawtooth", vol: 0.015, dur: 0.05, every: [3, 6] } },
  lore: { freq: 50, humVol: 0.028, noiseCut: 300, noiseVol: 0.016, event: { freq: 300, type: "triangle", vol: 0.03, dur: 0.4, every: [16, 30] } },
  arcade: { freq: 66, humVol: 0.03, noiseCut: 560, noiseVol: 0.02, event: { freq: 990, type: "square", vol: 0.028, dur: 0.12, every: [4, 8] } },
  community: { freq: 55, humVol: 0.035, noiseCut: 320, noiseVol: 0.02, event: { freq: 70, type: "sine", vol: 0.05, dur: 0.5, every: [18, 34] } },
};

let sceneName = "site";
let eventTimer = null;

/* Scene gains are deliberately gentle room tone; this global trim lifts them
   into audible range on laptop speakers while keeping the per-scene balance. */
const SCENE_TRIM = 1.55;
const EVENT_TRIM = 1.3;
const FADE_IN = 0.5;
const FADE_OUT = 0.3;

/* Random one-shot event that keeps each room tone alive. */
const scheduleSceneEvent = () => {
  if (eventTimer) clearTimeout(eventTimer);
  const scene = SCENES[sceneName];
  if (!scene?.event || !ambientNodes || !enabled) return;
  const [min, max] = scene.event.every;
  eventTimer = setTimeout(() => {
    if (!ambientNodes || !enabled) return;
    const evt = scene.event;
    blip(evt.freq * (0.92 + Math.random() * 0.16), evt.dur, evt.type, Math.min(0.12, evt.vol * EVENT_TRIM));
    scheduleSceneEvent();
  }, (min + Math.random() * (max - min)) * 1000);
};

/* Switch the active scene. If the drone is running, morph it in place
   (frequency/gain ramps) instead of tearing it down — no clicks, no gap,
   and the one-shot event timer restarts for the new scene. */
export const setAmbientScene = (name) => {
  const next = SCENES[name] ? name : "site";
  if (next === sceneName) return;
  sceneName = next;
  if (ambientNodes && ctx) {
    const scene = SCENES[sceneName];
    const now = ctx.currentTime;
    const glide = (param, target) => {
      try {
        param.setTargetAtTime(target, now, 0.18);
      } catch {
        /* param may belong to a chain that is fading out */
      }
    };
    glide(ambientNodes.hum.frequency, scene.freq);
    glide(ambientNodes.humGain.gain, scene.humVol * SCENE_TRIM);
    glide(ambientNodes.lp.frequency, scene.noiseCut);
    glide(ambientNodes.noiseGain.gain, scene.noiseVol * SCENE_TRIM);
    scheduleSceneEvent();
  }
};

/* ---------------- Ambient drone (electrical hum + fan) ----------------
 * The chain is hum + filtered noise → ambientGain (fade envelope) → master.
 * Scene switches retune the running chain; stop fades the envelope to zero
 * before stopping the old oscillators, so nothing ever hard-clicks. */
export const startAmbient = () => {
  const c = getCtx();
  if (!c || ambientNodes || !enabled) return;
  const scene = SCENES[sceneName];

  const hum = c.createOscillator();
  hum.type = "sine";
  hum.frequency.value = scene.freq;

  const humGain = c.createGain();
  humGain.gain.value = scene.humVol * SCENE_TRIM;

  // Fan noise via filtered white noise
  const bufferSize = 2 * c.sampleRate;
  const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = scene.noiseCut;

  const noiseGain = c.createGain();
  noiseGain.gain.value = scene.noiseVol * SCENE_TRIM;

  const envelope = c.createGain();
  envelope.gain.setValueAtTime(0.0001, c.currentTime);
  envelope.gain.linearRampToValueAtTime(1, c.currentTime + FADE_IN);

  hum.connect(humGain).connect(envelope);
  noise.connect(lp).connect(noiseGain).connect(envelope);
  envelope.connect(masterGain);
  hum.start();
  noise.start();

  ambientNodes = { hum, noise, humGain, noiseGain, lp, envelope };
  scheduleSceneEvent();
};

export const stopAmbient = () => {
  if (eventTimer) {
    clearTimeout(eventTimer);
    eventTimer = null;
  }
  if (!ambientNodes) return;
  const dying = ambientNodes;
  // Detach immediately so a quick restart builds a fresh chain; the old one
  // fades out on its own schedule and stops ~FADE_OUT from now.
  ambientNodes = null;
  try {
    const now = ctx.currentTime;
    dying.envelope.gain.cancelScheduledValues(now);
    dying.envelope.gain.setTargetAtTime(0.0001, now, FADE_OUT / 3);
  } catch {
    /* context already gone */
  }
  setTimeout(() => {
    try {
      dying.hum.stop();
      dying.noise.stop();
    } catch {
      /* already stopped */
    }
  }, FADE_OUT * 1000 + 60);
};

/* ---------------- One-shot helpers ---------------- */
/* Every blip marks the moment sound last fired, so the global UI layer can
   deduplicate: if a component already played something, stay quiet. */
let lastSfxAt = 0;
export const wasSfxRecent = (windowMs = 90) =>
  performance.now() - lastSfxAt < windowMs;

const blip = (freq, dur, type = "square", vol = 0.15, slideTo = null) => {
  const c = getCtx();
  if (!c || !enabled) return;
  lastSfxAt = performance.now();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(g).connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + dur + 0.02);
};

/* Electronic "channel switch" clunk + static burst */
export const sfxChannelSwitch = () => {
  const c = getCtx();
  if (!c || !enabled) return;
  blip(180, 0.08, "square", 0.12, 90);
  // static burst
  const bufferSize = Math.floor(c.sampleRate * 0.18);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = 0.09;
  src.connect(g).connect(masterGain);
  src.start();
};

/* Heavy metal door slam */
export const sfxDoorSlam = () => {
  const c = getCtx();
  if (!c || !enabled) return;
  blip(70, 0.35, "sawtooth", 0.35, 30);
  blip(140, 0.2, "square", 0.2, 50);
  const bufferSize = Math.floor(c.sampleRate * 0.25);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = 0.3;
  src.connect(g).connect(masterGain);
  src.start();
};

/* Door opens — servo whirr */
export const sfxDoorOpen = () => blip(240, 0.3, "sawtooth", 0.1, 120);

/* Footstep in the hall */
export const sfxFootstep = () => blip(90, 0.12, "triangle", 0.14, 60);

/* Camera deploy / camera up beep */
export const sfxCameraUp = () => {
  blip(560, 0.07, "square", 0.1);
  setTimeout(() => blip(760, 0.09, "square", 0.1), 70);
};

/* Metallic clatter for kitchens / vents */
export const sfxClatter = () => {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => blip(300 + Math.random() * 900, 0.06, "square", 0.07), i * 45);
  }
};

/* Jumpscare: harsh detuned scream-equivalent.
   Pass a character id for that character's signature scream profile —
   deeper for Golden Freddy, ragged-fast for Foxy, music-box pre-roll for
   the Puppet/Baby, springlock rattle for Springtrap. No id = classic. */
const SCARE_PROFILES = {
  "freddy-fazbear": { root: 1.0, sweep: 0.55, grit: 0.3 },
  bonnie: { root: 1.1, sweep: 0.5, grit: 0.26 },
  chica: { root: 1.26, sweep: 0.6, grit: 0.32 },
  foxy: { root: 1.45, sweep: 0.4, grit: 0.4, fast: true },
  "golden-freddy": { root: 0.78, sweep: 0.72, grit: 0.22, deep: true },
  springtrap: { root: 0.9, sweep: 0.5, grit: 0.36, rattle: true },
  "circus-baby": { root: 1.2, sweep: 0.66, grit: 0.2, musicbox: true },
  mangle: { root: 1.34, sweep: 0.46, grit: 0.38 },
  "the-puppet": { root: 1.16, sweep: 0.75, grit: 0.16, musicbox: true },
  "balloon-boy": { root: 1.5, sweep: 0.55, grit: 0.24, giggle: true },
};

export const sfxJumpscare = (charId) => {
  const c = getCtx();
  if (!c || !enabled) return;
  const p = SCARE_PROFILES[charId] || { root: 1, sweep: 0.55, grit: 0.3 };
  const dur = p.deep ? 1.35 : p.fast ? 0.75 : 1.0;
  [110, 116, 220, 330, 440].forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = i % 2 ? "sawtooth" : "square";
    osc.frequency.setValueAtTime(f * 2.2 * p.root, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f * p.sweep * p.root, c.currentTime + dur);
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur + 0.1);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + dur + 0.15);
  });
  // noise blast — the "grit" of the scream
  const bufferSize = Math.floor(c.sampleRate * (p.fast ? 0.35 : 0.5));
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(p.grit, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
  src.connect(g).connect(masterGain);
  src.start();
  /* Character flourishes */
  if (p.musicbox) {
    [784, 659, 523, 392].forEach((f, i) =>
      setTimeout(() => blip(f, 0.14, "triangle", 0.1), i * 90)
    );
  }
  if (p.rattle) {
    sfxClatter();
  }
  if (p.giggle) {
    [1568, 1760, 2093].forEach((f, i) =>
      setTimeout(() => blip(f, 0.06, "square", 0.08), 140 + i * 70)
    );
  }
};

/* Real jumpscare scream clip (hotlinked .ogg/.wav from the FNAF Wiki).
   Gated on the same mute/volume prefs as everything else. Resolves true
   only when playback actually starts; callers fall back to the procedural
   sfxJumpscare() when it resolves false (offline, blocked codec, muted). */
let scareClip = null;
export const sfxJumpscareClip = (url) => {
  if (!url || typeof Audio === "undefined") return Promise.resolve(false);
  if (!enabled || volume <= 0) return Promise.resolve(false);
  if (scareClip) {
    scareClip.pause();
    scareClip = null;
  }
  const audio = new Audio(url);
  audio.volume = Math.min(1, 0.6 + volume * 0.4);
  scareClip = audio;
  const played = audio.play();
  if (!played) return Promise.resolve(true); // legacy browsers: assume ok
  return played
    .then(() => {
      if (scareClip === audio) scareClip = null;
      return true;
    })
    .catch(() => {
      if (scareClip === audio) scareClip = null;
      return false;
    });
};

/* Low power warning beep */
export const sfxPowerWarning = () => blip(880, 0.12, "sine", 0.1, 660);

/* The Toreador March — Freddy's music box, played when power dies */
export const sfxToreador = () => {
  const c = getCtx();
  if (!c || !enabled) return;
  // Simplified melody in a music-box timbre
  const notes = [
    [659, 0.28], [659, 0.28], [698, 0.28], [784, 0.42],
    [784, 0.28], [698, 0.28], [659, 0.28], [587, 0.42],
    [523, 0.28], [587, 0.28], [659, 0.28], [659, 0.5],
  ];
  let t = 0;
  notes.forEach(([freq, dur]) => {
    setTimeout(() => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.14, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(g).connect(masterGain);
      osc.start();
      osc.stop(c.currentTime + dur + 0.05);
    }, t * 1000);
    t += dur;
  });
};

/* Hour chime / 6 AM victory */
export const sfxVictory = () => {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => blip(f, 0.3, "triangle", 0.16), i * 130)
  );
};

/* UI hover tick */
export const sfxTick = () => blip(1200, 0.02, "square", 0.04);

/* Generic UI confirm */
export const sfxConfirm = () => {
  blip(420, 0.08, "square", 0.1);
  setTimeout(() => blip(640, 0.12, "square", 0.1), 80);
};

/* ---------------- Global UI palette ----------------
 * Wire these to buttons, tabs, toggles and page changes across the site.
 * All of them route through blip(), so wasSfxRecent() keeps the global
 * click layer from doubling up on components that already play a sound.
 */

/* Hover tick — deliberately feather-light so hovers never fatigue. */
export const sfxUiHover = () => blip(1700, 0.015, "square", 0.022);

/* Generic click — a firm two-stage console clack. */
export const sfxUiClick = () => {
  blip(920, 0.03, "square", 0.06);
  setTimeout(() => blip(360, 0.05, "square", 0.055), 28);
};

/* Page transition — a soft filtered static whoosh (channel-change flavor). */
export const sfxPageIn = () => {
  const c = getCtx();
  if (!c || !enabled) return;
  lastSfxAt = performance.now();
  const bufferSize = Math.floor(c.sampleRate * 0.22);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(400, c.currentTime);
  bp.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 0.2);
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.055, c.currentTime + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
  src.connect(bp).connect(g).connect(masterGain);
  src.start();
  blip(240, 0.16, "triangle", 0.05, 160);
};

/* Toggle on / off — a switch flips up or drops down. */
export const sfxToggle = (on = true) =>
  on
    ? blip(560, 0.09, "triangle", 0.09, 940)
    : blip(880, 0.1, "triangle", 0.08, 420);

/* Access denied — the keypad buzzes at you. */
export const sfxDeny = () => {
  blip(170, 0.16, "square", 0.16);
  setTimeout(() => blip(120, 0.22, "square", 0.14), 130);
};

/* Access granted — a little keycard chime. */
export const sfxGrant = () => {
  [523, 784, 1047].forEach((f, i) =>
    setTimeout(() => blip(f, 0.22, "triangle", 0.12), i * 110)
  );
};

/* Arcade coin — classic two-note insert. */
export const sfxCoin = () => {
  blip(988, 0.07, "square", 0.1);
  setTimeout(() => blip(1319, 0.16, "square", 0.1), 70);
};

/* Keypress — terminal typing tick (login fields, chat). */
export const sfxType = () => blip(2400, 0.012, "square", 0.02);

/* Two low knocks — used by the staff terminal door. */
export const sfxKnock = () => {
  blip(84, 0.1, "triangle", 0.2);
  setTimeout(() => blip(72, 0.14, "triangle", 0.22), 180);
};
