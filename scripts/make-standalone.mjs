// Builds a fully self-contained copy of the wiki: one HTML file with the JS,
// CSS, every character portrait and every piece of FNAF artwork embedded.
//
// Why: opening dist/index.html directly from disk fails because browsers block
// external <script type="module"> files over file://. Inlining everything makes
// the page openable by double-click, and embedding the images means the file can
// be moved or shared on its own.
//
// Usage: npm run build && node scripts/make-standalone.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist-single");
const indexPath = join(dist, "index.html");

if (!existsSync(indexPath)) {
  console.error("dist-single/index.html not found — run `npm run build` first.");
  process.exit(1);
}

let html = readFileSync(indexPath, "utf8");

/* ---------- 1. Embed character portraits + FNAF artwork ---------- */
const mime = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};
const embedded = {};
const embeddedArt = {};
const pathMap = {};

const characterDir = join(root, "public", "characters");
if (existsSync(characterDir)) {
  for (const file of readdirSync(characterDir)) {
    const type = mime[extname(file).toLowerCase()];
    if (!type) continue;
    const id = file.slice(0, -extname(file).length);
    const data = `data:${type};base64,${readFileSync(join(characterDir, file)).toString("base64")}`;
    embedded[id] = data;
    pathMap[`./characters/${file}`] = data;
  }
}

const artDir = join(root, "public", "art");
if (existsSync(artDir)) {
  for (const file of readdirSync(artDir)) {
    const type = mime[extname(file).toLowerCase()];
    if (!type) continue;
    const data = `data:${type};base64,${readFileSync(join(artDir, file)).toString("base64")}`;
    embeddedArt[file] = data;
    pathMap[`./art/${file}`] = data;
  }
}

/* Jumpscare scream clips (public/sfx/) — .ogg / .wav / .mp3. */
const audioMime = {
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
};
const sfxDir = join(root, "public", "sfx");
const embeddedSfx = {};
if (existsSync(sfxDir)) {
  for (const file of readdirSync(sfxDir)) {
    const type = audioMime[extname(file).toLowerCase()];
    if (!type) continue;
    const data = `data:${type};base64,${readFileSync(join(sfxDir, file)).toString("base64")}`;
    embeddedSfx[file] = data;
    pathMap[`./sfx/${file}`] = data;
  }
}

/* ---------- 2. Inline the stylesheet ---------- */
// Drop chunk preloads first — the single-file build has no external chunks.
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, "");

/* Inline fonts (and any other CSS assets) so the standalone file works alone. */
const cssMime = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function inlineCssAssets(css, cssPath) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, ref) => {
    if (/^(data:|https?:|#|\/\/)/i.test(ref)) return match;
    const clean = ref.split(/[?#]/)[0];
    const candidates = clean.startsWith("/")
      ? [join(dist, clean.slice(1))]
      : [resolve(dirname(cssPath), clean), join(dist, clean)];
    const file = candidates.find((path) => existsSync(path) && cssMime[extname(path).toLowerCase()]);
    if (!file) return match;
    const type = cssMime[extname(file).toLowerCase()];
    return `url("data:${type};base64,${readFileSync(file).toString("base64")}")`;
  });
}

/* Inline the favicon so the standalone file is truly self-contained. */
const faviconPath = join(root, "public", "favicon.svg");
if (existsSync(faviconPath)) {
  const favicon = `data:image/svg+xml;base64,${readFileSync(faviconPath).toString("base64")}`;
  html = html.replace(
    /<link[^>]*rel="icon"[^>]*>/,
    `<link rel="icon" type="image/svg+xml" href="${favicon}" />`
  );
}

html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (match, href) => {
    const file = join(dist, href.replace(/^\.?\//, ""));
    if (!existsSync(file)) return match;
    return `<style>\n${inlineCssAssets(readFileSync(file, "utf8"), file)}\n</style>`;
  }
);

/* ---------- 3. Inline the module bundle ---------- */
let js = null;
html = html.replace(
  /<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (match, src) => {
    const file = join(dist, src.replace(/^\.?\//, ""));
    if (!existsSync(file)) return match;
    js = readFileSync(file, "utf8");
    return `<script type="module">\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`;
  }
);

/* ---------- 4. Inject the embedded image maps before the app ---------- */
// The runtime asset helpers check these maps first. They are defined before the
// module bundle so the very first render already resolves local data URIs.
let patched = false;
if (js) {
  const mapScript = `<script>window.__FNAF_IMAGES__=${JSON.stringify(
    embedded
  )};window.__FNAF_ART__=${JSON.stringify(embeddedArt)};window.__FNAF_SFX__=${JSON.stringify(
    embeddedSfx
  )}</script>`;
  if (html.includes("<script type=\"module\">")) {
    html = html.replace(
      /<script type="module">/,
      `${mapScript}\n<script type="module">`
    );
    patched = true;
  }
}

/* ---------- 5. Inline any literal asset paths ---------- */
// Catches static paths such as the Open Graph preview image. Runtime paths are
// handled by the maps above.
html = html.replace(
  /\.\/(?:art|characters|sfx)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|gif|ogg|wav|mp3|m4a)/g,
  (match) => pathMap[match] || match
);

const out = join(root, "FNAF-Wiki.html");
writeFileSync(out, html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(0);
const imgCount = Object.keys(embedded).length;
const artCount = Object.keys(embeddedArt).length;
const sfxCount = Object.keys(embeddedSfx).length;
console.log(
  `Wrote ${out} (${kb} KB, ${imgCount} portraits + ${artCount} artwork + ${sfxCount} scream files embedded${
    patched ? "" : " — WARNING: image maps not injected, keep public/ nearby"
  })`
);
