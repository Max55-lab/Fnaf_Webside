// Third-party web editions for the arcade cabinets.
//
// Sources:
// - irv77/hd_fnaf: the complete Clickteam FNAF games 1-4, World, Sister
//   Location, Pizzeria Simulator and Ultimate Custom Night, compiled to
//   HTML5 and hosted on GitHub Pages.
// - Dorukyum/FNAF-Web: a React recreation of the original Five Nights at
//   Freddy's (fork of Wendell Sousa's 2020 project). Its menu includes the
//   Custom Night with 0-20 AI sliders, reachable via NEW GAME -> Custom Night.
//
// Fan works. Five Nights at Freddy's (c) Scott Cawthon / Steel Wool Studios.

const HD = "https://irv77.github.io/hd_fnaf";
const FNAF_WEB = "https://dorukyum.github.io/FNAF-Web/";

export const SOURCES = {
  hd_fnaf: {
    name: "hd_fnaf",
    url: "https://github.com/irv77/hd_fnaf",
    label: "irv77 · hd_fnaf (HTML5 ports)",
  },
  fnaf_web: {
    name: "FNAF-Web",
    url: "https://github.com/Dorukyum/FNAF-Web",
    label: "Dorukyum · FNAF-Web (recreation of Wendell Sousa's 2020 build)",
  },
};

export const webGames = [
  {
    slug: "fnaf-1",
    title: "FNAF 1 — Web Edition",
    meta: "Five Nights 1 + 4/20",
    art: "game-fnaf-1",
    accent: "#ff1744",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/1/`,
    description:
      "The complete original pizzeria, compiled for the browser. Doors, lights, cameras, power and five nights of Bonnie knocking on your wall.",
  },
  {
    slug: "fnaf-2",
    title: "FNAF 2 — Web Edition",
    meta: "No doors. Wristwatch or die",
    art: "game-fnaf-2",
    accent: "#ff9100",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/2/`,
    description:
      "The toy-era pizzeria with the music box, the mask and eleven animatronics. Wind the music box or the Puppet handles it for you.",
  },
  {
    slug: "fnaf-3",
    title: "FNAF 3 — Web Edition",
    meta: "One real threat",
    art: "game-fnaf-3",
    accent: "#00e5ff",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/3/`,
    description:
      "Fazbear's Fright, thirty years on. Reprogram the audio lures, reboot the systems and keep one very springy rabbit in the maze.",
  },
  {
    slug: "fnaf-4",
    title: "FNAF 4 — Web Edition",
    meta: "Listen at the doors",
    art: "game-fnaf-4",
    accent: "#e040fb",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/4/`,
    description:
      "No cameras, no power meter — just doors, a flashlight, a closet and nightmares with teeth. Headphones recommended, sanity optional.",
  },
  {
    slug: "custom-night",
    title: "Custom Night — FNAF Web",
    meta: "YOUR 20/20/20/20, your rules",
    art: "game-ucn",
    accent: "#ffd600",
    badge: "CUSTOM NIGHT",
    source: "fnaf_web",
    url: FNAF_WEB,
    description:
      "A faithful fan recreation of the original office. In its menu pick NEW GAME, then Custom Night, and set Freddy, Bonnie, Chica and Foxy to any level 0-20 yourself.",
  },
  {
    slug: "fnaf-world",
    title: "FNAF World — Web Edition",
    meta: "RV camping with Jumpscare mode",
    art: "fruity-maze-arcade",
    accent: "#76ff03",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/w/`,
    description:
      "The full RPG where the animatronics are the heroes. On display: Fruity Maze art — no dedicated World box art exists on the wiki shelf.",
  },
  {
    slug: "sister-location",
    title: "Sister Location — Web Edition",
    meta: "Below the pizzaplex",
    art: "game-sister-location",
    accent: "#f48fb1",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/sl/`,
    description:
      "Circus Baby's rental facility. Voice lines, crawlspaces and the scooping room's brief 12 AM shift as a very light-sensitive technician.",
  },
  {
    slug: "pizzeria-simulator",
    title: "Pizzeria Simulator — Web Edition",
    meta: "Buy the real franchises",
    art: "game-ffps",
    accent: "#ffd600",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/ps/`,
    description:
      "Run your own pizza joint: catalogue, contracts, and one animatronic you absolutely did not order. Then the Sunday paper does not mention it.",
  },
  {
    slug: "ucn",
    title: "Ultimate Custom Night — Web Edition",
    meta: "50 animatronics, 50/20 mode",
    art: "game-ucn",
    accent: "#ff1744",
    badge: "HTML5 PORT",
    source: "hd_fnaf",
    url: `${HD}/ucn/`,
    description:
      "The roster nightmare: set fifty animatronics per AI level and survive your own personal hell. The 50/20 mode is the series' final boss.",
  },
];
