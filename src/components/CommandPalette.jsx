import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { characters, characterEmoji } from "../data/characters.js";
import { games } from "../data/games.js";
import { timeline } from "../data/lore.js";
import { films, books } from "../data/films.js";
import { guides } from "../data/guides.js";
import { secrets, minigames } from "../data/minigames.js";
import newsData from "../data/news.json";
import { loadThreads } from "../lib/forum.js";

const PAGES = [
  { label: "Home", to: "/", hint: "Front page" },
  { label: "Characters", to: "/characters", hint: "Full animatronic roster" },
  { label: "Games", to: "/games", hint: "Every mainline entry" },
  { label: "The Arcade", to: "/play", hint: "Minigames, tutorials and web editions" },
  { label: "Lore Timeline", to: "/lore", hint: "Games, novels and film continuities" },
  { label: "Films & Books", to: "/media", hint: "The non-game canon" },
  { label: "Newsroom", to: "/community?tab=news", hint: "Headlines and creator videos" },
  { label: "Community Forum", to: "/community?tab=forum", hint: "Local threads, polls and tier lists" },
  { label: "Break Room Chat", to: "/community?tab=chat", hint: "Live shift chat between open tabs" },
  { label: "Wiki Wire", to: "/community?tab=wire", hint: "Live Fandom activity" },
  { label: "Staff Terminal", to: "/login", hint: "Concept login — Guest, Admin, Oversight" },
  { label: "Oversight Console", to: "/admin", hint: "Administrator clearance required" },
  { label: "Secrets & Minigames", to: "/secrets", hint: "Hidden story content" },
  { label: "The Vault", to: "/vault", hint: "Secrets and saved items" },
  { label: "Service Record", to: "/achievements", hint: "Badges and night-shift stats" },
];

