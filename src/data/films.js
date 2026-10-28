// Films and books — the parts of the franchise that aren't games.
// Posters and covers come from the FNAF Fandom wiki (public/art/).
import { art } from "../lib/assets.js";

const mediaArt = (kind, id) => art(`${kind}-${id}`);

const filmData = [
  {
    id: "fnaf-movie",
    title: "Five Nights at Freddy's",
    year: 2023,
    studio: "Blumhouse Productions · Universal Pictures",
    director: "Emma Tammi",
    tagline: "Can you survive five nights?",
    accent: "#ffd600",
    release: "October 27, 2023",
    runtime: "1h 49m",
    boxOffice:
      "≈ $122M worldwide on a ~$20M budget — Blumhouse's biggest opening weekend at the time and the highest-grossing horror film of 2023.",
    cast: [
      "Josh Hutcherson — Mike Schmidt",
      "Elizabeth Lail — Vanessa Shelly",
      "Piper Rubio — Abby Schmidt",
      "Matthew Lillard — Steve Raglan / William Afton",
      "Katrina Bowden — Aunt Jane",
      "Jim Henson's Creature Shop — the animatronics",
    ],
    reception:
      "Critics split: fans called it a faithful, Easter-egg-dense adaptation, reviewers found it slow. Audiences settled the argument — it became a cultural event and the defining horror hit of its year.",
    summary:
      "A down-on-his-luck security guard takes a night job at the abandoned Freddy Fazbear's Pizza and discovers the animatronics are not the only thing that stayed behind.",
    detail:
      "The film reworks the game's premise into a family tragedy: Mike Schmidt (Josh Hutcherson) takes the night shift while caring for his younger sister Abby, and the animatronics — built from the missing children's memories — treat Abby as a friend rather than a threat. Critics split on it; audiences didn't. It became Blumhouse's biggest opening weekend and the highest-grossing horror film of 2023.",
    trivia: [
      "Scott Cawthon co-wrote and produced",
      "The animatronics were built practically by Jim Henson's Creature Shop",
      "MatPat, CoryxKenshin and other FNAF creators have cameos",
      "Released October 27 — a date the fandom had speculated about for months",
      "The film's version of William Afton hides in plain sight as 'Steve Raglan', the career counselor",
    ],
  },
  {
    id: "fnaf-movie-2",
    title: "Five Nights at Freddy's 2",
    year: 2025,
    studio: "Blumhouse Productions · Universal Pictures",
    director: "Emma Tammi",
    tagline: "Anyone can survive five nights. This time, there will be no second chances.",
    accent: "#ff1744",
    release: "December 2025",
    reception:
      "Positioned as a darker, larger-scale follow-up rather than a repeat of the first film's formula — more animatronics, more of the Afton family, and a much closer look at the lore fans had been waiting for.",
    summary:
      "The sequel widens the story beyond Freddy's, pulling in the toy animatronics, the Bite of '87 and the ruins of the original pizzeria.",
    detail:
      "Following the first film's ending, the second entry leans further into the game lore fans had been waiting for: the Grand Reopening, the Toy animatronics, and a much closer look at the Afton family. It was positioned as a darker, larger-scale follow-up rather than a repeat of the first film's formula.",
    trivia: [
      "Released December 2025",
      "Expands the roster to the FNAF 2 cast — Toy Freddy, Toy Bonnie, Toy Chica and Mangle",
      "Continues the film continuity, not the game timeline",
      "Brings the shadow of the Bite of '87 into the films for the first time",
    ],
  },
];

export const films = filmData.map((film) => ({
  ...film,
  image: mediaArt("film", film.id),
}));

