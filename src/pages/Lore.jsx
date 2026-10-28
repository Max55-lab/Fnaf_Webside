import { useEffect, useMemo, useRef, useState } from "react";
import { keyConcepts, loreLayers, deepDives } from "../data/lore.js";
import { setAmbientScene } from "../audio/sound.js";
import PageMeta from "../components/PageMeta.jsx";
import Spoiler from "../components/Spoiler.jsx";

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const LORE_SCHEMA = {
  "@type": "CollectionPage",
  name: "FNAF Lore — Three Timelines",
  description:
    "An interactive, multi-layered Five Nights at Freddy's timeline covering the games, the novels and the Blumhouse films as separate continuities.",
  about: [
    "Five Nights at Freddy's",
    "FNAF lore",
    "FNAF timeline",
    "FNAF novels",
    "FNAF films",
  ],
  isPartOf: { "@type": "WebSite", name: "FNAF Wiki" },
};

const SOURCE_LINKS = {
  games: {
    label: "FNAF Wiki — game timeline",
    href: "https://freddy-fazbears-pizza.fandom.com/wiki/Timeline",
  },
  novels: {
    label: "FNAF Wiki — Novel Trilogy",
    href: "https://freddy-fazbears-pizza.fandom.com/wiki/Five_Nights_at_Freddy%27s:_The_Silver_Eyes",
  },
  films: {
    label: "FNAF Wiki — film series",
    href: "https://freddy-fazbears-pizza.fandom.com/wiki/Five_Nights_at_Freddy%27s_(film)",
  },
};

