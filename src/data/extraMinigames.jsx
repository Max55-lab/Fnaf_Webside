import FoxyDash from "../components/minigames/FoxyDash.jsx";
import MusicBox from "../components/minigames/MusicBox.jsx";
import PizzaToss from "../components/minigames/PizzaToss.jsx";
import GoldenStare from "../components/minigames/GoldenStare.jsx";
import "./../styles/arcade-extra.css";

/* Four extra machines for the Arcade, shaped exactly like Play's MINIGAMES
 * entries: spread them in with `[...MINIGAMES, ...EXTRA_MINIGAMES]`. */
export const EXTRA_MINIGAMES = [
  {
    id: "foxy-dash",
    title: "Foxy's Dock Dash",
    game: "FNAF 3",
    gameId: "fnaf-3",
    art: "jumpscare-foxy",
    accent: "#ff5722",
    label: "Runner · reflexes",
    description:
      "Foxy sprints down the dock through a three-lane barrage of barrels. Dodge with the arrow keys or A·D, grab coins for bonus distance — one hit and he has you.",
    Component: FoxyDash,
  },
  {
    id: "music-box",
    title: "Wind the Music Box",
    game: "FNAF 3",
    gameId: "fnaf-3",
    art: "jumpscare-the-puppet",
    accent: "#7c4dff",
    label: "Timing · survival",
    description:
      "Keep the Prize Corner melody alive: wind the box while the sweeping marker is inside the shifting green zone. Every wind quickens the tempo, and a dry box ends the run.",
    Component: MusicBox,
  },
  {
    id: "pizza-toss",
    title: "Pizza Toss",
    game: "FFPS",
    gameId: "ffps",
    art: "cupcake",
    accent: "#ff9100",
    label: "Accuracy · arcade",
    description:
      "Ten tosses, one cupcake target on the move, and a power meter that never sits still. Bullseye 50, ring 20, floor pizza 0 — clear 250 to finish the rush.",
    Component: PizzaToss,
  },
  {
    id: "golden-stare",
    title: "Golden Freddy Stare",
    game: "FNAF 4",
    gameId: "fnaf-4",
    art: "jumpscare-golden-freddy",
    accent: "#ffd600",
    label: "Reaction · nerves",
    description:
      "The room dims and a face flickers in with less and less warning. Look away within the shrinking window or it fills the screen. How long can the streak survive?",
    Component: GoldenStare,
  },
];
