// Refreshes the FNAF News Desk snapshot.
//
// Sources:
//   • Google News RSS for "Five Nights at Freddy's"
//   • Official YouTube channels (Steel Wool Studios, Universal Pictures)
//   • Community YouTube channels (Dawko, FuhNaff, The Game Theorists)
//
// Usage: npm run news
//
// Set OPENAI_API_KEY to let a language model write the desk briefing. Without a
// key the script writes a transparent extractive briefing instead. Nothing is
// auto-published: the UI links to every source and labels the briefing.

import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artDir = join(root, "public", "art");
const outFile = join(root, "src", "data", "news.json");
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
};
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  trimValues: true,
  processEntities: true,
});

const NEWS_FEED =
  "https://news.google.com/rss/search?q=%22Five%20Nights%20at%20Freddy%27s%22&hl=en-US&gl=US&ceid=US:en";

const CHANNELS = [
  { handle: "SteelWoolStudios", name: "Steel Wool Studios", type: "official", limit: 4 },
  { handle: "UniversalPictures", name: "Universal Pictures", type: "official", limit: 3 },
  { handle: "Dawko", name: "Dawko", type: "creator", limit: 3 },
  { handle: "Fuhnaff", name: "FuhNaff", type: "creator", limit: 3 },
  { handle: "GameTheory", name: "The Game Theorists", type: "creator", limit: 3 },
];

const textValue = (value) =>
  value && typeof value === "object" ? value["#text"] ?? value.text ?? "" : value;

const stripHtml = (value) =>
  String(textValue(value) || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tagFor = (text) => {
  const haystack = text.toLowerCase();
  if (/\b(film|movie|cinema|blumhouse|box office|sequel)\b/.test(haystack)) return "Film";
  if (/\b(book|novel|frights|tales|anthology)\b/.test(haystack)) return "Books";
  if (/\b(vr|game|dlc|steel wool|security breach|mimic|help wanted|release)\b/.test(haystack))
    return "Games";
  if (/\b(community|fan|cosplay|convention|tiktok|roblox|fortnite)\b/.test(haystack))
    return "Community";
  return "Franchise";
};

const isRelevant = (text) => /(fnaf|five nights|freddy|fazbear|mimic)/i.test(text);

const fetchText = async (url) => {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};

/* ---------- Google News ---------- */
const newsItems = [];
try {
  const xml = await fetchText(NEWS_FEED);
  const parsed = parser.parse(xml);
  const raw = parsed?.rss?.channel?.item;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const item of list) {
    const title = stripHtml(item.title);
    if (!title || !isRelevant(title)) continue;
    const source = stripHtml(item.source) || "Google News";
    // Google appends " - Publisher" to every headline.
    const cleanTitle = title.replace(
      new RegExp(`\\s+-\\s+${escapeRegex(source)}$`, "i"),
      ""
    );
    const description = stripHtml(item.description);
    const usefulDescription =
      description.length > cleanTitle.length + 24 &&
      !description.toLowerCase().startsWith(cleanTitle.toLowerCase())
        ? description
        : "";
    const idHash = createHash("sha1")
      .update(String(item.link || cleanTitle))
      .digest("hex")
      .slice(0, 12);
    newsItems.push({
      id: `news-${idHash}`,
      kind: "news",
      title: cleanTitle.trim(),
      source,
      url: item.link || "",
      publishedAt: new Date(item.pubDate || Date.now()).toISOString(),
      summary:
        usefulDescription || `Coverage from ${source}. Follow the source link for the full report.`,
      tag: tagFor(`${title} ${source}`),
      sourceType: "outlet",
      image: null,
    });
  }
} catch (error) {
  console.warn(`Google News unavailable: ${error.message}`);
}

/* ---------- YouTube RSS ---------- */
const resolveChannel = async (handle) => {
  try {
    const page = await fetchText(`https://www.youtube.com/@${handle}/videos`);
    const id = page.match(/"externalId":"(UC[^"]+)"/)?.[1];
    return id || null;
  } catch {
    return null;
  }
};

