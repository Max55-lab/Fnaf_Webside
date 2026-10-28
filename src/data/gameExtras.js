// Per-game field manual: how to play each entry (tutorial) and the easter
// eggs players can hunt for. Keyed by game id (see games.js).

export const gameTutorials = {
  "fnaf-1": {
    controls: [
      "Camera button raises the monitor — your only warning system",
      "Left/right door buttons seal the halls; hall lights show who is standing there",
      "Everything drains power: doors, lights, cameras, even the fan",
    ],
    steps: [
      "Check Cam 1A first — Freddy, Bonnie and Chica start on the show stage. Track who leaves and when.",
      "Watch Cam 1C (Pirate Cove). Foxy only advances while you are NOT looking at him — check often, but never stop checking.",
      "When Bonnie or Chica reaches your door (Cam 2B or 3), close that door and wait. They leave on their own.",
      "Freddy is the last to move. When you hear his laugh in the west hall, check Cam 2B and be ready on the left door.",
      "Power is the real boss. Never hold both doors — close one only when someone is actually standing there.",
      "At 20% power, stop checking cameras entirely. Hide, listen, and wait for 6 AM.",
      "Nights 4–5: the calls get darker and the animatronics move faster. Same strategy, tighter timing.",
    ],
    tips: [
      "Hall lights are cheap — use them instead of holding doors shut.",
      "If you hear banging on a door, you are already too late. Close it the moment you hear movement.",
      "Lower the monitor between checks; every second it is up costs power.",
      "Foxy is the only threat that can end a well-managed night in one run — check the Cove every few seconds once he is active.",
    ],
  },
  "fnaf-2": {
    controls: [
      "The Freddy mask fools most animatronics — wear it when they are in the office",
      "The flashlight repels Foxy in the hall and checks the vents",
      "The music box at the Prize Corner must be wound regularly",
    ],
    steps: [
      "Wind the music box early and often — the Puppet escapes if it runs dry, and that is a guaranteed death.",
      "Watch the vents. Withered Bonnie and Chica come through them — mask on the moment you see them.",
      "Foxy charges down the main hall — flash him repeatedly to push him back.",
      "Balloon Boy disables your lights if he reaches the office through the left vent — mask the instant you see him.",
      "Mangle creeps around the vents and the right hall; a flashlight burst makes them retreat.",
      "Wear the mask whenever you hear footsteps in the office — take it off only when the room is quiet.",
      "The flashlight drains battery fast. Flash in short bursts and never hold it down.",
    ],
    tips: [
      "The Puppet is your real timer — check the music box even when everything else looks calm.",
      "Golden Freddy appears rarely in the office — mask up instantly.",
      "If the lights die you are blind: mask, breathe, listen for footsteps.",
      "Vent lights tell you what is crawling toward you before it arrives.",
    ],
  },
  "fnaf-3": {
    controls: [
      "Audio lures: play Freddy, Bonnie, Chica or Foxy sounds on the cameras to move Springtrap",
      "Vent seals block him from reaching your office",
      "Reboot systems when the phantoms overload you",
    ],
    steps: [
      "Springtrap only shows up on certain cameras — check them to learn where he is.",
      "Play audio lures in rooms FAR from your office to pull him away from the vents.",
      "Seal a vent the moment he crawls into it — but remember, sealing one path opens another.",
      "Phantom animatronics appear when you stare at cameras too long — lower the monitor and look away when you see them.",
      "If a phantom gets you, systems reboot — keep the vent sealed while you wait it out.",
      "Two endings: complete every minigame for the 'good' ending; skip them and you get the 'bad' one.",
    ],
    tips: [
      "The camera system glitches randomly — never rely on it as your only information.",
      "Audio lures work through walls. Herd Springtrap in circles and he never gets close.",
      "Never play audio near your office — Springtrap is drawn to sound, not to you.",
      "Check the office vents constantly; he arrives without a sound otherwise.",
    ],
  },
  "fnaf-4": {
    controls: [
      "Hold position at a door to listen — breathing means they are right there",
      "The flashlight lights the halls; flash only when the hall is silent",
      "The closet holds Foxy — hold it shut when he is inside",
    ],
    steps: [
      "Stand at a door and LISTEN. Breathing = they are at the door. Do NOT flash.",
      "If the hall is silent, flash it — that is when Foxy is creeping up the left hall.",
      "Check the closet regularly. If Foxy is inside, hold the door until he retreats.",
      "Freddles gathering on the bed mean Nightmare Freddy is closing in — glance at the bed.",
      "Later nights add Nightmare Fredbear — same rules: listen first, flash only when silent.",
      "Do not spam the flashlight. It is your only defense and it takes time to raise.",
    ],
    tips: [
      "The Fredbear plush on the bed speaks when something gets close — treat it as a warning system.",
      "Breathing at BOTH doors means you waited too long. Pick one and hold on.",
      "Foxy needs several flashes to retreat — keep flashing until the hall is truly clear.",
      "Silence is information. An empty hall you never checked is where deaths come from.",
    ],
  },
  "sister-location": {
    controls: [
      "Move between rooms on the facility tablet map — each room is a task",
      "Hold your breath when Ballora's music gets close",
      "Watch the doors for Funtime Foxy's curtain",
    ],
    steps: [
      "Night 1: reach the parts service room — the map tells you where to go next.",
      "Ballora gallery: when her music swells, hold your breath. She hunts by sound.",
      "Funtime Foxy's show: wait for the curtain to open, then slam the door. Mistime it and he is in.",
      "Complete each night's repair sequence — the facility map unfolds as you progress.",
      "Night 5: the Scooping Room. Follow the instructions. Trust nothing you hear.",
      "Custom night: Ennard hunts you through the office — manage the tools and survive.",
    ],
    tips: [
      "Voice lines from the animatronics are clues, not flavor text.",
      "The 'Amnesia' glitch skips a section — fun for speedruns, not for a first play.",
      "The secret bunker ending lives on Night 5. Do not rush it.",
      "Every task has a rhythm — learn it once and the facility becomes manageable.",
    ],
  },
  ffps: {
    controls: [
      "Tycoon: buy animatronics and decor cheap, place them, watch the budget",
      "Salvage: answer yes/no honestly to what you saw and heard",
      "Bankruptcy ends the game early — never overspend",
    ],
    steps: [
      "Buy low: the catalogue rotates — grab animatronics and decor while they are on sale.",
      "Place tables and decor to attract customers; balance cost against reputation.",
      "Salvage segments: three questions per animatronic. Answer what actually happened.",
      "The secretary's messages get darker — that is the story advancing, not flavor.",
      "Midnight mode and the hidden fourth salvage are the endgame challenges.",
      "Play to the end. Henry's speech is the payoff for the entire original saga.",
    ],
    tips: [
      "Rejecting a salvaged animatronic does not make it go away.",
      "Salvage everything for cash — but wrong answers are how people die.",
      "The tycoon is a trap: you are building the collection Henry intends to burn.",
      "Check the budget every round; one bad purchase ends the run.",
    ],
  },
  ucn: {
    controls: [
      "Set AI levels for 50+ animatronics before starting the night",
      "Left/right doors, vent seals, cameras, the mask and the death coin each counter specific threats",
      "Power, temperature and office tools compete — rotate, do not camp",
    ],
    steps: [
      "Start with a handful of animatronics at low AI. Learn each one's counter before raising levels.",
      "Hall threats get doors. Office visitors get the mask. Vent crawlers get the vent seal.",
      "The death coin exists for one purpose: Golden Freddy. Save it for him.",
      "Watch whichever gauge is screaming — temperature, power or tool status tells you who is close.",
      "Add animatronics in pairs. New counter + old counter together is how runs die.",
      "50/20 mode: all fifty at maximum AI. The franchise's hardest challenge — attempt it last.",
    ],
    tips: [
      "Counters are specific: the wrong tool does nothing, and you die anyway.",
      "Some animatronics stay dormant until others are active — learn the pairs.",
      "Old Man Consequences hides a calm ending. Catch the fish.",
      "Learn one animatronic at a time; 50/20 is just fifty small lessons.",
    ],
  },
  "security-breach": {
    controls: [
      "Move with WASD; hide in lockers and under tables when detected",
      "Glamrock Freddy is your friend — ride him when the coast is clear",
      "Flashlight battery and save stations at the statues",
    ],
    steps: [
      "Learn the Pizzaplex layout — your objectives are marked on the map.",
      "When the music cue changes, you have been spotted: break line of sight and hide.",
      "Glamrock Freddy carries you between zones — use him to skip dangerous halls.",
      "Upgrade Freddy at the parts desks whenever you find an upgrade.",
      "Complete the objectives to reach 6 AM; the doors open at the end.",
      "Multiple endings exist: the van, the blob, and the Princess Quest 'true' ending.",
    ],
    tips: [
      "Roxy and Monty hunt differently — learn each pattern before roaming.",
      "Save often; the station statues are your checkpoints.",
      "Princess Quest 1–3 unlocks the true ending — do not skip the arcades.",
      "When in doubt, get inside Freddy and wait for the music to calm down.",
    ],
  },
  "help-wanted": {
    controls: [
      "VR or flat screen — same rules, different intensity",
      "Remastered FNAF 1–3 levels use their original strategies",
      "New levels add Glitchtrap's influence and harder variants",
    ],
    steps: [
      "Beat the remastered nights first — everything you know from the originals applies.",
      "New levels introduce Glitchtrap's trail — watch for the yellow rabbit.",
      "Hard mode changes animatronic behavior — relearn each fight from scratch.",
      "Nightmare mode is the endgame: every level, every nightmare, maxed.",
      "Hunt the secrets — Glitchtrap's trail leads straight into Security Breach.",
    ],
    tips: [
      "In VR, physical movement replaces camera checks — use your real head.",
      "Flat-screen mode is the accessibility path. No shame in it.",
      "The Princess minigame connects to Security Breach's true ending.",
      "Hard mode rewards patience: the animatronics are faster, not smarter.",
    ],
  },
  ruin: {
    controls: [
      "The AR mask reveals hidden paths, symbols and puzzles",
      "The mask also shows what the ruined animatronics really are",
      "Mask on for puzzles, mask off for stealth — learn the rhythm",
    ],
    steps: [
      "Put the mask on to see hidden geometry — many doors only exist in AR.",
      "Solve the mask puzzles to progress; symbols light up in sequence.",
      "Avoid the damaged Glamrocks — they hunt the physical ruins you are standing in.",
      "Follow Gregory's messages; they lead toward the end of the complex.",
      "Reach one of the endings — the Mimic setup pays off in Secret of the Mimic.",
    ],
    tips: [
      "The AR world shows the Pizzaplex's true history — read everything it reveals.",
      "The Maskbot is a new kind of threat: it wears faces. Never trust a friendly voice.",
      "The 'good' ending implies Gregory is still trapped — decide for yourself.",
      "Every puzzle has a physical clue nearby if AR alone confuses you.",
    ],
  },
  "secret-of-the-mimic": {
    controls: [
      "Explore the 1970s warehouse — delivery routes become puzzle routes",
      "The Mimic copies voices and behavior: what it hears, it repeats",
      "Stealth when it hunts, puzzles when it does not",
    ],
    steps: [
      "Deliver the package — then the warehouse stops making sense.",
      "The Mimic learns from what it hears. Do not let it hear everything.",
      "Solve the costume and mannequin puzzles to unlock new wings of the manor.",
      "Stealth past it when it is hunting — it mimics voices to lure you out.",
      "Reach one of the multiple endings; they reveal the Mimic's origin and Edwin's fate.",
    ],
    tips: [
      "If a voice sounds too familiar, it is the Mimic.",
      "The 1970s setting predates Freddy's — nothing in this building is safe yet.",
      "Sound is a resource: run when you must, walk when you can.",
      "The true ending rewrites the timeline. Stay for the credits.",
    ],
  },
};