const bookData = [
  {
    id: "silver-eyes",
    title: "The Silver Eyes",
    year: 2015,
    series: "Novel Trilogy · Book 1",
    author: "Scott Cawthon & Kira Breed-Wrisley",
    accent: "#00e5ff",
    highlights: [
      "Introduces Charlie Emily and the legacy of Henry's inventions",
      "Its own continuity — separate from the games, with its own rules",
      "The first novel to dive into the science behind the hauntings",
    ],
    summary:
      "Ten years after the murders, Charlie returns to her hometown and the boarded-up pizzeria where her friends died.",
    detail:
      "The first FNAF novel establishes a separate canon with its own rules — most notably that the animatronics are haunted in a very physical, deliberate way. It introduced Charlie as a protagonist and reframed the Freddy's tragedy around a group of childhood friends.",
    notes: [
      "First published 2015 — the start of the novel trilogy",
      "Co-written with Kira Breed-Wrisley",
      "The book that made the novels a parallel continuity",
    ],
  },
  {
    id: "twisted-ones",
    title: "The Twisted Ones",
    year: 2017,
    series: "Novel Trilogy · Book 2",
    author: "Scott Cawthon & Kira Breed-Wrisley",
    accent: "#ff9100",
    highlights: [
      "Body horror: the Twisted animatronics use sound-based illusions",
      "Deepens the technology behind the hauntings",
      "Charlie's fight moves out of the pizzeria and into the woods",
    ],
    summary:
      "Charlie is drawn back to the mystery when twisted, sound-based animatronics begin appearing in the woods.",
    detail:
      "The middle chapter pushes the horror into body horror: the 'Twisted' animatronics use auditory illusions to disorient their victims. It deepens the lore around the discs and the technology behind the hauntings.",
    notes: [
      "Published 2017",
      "The trilogy's horror pivot — less haunted house, more hunt",
    ],
  },
  {
    id: "fourth-closet",
    title: "The Fourth Closet",
    year: 2018,
    series: "Novel Trilogy · Book 3",
    author: "Scott Cawthon & Kira Breed-Wrisley",
    accent: "#ff1744",
    highlights: [
      "The finale's famous twist recontextualizes both previous books",
      "The truth about Charlie and the fourth closet",
      "One of the most argued-about pieces of FNAF fiction",
    ],
    summary:
      "The trilogy ends with the truth about Charlie, the fourth closet, and what Afton was really building.",
    detail:
      "The finale ties the trilogy's threads together and is famous for a twist that recontextualises the previous two books. It remains one of the most argued-about pieces of FNAF fiction.",
    notes: [
      "Published 2018 — trilogy complete",
      "Contains the reveal most fans consider the series' best twist",
    ],
  },
  {
    id: "fazbear-frights",
    title: "Fazbear Frights",
    year: "2019–2022",
    series: "12 volumes",
    author: "Scott Cawthon",
    accent: "#76ff03",
    highlights: [
      "Three self-contained stories plus a connecting epilogue per volume",
      "'Into the Pit', 'Coming Home' and 'The Man in Room 1280' are fan favourites",
      "Several ideas were later echoed in Security Breach and the films",
    ],
    summary:
      "An anthology series — three short horror stories per book, loosely tied to the games.",
    detail:
      "Each volume contains three self-contained stories with a connecting epilogue. Some entries ('Into the Pit', 'Coming Home', 'The Man in Room 1280') became fan favourites, and several ideas were later echoed in Security Breach and the films.",
    notes: [
      "Twelve volumes, 2019–2022",
      "The Stitchwraith epilogues form their own connective storyline",
    ],
  },
  {
    id: "tales-pizzaplex",
    title: "Tales from the Pizzaplex",
    year: "2022–2024",
    series: "8 volumes",
    author: "Scott Cawthon",
    accent: "#e040fb",
    highlights: [
      "Fleshes out the Pizzaplex era: glamrocks, employees, the Mimic",
      "The closest thing to a written companion for Security Breach",
      "Major source material for Secret of the Mimic's backstory",
    ],
    summary:
      "Short stories set around the Mega Pizzaplex, filling in the world of Security Breach.",
    detail:
      "This series fleshes out the Pizzaplex era: the glamrock band, the employees, the Mimic, and the slow decay of Fazbear Entertainment's newest venture. It is the closest thing to a written companion for Security Breach.",
    notes: [
      "Eight volumes, 2022–2024",
      "Follows the Mimic across decades — from Edwin's manor to the Pizzaplex",
    ],
  },
  {
    id: "freddy-files",
    title: "The Freddy Files",
    year: 2017,
    series: "Guidebook",
    author: "Scott Cawthon",
    accent: "#ffd600",
    highlights: [
      "Part art book, part lore primer, part puzzle",
      "Written from inside the fiction as a Fazbear Entertainment document",
      "Later editions cover everything up to Help Wanted",
    ],
    summary:
      "A guide to the games and their secrets, written from inside the fiction as a Fazbear Entertainment document.",
    detail:
      "Part art book, part lore primer, part puzzle. Later editions cover everything up to Help Wanted and include the kind of annotations that send theorists digging.",
    notes: [
      "First published 2017",
      "Updated editions track the franchise as it grows",
    ],
  },
];

export const books = bookData.map((book) => ({
  ...book,
  image: mediaArt("book", book.id),
}));
