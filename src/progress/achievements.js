// Achievement catalog for the Service Record. Every badge is a pure predicate
// over the flat snapshot produced by computeSnapshot() (record.js), so the
// same evaluation runs on navigation, on a timer, and on the dashboard page.
//
// Tiers: bronze → silver → gold → platinum. Pass-2 badges are evaluated after
// the first sweep so "earn N badges" criteria can count what just unlocked.

export const ACHIEVEMENTS = [
  /* ---------- Reading the wiki ---------- */
  {
    id: "first-file",
    tier: "bronze",
    icon: "📂",
    title: "First File",
    desc: "Open your first character or game file.",
    hint: "Click into any entry from the Characters or Games roster.",
    check: (s) => s.characterCount + s.gameCount >= 1,
  },
  {
    id: "night-reader",
    tier: "bronze",
    icon: "📖",
    title: "Night Reader",
    desc: "Read five character files.",
    hint: "Bios, night behaviour and trivia — five of twenty.",
    check: (s) => s.characterCount >= 5,
  },
  {
    id: "archivist",
    tier: "gold",
    icon: "🗂",
    title: "The Archivist",
    desc: "Read every character file in the roster.",
    hint: "All twenty characters, start to finish.",
    check: (s) => s.characterCount >= s.characterTotal,
  },
  {
    id: "historian",
    tier: "bronze",
    icon: "🎮",
    title: "Game Historian",
    desc: "Open five game files.",
    hint: "Each game page is a three-tab field manual.",
    check: (s) => s.gameCount >= 5,
  },
  {
    id: "full-dossier",
    tier: "gold",
    icon: "🗄",
    title: "Full Dossier",
    desc: "Open every mainline game file.",
    hint: "All eleven entries — guides, tutorials, egg lists.",
    check: (s) => s.gameCount >= s.gameTotal,
  },
  {
    id: "section-scout",
    tier: "silver",
    icon: "🧭",
    title: "Section Scout",
    desc: "Visit all ten sections of the wiki.",
    hint: "Home, Characters, Games, Lore, Media, Arcade, Community, Secrets, Vault, Record.",
    check: (s) => s.sectionCount >= s.sectionTotal,
  },

  /* ---------- Secrets ---------- */
  {
    id: "first-secret",
    tier: "bronze",
    icon: "🔑",
    title: "First Crack",
    desc: "Find your first hidden secret.",
    hint: "The keyboard is a hidden input on every page. Type things.",
    check: (s) => s.secretsFound >= 1,
  },
  {
    id: "code-breaker",
    tier: "silver",
    icon: "🔓",
    title: "Code Breaker",
    desc: "Find ten secrets.",
    hint: "Years, names, colours, cheat codes — the Vault keeps the hints.",
    check: (s) => s.secretsFound >= 10,
  },
  {
    id: "vault-master",
    tier: "gold",
    icon: "🗝",
    title: "Vault Master",
    desc: "Find every secret on the site.",
    hint: "Every hint lives in the Vault. Nothing else is hidden from you.",
    check: (s) => s.secretsFound >= s.secretsTotal,
  },

  /* ---------- Arcade ---------- */
  {
    id: "arcade-regular",
    tier: "bronze",
    icon: "🕹",
    title: "Arcade Regular",
    desc: "Set a best score in any minigame.",
    hint: "Seven cabinets — Plushtrap's flashlight to Golden Freddy's stare. Pick one.",
    check: (s) => s.scoredCount >= 1,
  },
  {
    id: "arcade-ace",
    tier: "silver",
    icon: "🏆",
    title: "Arcade Ace",
    desc: "Set best scores in every minigame.",
    hint: "Seven cabinets, seven scores on the board.",
    check: (s) => s.scoredCount >= (s.scoredTotal || 3) && s.scoredCount >= 1,
  },

  /* ---------- Community ---------- */
  {
    id: "first-post",
    tier: "bronze",
    icon: "💬",
    title: "First Word",
    desc: "Author your first forum thread or reply.",
    hint: "Pick a display name and post — threads stay in this browser.",
    check: (s) => s.forumPosts >= 1,
  },
  {
    id: "forum-regular",
    tier: "silver",
    icon: "📢",
    title: "Forum Regular",
    desc: "Author three forum posts.",
    hint: "Threads and replies both count.",
    check: (s) => s.forumPosts >= 3,
  },
  {
    id: "pollster",
    tier: "bronze",
    icon: "🗳",
    title: "Pollster",
    desc: "Vote in a community poll or tier list.",
    hint: "The Forum tab runs era polls and character tiers.",
    check: (s) => s.voted,
  },

  /* ---------- Saved items ---------- */
  {
    id: "bookmarked",
    tier: "bronze",
    icon: "🔖",
    title: "Saved for Later",
    desc: "Bookmark your first item.",
    hint: "Press ☆ Save on any character or game.",
    check: (s) => s.bookmarks >= 1,
  },
  {
    id: "collector",
    tier: "silver",
    icon: "📚",
    title: "Collector",
    desc: "Keep five bookmarks.",
    hint: "The Vault holds them all.",
    check: (s) => s.bookmarks >= 5,
  },

  /* ---------- Clearance ---------- */
  {
    id: "insider",
    tier: "bronze",
    icon: "🪪",
    title: "Insider",
    desc: "Clock in at the staff terminal.",
    hint: "The footer has a door marked 'Staff terminal'. Any badge will do.",
    check: (s) => s.signedIn,
  },

  /* ---------- Dedication ---------- */
  {
    id: "second-shift",
    tier: "bronze",
    icon: "🌙",
    title: "Second Shift",
    desc: "Come back for another session.",
    hint: "Close the wiki and return later. The job isn't done.",
    check: (s) => s.sessions >= 2,
  },
  {
    id: "regular-guard",
    tier: "silver",
    icon: "🛡",
    title: "Regular Guard",
    desc: "Start five separate shifts.",
    hint: "Five sessions. You keep showing up for the night.",
    check: (s) => s.sessions >= 5,
  },
  {
    id: "overtime",
    tier: "bronze",
    icon: "⏰",
    title: "Overtime",
    desc: "Spend thirty minutes on the wiki.",
    hint: "Time counts while the tab is visible.",
    check: (s) => s.timeMs >= 30 * 60 * 1000,
  },
  {
    id: "long-week",
    tier: "silver",
    icon: "📅",
    title: "The Long Week",
    desc: "Spend two hours on the wiki.",
    hint: "Clock in, stay a while.",
    check: (s) => s.timeMs >= 2 * 60 * 60 * 1000,
  },
  {
    id: "all-nighter",
    tier: "gold",
    icon: "🌄",
    title: "All-Nighter",
    desc: "Spend four hours on the wiki.",
    hint: "Nobody makes it to 6 AM without putting the hours in.",
    check: (s) => s.timeMs >= 4 * 60 * 60 * 1000,
  },
  {
    id: "night-owl",
    tier: "bronze",
    icon: "🦉",
    title: "Night Owl",
    desc: "Browse between midnight and 5 AM.",
    hint: "The small hours have their own award.",
    check: (s) => s.smallHours,
  },

  /* ---------- Meta (pass 2 — counts badges earned in pass 1) ---------- */
  {
    id: "veteran",
    tier: "platinum",
    icon: "⭐",
    title: "Fazbear Veteran",
    desc: "Earn fifteen badges.",
    hint: "Fifteen badges. The night shift keeps score.",
    pass: 2,
    check: (s) => s.earnedCount >= 15,
  },
  {
    id: "completionist",
    tier: "platinum",
    icon: "👑",
    title: "Employee of the Month",
    desc: "Earn every other badge.",
    hint: "Every other badge in the catalog. Fazbear notices everything.",
    pass: 2,
    check: (s) => s.earnedCount >= ACHIEVEMENTS.length - 1,
  },
];

