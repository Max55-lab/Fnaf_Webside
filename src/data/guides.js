// Night Shift Guides — spoiler-light tutorials and practical walkthroughs for
// every mainline game. Written for the fan wiki, not copied from a guide site.

export const guides = {
  "fnaf-1": {
    difficulty: "Medium",
    length: "5 nights · ~4 min each",
    overview:
      "FNAF 1 is a power-management game disguised as a horror game. Every camera check, door and light costs you. The winning habit is to check only what you need, then look away.",
    quickStart: [
      "Keep the left door closed when Bonnie is at the west hall corner.",
      "Check Pirate Cove often enough that Foxy never leaves stage 3.",
      "At 2 AM and 4 AM, do a fast camera sweep instead of staring at one feed.",
    ],
    walkthrough: [
      {
        title: "Night 1 — learn the rhythm",
        steps: [
          "Open the monitor, check CAM 1A, then 1B, 1C and 2A. Close it.",
          "If Bonnie is missing from the stage, check the west hall light before closing the door.",
          "Use the right door only when Chica is in the east hall corner. Freddy stays quiet until later nights.",
        ],
      },
      {
        title: "Night 2–3 — protect the power",
        steps: [
          "Do not leave the monitor open while planning. The tablet drains power every second.",
          "Close a door only for as long as the threat is there, then reopen it.",
          "Check Pirate Cove every 2–3 camera sweeps. Foxy punishes long gaps, not short glances.",
        ],
      },
      {
        title: "Night 4–5 — the fast sweep",
        steps: [
          "Sweep cameras in a loop: 1A → 1B → 1C → 2A → 3. Close the tablet immediately after.",
          "When Freddy laughs, check the east hall corner. If he is there, shut the right door until he leaves.",
          "After 4 AM, stop unnecessary camera checks. Save power for doors and lights.",
        ],
      },
      {
        title: "Night 6 / 20-20-20-20",
        steps: [
          "Treat every animatronic as active from minute one.",
          "Use the door lights more than the cameras; they cost less than a full monitor sweep.",
          "Accept that the last hour is a power race. If you reach 5 AM with 15% power, you are on pace.",
        ],
      },
    ],
    proTips: [
      "The left light reveals Bonnie; the right light reveals Chica. The hall lights do not reveal Freddy.",
      "Foxy's stage advances when you ignore Pirate Cove. A single quick check resets the timer.",
      "The office fan is not a mechanic. It is a lie. Keep moving.",
    ],
    mistakes: [
      "Holding a door closed all night — this is the fastest way to lose power.",
      "Watching the show stage for long stretches while Freddy moves.",
      "Panic-checking every camera after hearing a footstep.",
    ],
    minigame: null,
  },

  "fnaf-2": {
    difficulty: "Hard",
    length: "5 nights · ~5 min each",
    overview:
      "FNAF 2 has no doors. Your tools are the Freddy mask, the flashlight and the music box. The music box is the real timer: if it winds down, the Puppet ends the night.",
    quickStart: [
      "Wind the music box first, then check cameras.",
      "Put on the mask when an animatronic enters the office — not before.",
      "Flash the hall but do not overuse it: Foxy moves when the hall is lit too long.",
    ],
    walkthrough: [
      {
        title: "Night 1 — mask basics",
        steps: [
          "Start with the music box. It is always the priority.",
          "Check CAM 11 (Prize Corner) and rewind before leaving the monitor.",
          "If Toy Bonnie or Toy Chica appears in the office, raise the mask and hold still.",
        ],
      },
      {
        title: "Night 2–3 — juggle the vents",
        steps: [
          "Watch CAM 12, 13 and 14 for Mangle and Balloon Boy.",
          "When BB gets in, he disables the flashlight. Find him in the vents before he reaches you.",
          "Use the mask for Foxy as well, then check the hall light again after a few seconds.",
        ],
      },
      {
        title: "Night 4–5 — Puppet pressure",
        steps: [
          "Wind the box at least every 15–20 seconds. Do not wait for the warning.",
          "Do camera checks in a tight loop: Prize Corner → vents → office.",
          "If the Puppet is out, the mask will not save you. Keep the box wound from the first minute.",
        ],
      },
      {
        title: "Night 6 — no wasted moves",
        steps: [
          "Open the monitor only when you need to wind or check a spawn point.",
          "Use the flashlight on the hall when Foxy is there, then lower it immediately.",
          "At 4 AM, prioritize the music box over every other camera.",
        ],
      },
    ],
    proTips: [
      "The mask works while the monitor is down. Learn the animation that tells you to raise it.",
      "Mangle can hang from the ceiling. Check above the office, not just the vents.",
      "Golden Freddy appears as a floating head. Put the mask on immediately.",
    ],
    mistakes: [
      "Forgetting the music box while chasing a camera check.",
      "Wearing the mask while an animatronic is in the office — it is too late.",
      "Flashing Foxy repeatedly and pushing him toward an instant charge.",
    ],
    minigame: { id: "shadow-bonnie", label: "Shadow Bonnie's cake run" },
  },

  "fnaf-3": {
    difficulty: "Hard",
    length: "5 nights · ~6 min each",
    overview:
      "Springtrap is one threat and six systems are broken. You are not fighting him directly; you are slowing him down while keeping the office sealed. Audio lures are your best tool.",
    quickStart: [
      "Play the audio lure in a room next to Springtrap, then leave it alone.",
      "Seal the vent he is closest to, not the one he is already inside.",
      "Reboot cameras or vents after a phantom attack — do not wait.",
    ],
    walkthrough: [
      {
        title: "Night 1 — find Springtrap",
        steps: [
          "Check CAM 09 and CAM 10 early. Springtrap starts on the far side of the attraction.",
          "Play the audio lure two rooms away from his current camera, then switch cameras.",
          "Keep the office vents sealed when he reaches CAM 08 or CAM 07.",
        ],
      },
      {
        title: "Night 2–3 — manage phantoms",
        steps: [
          "A phantom in the office blocks your view. Look away or use the monitor to make it vanish.",
          "When Phantom Mangle appears on a camera, change feeds immediately.",
          "Reboot one system at a time so you are never fully blind.",
        ],
      },
      {
        title: "Night 4–5 — the last hour",
        steps: [
          "Do not over-seal vents early. Seal only the vent Springtrap is actually closest to.",
          "Use the audio lure every time he moves toward the office, not on a fixed timer.",
          "At 5 AM, preserve power for the vent in his final approach lane.",
        ],
      },
    ],
    proTips: [
      "If Springtrap is in CAM 09, lure to CAM 08 or CAM 10 — never the room he can hear you from.",
      "Phantom Freddy disables the camera in the office. Reboot it before checking again.",
      "The secret minigames are not required for the good ending, but they explain it.",
    ],
    mistakes: [
      "Playing the audio lure on the same camera as Springtrap.",
      "Sealing both vents all night and running out of power.",
      "Trying to stare down a phantom instead of looking away.",
    ],
    minigame: { id: "shadow-bonnie", label: "Shadow Bonnie's cake run" },
  },

  "fnaf-4": {
    difficulty: "Very hard",
    length: "5 nights · ~8 min each",
    overview:
      "FNAF 4 is an audio game. You cannot see the bed behind you, and the halls are traps. Learn each animatronic's breathing, then use sound instead of sight.",
    quickStart: [
      "Put on the headphones. Breathing tells you which side is being approached.",
      "Flash the left or right hall only when you hear breathing there.",
      "Check the bed frequently after 2 AM, especially after a loud noise.",
    ],
    walkthrough: [
      {
        title: "Night 1 — audio calibration",
        steps: [
          "Keep the flashlight on the right hall stored, not held down.",
          "When you hear breathing on the left, flash left. When it stops, flash again to confirm.",
          "Check behind you when the bed creak plays. If you see eyes, flash them.",
        ],
      },
      {
        title: "Night 2–3 — Foxy and the closet",
        steps: [
          "Foxy appears as a flash in the hall. One flash sends him back; more can be dangerous.",
          "If the closet door is open, check it after every hall flash.",
          "Do not flash empty halls. It wastes time and can trigger Foxy.",
        ],
      },
      {
        title: "Night 4–5 — Nightmare pace",
        steps: [
          "Alternate checks: left hall, right hall, bed, closet. Keep the route identical.",
          "If two animatronics are close, prioritize the one with the louder breathing.",
          "At 5 AM, stop exploring and hold your position. Nightmare moves on a timer.",
        ],
      },
    ],
    proTips: [
      "Nightmare Fredbear changes positions faster than the others. Listen for the deeper growl.",
      "The Plushtrap minigame is optional, but beating it changes the next night's difficulty.",
      "A dark room is safer than a flash on an empty hall. Do not 'check' out of nerves.",
    ],
    mistakes: [
      "Playing without sound.",
      "Flashing both halls back and forth in a panic.",
      "Ignoring the bed because you are focused on the doors.",
    ],
    minigame: { id: "plushtrap", label: "Plushtrap's flashlight game" },
  },

  "sister-location": {
    difficulty: "Medium",
    length: "5 nights + custom",
    overview:
      "Sister Location is paced like a haunted-house tour. Most deaths come from ignoring the voice cue or opening a door at the wrong time. Follow the instructions, then break them only when the game asks you to.",
    quickStart: [
      "Do the task on screen before exploring. The game gates progress behind instructions.",
      "Hold your breath when Ballora's music stops — not while it is playing.",
      "In the Funtime Foxy section, wait for the light cue before entering.",
    ],
    walkthrough: [
      {
        title: "Night 1 — trust the handler",
        steps: [
          "Follow the camera/flashlight tasks exactly. Do not linger in the vent.",
          "When HandUnit pauses, stop moving and listen.",
          "If Circus Baby interrupts, her instructions are the path forward.",
        ],
      },
      {
        title: "Night 2–3 — sneak sections",
        steps: [
          "Ballora tracks movement and sound. Move only when her music is loud.",
          "In the breaker room, count the flashes and match the pattern.",
          "Keep your flashlight off unless you need to see an interaction prompt.",
        ],
      },
      {
        title: "Night 4–5 — the script breaks",
        steps: [
          "When the game gives you a choice between following instructions and staying safe, choose safe.",
          "In the Scooping Room, do not move until the sequence ends.",
          "The custom night is a separate challenge. Learn the vent patterns before raising AI levels.",
        ],
      },
    ],
    proTips: [
      "The pause button does not pause audio cues. Listen before tabbing out.",
      "Funtime Freddy's Bon-Bon call tells you which side to watch.",
      "The private room ending is the one that connects directly to FFPS.",
    ],
    mistakes: [
      "Rushing ahead of the handler's instructions.",
      "Holding your breath too early and running out when Ballora arrives.",
      "Treating the Scooping Room as a quick-time event.",
    ],
    minigame: null,
  },

  ffps: {
    difficulty: "Medium",
    length: "6 days + salvage",
    overview:
      "Pizzeria Simulator hides a horror game inside a tycoon game. Your restaurant has to look profitable enough to reach the salvage nights, but the real goal is Henry's ending.",
    quickStart: [
      "Buy cheap tables and stage items first; you need cash flow, not decoration.",
      "Do not salvage an animatronic you cannot handle on a dark screen.",
      "Keep the restaurant's legal risk low before the final week.",
    ],
    walkthrough: [
      {
        title: "Day 1–2 — build a functioning pizzeria",
        steps: [
          "Place a stage, two tables and a few arcade cabinets. Keep the layout walkable.",
          "Run one ad per day and check the daily report before spending.",
          "Save cash for the salvage nights; do not dump it all into cosmetics.",
        ],
      },
      {
        title: "Day 3–4 — salvage decisions",
        steps: [
          "During salvage, watch the animatronic's movement and shine the light when it advances.",
          "Listen for the audio cue that tells you when to look away.",
          "Reject a salvage if your power is low — the repair cost is worse than the missed item.",
        ],
      },
      {
        title: "Day 5–6 — the finale",
        steps: [
          "Make sure all four salvageable animatronics have been handled to reach the true ending.",
          "Keep the pizzeria's reputation above zero; bankruptcy locks you out of the final night.",
          "When Henry begins his speech, stop optimizing. The ending is the reward.",
        ],
      },
    ],
    proTips: [
      "The left/right audio cue in salvage is the entire mechanic. Turn the music off.",
      "Liability risk rises when you place dangerous animatronics near customers.",
      "You can finish the story without a perfect pizzeria, but not without paying attention.",
    ],
    mistakes: [
      "Spending the entire budget on decor before the first salvage.",
      "Trying to salvage every animatronic on the first attempt.",
      "Ignoring the daily report until bankruptcy.",
    ],
    minigame: { id: "fruity-maze", label: "Fruity Maze" },
  },

  ucn: {
    difficulty: "Extreme",
    length: "One night · many attempts",
    overview:
      "Ultimate Custom Night is a toolkit exam. Pick a small roster, learn one interaction at a time, then add pressure. 50/20 mode is a stunt, not a starting point.",
    quickStart: [
      "Start with four animatronics you already understand.",
      "Keep the fan and a vent snare on a fixed rhythm.",
      "Use the death coin only on Golden Freddy; it is wasted on anyone else.",
    ],
    walkthrough: [
      {
        title: "Build a beginner roster",
        steps: [
          "Choose Freddy, Bonnie, Chica and Foxy at low AI. Learn the office layout.",
          "Add one mechanic at a time: first doors, then vents, then the music box.",
          "Write down each death and the animatronic responsible. The pattern will appear.",
        ],
      },
      {
        title: "Add the annoying ones",
        steps: [
          "Balloon Boy blocks the flashlight; find him in the vents before it matters.",
          "Springtrap requires vent sealing, not door camping.",
          "Nightmare Fredbear's laugh tells you he is about to appear. Check both halls.",
        ],
      },
      {
        title: "50/20 is a different game",
        steps: [
          "Expect to reset often. The opening 30 seconds decide most runs.",
          "Use the camera cycle as a metronome, not a reaction.",
          "Do not chase a perfect run. Survive one hour at a time.",
        ],
      },
    ],
    proTips: [
      "The Death Coin is for Golden Freddy. Everything else can be handled with systems.",
      "The office fan can be left on longer than you think — but not all night.",
      "If you are losing to the same animatronic, remove them and practice the counter in isolation.",
    ],
    mistakes: [
      "Maxing every AI slider on the first attempt.",
      "Ignoring the vent snare while watching the halls.",
      "Treating UCN like FNAF 1 with more characters.",
    ],
    minigame: null,
  },

  "security-breach": {
    difficulty: "Medium",
    length: "6 hours · open world",
    overview:
      "Security Breach rewards movement and map knowledge more than reaction speed. Freddy is your taxi and your hiding place. Learn the escape routes before you try to collect everything.",
    quickStart: [
      "Follow the main mission until you unlock Freddy's chest compartment.",
      "Use lockers and under-table hiding instead of running through open rooms.",
      "Save before entering a boss area; the auto-save is not always generous.",
    ],
    walkthrough: [
      {
        title: "The Pizzaplex opening",
        steps: [
          "Head to the security office and get the flashlight and party pass.",
          "Use Freddy to travel between zones; his chest protects you from patrols.",
          "Do not fight animatronics. Break line of sight and hide.",
        ],
      },
      {
        title: "First upgrades",
        steps: [
          "Collect the Fazer Blast and Monty Golf passes before exploring deeper.",
          "Upgrade Freddy's voice box and claws; both open routes you will need later.",
          "When Roxy patrols, turn off your flashlight and move behind cover.",
        ],
      },
      {
        title: "The ending routes",
        steps: [
          "The Princess Quest arcade games are the main path to the true ending.",
          "The fire escape ending is shorter and easier; the van ending is the one most fans treat as canon.",
          "If you are lost, follow the objective marker but check side rooms for save stations.",
        ],
      },
    ],
    proTips: [
      "You can hide in Freddy during a chase even when the prompt is not obvious.",
      "Monty's golf area has a faster route over the catwalks than through the lobby.",
      "Listen for the Vanny mask whisper — it means she is close, not that you are safe.",
    ],
    mistakes: [
      "Sprinting everywhere and running out of stamina.",
      "Trying to fight Glamrock animatronics head-on.",
      "Skipping the Fazer Blast pass and then getting locked out of the true ending.",
    ],
    minigame: null,
  },

  "help-wanted": {
    difficulty: "Hard",
    length: "6+ hours",
    overview:
      "Help Wanted is a VR collection of remastered FNAF levels. On flat screen it plays like a first-person puzzle-horror game. The core skills are still listening, timing and looking behind you.",
    quickStart: [
      "Play the Flat Mode tutorial and set the comfort options before the first night.",
      "In FNAF 1 levels, the monitor is on your desk — do not stand up to check cameras.",
      "When Glitchtrap appears, follow the tape, not the jumpscare.",
    ],
    walkthrough: [
      {
        title: "FNAF 1 VR",
        steps: [
          "Use the desk monitor and door buttons without leaving the chair.",
          "Foxy is the biggest threat because you cannot hear the door light as clearly.",
          "When the power runs out, keep your headset pointed at the left door for the Toreador March.",
        ],
      },
      {
        title: "FNAF 2 VR",
        steps: [
          "Grab the Freddy mask and put it on when an animatronic enters.",
          "The flashlight is a wrist tool; aim it at the hall, not the floor.",
          "Wind the music box with the crank on the desk, then lower the monitor.",
        ],
      },
      {
        title: "FNAF 3 VR + Nightmare levels",
        steps: [
          "Audio lures are controlled from the monitor. Learn the button positions by touch.",
          "In Nightmare mode, the animatronics move faster but follow the same rules.",
          "Glitchtrap's tapes are hidden in the hub. Collect them between levels, not during a scare.",
        ],
      },
    ],
    proTips: [
      "VR head tracking makes Freddy's office feel larger. Turn your body, not just your head.",
      "If you feel motion sick, use snap turning and a seated play style.",
      "The hub has a practice mode. Use it before a hard level, not after a death.",
    ],
    mistakes: [
      "Standing up during a camera check and losing the monitor.",
      "Ignoring the audio cue from behind you.",
      "Rushing the Glitchtrap tapes without a break.",
    ],
    minigame: null,
  },

  ruin: {
    difficulty: "Hard",
    length: "3–5 hours",
    overview:
      "Ruin strips away Freddy and the flashlight. The AR mask is your only way to see hidden paths, but wearing it leaves you vulnerable. The game is about routing, not combat.",
    quickStart: [
      "Use the mask in short bursts; take it off when you hear footsteps.",
      "Follow Cassie's voice cues, not the objective marker alone.",
      "The environment is full of one-way drops. Look before you jump.",
    ],
    walkthrough: [
      {
        title: "The ruined atrium",
        steps: [
          "Put on the AR mask to reveal the broken bridge path.",
          "When Roxy is nearby, turn off the flashlight and move behind rubble.",
          "The security nodes need power; find the generator before opening the next gate.",
        ],
      },
      {
        title: "Roxy and the mask",
        steps: [
          "Roxy is blind but hears movement. Walk, do not sprint.",
          "Use the mask to see her patrol route, then take it off before she gets close.",
          "If she charges, break line of sight around a corner and hide.",
        ],
      },
      {
        title: "The Mimic ending",
        steps: [
          "Collect the security nodes in the order the environment suggests; backtracking is expensive.",
          "The final choice is a choice. Read the room before you pull a lever.",
          "The elevator route is shorter, but the Mimic ending is the one that sets up Secret of the Mimic.",
        ],
      },
    ],
    proTips: [
      "The AR mask changes collision in some rooms. Do not trust a path that only exists in AR.",
      "Cassie's breathing gets louder when danger is close.",
      "The Mimic can copy voices. If an instruction sounds wrong, stop and look around.",
    ],
    mistakes: [
      "Wearing the mask while walking through a dark room.",
      "Sprinting near Roxy.",
      "Skipping the generator and getting stuck at a gate.",
    ],
    minigame: null,
  },

  "secret-of-the-mimic": {
    difficulty: "Hard",
    length: "4–6 hours",
    overview:
      "Secret of the Mimic is a stealth-puzzle prequel. The Mimic learns from what you do, so repeated routes become dangerous. Change your pattern and use sound deliberately.",
    quickStart: [
      "Walk unless you are being chased. Noise is the Mimic's main input.",
      "Inspect every costume room; the game hides route keys in plain sight.",
      "If the Mimic copies a voice, do not answer it. Move to a different room.",
    ],
    walkthrough: [
      {
        title: "Murray's Costume Manor",
        steps: [
          "Follow the delivery route but check side rooms for fuse keys.",
          "The Mimic starts passive. It watches your movement before it blocks doors.",
          "Use the flashlight sparingly; it reveals the environment but also announces you.",
        ],
      },
      {
        title: "The first mimicry",
        steps: [
          "When a voice calls from a room you already cleared, it is not a survivor.",
          "Close doors behind you. The Mimic uses open paths.",
          "The costume displays are hiding places, not just decor. Test the prompt.",
        ],
      },
      {
        title: "The ending route",
        steps: [
          "Collect all the memory tapes before the final descent; they change the context of the ending.",
          "Do not sprint through the final hall. The Mimic tracks footsteps.",
          "When the credits roll, check the post-credit scene for the Ruin connection.",
        ],
      },
    ],
    proTips: [
      "The Mimic repeats the last voice it heard. Use that to bait it away from a door.",
      "Costume heads can be knocked over to create a distraction.",
      "If you are lost, return to the last room with a lit exit sign.",
    ],
    mistakes: [
      "Sprinting through every corridor.",
      "Trusting a voice that repeats an earlier line.",
      "Leaving doors open behind you.",
    ],
    minigame: null,
  },
};

export const getGuide = (id) => guides[id] || null;