/**
 * Ctrl/Cmd+K global search. Indexes every major content type: characters,
 * games, guides, news, films, books, lore, secrets, playable minigames and
 * browser-local forum threads.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [forumThreads, setForumThreads] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const paletteRef = useRef(null);
  const previousFocus = useRef(null);
  const navigate = useNavigate();

  /* Refresh local forum results whenever the palette opens. */
  useEffect(() => {
    if (open) setForumThreads(loadThreads());
  }, [open]);

  const index = useMemo(() => {
    const items = [];

    for (const character of characters) {
      items.push({
        kind: "Character",
        label: character.name,
        sub: `${character.alias} — ${character.game}`,
        to: `/characters/${character.id}`,
        icon: characterEmoji(character.name),
        keys: `${character.name} ${character.alias} ${character.game} ${character.tags.join(" ")} ${character.bio}`,
      });
    }

    for (const game of games) {
      items.push({
        kind: "Game",
        label: game.title,
        sub: `${game.short} · ${game.year} · ${game.setting}`,
        to: `/games/${game.id}`,
        icon: "🎮",
        keys: `${game.title} ${game.short} ${game.year} ${game.setting} ${game.tagline} ${game.description}`,
      });
    }

    for (const [gameId, guide] of Object.entries(guides)) {
      const game = games.find((entry) => entry.id === gameId);
      items.push({
        kind: "Guide",
        label: `${game?.short || gameId} walkthrough`,
        sub: `${guide.difficulty} · ${guide.length}`,
        to: `/games/${gameId}`,
        icon: "🗺",
        keys: `${game?.title || ""} ${guide.overview} ${guide.quickStart.join(" ")} ${guide.walkthrough
          .map((stage) => `${stage.title} ${stage.steps.join(" ")}`)
          .join(" ")} ${guide.proTips.join(" ")}`,
      });
    }

    for (const era of timeline) {
      for (const event of era.events) {
        items.push({
          kind: "Lore",
          label: event.title,
          sub: `${era.era} · ${era.year}`,
          to: "/lore",
          icon: "📜",
          keys: `${event.title} ${event.text} ${event.source} ${era.era} ${era.year}`,
        });
      }
    }

    for (const film of films) {
      items.push({
        kind: "Film",
        label: film.title,
        sub: `${film.year} · ${film.studio}`,
        to: "/media",
        icon: "🎬",
        keys: `${film.title} ${film.tagline} ${film.summary} ${film.detail} ${film.notes?.join(" ")}`,
      });
    }

    for (const book of books) {
      items.push({
        kind: "Book",
        label: book.title,
        sub: `${book.series} · ${book.year}`,
        to: "/media",
        icon: "📚",
        keys: `${book.title} ${book.series} ${book.summary} ${book.detail}`,
      });
    }

    for (const item of newsData.items || []) {
      items.push({
        kind: item.kind === "video" ? "Video" : "News",
        label: item.title,
        sub: `${item.source} · ${item.tag}`,
        to: item.url,
        icon: item.kind === "video" ? "▶" : "📰",
        external: true,
        keys: `${item.title} ${item.summary} ${item.source} ${item.tag}`,
      });
    }

    for (const secret of secrets) {
      items.push({
        kind: "Secret",
        label: secret.name,
        sub: secret.game,
        to: "/secrets",
        icon: "🔍",
        keys: `${secret.name} ${secret.game} ${secret.detail}`,
      });
    }

    for (const minigame of minigames) {
      items.push({
        kind: "Lore",
        label: minigame.name,
        sub: `${minigame.game} · story minigame`,
        to: "/secrets",
        icon: "🕹",
        keys: `${minigame.name} ${minigame.game} ${minigame.how} ${minigame.truth}`,
      });
    }

    items.push({
      kind: "Play",
      label: "Plushtrap's Flashlight",
      sub: "FNAF 4 · playable minigame",
      to: "/play?mg=plushtrap",
      icon: "🔦",
      keys: "plushtrap flashlight fnaf 4 play minigame reaction",
    });
    items.push({
      kind: "Play",
      label: "Shadow Bonnie's Cake Run",
      sub: "FNAF 3 · playable minigame",
      to: "/play?mg=shadow-bonnie",
      icon: "🍰",
      keys: "shadow bonnie cake run fnaf 3 play minigame maze",
    });
    items.push({
      kind: "Play",
      label: "Fruity Maze",
      sub: "FFPS · playable arcade minigame",
      to: "/play?mg=fruity-maze",
      icon: "🍒",
      keys: "fruity maze ffps pizza simulator arcade play minigame",
    });

    for (const thread of forumThreads) {
      items.push({
        kind: "Thread",
        label: thread.title,
        sub: `${thread.category} · ${thread.author} · ${thread.replies.length} replies`,
        to: "/community?tab=forum",
        icon: "💬",
        keys: `${thread.title} ${thread.body} ${thread.author} ${thread.category} ${thread.replies
          .map((reply) => reply.body)
          .join(" ")}`,
      });
    }

    for (const page of PAGES) {
      items.push({
        kind: "Page",
        label: page.label,
        sub: page.hint,
        to: page.to,
        icon: "⬡",
        keys: `${page.label} ${page.hint}`,
      });
    }

    return items;
  }, [forumThreads]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      return [
        ...index.filter((item) => item.kind === "Page"),
      ].slice(0, 9);
    }
    const scored = [];
    for (const item of index) {
      const haystack = item.keys.toLowerCase();
      const at = haystack.indexOf(needle);
      if (at === -1) continue;
      const starts = item.label.toLowerCase().startsWith(needle) ? 0 : 1;
      scored.push({ item, score: starts * 1000 + at });
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 30).map((entry) => entry.item);
  }, [q, index]);

  const onChange = (event) => {
    setQ(event.target.value);
    setActive(0);
  };

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActive(0);
  }, []);

  const go = useCallback(
    (item) => {
      if (!item) return;
      close();
      if (item.external) {
        const opened = window.open(item.to, "_blank", "noopener,noreferrer");
        if (!opened) window.location.href = item.to;
        return;
      }
      navigate(item.to);
    },
    [close, navigate]
  );

  /* Global shortcuts */
  useEffect(() => {
    const onKey = (event) => {
      const isK = event.key.toLowerCase() === "k";
      if ((event.ctrlKey || event.metaKey) && isK) {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
        return;
      }
      if (!open) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((value) => Math.min(value + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((value) => Math.max(value - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        go(results[active]);
      } else if (event.key === "Tab") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, go, close]);

  /* Open from the nav button. */
  useEffect(() => {
    const opener = () => setOpen(true);
    window.addEventListener("fnaf:command", opener);
    return () => window.removeEventListener("fnaf:command", opener);
  }, []);

  /* Focus, body lock, and focus restoration. */
  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo?.(0, 0);
  }, [open]);

  useEffect(() => {
    const element = listRef.current?.querySelector(`[data-idx="${active}"]`);
    element?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onMouseDown={close}>
      <div
        className="palette"
        ref={paletteRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="palette-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="palette-title" className="sr-only">
          Search all wiki content
        </h2>
        <div className="palette-head">
          <span className="palette-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Search characters, games, guides, news, threads…"
            value={q}
            onChange={onChange}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-autocomplete="list"
            aria-activedescendant={results[active] ? `palette-result-${active}` : undefined}
            aria-label="Search all wiki content"
          />
          <kbd className="palette-kbd">ESC</kbd>
        </div>

        <div className="palette-list" ref={listRef} role="listbox" id="palette-results">
          {results.length === 0 && (
            <div className="palette-empty">
              No record of “{q}”. Fazbear Entertainment has removed it.
            </div>
          )}
          {results.map((item, i) => (
            <button
              type="button"
              key={`${item.kind}-${item.label}-${i}`}
              id={`palette-result-${i}`}
              data-idx={i}
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              className={`palette-row ${i === active ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
            >
              <span className="palette-row-icon" aria-hidden="true">{item.icon}</span>
              <span className="palette-row-main">
                <span className="palette-row-label">{item.label}</span>
                <span className="palette-row-sub">{item.sub}</span>
              </span>
              <span className="palette-row-kind">
                {item.kind}
                {item.external ? " ↗" : ""}
              </span>
            </button>
          ))}
        </div>

        <div className="palette-foot">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>esc to close</span>
          <span className="palette-count">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
