import { useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PageMeta from "../components/PageMeta.jsx";
import { webGames, SOURCES } from "../data/webGames.js";

/* Full-viewport arcade cabinet for a third-party web edition. */
export default function WebGame() {
  const { slug } = useParams();
  const game = webGames.find((g) => g.slug === slug);
  const wrapRef = useRef(null);

  if (!game) return <Navigate to="/play" replace />;

  const source = SOURCES[game.source];
  const sourceName = game.source === "hd_fnaf" ? "hd_fnaf · irv77" : "FNAF-Web · Dorukyum";

  const goFullscreen = () => {
    const target = wrapRef.current;
    if (target?.requestFullscreen) target.requestFullscreen().catch(() => {});
  };

  return (
    <div className="page webgame-page">
      <PageMeta
        title={game.title}
        description={`Play ${game.title} in the browser via the ${sourceName} web port. Third-party fan build — links back to the original project.`}
        noindex
      />

      <div className="webgame-topbar">
        <div className="webgame-topbar-left">
          <Link to="/play" className="btn webgame-back">
            ← Back to the arcade
          </Link>
          <span className="webgame-kicker">
            WEB CABINET · {sourceName.toUpperCase()}
          </span>
        </div>
        <div className="webgame-topbar-right">
          <button type="button" className="btn" onClick={goFullscreen}>
            ⛶ FULLSCREEN
          </button>
          <a
            className="btn"
            href={game.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            POP OUT ↗
          </a>
        </div>
      </div>

      <div className="webgame-frame-wrap" ref={wrapRef}>
        <iframe
          className="webgame-frame"
          src={game.url}
          title={game.title}
          allow="fullscreen; autoplay"
        />
      </div>

      <div className="webgame-note">
        <div className="webgame-note-title">{game.title}</div>
        <p>{game.description}</p>
        <ul className="webgame-note-list">
          <li>
            The cabinet streams its build from GitHub Pages, so it needs an internet
            connection. Everything else on this wiki stays local.
          </li>
          {game.source === "hd_fnaf" ? (
            <li>
              Cabinet shortcut: press <strong>-</strong> + <strong>=</strong> together for
              fullscreen. Saves persist in that port's own storage.
            </li>
          ) : (
            <li>
              Custom Night lives in the app's own menu: NEW GAME, then Custom Night — set
              Freddy, Bonnie, Chica and Foxy anywhere from 0 to 20.
            </li>
          )}
        </ul>
        <p className="webgame-source-line">
          Port by{" "}
          <a href={source.url} target="_blank" rel="noreferrer noopener">
            {source.label}
          </a>
          . Five Nights at Freddy's © Scott Cawthon / Steel Wool Studios — unofficial fan
          work, framed here with credit and a direct link back.
        </p>
      </div>
    </div>
  );
}
