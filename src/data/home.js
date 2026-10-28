// Rotating "Faz-Facts" (inspired by the Fandom wiki's Faz-Fact box)
export const fazFacts = [
  "Kellen Goff has voiced some variant of Freddy Fazbear more than twelve times across the franchise.",
  "The original FNAF was made in roughly six months by a single developer, Scott Cawthon.",
  "The name 'Springtrap' comes from the spring-lock suit mechanism that failed and killed Afton.",
  "Foxy's run animation is only a few frames long — but it terrified a generation.",
  "The Puppet's music box theme is 'My Grandfather's Clock', a real 1876 song.",
  "Golden Freddy's 'IT'S ME' poster is one of the most analysed images in indie horror.",
  "Freddy Fazbear's Pizza is a pastiche of real chains like Chuck E. Cheese's and ShowBiz Pizza Place.",
  "The Bite of '87 damaged a guard's frontal lobe — the victim survived, but was never the same.",
  "FNAF's first game was rejected by reviewers before it became a phenomenon. Scott almost quit.",
  "Ennard is a fusion of every Funtime animatronic — you can spot each one's mask in the design.",
  "Ballora's eyes are always closed, yet she 'sees' you by sound alone.",
  "The Fazbear Frights and Tales from the Pizzaplex books contain stories that never appeared in the games.",
  "Michael Afton's skin turns purple as his body decays — the same colour as the 'Purple Guy'.",
  "The Mega Pizzaplex's Princess Quest arcade games hold the key to Security Breach's true ending.",
  "Henry Emily's final speech in Pizzeria Simulator is widely considered the best writing in the series.",
  "The Mimic predates Freddy Fazbear's Pizza by decades — it was there first.",
];

// Official links (inspired by the Fandom wiki's Official Links box)
export const officialLinks = [
  { name: "Scott Cawthon's Website", url: "http://scottgames.com" },
  { name: "Steel Wool Studios", url: "https://www.steelwoolstudios.com" },
  { name: "Blumhouse (FNAF Movie)", url: "https://www.blumhouse.com" },
  { name: "FNAF Movie Site", url: "https://www.fivenightsatfreddys.movie" },
  { name: "FNAF Subreddit", url: "https://www.reddit.com/r/fivenightsatfreddys" },
  { name: "Clickteam (Ports)", url: "https://www.clickteam.com" },
];

// Franchise hub categories (inspired by the Fandom wiki's Franchise box)
import { art, characterArt } from "../lib/assets.js";

export const franchiseCategories = [
  { image: art("game-fnaf-1"), label: "Video Games", to: "/games", desc: "Every mainline entry" },
  { image: characterArt("freddy-fazbear"), label: "Characters", to: "/characters", desc: "The full roster" },
  { image: characterArt("springtrap"), label: "Lore", to: "/lore", desc: "The complete timeline" },
  { image: art("film-fnaf-movie"), label: "Films & Books", to: "/media", desc: "Outside the games" },
  { image: art("game-fnaf-3"), label: "Minigames", to: "/secrets", desc: "The hidden story" },
  { image: art("cam-1a"), label: "Web Editions", to: "/play", desc: "Full web builds of the games" },
  { image: art("office"), label: "Community", to: "/community", desc: "Live wiki activity" },
  { image: art("shadow-bonnie"), label: "The Vault", to: "/vault", desc: "Secrets & easter eggs" },
];