export const gameEasterEggs = {
  "fnaf-1": [
    {
      name: "'IT'S ME' poster",
      how: "Check the hall posters between camera checks — randomly, a crying child with golden tears and the words 'IT'S ME' replaces them. Fans link it to Golden Freddy.",
    },
    {
      name: "The 1987 code",
      how: "In Custom Night, set every animatronic's AI level to 1-9-8-7. Golden Freddy answers.",
    },
    {
      name: "Golden Freddy in the office",
      how: "Rarely, a slumped golden Freddy face appears in your office. Flip up the camera to make him leave — or he gets you.",
    },
    {
      name: "Phone Guy's last call",
      how: "Night 4's phone call is his death — listen through the static and the scream at the end.",
    },
    {
      name: "$120.50 paycheck",
      how: "Survive the week for a paycheck of exactly $120.50 — the number the franchise never lets go of.",
    },
  ],
  "fnaf-2": [
    {
      name: "SAVE THEM",
      how: "Between certain nights, the game drops you into an 8-bit pizzeria chasing the purple figure — the murders, witnessed.",
    },
    {
      name: "Give Gifts, Give Life",
      how: "Another between-night minigame: the Puppet places the children into the suits. The origin of everything haunted.",
    },
    {
      name: "BB's Air Adventure",
      how: "A hidden platforming minigame — jump the boxes to reach Balloon Boy.",
    },
    {
      name: "Golden Freddy in the office",
      how: "Rarely, Golden Freddy appears in the office — mask up instantly.",
    },
    {
      name: "The $120.50 week",
      how: "The paycheck at the end of the week is $120.50. The franchise's favorite number strikes again.",
    },
  ],
  "fnaf-3": [
    {
      name: "The Spring-Lock Failure",
      how: "Between nights, an 8-bit minigame shows William Afton's end: cornered, he enters the Spring Bonnie suit — and it springs shut.",
    },
    {
      name: "Happiest Day",
      how: "Collect all 8 cake pieces across the nights to unlock the series' emotional climax: the Puppet's birthday party.",
    },
    {
      name: "Two endings",
      how: "Complete every minigame for the 'good' ending — the animatronic eyes go dark. Skip them and they stay lit.",
    },
    {
      name: "The purple man minigame",
      how: "Springtrap's death minigame replays the original murder in 8-bit.",
    },
  ],
  "fnaf-4": [
    {
      name: "The Bite of '83",
      how: "Between-night minigames show the birthday party where a crying child is lifted into Fredbear's mouth.",
    },
    {
      name: "The Fredbear plush speaks",
      how: "The plush on the bed talks — its final message arrives when the nightmare is almost over.",
    },
    {
      name: "'83 on the TV",
      how: "The TV in the minigame reads '83' — the date fans have argued about ever since.",
    },
    {
      name: "Nightmare mode",
      how: "Beat the game for 20/20/20/20 — every nightmare animatronic at maximum AI.",
    },
  ],
  "sister-location": [
    {
      name: "The secret bunker",
      how: "On Night 5, a hidden door in the facility leads to the bunker — and the truth about the Afton family.",
    },
    {
      name: "The Amnesia glitch",
      how: "A sequence skip that blows through a section — beloved by speedrunners.",
    },
    {
      name: "Funtime Foxy's hallway run",
      how: "The timed door sequence — one of the series' hardest optional challenges.",
    },
    {
      name: "Custom night roster",
      how: "The custom night menu reveals the full Funtime lineup — and Ennard.",
    },
  ],
  ffps: [
    {
      name: "The salvages",
      how: "Four animatronics sit in the dark while you answer questions about them. Answer honestly — or don't answer at all.",
    },
    {
      name: "Henry's final speech",
      how: "Reach the ending: Henry Emily burns it all down, naming every soul in the building.",
    },
    {
      name: "Midnight mode",
      how: "The endgame challenge — survive the night with everything unlocked.",
    },
    {
      name: "Lefte",
      how: "A hidden fourth salvage — the animatronic that shouldn't exist.",
    },
  ],
  ucn: [
    {
      name: "50/20 mode",
      how: "All fifty animatronics at maximum AI. Only a handful of players have beaten it.",
    },
    {
      name: "Old Man Consequences",
      how: "A hidden calm ending — catch the fish, sit by the lake, rest.",
    },
    {
      name: "The death coin",
      how: "Spend the death coin on Golden Freddy — the only animatronic it works on.",
    },
    {
      name: "Freddy in Space",
      how: "A mini-game unlocked by high scores — the franchise at its most absurd.",
    },
  ],
  "security-breach": [
    {
      name: "Princess Quest",
      how: "Three hidden arcade cabinets. Complete all three for the true ending — and Vanny's freedom.",
    },
    {
      name: "The van ending",
      how: "Escape in the van — the 'canonical' exit, if you can call it that.",
    },
    {
      name: "The blob ending",
      how: "The pit beneath the Pizzaplex connects straight back to Pizzeria Simulator.",
    },
    {
      name: "Vanny revealed",
      how: "The Princess Quest games are the key to unmasking Vanny.",
    },
  ],
  "help-wanted": [
    {
      name: "Glitchtrap's suit",
      how: "The digital William Afton hides in the code — follow his trail through the levels.",
    },
    {
      name: "The Princess minigame",
      how: "A retro minigame connects directly to Security Breach's true ending.",
    },
    {
      name: "Hard mode behaviors",
      how: "Hard mode changes how every animatronic moves — relearn the fights.",
    },
    {
      name: "VR intensity",
      how: "In VR, jumpscares are ten times worse. You have been warned.",
    },
  ],
  ruin: [
    {
      name: "The Mimic setup",
      how: "The ending plants the seed for Secret of the Mimic — watch what climbs out.",
    },
    {
      name: "The Maskbot",
      how: "A new type of threat that wears faces — find it in the ruins.",
    },
    {
      name: "The AR world's history",
      how: "The mask reveals the Pizzaplex's true history layer by layer — walls, posters, old rooms.",
    },
    {
      name: "The 'good' ending",
      how: "It implies Gregory is still trapped. Decide for yourself what it means.",
    },
  ],
  "secret-of-the-mimic": [
    {
      name: "Edwin's creation",
      how: "The Mimic was built to entertain Edwin's son — before it learned to copy more than play.",
    },
    {
      name: "The 1970s setting",
      how: "The manor predates Freddy's by decades — nothing in these rooms is safe yet.",
    },
    {
      name: "The Blob connection",
      how: "The Mimic threads directly into Ruin's Blob beneath the Pizzaplex.",
    },
    {
      name: "The true ending",
      how: "The franchise's biggest lore bomb — stay for the credits.",
    },
  ],
};

