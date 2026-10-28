// Downloads the real in-game jumpscare GIFs *and* their scream sounds from
// the FNAF Wiki's Jumpscares galleries, then turns the GIFs into small
// animated WebP files (plus a still frame for reduced-motion visitors) and
// copies the screams into public/sfx/.
//
// Why local instead of hotlinking: static.wikia.nocookie.net sends a
// Cross-Origin-Resource-Policy header that makes browsers hard-block
// cross-origin <img>/<audio> (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin), so the
// gallery can't be hotlinked at all. We download once and bundle.
//
// Usage: npm run jumpscares
//
// Source files are read from the public Five Nights at Freddy's Fandom wiki.
// They are only used inside this non-commercial fan project; every source file
// is credited in README.md and on the wiki itself.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artDir = join(root, "public", "art");
const sfxDir = join(root, "public", "sfx");
const CDN = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
  Referer: "https://freddy-fazbears-pizza.fandom.com/",
};

// slug -> gallery GIF path + (optional) scream path, relative to the CDN root.
// Characters missing from the FNaF:SD gallery are pulled from the FNaF:SB,
// HW2, FNaF 2 and Sister Location galleries instead. william-afton reuses
// springtrap, so it isn't listed here.
const CLIPS = [
  { slug: "freddy-fazbear", gif: "c/c5/FreddyJumpscare.gif", sfx: "2/26/FreddyJumpscare.ogg" },
  { slug: "bonnie", gif: "1/18/BonnieJumpscare.gif", sfx: "0/0c/BonnieJumpscare.ogg" },
  { slug: "chica", gif: "b/bb/ChicaJumpscare.gif", sfx: "b/b2/ChicaJumpscare.ogg" },
  { slug: "foxy", gif: "3/3a/FoxyJumpscare.gif", sfx: "f/f4/FoxyJumpscare.ogg" },
  { slug: "golden-freddy", gif: "d/d6/GoldenFredJumpscare.gif", sfx: "5/55/GoldenJumpscare.ogg" },
  { slug: "springtrap", gif: "0/0d/SpringtrapJumpscare.gif", sfx: "e/ea/SpringtrapJumpscare.ogg" },
  { slug: "circus-baby", gif: "b/bc/BabyJumpscare.gif", sfx: "0/0b/BabyJumpscare.ogg" },
  { slug: "mangle", gif: "5/51/MangleARJump.gif", sfx: "d/db/MangleJumpscare.ogg" },
  { slug: "the-puppet", gif: "0/05/Puppet%27s_Jumpscare.gif", sfx: "2/26/Sfx_puppet_onStage_jumpscare.ogg" },
  { slug: "balloon-boy", gif: "5/55/BBARJump.gif", sfx: "6/6b/BalloonBoyJumpscare.ogg" },
  { slug: "funtime-freddy", gif: "5/5a/Funtime_Freddy_Jumpscare_HW2-min.gif", sfx: "a/aa/Funtime_Freddy_Jumpscare.ogg" },
  { slug: "ballora", gif: "0/00/AR-BalloraJumpscare.gif", sfx: "4/45/BalloraJumpscare.ogg" },
  { slug: "ennard", gif: "c/ce/Ennard%27s_Jumpscare.gif", sfx: "9/9c/Sfx_ennard_jumpscare.ogg" },
  { slug: "glamrock-freddy", gif: "8/81/GlamrockFreddyJumpscare.gif", sfx: null }, // no scream file exists
  { slug: "montgomery-gator", gif: "8/88/MontyJumpscare.gif", sfx: "9/9a/JumpScare_monty.ogg" },
  { slug: "roxanne-wolf", gif: "d/d8/RoxyJumpscare.gif", sfx: "2/24/JumpScare_roxy.ogg" },
  { slug: "the-mimic", gif: "0/0f/MimicJumpscare.gif", sfx: "b/ba/Sfx_rn_Mimic_jumpscare.wav" },
];

const fetchBytes = async (path) => {
  const response = await fetch(`${CDN}/${path}/revision/latest`, { headers: HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
};

await mkdir(artDir, { recursive: true });
await mkdir(sfxDir, { recursive: true });

let okCount = 0;
let failCount = 0;

for (const { slug, gif, sfx } of CLIPS) {
  process.stdout.write(`${slug} … `);
  try {
    const source = await fetchBytes(gif);

    // 420px wide keeps the scare readable while making the standalone build
    // practical. A q64 animated WebP is a fraction of the multi-MB GIF size.
    const animated = await sharp(source, { animated: true })
      .resize({ width: 420, withoutEnlargement: true })
      .webp({ quality: 64, alphaQuality: 75, effort: 6, smartSubsample: true })
      .toBuffer();

    const still = await sharp(source, { page: 0 })
      .resize({ width: 420, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();

    await writeFile(join(artDir, `${slug}.webp`), animated);
    await writeFile(join(artDir, `${slug}-still.webp`), still);

    const kb = (size) => `${(size / 1024).toFixed(0)} KB`;
    let sfxNote = "no scream (procedural fallback)";
    if (sfx) {
      const audio = await fetchBytes(sfx);
      const ext = sfx.split(".").pop();
      await writeFile(join(sfxDir, `${slug}.${ext}`), audio);
      sfxNote = `scream ${kb(audio.length)}.${ext}`;
    }
    okCount += 1;
    console.log(`gif ${kb(source.length)} → webp ${kb(animated.length)} + still · ${sfxNote}`);
  } catch (error) {
    failCount += 1;
    console.log(`FAILED (${error.message})`);
  }
}

console.log(
  `\nWrote clips for ${okCount} characters to public/art/ + public/sfx/` +
    (failCount ? ` (${failCount} failed)` : "")
);
