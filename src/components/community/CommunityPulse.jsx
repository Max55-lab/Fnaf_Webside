import { useEffect, useMemo, useState } from "react";
import { characters, characterEmoji } from "../../data/characters.js";

const POLL_KEY = "fnaf_poll_era_v1";
const TIER_KEY = "fnaf_tier_list_v1";
const TIERS = ["S", "A", "B", "C"];

const POLL_OPTIONS = [
  { id: "classic", label: "Classic era", note: "FNAF 1–4", seed: 46 },
  { id: "scifi", label: "Sci-fi era", note: "Sister Location–FFPS", seed: 28 },
  { id: "vr", label: "The Pizzaplex", note: "Help Wanted–Ruin", seed: 39 },
  { id: "films", label: "Film universe", note: "Blumhouse", seed: 17 },
];

const TIER_ROSTER = [
  "freddy-fazbear",
  "bonnie",
  "chica",
  "foxy",
  "the-puppet",
  "springtrap",
  "circus-baby",
  "glamrock-freddy",
  "roxanne-wolf",
  "the-mimic",
];

function readPoll() {
  const fallback = {
    choice: null,
    votes: Object.fromEntries(POLL_OPTIONS.map((option) => [option.id, option.seed])),
  };
  try {
    const stored = JSON.parse(localStorage.getItem(POLL_KEY) || "null");
    if (!stored || typeof stored !== "object") return fallback;
    return {
      choice: typeof stored.choice === "string" ? stored.choice : null,
      votes: { ...fallback.votes, ...(stored.votes || {}) },
    };
  } catch {
    return fallback;
  }
}

function readTiers() {
  try {
    const stored = JSON.parse(localStorage.getItem(TIER_KEY) || "null");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode can refuse storage. The widget still works for this visit.
  }
}

export default function CommunityPulse() {
  const [poll, setPoll] = useState(readPoll);
  const [tiers, setTiers] = useState(readTiers);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    persist(POLL_KEY, poll);
  }, [poll]);

  useEffect(() => {
    persist(TIER_KEY, tiers);
  }, [tiers]);

  const totalVotes = useMemo(
    () => Object.values(poll.votes).reduce((sum, value) => sum + Number(value || 0), 0),
    [poll.votes]
  );

  const roster = useMemo(
    () =>
      TIER_ROSTER.map((id) => characters.find((character) => character.id === id)).filter(
        Boolean
      ),
    []
  );

  const tierCounts = useMemo(
    () =>
      TIERS.reduce(
        (counts, tier) => ({
          ...counts,
          [tier]: roster.filter((character) => tiers[character.id] === tier).length,
        }),
        {}
      ),
    [roster, tiers]
  );

  const vote = (option) => {
    if (poll.choice) return;
    setPoll((current) => ({
      choice: option.id,
      votes: {
        ...current.votes,
        [option.id]: Number(current.votes[option.id] || 0) + 1,
      },
    }));
    setAnnouncement(`Vote recorded for ${option.label}.`);
  };

  const assign = (character, tier) => {
    setTiers((current) => {
      const next = { ...current };
      if (next[character.id] === tier) delete next[character.id];
      else next[character.id] = tier;
      return next;
    });
    setAnnouncement(
      `${character.name} ${tiers[character.id] === tier ? "removed from" : "placed in"} tier ${tier}.`
    );
  };

  return (
    <section className="pulse-grid" aria-labelledby="pulse-title">
      <div className="pulse-intro">
        <span className="pulse-kicker">Community pulse</span>
        <h3 id="pulse-title">Vote with your flashlight</h3>
        <p>
          These widgets are saved locally in this browser. They are a community conversation
          starter, not a verified global poll.
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div className="card pulse-card">
        <div className="pulse-card-head">
          <h4>Which era is the scariest?</h4>
          <span>{totalVotes} local votes</span>
        </div>
        <fieldset className="pulse-options" disabled={Boolean(poll.choice)}>
          <legend className="sr-only">Choose the scariest FNAF era</legend>
          {POLL_OPTIONS.map((option) => {
            const votes = Number(poll.votes[option.id] || 0);
            const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
            const selected = poll.choice === option.id;
            return (
              <label
                className={`pulse-option ${selected ? "is-selected" : ""}`}
                key={option.id}
              >
                <input
                  type="radio"
                  name="scariest-era"
                  value={option.id}
                  checked={selected}
                  onChange={() => vote(option)}
                />
                <span className="pulse-option-main">
                  <span>
                    {option.label} <small>{option.note}</small>
                  </span>
                  <b>{pct}%</b>
                </span>
                <span className="pulse-bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
              </label>
            );
          })}
        </fieldset>
        <p className="pulse-note">
          {poll.choice
            ? "Your vote is locked in this browser. Debate responsibly."
            : "Pick one. There is no wrong answer, only worse nightmares."}
        </p>
      </div>

      <div className="card pulse-card pulse-tier-card">
        <div className="pulse-card-head">
          <h4>Build your animatronic tier list</h4>
          <span>
            {Object.keys(tiers).length}/{roster.length} ranked
          </span>
        </div>
        <div className="pulse-tier-legend" aria-hidden="true">
          {TIERS.map((tier) => (
            <span key={tier} className={`tier-badge tier-${tier.toLowerCase()}`}>
              {tier}
              <b>{tierCounts[tier]}</b>
            </span>
          ))}
        </div>
        <div className="pulse-tier-list">
          {roster.map((character) => (
            <div className="pulse-tier-row" key={character.id}>
              <span className="pulse-tier-name">
                <span aria-hidden="true">{characterEmoji(character.name)}</span>
                {character.name}
              </span>
              <span className="pulse-tier-actions" role="group" aria-label={`Tier for ${character.name}`}>
                {TIERS.map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    className={`tier-pick tier-${tier.toLowerCase()} ${
                      tiers[character.id] === tier ? "is-active" : ""
                    }`}
                    aria-pressed={tiers[character.id] === tier}
                    aria-label={`Place ${character.name} in tier ${tier}`}
                    onClick={() => assign(character, tier)}
                  >
                    {tier}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="pulse-clear"
          onClick={() => {
            setTiers({});
            setAnnouncement("Tier list cleared.");
          }}
          disabled={!Object.keys(tiers).length}
        >
          Clear tier list
        </button>
      </div>
    </section>
  );
}
