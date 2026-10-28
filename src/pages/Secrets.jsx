import { useState } from "react";
import { Link } from "react-router-dom";
import { minigames, secrets } from "../data/minigames.js";
import { useSecrets } from "../secrets/SecretsProvider.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function Secrets() {
  const [tab, setTab] = useState("minigames");
  const { count, total } = useSecrets();

  return (
    <div className="page">
      <PageMeta
        title="Secrets & Minigames"
        description="The hidden 8-bit minigames and buried easter eggs that tell the real FNAF story."
      />
      <h1 className="page-title">Secrets &amp; Minigames</h1>
      <p className="page-subtitle">
        The hidden content fans spent years digging for — the 8-bit minigames that
        tell the real story, and the easter eggs buried in the code.
      </p>

      {/* Vault progress banner */}
      <div className="card" style={{ borderLeft: "3px solid var(--accent)", marginBottom: "1.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="card-title" style={{ marginBottom: "0.2rem" }}>🗄 The Vault — Interactive Hunt</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--dim)", letterSpacing: 1 }}>
            {count} / {total} SECRETS FOUND · typed codes, hidden clicks, rare glitches
          </div>
        </div>
        <Link to="/vault" className="btn" style={{ fontSize: "0.72rem", padding: "0.55rem 1.3rem" }}>
          View All Secrets
        </Link>
      </div>

      <div className="filter-row">
        <button className={`pill ${tab === "minigames" ? "active" : ""}`} onClick={() => setTab("minigames")}>
          🕹 Story Minigames
        </button>
        <button className={`pill ${tab === "secrets" ? "active" : ""}`} onClick={() => setTab("secrets")}>
          🔍 Easter Eggs
        </button>
      </div>

      {tab === "minigames" ? (
        <div className="grid grid-2">
          {minigames.map((m) => (
            <div className="card" key={m.name} style={{ borderTop: "3px solid var(--accent)" }}>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--dim)", fontSize: "0.7rem", letterSpacing: 2 }}>
                {m.game}
              </div>
              <div className="card-title" style={{ marginTop: "0.3rem" }}>{m.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--cyan)", margin: "0.5rem 0", lineHeight: 1.6 }}>
                HOW TO FIND: {m.how}
              </div>
              <div className="card-text">{m.truth}</div>
              <div className="tags">
                <span className="tag tag-villain">
                  {"🩸".repeat(Math.min(m.tears, 5))} LORE WEIGHT {m.tears}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-2">
          {secrets.map((s) => (
            <div className="card" key={s.name} style={{ borderLeft: "3px solid var(--cyan)" }}>
              <div className="card-title">{s.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--dim)", fontSize: "0.7rem", letterSpacing: 2, marginBottom: "0.5rem" }}>
                {s.game}
              </div>
              <div className="card-text">{s.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: "2.5rem", borderLeft: "3px solid var(--danger)" }}>
        <div className="card-title" style={{ color: "var(--danger)" }}>⚠ The Golden Rule of FNAF Lore</div>
        <div className="card-text">
          Almost nothing in this franchise is stated outright. The minigames are how
          Scott Cawthon tells the real story — the gameplay is the surface, and the
          8-bit sequences are the truth underneath. If you want to understand FNAF,
          watch the minigames. That's where the answers live.
        </div>
      </div>
    </div>
  );
}