/* Field guide for the three browser minigames: how you find the original,
 * how to beat this version, and what hides in the corners. */
export const minigameGuides = {
  plushtrap: {
    activate:
      "In FNAF 4 the Plushtrap Chalk Game is one of the between-night segments: you are put in a dark room with the toy rabbit and a chalk X on the floor.",
    tutorial: [
      "Wait for Plushtrap to step onto the glowing X — he advances one spot at a time.",
      "Flash him with SPACE (or the FLASH button) while he stands on the X.",
      "Three clean flashes win the round.",
      "A flash off the X costs a miss. Two misses and he reaches the door.",
      "He speeds up every round: the interval drops from 1500ms toward 620ms as your score climbs.",
    ],
    eggs: [
      "The X glows brighter right before he steps onto it.",
      "Your best score is saved in this browser (fnaf_mg_plushtrap_best).",
      "In the real game the reward is a little more time at 6 AM — patience is the whole lesson.",
    ],
  },
  "shadow-bonnie": {
    activate:
      "In FNAF 3, Shadow Bonnie (RWQFSFASX) randomly appears in your office. Click him and you drop into his glitched minigame.",
    tutorial: [
      "Move with the arrow keys or WASD.",
      "Collect all three cakes hidden in the maze.",
      "Then reach the crying child at the exit — the exit stays shut until every cake is collected.",
      "The maze is one screen: plan a loop that grabs all three cakes on the way to the exit.",
      "Fewest steps wins; your best run is saved in this browser.",
    ],
    eggs: [
      "Three cakes, one exit — the simplest win condition in the arcade.",
      "RWQFSFASX is the name fans use for Shadow Bonnie; it is an anagram fans still decode.",
      "Shadow Bonnie never attacks you — he only shows you the way out.",
    ],
  },
  "fruity-maze": {
    activate:
      "Fruity Maze is one of the arcade cabinets in Freddy Fazbear's Pizzeria Simulator — buy it from the catalogue, place it on the floor, and play it there.",
    tutorial: [
      "Collect all four pieces of fruit scattered through the maze.",
      "The exit stays locked until the fruit is gone.",
      "After the last fruit, the yellow rabbit spawns at the far corner and starts chasing you.",
      "The rabbit moves one step per your step — never panic-move in a straight line.",
      "Reach the exit alive; the fewest steps is your best route (saved in this browser).",
    ],
    eggs: [
      "The music changes the moment the last fruit is collected — that is your cue.",
      "The rabbit spawns at a fixed corner: (7,1) on the board.",
      "In the original cabinet, the chase is widely read as Susie being lured. The fruit was never the point.",
    ],
  },
  "foxy-dash": {
    activate:
      "Foxy has sprinted through several of the series' smallest screens — the Go! Go! Go! stage and the FNAF 3 Save Them run. This cabinet takes the pirate's sprint and puts it on the docks.",
    tutorial: [
      "Foxy runs on his own; you only pick the lane. Left/Right arrows, A/D or the on-screen buttons.",
      "Red barrels are one-hit kills — a single touch ends the run.",
      "Gold coins are worth +25m of bonus distance on top of the auto-climbing distance score.",
      "Spawns favour one obstacle at a time; one of the three lanes is always left clear.",
      "Speed ramps the whole run: it starts slow and keeps climbing until it hits its cap.",
    ],
    eggs: [
      "Your best distance is saved in this browser (fnaf_mg_foxydash_best).",
      "Coins spawn roughly one try in three, but never on top of a barrel.",
      "Foxy's token uses his jumpscare art — the wiki's only official portrait of the pirate.",
    ],
  },
  "music-box": {
    activate:
      "In FNAF 2 the music box sits in the Prize Corner on CAM 11. Wind it from the camera before it runs out — an unwound box releases the Puppet into your hallway.",
    tutorial: [
      "The marker sweeps the bar; press SPACE (or WIND) only while it is inside the green zone.",
      "Each successful wind adds 20% to the box (capped at 100) and moves the safe zone.",
      "A missed wind costs 9% of the box, and the drain speeds up with every wind you land.",
      "The zone shrinks from 18% toward 9% of the bar as the tempo climbs.",
      "The run ends the instant the box hits 0% — the score is the number of winds you landed.",
    ],
    eggs: [
      "Your best wind count is saved in this browser (fnaf_mg_musicbox_best).",
      "The green zone always spawns fully inside the bar — it never wraps around the edges.",
      "In the real game the reward for constant winding is simply that the Puppet stays in his corner.",
    ],
  },
  "pizza-toss": {
    activate:
      "Freddy Fazbear's Pizzeria Simulator makes you run the whole business, food service included — this cabinet takes the rush-hour serving line and turns it into a ten-toss arcade round.",
    tutorial: [
      "You get ten tosses per rush. Press SPACE (or TOSS) to throw.",
      "The cupcake target drifts side to side, but your score comes from the power meter.",
      "Release inside the hot zone: the dark orange bullseye band scores 50, the wider ring band scores 20, anything else is 0.",
      "The meter speeds up a little with every toss — the last two are the fastest.",
      "Score 250 or more out of ten tosses to clear the rush.",
    ],
    eggs: [
      "Your best rush total is saved in this browser (fnaf_mg_pizzatoss_best).",
      "The ring band is the 60–74% slice of the meter; the bullseye is the 64–70% core of it.",
      "The target is a cupcake — the only order on the menu that fights back.",
    ],
  },
  "golden-stare": {
    activate:
      "Golden Freddy is the rarest visitor in FNAF 1: linger on the empty poster room and he appears in your office with a crashed game, unless you drop the monitor fast.",
    tutorial: [
      "Each round the room dims, then Golden Freddy's face flickers in after a random delay.",
      "Press SPACE (or LOOK AWAY) while the face is on screen — the window shrinks as your streak grows.",
      "Look away before the face appears and you were staring after all: that is a miss.",
      "A miss ends the run instantly with a jumpscare — the score is your streak.",
      "Delays shorten by 80ms per streak and the reaction window closes from 1350ms toward 450ms.",
    ],
    eggs: [
      "Your best streak is saved in this browser (fnaf_mg_goldenstare_best).",
      "The shrinking gold bar under the face is a visual timer for the reaction window.",
      "IT'S ME — the phrase fans still argue over, straight from the original poster room.",
    ],
  },
};