/* Evaluate the catalog against a snapshot. Returns only badges that are
   newly satisfied (already-earned ones are skipped). Pass-2 badges receive
   an earnedCount that includes pass-1 unlocks from this same evaluation. */
export function evaluateAchievements(stats) {
  const earned = new Set(Object.keys(stats.earned || {}));
  const newly = [];
  let earnedCount = stats.earnedCount ?? earned.size;

  for (const badge of ACHIEVEMENTS) {
    if (badge.pass === 2 || earned.has(badge.id)) continue;
    if (safeCheck(badge, stats)) {
      newly.push(badge);
      earned.add(badge.id);
      earnedCount += 1;
    }
  }

  const augmented = { ...stats, earnedCount };
  for (const badge of ACHIEVEMENTS) {
    if (badge.pass !== 2 || earned.has(badge.id)) continue;
    if (safeCheck(badge, augmented)) {
      newly.push(badge);
      earned.add(badge.id);
      earnedCount += 1;
    }
  }

  return newly;
}

function safeCheck(badge, stats) {
  try {
    return Boolean(badge.check(stats));
  } catch {
    return false;
  }
}

/* Display rank, driven by how many badges are held. */
export function rankFor(count, total = ACHIEVEMENTS.length) {
  if (count >= total) {
    return {
      title: "Golden Freddy",
      blurb: "Every badge. Every secret. The record is complete — management is nervous.",
    };
  }
  if (count >= 22) {
    return {
      title: "Fazbear Legend",
      blurb: "Almost the full file. The last few badges are formalities.",
    };
  }
  if (count >= 16) {
    return {
      title: "Shift Veteran",
      blurb: "You know where everything is hidden — including the bodies of your old saves.",
    };
  }
  if (count >= 10) {
    return {
      title: "Senior Guard",
      blurb: "Reliable, documented, and getting a little too comfortable with the cameras.",
    };
  }
  if (count >= 5) {
    return {
      title: "Night Guard",
      blurb: "You've survived enough of the wiki to start calling it work.",
    };
  }
  if (count >= 1) {
    return {
      title: "Night Hire",
      blurb: "First badge earned. Your file is open — fill it.",
    };
  }
  return {
    title: "Unregistered Visitor",
    blurb: "No record on file. Fazbear Entertainment denies all knowledge of you.",
  };
}
