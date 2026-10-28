# Five Nights at Freddy's — Fan Wiki

A dark, interactive FNAF fan encyclopedia built with **React + Vite**.
20 characters with full backstories, layered lore broken into the games, novels
and films continuities (plus long-form deep dives), all 11 mainline games with
walkthrough guides, **how-to-play tutorials** and **easter-egg checklists**,
**seven playable minigames** (Plushtrap chalk game, Shadow Bonnie cake chase,
Fruity Maze, Foxy's dock dash, Wind the Music Box, Pizza Toss and Golden Freddy
Stare) with how-to-activate field guides, a **live newsroom** that polls
real headlines, a browser-local **forum**, a **live break-room chat** that talks
across your open tabs, a live **Wiki Wire** fed by the FNAF
Fandom wiki, real **jumpscare clips** sourced from the wiki, a Fazbear-style
**boot screen**, per-page **procedural ambient audio** plus **procedural UI
sounds** on every button and tab, a concept **staff terminal** with three roles
(Guest / Administrator / Super Administrator) that restyle the whole wiki, a
hand-written **WebGL CRT/VHS shader**, snappier **page-transition animations**,
**buy / read / download** options on every film and book, and a hidden layer of
**34 secrets, codes and easter eggs** tracked in a secret "Vault".

> Fan project. Not affiliated with Scott Cawthon or Steel Wool Studios.
> Character art, game key art, film/book covers and camera stills are credited to the
> [FNAF Wiki](https://freddy-fazbears-pizza.fandom.com). Jumpscare GIFs and scream
> clips are downloaded from that wiki's
> [Jumpscares galleries](https://freddy-fazbears-pizza.fandom.com/wiki/Jumpscares_(FNaF:_SD))
> (FNaF: SD first, then FNaF: SB / HW2 / FNaF 2 / Sister Location for anyone the SD
> roster doesn't cover) and bundled locally — the wiki's CDN blocks hotlinking.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/ + FNAF-Wiki.html
npm run preview  # preview the production build
```

On Windows you can also just double-click **`Start Website.bat`** — it installs
dependencies on first run, starts the dev server and opens the browser.

On Windows PowerShell, use `npm.cmd` if script execution is restricted.

### Just want to look at it?

`npm run build` also produces **`FNAF-Wiki.html`** in the project root — a single
self-contained file with the scripts, styles, the 20 portraits and all 79 pieces of
FNAF artwork embedded. Double-click
it (or **`Open Wiki - Offline.bat`**) to open the wiki in any browser. No server needed.

Do **not** double-click `dist/index.html`: browsers block external module scripts over
`file://`, which shows a blank page.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Fandom-style home: welcome box, featured character, franchise hub, Faz-Facts, official links, shortcut portals with saved-bookmark seeds |
| `/characters` | Searchable character roster (20 animatronics + humans) |
| `/characters/:id` | Bio, full backstory, night behaviour, trivia, games they appear in, related cast, prev/next |
| `/games` / `/games/:id` | All 11 games with mechanics, characters and secrets; every game page is a three-tab field manual — night-shift walkthrough guide, step-by-step how-to-play tutorial, and an easter-egg hunt list |
| `/play` | Arcade hub (`/arcade` redirects here): seven playable minigames — Plushtrap Chalk Game, Shadow Bonnie cake chase, Fruity Maze, Foxy's dock dash, Wind the Music Box, Pizza Toss and Golden Freddy Stare — each with a field guide (how to activate it in the real game, how to beat it, easter eggs) and best scores kept in `localStorage` |
| `/play/web/:slug` | Full-page third-party web editions: FNAF 1-4, World, Sister Location, Pizzeria Simulator and Ultimate Custom Night (hd_fnaf HTML5 ports) plus Dorukyum's FNAF-Web with the Custom Night |
| `/media` | Both films and six book lines in depth — release dates, runtime, cast, box office, reception, production notes and per-book highlights — plus **Buy / Read / Download case file** actions on every entry |
| `/community` | Four-tab hub: **Newsroom** (live-polled headlines + build-time snapshot fallback, plus in-world dispatches that trickle in over the session, site patch notes + video desk), **Forum** (browser-local threads), **Break Room** (live shift chat between your open tabs, with night-shift bots and presence) and **Wiki Wire** (live Fandom activity, auto-synced every 3 minutes) |
| `/login` | Concept **staff terminal** — sign in as Guest, Administrator or Super Administrator; any code works, the badge lives in `localStorage`, and each clearance repaints the whole wiki |
| `/admin` | **Oversight console** (staff clearance required): shift stats, staff directory, shift broadcasts that surface on the terminal, and a super-admin-only classified addendum |
| `/lore` | Layered timeline: games, novels and film continuities, each with era filters, key concepts and six long-form deep dives |
| `/secrets` | Story minigames and documented easter eggs |
| `/vault` | Every secret in the site, with hints, progress, filters and a reset button |
| `/achievements` | The Service Record: night-guard statistics (sessions, time on site, files read) plus 24 achievement badges across bronze/silver/gold/platinum tiers, with ranks and an unlock toast (`/record` redirects here) |

`/night` and `/cameras` were retired — their routes, art-pass CSS and demo-only
secrets were removed — and now redirect to `/play`.

## Features

- **Procedural UI sounds everywhere** — hover ticks, a two-stage console clack on
  clicks, a static whoosh on every page change, toggle flips, keypad buzzes, coin
  inserts and keycard chimes, all synthesised in `src/audio/sound.js`. A global
  listener wires them to every button, link and `role="button"`; components that
  already play their own sound win (a 90 ms dedup window in the sound engine),
  and the "CRT effects" toggle silences the whole layer.
- **Per-character jumpscares** — clicking a character portrait plays *that*
  character's real jumpscare animation and scream clip, downloaded from the wiki's
  Jumpscares galleries, with *their* line ("LEFT DOOR. NOW.", "RUN.",
  "I ALWAYS COME BACK"…). Each has a matching procedural scream profile used as
  a fallback when the clip can't play (offline or muted): Foxy's is
  fast and ragged, Golden Freddy's is deep and long, the Puppet and Circus Baby
  get a music-box pre-roll, Springtrap rattles.
- **Roles + a concept staff terminal** — `/login` lets you clock in as Guest,
  Administrator or Super Administrator (any code works — it's a concept, and
  typing `1987`, `afton`, `purple` or `henry` into the code field is noticed).
  The badge lives in `fnaf_auth_v1`, repaints the whole wiki via a `data-role`
  attribute on `<html>` (yellow → cyan → red/gold with a glitching logo), shows
  a nav chip, unlocks `/admin` (Oversight console: stats, staff directory,
  shift broadcasts) — and `sudo` works while you're wearing an admin badge.
- **WebGL shader backdrops** — a hand-written (no libraries) raw-WebGL CRT/VHS
  fragment shader: broadcast static, scanlines, a rolling wave, dust specks and
  a vignette behind the homepage hero and the staff terminal. It pauses when the
  tab hides or scrolls out of view and paints one frozen frame under
  `prefers-reduced-motion`.
- **Live break-room chat** — the Community tab's fourth desk is a shift chat
  that works *across your open tabs* (BroadcastChannel), with presence, typing
  indicators, `!roll` / `!cams` / `!power` / `!pizza` commands and night-shift
  bots so it never feels dead offline. The newsroom also stops being static:
  in-world dispatches trickle into the feed over the session with a NEW chip.
- **Buy / read / download on media** — every film and book card gets a Buy
  link, a Read/Trailer link (external searches — nothing copyrighted is hosted)
  and a **Download case file** button that generates a plain-text dossier of
  our own wiki write-up for that entry.
- **Command palette** — press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> (or the nav
  search button) to search characters, games, lore events, minigames and pages from
  anywhere.
- **Bookmarks** — star characters, games, lore events and secrets; saved filters live
  in `fnaf_prefs_v2` next to theme, volume and display preferences.
- **Per-page metadata** — every route sets its own title, description and Open Graph
  tags (`PageMeta`).
- **Code splitting** — routes are lazy-loaded behind a themed "connecting to camera"
  loading screen.
- **Error boundary** — a bad page shows a "System Malfunction" screen instead of a
  blank wiki.
- **Mobile navigation** — hamburger menu under 900 px, with the vault count on the
  Vault link at every size.
- **Accessibility** — visible focus rings, keyboard-operable hotspots, aria labels,
  `prefers-reduced-motion` support and a higher-contrast secondary text colour.
- **Modern visual system** — self-hosted Bebas Neue / Inter / JetBrains Mono, glass
  navigation, rounded cards and pills, gradient mesh background, and scroll-driven
  card reveals where the browser supports them. All fonts are embedded in the
  single-file build, so it still works offline.
- **Real wiki artwork** — the FNAF 1 office and camera feeds, game key art, film
  posters, book covers, character renders and franchise tiles all use locally stored
  artwork from the Fandom wiki. No hotlinked images, and the standalone build embeds
  every file.
- **Real jumpscares** — each character's jumpscare is the wiki gallery's actual
  animation (GIF → animated WebP) plus its real scream clip (`.ogg`/`.wav`), both
  bundled locally. Reduced-motion viewers get a `-still.webp` first frame, and the
  scream falls back to the synthesised profile when it can't play. Glamrock Freddy
  has no scream file on the wiki, so he keeps the procedural profile. Unmapped
  characters fall back to Freddy, Bonnie, Chica or Foxy.
- **Playables with memory** — all seven minigames persist best scores
  (`fnaf_mg_*` keys) and support arrow keys + on-screen d-pads.
- **Boot screen** — every fresh session opens on a Fazbear Entertainment terminal:
  Freddy face, scanlines, staged system checks (one of them red) and a load
  percentage that tracks the progress bar. Click anywhere or press any key to enter;
  reduced-motion visitors get a near-instant fade. When sound is muted, the boot
  screen shows a tip pointing at the speaker toggle so the audio is discoverable.
- **Field manuals** — each game page is a three-tab manual: night-shift walkthrough,
  step-by-step how-to-play tutorial, and an easter-egg hunt list with
  where-to-find instructions. All seven arcade minigames each carry a field guide
  (how to activate the original, how to beat this version, easter eggs).
- **Snappier page transitions** — every navigation replays a keyed entrance
  animation on the route stage: a fade/slide plus a scanline band that sweeps
  down the new page. Reduced-motion visitors get the fade without the sweep.
- **Room-tone audio** — every major page sets its own procedural ambience
  (`setAmbientScene` in `src/audio/sound.js`): a distinct hum plus randomized
  one-shot texture per scene — music-box plinks on FNAF 2, clock ticks on Secret of
  the Mimic, projector flutter in the media room, arcade blips on `/play`.
- **Service Record** — a stats dashboard with 25 achievement badges
  (`src/progress/`): every visit, file read, secret cracked and high score feeds
  a night-guard report card, a clearance rank (Unregistered Visitor → Golden
  Freddy) and bronze/silver/gold/platinum badges that pop a toast the moment they
  unlock. Persisted in `fnaf_progress_v1`; badges tied to secrets, scores,
  bookmarks and forum posts derive from their own stores.
- **Web editions arcade** — nine full-page cabinets framing complete third-party
  web builds: FNAF 1-4, FNAF World, Sister Location, Pizzeria Simulator and
  Ultimate Custom Night from irv77's `hd_fnaf` HTML5 ports, plus Dorukyum's
  FNAF-Web (recreation of Wendell Sousa's 2020 build) for the original game's
  Custom Night with 0-20 AI sliders. Every cabinet credits its port project and
  links back; the wiki ships no game assets of its own for them.
- **Newsroom, live** — polls Google News RSS for fresh FNAF headlines every ten
  minutes (browser-safe JSON proxy, visible-tab only); live items merge ahead of the
  build-time snapshot (`npm run news`) with a LIVE/updated-ago status pill, a manual
  refresh button and an honest offline fallback. Same desk as before: an editorial
  collect → draft → review checkbox flow for wiki contributions, site patch notes,
  and an embedded video grid with a lazy YouTube modal.
- **Forum stays local** — threads, replies and topics are stored only in your browser
  (`fnaf_forum_v1`), clearly labelled "LOCAL ONLY"; there is no backend and nothing
  is uploaded anywhere.
- **Community Wire** - live recent changes and article intros from the Fandom wiki,
  cached in `localStorage` for ten minutes with a shipped snapshot as the offline
  fallback. It auto-syncs every three minutes while the tab is visible and refreshes
  relative timestamps every 30 seconds. The homepage shows a three-item pulse from
  that snapshot. See below for the drafting agent.
- **Deploy-ready** — `netlify.toml` and `vercel.json` included.

## Deploying

The build output is plain static files in `dist/`.

- **Netlify:** connect the repo (or drag `dist/` into the dashboard). `netlify.toml`
  sets the build command and publish directory.
- **Vercel:** import the repo. `vercel.json` sets the same build output.
- **GitHub Pages:** run `npm run build` and publish `dist/`. `base: './'` in
  `vite.config.js` means it works from a project subfolder without extra config.

The site uses `HashRouter`, so URLs look like `/#/characters` and deep links work on
any static host without rewrite rules.

## Community Wire and the content agent

`/community` combines two layers:

1. **Live activity** — the browser calls the Fandom MediaWiki API directly
   (`action=query&list=recentchanges&origin=*`), then reads each changed article's
   lead paragraph to build a summary. Responses are cached in `localStorage` for ten
   minutes. If the API or network is unavailable, the page falls back to
   `src/data/community.json`.
2. **Editorial drafts** — `npm run agent` refreshes that snapshot and writes a
   markdown draft into `content-inbox/` for every brand-new wiki page it sees.

```bash
npm run agent                 # extractive summaries, drafts on
npm run agent -- --no-drafts  # snapshot only
npm run agent -- --no-ai      # ignore a configured AI key
npm run agent -- --limit=20   # how many recent pages to collect
```

The agent never edits site content. Drafts are explicitly marked **unreviewed** and
carry a verification checklist; a human decides whether anything gets published.
This is intentional — recent changes include vandalism, test pages, speculation and
fan-fiction presented as canon.

### Optional AI summaries

Set any OpenAI-compatible endpoint. Without a key, the agent summarises using the
article's own intro, so the feature still works:

```bash
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1   # or a local Ollama/LM Studio endpoint
AI_MODEL=gpt-4o-mini
```

If a summary comes from the model, the card is tagged **AI SUMMARY**. The model is
instructed not to invent details or present theories as canon, but that is not a
substitute for review.

### Automatic refresh on GitHub

`.github/workflows/community-agent.yml` runs every six hours (and on demand) and
commits `src/data/community.json` plus new drafts. Add `AI_API_KEY` as an Actions
secret if you want AI summaries; optionally set `AI_MODEL` / `AI_BASE_URL` as
repository variables. Because it commits with `[skip ci]`, it will not trigger a
second deployment loop.

> The Wire is read-only and links every item back to Fandom. If you reuse wiki text,
> follow the wiki's licence and attribution rules — the agent paraphrases the intro
> rather than copying articles, and drafts are meant to be rewritten, not pasted.


## The secrets engine

`src/secrets/SecretsProvider.jsx` is a global context that:

- listens for **typed codes** anywhere on the site (ignoring real form inputs),
- listens for the **Konami code**,
- exposes `discover(key)` for click, hover, hold and timed secrets,
- persists findings in `localStorage` under `fnaf_secrets_found`,
- renders the discovery toast, glitch overlay, phantom flash and reversed-audio whisper,
- prints a hint in the browser console for anyone who opens devtools.

Adding a secret is two steps: add an entry to the `SECRETS` registry (title, icon,
hint, discovery text), then call `discover("your-key")` from wherever it should fire.

<details>
<summary><strong>Spoilers — all 34 secrets</strong></summary>

**Typed codes:** `1987`, `1983`, `itsme`, `freddy`, `foxy`, `purple`, `henry`, `afton`,
`mimic`, `toreador`, `6am`, `springtrap`, `phone`, `fazbear`

**Sequences & clicks:** Konami code · tap the logo three times quickly · click the
red nose in the footer · the desk fan and the cupcake on a character page · poke the
home page title five times · poke the home page's static field seven times

**Holds & stares:** hold the footer nose for over a second · leave the cursor on a
character portrait for three seconds

**Exploration:** stay until the in-game clock reaches 6 AM · finish Shadow Bonnie's
cake run in the arcade · visit at 3 AM local time

**Clearance:** clock in at the staff terminal as a Guest · as an Administrator ·
as the Super Administrator · type `sudo` while wearing an admin badge

**Rare events:** a 1-in-100 glitch on arrival · random phantom flash · reversed audio ·
the Toreador March when the nav power dies

</details>

## Audio

Most sound is synthesised with the Web Audio API in `src/audio/sound.js`. The one
exception is the jumpscare screams: each character's real `.ogg`/`.wav` clip from the
wiki galleries lives in `public/sfx/` and plays first (see `sfxJumpscareClip`); if it
can't play (offline, muted, blocked codec) the synthesised scream profile fires
instead. Audio starts muted and unlocks
on the first interaction (the 🔇 speaker in
the top nav; the gear holds volume, ambience and effects). The boot screen shows a
tip when sound is muted.

Beyond the per-page ambience there is a **global UI layer**: hover ticks, clicks,
page-change whooshes, toggle flips, deny buzzes, keycard chimes and coin inserts —
all procedural, all deduplicated against component sounds.

Every character also has a **procedural jumpscare scream profile** keyed to their id,
so Foxy, Golden Freddy, the Puppet and the rest each sound like themselves.

The ambient layer is scene-based: `setAmbientScene(name)` gives each page its own
room tone — a base hum, filtered noise and randomized one-shot events (distant
thumps, music-box plinks, mechanical clicks, clock ticks). The site shell, the
arcade, the media room, the lore archive, the community desk and all eleven game
pages each have a scene; pages reset to the default "site" tone on unmount.
Scene changes retune the running drone in place with smooth parameter ramps
instead of tearing it down, and every start/stop passes through a gain envelope,
so navigation fades between room tones instead of clicking.

## Artwork and images

All art is local: no image on the site is hotlinked from the wiki.

- `public/characters/` holds the 20 character portraits used by the character pages,
  detail headers, jumpscares and camera figures. `scripts/fetch-character-images.ps1`
  re-downloads them from the FNAF Wiki. Every portrait still falls back to an emoji if
  a file is missing.
- `public/art/` holds the WebP assets: 11 game covers, 2 film posters, 6 book covers,
  8 FNAF 1 camera stills, the office and desk props, 4 minigame images, 10 video
  thumbnails, and 17 jumpscare clips converted from the wiki gallery GIFs to animated
  WebP — each with a `-still.webp` frame used for `prefers-reduced-motion` viewers.
- `public/sfx/` holds the 16 real jumpscare scream clips (`.ogg`/`.wav`) downloaded
  from the same galleries. Glamrock Freddy has no scream file, so his profile stays
  fully procedural.

`scripts/fetch-jumpscares.mjs` re-downloads and re-compresses the jumpscare clips and
re-fetches the screams (the wiki's CDN blocks hotlinking, so everything is bundled);
`scripts/fetch-news.mjs` regenerates `src/data/news.json` (news + video snapshot).

`scripts/fetch-jumpscares.mjs` re-downloads and re-compresses the jumpscare clips;
`scripts/fetch-news.mjs` regenerates `src/data/news.json` (news + video snapshot).

Fandom serves its original files as WebP even when the source filename ends in `.png`
or `.jpg`, so every file in `public/art/` is stored as `.webp`. Runtime paths go through
`src/lib/assets.js`: it prefers the `__FNAF_ART__` / `__FNAF_IMAGES__` maps that
`scripts/make-standalone.mjs` injects, then falls back to the normal `/art/` and
`/characters/` public paths. That keeps the same components working in the dev server,
the regular build and the single-file build.

## Project layout

```
src/
  assets/fonts/ self-hosted display, UI and mono fonts
  audio/        Web Audio sound engine (ambient scenes + UI palette + scares)
  auth/         AuthProvider — concept roles: guest / administrator / super
  components/   Layout, CharImage, PageMeta, CommandPalette, ErrorBoundary,
                ShaderBackdrop (raw WebGL CRT/VHS), minigames/, community/
  data/         characters, games, gameExtras (tutorials + easter eggs), lore,
                films (media), minigames, extraMinigames, home, dispatches,
                community snapshot
  lib/          shared Fandom API client + artwork resolver
  pages/        one file per route (incl. Login, Oversight)
  secrets/      SecretsProvider (codes, tracking, overlays)
  styles/       immersive.css (role looks, transitions), auth.css,
                breakroom.css, arcade-extra.css
scripts/        image fetcher, content agent, standalone builder
content-inbox/  unreviewed drafts produced by the agent
public/         character portraits and FNAF artwork
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (`dist/`) + standalone `FNAF-Wiki.html` |
| `npm run build:only` | Split production build in `dist/` only |
| `npm run build:single` | Single-bundle build in `dist-single/` |
| `npm run single` | Rebuild `FNAF-Wiki.html` from `dist-single/` |
| `npm run agent` | Refresh the Community Wire snapshot + review drafts |
| `npm run news` | Rebuild the newsroom snapshot (`src/data/news.json`) |
| `npm run jumpscares` | Re-download/compress the 17 jumpscare clips + stills |
| `npm run lint` | oxlint |
| `npm run preview` | Preview `dist/` |