export default function Lore() {
  const [tab, setTab] = useState("timeline");
  const [layerId, setLayerId] = useState("games");
  const [era, setEra] = useState("all");
  const layerTabs = useRef([]);

  /* The archive gets a quiet reading-room hum. */
  useEffect(() => {
    setAmbientScene("lore");
    return () => setAmbientScene("site");
  }, []);

  const layer = loreLayers.find((item) => item.id === layerId) || loreLayers[0];
  const source = SOURCE_LINKS[layer.id];
  const eras = useMemo(() => ["all", ...layer.timeline.map((block) => block.era)], [layer]);
  const shown = era === "all" ? layer.timeline : layer.timeline.filter((block) => block.era === era);
  const eventCount = layer.timeline.reduce((sum, block) => sum + block.events.length, 0);

  const chooseLayer = (id) => {
    setLayerId(id);
    setEra("all");
    setTab("timeline");
  };

  const onLayerKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % loreLayers.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + loreLayers.length) % loreLayers.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = loreLayers.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = loreLayers[nextIndex];
    chooseLayer(next.id);
    requestAnimationFrame(() => layerTabs.current[nextIndex]?.focus());
  };

  const scrollToEra = (eraName) => {
    document.getElementById(`era-${layer.id}-${slug(eraName)}`)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="page lore-page">
      <PageMeta
        title="Lore"
        description="The complete Five Nights at Freddy's lore — an interactive timeline across three continuities: the games, the novels and the Blumhouse films, with collapsible spoilers."
        keywords="FNAF lore, FNAF timeline, FNAF books timeline, FNAF movie lore, William Afton, Mimic"
        schema={LORE_SCHEMA}
      />

      <header className="lore-hero">
        <div>
          <span className="hub-kicker">Fazbear Entertainment · recovered archive</span>
          <h1 className="page-title">The Lore</h1>
          <p className="page-subtitle">
            One franchise, three continuities. The games, the novels and the films borrow
            from each other constantly — but they do not tell the same story. Pick a layer,
            then follow it from the first tragedy to the last locked door.
          </p>
        </div>
        <div className="lore-hero-count" aria-hidden="true">
          <b>{eventCount}</b>
          <span>events in this layer</span>
          <small>{layer.canon}</small>
        </div>
      </header>

      <div className="lore-tabs" role="tablist" aria-label="Lore views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "timeline"}
          className={`pill ${tab === "timeline" ? "active" : ""}`}
          onClick={() => setTab("timeline")}
        >
          📜 Timeline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "concepts"}
          className={`pill ${tab === "concepts" ? "active" : ""}`}
          onClick={() => setTab("concepts")}
        >
          🧬 Key concepts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "dives"}
          className={`pill ${tab === "dives" ? "active" : ""}`}
          onClick={() => setTab("dives")}
        >
          🔍 Deep dives
        </button>
      </div>

      {tab === "timeline" && (
        <>
          <div
            className="lore-layer-tabs"
            role="tablist"
            aria-label="Choose a continuity"
          >
            {loreLayers.map((item, index) => (
              <button
                ref={(node) => {
                  layerTabs.current[index] = node;
                }}
                key={item.id}
                type="button"
                role="tab"
                id={`lore-layer-${item.id}`}
                aria-selected={layer.id === item.id}
                aria-controls="lore-layer-panel"
                tabIndex={layer.id === item.id ? 0 : -1}
                className={`lore-layer-tab ${layer.id === item.id ? "is-active" : ""}`}
                style={{ "--layer-accent": item.accent }}
                onClick={() => chooseLayer(item.id)}
                onKeyDown={(event) => onLayerKeyDown(event, index)}
              >
                <span className="lore-layer-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.canon}</small>
                </span>
              </button>
            ))}
          </div>

          <div
            className="lore-layer-intro"
            id="lore-layer-panel"
            role="tabpanel"
            aria-labelledby={`lore-layer-${layer.id}`}
            style={{ "--layer-accent": layer.accent }}
          >
            <div>
              <span className="hub-kicker">Continuity layer</span>
              <h2>{layer.label} continuity</h2>
              <p>{layer.blurb}</p>
            </div>
            <div className="lore-layer-stats">
              <span>
                <b>{layer.timeline.length}</b> eras
              </span>
              <span>
                <b>{eventCount}</b> events
              </span>
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label} ↗
              </a>
            </div>
          </div>

          <div className="filter-row lore-era-filter" role="group" aria-label="Filter timeline by era">
            {eras.map((name) => (
              <button
                key={name}
                type="button"
                className={`pill ${era === name ? "active" : ""}`}
                onClick={() => setEra(name)}
                aria-pressed={era === name}
              >
                {name === "all" ? "All eras" : name}
              </button>
            ))}
          </div>

          {era === "all" && shown.length > 1 && (
            <nav className="lore-era-nav" aria-label="Jump to an era">
              <span>Jump to</span>
              {shown.map((block) => (
                <button key={block.era} type="button" onClick={() => scrollToEra(block.era)}>
                  {block.era}
                  <small>{block.year}</small>
                </button>
              ))}
            </nav>
          )}

          <div className="timeline lore-timeline" style={{ "--layer-accent": layer.accent }}>
            {shown.map((block, blockIndex) => (
              <section
                className="era-block lore-era-block"
                key={`${layer.id}-${block.era}`}
                id={`era-${layer.id}-${slug(block.era)}`}
                style={{ "--era-color": block.color }}
              >
                <div className="era-title">{block.era}</div>
                <div className="era-year">{block.year}</div>
                <span className="lore-era-count">
                  {block.events.length} {block.events.length === 1 ? "entry" : "entries"}
                </span>
                {block.events.map((event, eventIndex) => (
                  <article className="event-card lore-event-card" key={event.title}>
                    <span className="lore-event-index" aria-hidden="true">
                      {String(blockIndex + 1).padStart(2, "0")}.
                      {String(eventIndex + 1).padStart(2, "0")}
                    </span>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-text">{event.text}</p>
                    {event.spoiler && (
                      <Spoiler label="Reveal the spoiler detail">
                        {event.spoiler}
                      </Spoiler>
                    )}
                    <span className="event-source">{event.source}</span>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </>
      )}

      {tab === "concepts" && (
        <>
          <div className="card concepts-intro">
            <span className="hub-kicker">The rules behind the ghosts</span>
            <h2>How the haunting works</h2>
            <p>
              Remnant, agony and memory are the vocabulary fans use to explain why metal keeps
              remembering. These are interpretations drawn from across the franchise, not a
              single official rulebook.
            </p>
          </div>
          <div className="grid grid-2">
            {keyConcepts.map((concept, index) => (
              <article className="card concept-card" key={concept.name}>
                <span className="concept-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="card-title">{concept.name}</h3>
                <p className="card-text">{concept.description}</p>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === "dives" && (
        <>
          <div className="card concepts-intro">
            <span className="hub-kicker">Long reads</span>
            <h2>Deep dives</h2>
            <p>
              Six long-form explainers for the questions the timeline can&apos;t answer on its
              own — the incident at the center of it all, the bites, the night guard, the
              physics of possession, the Mimic&apos;s full history, and why every night ends
              at 6 AM.
            </p>
          </div>
          <div className="deep-grid">
            {deepDives.map((dive, index) => (
              <article className="card deep-card" key={dive.id}>
                <span className="deep-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="hub-kicker">{dive.tags.join(" · ")}</span>
                <h3 className="card-title">{dive.title}</h3>
                <p className="deep-summary">{dive.summary}</p>
                <details className="deep-more">
                  <summary>Read the full dive →</summary>
                  <div className="deep-body">
                    {dive.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="lore-spoiler-note">
        <span className="lore-spoiler-icon" aria-hidden="true">
          ⚠
        </span>
        <div>
          <strong>Spoilers are tagged, not hidden forever.</strong>
          <p>
            FNAF lore is deliberately ambiguous. Timeline order, possession rules and even
            character identities are still debated. Entries reflect the most widely accepted
            reading — if your theory differs, you are probably not wrong. That is half the fun.
          </p>
        </div>
      </div>
    </div>
  );
}