const videoItems = [];
for (const channel of CHANNELS) {
  try {
    const channelId = await resolveChannel(channel.handle);
    if (!channelId) throw new Error("channel id not found");
    const xml = await fetchText(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    const parsed = parser.parse(xml);
    const raw = parsed?.feed?.entry;
    const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
    let added = 0;
    for (const entry of entries) {
      if (added >= channel.limit) break;
      const title = stripHtml(entry.title);
      if (!title) continue;
      if (channel.type === "creator" && !isRelevant(title)) continue;
      if (channel.handle === "UniversalPictures" && !isRelevant(title)) continue;

      const videoId = String(entry["yt:videoId"] || "");
      const link = entry.link?.href || `https://www.youtube.com/watch?v=${videoId}`;
      const isShort = link.includes("/shorts/");
      const description = stripHtml(entry["media:group"]?.["media:description"]);
      const publishedAt = new Date(entry.published || Date.now()).toISOString();

      let image = null;
      if (videoId) {
        try {
          const thumb = await fetch(
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            { headers: HEADERS }
          );
          if (thumb.ok) {
            const buf = Buffer.from(await thumb.arrayBuffer());
            const name = `news-video-${videoId}`;
            await sharp(buf)
              .resize({ width: 480, withoutEnlargement: true })
              .webp({ quality: 72 })
              .toFile(join(artDir, `${name}.webp`));
            image = name;
          }
        } catch {
          // A missing thumbnail is fine: the UI falls back to game artwork.
        }
      }

      videoItems.push({
        id: `video-${videoId || Buffer.from(title).toString("base64url").slice(0, 12)}`,
        kind: "video",
        title,
        source: channel.name,
        url: isShort ? link.replace("/shorts/", "/watch?v=") : link,
        publishedAt,
        summary:
          description ||
          `${channel.type === "official" ? "Official" : "Community"} video from ${channel.name}. Watch on YouTube.`,
        tag: isShort ? "Short" : tagFor(title),
        sourceType: channel.type,
        image,
        videoId,
        isShort,
      });
      added += 1;
    }
  } catch (error) {
    console.warn(`${channel.name} unavailable: ${error.message}`);
  }
}

/* ---------- Assemble, dedupe, sort ---------- */
const seen = new Set();
const items = [...newsItems, ...videoItems]
  .filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  .slice(0, 28);

/* ---------- Briefing ---------- */
const fallbackBriefing = () => {
  const top = items.filter((item) => item.kind === "news").slice(0, 3);
  const videos = items.filter((item) => item.kind === "video").slice(0, 2);
  const lines = [];
  if (top.length) {
    lines.push(
      `The desk is tracking ${items.length} FNAF signals. The biggest stories right now: ${top
        .map((item) => item.title)
        .join("; ")}.`
    );
  }
  if (videos.length) {
    lines.push(
      `Fresh video coverage comes from ${[...new Set(videos.map((v) => v.source))].join(
        ", "
      )}. Treat creator videos as commentary, not canon.`
    );
  }
  lines.push(
    "Every item links to its original source. Check the source before repeating a claim."
  );
  return lines.join(" ");
};

const apiKey = process.env.OPENAI_API_KEY;
let briefing = {
  text: fallbackBriefing(),
  generatedBy: "extractive",
  generatedAt: new Date().toISOString(),
};

if (apiKey) {
  try {
    const prompt = `You are the editor of a fan-run FNAF news desk. Write a neutral 3-sentence briefing from these headlines. Do not invent facts. Separate official news from creator commentary.
${items
  .slice(0, 14)
  .map((item) => `- [${item.source}] ${item.title} (${item.publishedAt.slice(0, 10)})`)
  .join("\n")}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: "system", content: "You write careful, source-aware fan wiki briefings." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (response.ok) {
      const json = await response.json();
      const text = json.choices?.[0]?.message?.content?.trim();
      if (text) {
        briefing = {
          text,
          generatedBy: "openai",
          generatedAt: new Date().toISOString(),
        };
      }
    } else {
      console.warn(`OpenAI briefing failed: ${response.status}`);
    }
  } catch (error) {
    console.warn(`OpenAI briefing failed: ${error.message}`);
  }
}

await mkdir(dirname(outFile), { recursive: true });
await mkdir(artDir, { recursive: true });
await writeFile(
  outFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sources: {
        news: "Google News RSS",
        official: ["Steel Wool Studios", "Universal Pictures"],
        community: ["Dawko", "FuhNaff", "The Game Theorists"],
      },
      briefing,
      items,
    },
    null,
    2
  ) + "\n",
  "utf8"
);

const newsCount = items.filter((item) => item.kind === "news").length;
console.log(
  `Wrote ${outFile} · ${newsCount} news + ${items.length - newsCount} videos · briefing: ${briefing.generatedBy}`
);
