// Real in-game jumpscare clips + scream sounds, downloaded from the FNAF
// Wiki's Jumpscares galleries (FNaF: SD first, then FNaF: SB / HW2 / FNaF 2 /
// Sister Location for anyone it doesn't cover) and bundled locally.
//
// The wiki's CDN sends Cross-Origin-Resource-Policy, so the gallery can't be
// hotlinked — `npm run jumpscares` re-downloads and converts them here:
//   public/art/<id>.webp        animated jumpscare (gallery GIF -> WebP)
//   public/art/<id>-still.webp  first frame, used for reduced-motion viewers
//   public/sfx/<id>.ogg|.wav    the character's real scream
// Characters with no scream file on the wiki (Glamrock Freddy) keep the
// procedural synth profile in src/audio/sound.js as their fallback. Source
// credit lives in README.md.
import { art, sfx } from "../lib/assets.js";

const CLIPS = {
  "freddy-fazbear": { src: "jumpscare-freddy", text: "IT'S ME", sfx: "freddy-fazbear.ogg" },
  bonnie: { src: "jumpscare-bonnie", text: "LEFT DOOR. NOW.", sfx: "bonnie.ogg" },
  chica: { src: "jumpscare-chica", text: "LET'S EAT!", sfx: "chica.ogg" },
  foxy: { src: "jumpscare-foxy", text: "RUN.", sfx: "foxy.ogg" },
  "golden-freddy": { src: "jumpscare-golden-freddy", text: "IT'S ME", sfx: "golden-freddy.ogg" },
  springtrap: {
    src: "jumpscare-springtrap",
    text: "I ALWAYS COME BACK",
    sfx: "springtrap.ogg",
  },
  "circus-baby": {
    src: "jumpscare-circus-baby",
    text: "YOU WON'T GET TIRED OF MY VOICE",
    sfx: "circus-baby.ogg",
  },
  mangle: { src: "jumpscare-mangle", text: "HELLO?", sfx: "mangle.ogg" },
  "the-puppet": { src: "jumpscare-the-puppet", text: "THE MUSIC BOX", sfx: "the-puppet.ogg" },
  "balloon-boy": { src: "jumpscare-balloon-boy", text: "HI!", sfx: "balloon-boy.ogg" },
  "funtime-freddy": {
    src: "jumpscare-funtime-freddy",
    text: "BON-BON!",
    sfx: "funtime-freddy.ogg",
  },
  ballora: { src: "jumpscare-ballora", text: "COME CLOSER", sfx: "ballora.ogg" },
  ennard: { src: "jumpscare-ennard", text: "WE ARE ALL HERE", sfx: "ennard.ogg" },
  "glamrock-freddy": {
    src: "jumpscare-glamrock-freddy",
    text: "SUPERSTAR",
    sfx: null, // no scream file exists — procedural fallback
  },
  "montgomery-gator": {
    src: "jumpscare-montgomery-gator",
    text: "ROCK AND ROLL",
    sfx: "montgomery-gator.ogg",
  },
  "roxanne-wolf": { src: "jumpscare-roxanne-wolf", text: "I CAN SEE YOU", sfx: "roxanne-wolf.ogg" },
  "the-mimic": { src: "jumpscare-the-mimic", text: "I CAN MIMIC YOU", sfx: "the-mimic.wav" },
  "william-afton": {
    src: "jumpscare-springtrap",
    text: "I ALWAYS COME BACK",
    sfx: "springtrap.ogg",
  },
};

const FALLBACKS = ["freddy-fazbear", "bonnie", "chica", "foxy"];

export const jumpscareFor = (characterId) => {
  const key = CLIPS[characterId]
    ? characterId
    : FALLBACKS[Math.abs(String(characterId || "").length) % FALLBACKS.length];
  const clip = CLIPS[key] || CLIPS["freddy-fazbear"];

  return {
    characterId: key,
    text: clip.text,
    image: art(clip.src),
    still: art(`${clip.src}-still`),
    sound: clip.sfx ? sfx(clip.sfx) : null,
  };
};

/* Warm the browser cache for a character's jumpscare + scream so the scare
   doesn't wait on the network when it fires. Idempotent. */
const preloaded = new Set();
export const preloadJumpscare = (characterId) => {
  const clip = jumpscareFor(characterId);
  if (preloaded.has(clip.characterId)) return;
  preloaded.add(clip.characterId);
  const img = new Image();
  img.decoding = "async";
  img.src = clip.image;
  if (clip.sound) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = clip.sound;
  }
};

export const globalJumpscares = [
  "freddy-fazbear",
  "bonnie",
  "chica",
  "foxy",
  "springtrap",
  "golden-freddy",
].map((id) => ({
  char: id,
  text: CLIPS[id].text,
  ...jumpscareFor(id),
}));
