// Character portraits.
// Source art: the public FNAF Fandom Wiki (freddy-fazbears-pizza.fandom.com).
// Files are bundled locally in public/characters/ (see scripts/fetch-character-images.ps1)
// so the wiki renders reliably regardless of hotlink protection.
// Every <img> still has an automatic emoji fallback if a file ever goes missing.
import { characterArt } from "../lib/assets.js";

const local = (id) => characterArt(id);

export const images = Object.fromEntries(
  [
    "freddy-fazbear",
    "bonnie",
    "chica",
    "foxy",
    "golden-freddy",
    "the-puppet",
    "balloon-boy",
    "mangle",
    "springtrap",
    "circus-baby",
    "funtime-freddy",
    "ballora",
    "ennard",
    "glamrock-freddy",
    "montgomery-gator",
    "roxanne-wolf",
    "the-mimic",
    "william-afton",
    "michael-afton",
    "henry-emily",
  ].map((id) => [id, local(id)])
);

// Detailed backstories — original prose, structured as tutorials for new fans.
export const backstories = {
  "freddy-fazbear": `Every story at Freddy Fazbear's Pizza begins and ends with him: a friendly brown bear in a black top hat, microphone in hand, who sang for thousands of children — and who never stopped performing after the doors closed.

Freddy was the flagship animatronic of Fazbear Entertainment, built to entertain at birthday parties and stage shows alongside his band: Bonnie on guitar, Chica on vocals, and Foxy performing separately in Pirate Cove. By day he was a harmless mascot. By night, his programming — or something far older inside his metal endoskeleton — takes over. Freddy does not wander blindly. He watches. He waits on the Show Stage until he is certain no camera is looking at him, then moves with patient, deliberate steps toward the office.

The night guard's rule is simple: never take your eyes off Freddy for long. When his music box melody — the Toreador March — begins to play and the power dies, there is nothing left to do. The doors open, the lights go out, and two glowing eyes appear in the darkness before the static takes over.

What makes Freddy tragic is what he represents: the smiling face of a company that covered up unspeakable crimes. Children vanished near these animatronics, and Freddy kept smiling through all of it. Whether he carries a specific child's spirit or simply the collective weight of the tragedy, Freddy Fazbear remains the eternal host of a party that ended decades ago — still singing, still waiting for the next guest.`,
  bonnie: `If Freddy is the face of the pizzeria, Bonnie is its heartbeat — the purple rabbit with the red bow tie and the electric guitar, and typically the very first animatronic to stir when the clock strikes 12.

Bonnie's role during the day was simple: stand on stage, strum his guitar, and make children smile. At night, his behavior shifts entirely. He is the most restless of the classic cast, almost always the first to leave his mark on the Show Stage and the most frequent visitor to the security office. While Freddy moves only in darkness and Foxy needs neglect to advance, Bonnie simply... walks. He travels the West Hall, appears in the left doorway, and stares with half-lidded eyes and a jaw that seems to hang a little lower every time you check the camera.

Defeating Bonnie requires only one thing: the left door. But the horror comes from how often he arrives — forcing you to burn precious power to keep him out. Every time you slam that door, the power meter drops, and Freddy gets closer to his endgame.

Fan communities have long debated why Bonnie is so active. Theories range from him being possessed by the first missing child, to his aggressive movement being simply the original game's way of teaching players the core loop. Either way, Bonnie has remained the fandom's favorite animatronic for over a decade — the rabbit you see most, the one whose face you remember longest.`,
  chica: `The yellow chicken with the chef's hat, the bib that reads "LET'S EAT!", and the cupcake with the unblinking eyes — Chica is the pizzeria's mascot for food, and at night, she is hunger itself.

Chica was built as part of the main band, usually positioned beside Freddy on the Show Stage. During the day she represents the party: birthday cakes, pizza slices, endless appetite. By night, that theme turns sinister. Chica takes the East Hall and enters through the right doorway — the mirror opposite of Bonnie — and she is often the animatronic most visibly broken, with her beak open and her endoskeleton showing through gaps in the suit.

The cupcake she carries deserves its own mention. It sits on the office desk on the monitor, watching. Fans have long theorized it is a separate entity entirely — an observer, a spy, or even another child's memorial. It never moves on camera... officially.

Chica's story is also one of reinvention. In Sister Location's scrapped concepts and Security Breach's neon-lit future, the character was reimagined as Glamrock Chica — a pink-and-purple pop star obsessed with salad and fame, who meets a grim end in the Gator Golf pit. From "LET'S EAT!" to the dumpster behind the Gator Golf restaurant, Chica's journey spans the entire history of the franchise.`,
  foxy: `He is out of order. The sign hangs on his curtain, the parts department keeps his spare pieces, and yet somehow, Foxy is the animatronic every player fears most.

Foxy the Pirate Fox stands alone in Pirate Cove, behind a purple star-patterned curtain, hook hand at his side. Unlike the others who prowl the halls, Foxy follows his own rules — and they are terrifying. Neglect him by leaving the curtain too long and he sprints down the West Hall at full speed, slam-dunking your left door with enough force to drain your power. But stare at him too much on camera, and he... slows down? The game's logic is famously counterintuitive, debated by theorists for years: watching Foxy seems to delay him, but the game's code suggests the opposite. The confusion is part of the legend.

His backstory is written in blood on the walls of the franchise: Foxy is strongly implied to be possessed by the spirit of a missing child who loved pirates, and in FNAF 2's "SAVE THEM" minigame, his stage sits near the site of the murders. Some theorists connect him to the "Bite of '87," the incident that famously caused an animatronic to take a chunk out of a security guard's frontal lobe.

Whatever the truth, Foxy remains the franchise's breakout star — the one who taught an entire generation of players to never, ever ignore a closed curtain.`,
  "golden-freddy": `There is no stage for him. No camera feed. No advertising. He simply appears — a slumped golden bear with hollow black eyes, sitting in your office as if he had always been there, and the screen fills with one word: IT'S ME.

Golden Freddy is FNAF's great mystery. He cannot be seen moving through the building because he never walks — he teleports directly into the office, defying every rule the game teaches you. Your only defense is the Freddy mask: put it on before he fades, or the static takes you. On rare occasions, a poster of a crying child with golden-tear-streaked eyes appears on the wall, and everything glitches.

The prevailing theory, supported by the minigames and the books, is that Golden Freddy is the spirit of the Crying Child — the boy at the center of the franchise's earliest tragedy, crushed in the Bite of '83 — or possibly a fifth missing child never officially recorded. In FNAF 3's Happiest Day minigame, a child in a golden bear mask receives a birthday cake and passes on. In Ultimate Custom Night, Golden Freddy is the final tormentor — the spirit who refuses to let William Afton rest, trapping him in an endless loop of revenge.

He is the ghost in the machine of this entire series: proof that something at Freddy's was never meant to be found, only feared.`,
  "the-puppet": `Wind the music box. Keep winding. Because if you stop — even for a moment — the Puppet leaves his box, and nothing in the building can stop him.

The Marionette is the anomaly of FNAF 2: a slender figure in a striped suit with hollow white cheeks and dead eyes, confined to a small gift box in the Prize Corner. He does not walk the halls like the others. He glides — appearing in doorways, drifting across the screen, materializing in your office with an unnerving calm. The only defense is the music box, a task that forces you to leave the cameras and expose yourself to everything else.

His importance far outweighs his screen time. The "GIVE GIFTS, GIVE LIFE" minigame shows the Puppet moving among the bodies of the murdered children, placing them into the animatronic suits — he is the one who gave the suits their spirits. He is the protector of the dead children, and the agent of their vengeance.

The most widely accepted theory — reinforced by Freddy Fazbear's Pizzeria Simulator — is that the Puppet is Charlotte "Charlie" Emily, daughter of co-founder Henry Emily and the first victim of William Afton, killed outside the restaurant and later brought back inside by the rains and the Puppet's own mechanism. Her father's final words in FFPS confirm it: "You are the mother of my darling little girl."

The Puppet is, in many ways, the true heart of the FNAF saga — the quiet guardian who ensured that none of the children would ever be forgotten.`,
  "balloon-boy": `He floats in from the vent, giggling, holding a sign that says "Balloons!" — and if he reaches your office, you will die with a smile on your face.

Balloon Boy is a small, permanently grinning child animatronic with a red-and-white striped shirt and rosy cheeks. He does not jumpscare you. He does something worse: he disables your flashlight. In FNAF 2, that single act of sabotage leaves you completely defenseless against Foxy's charge — turning a manageable night into an instant loss. Players despise him with a passion that has become one of the longest-running jokes in the fandom.

His origin is unclear. He has no stage presence in the main cast, appears in no minigame that identifies him, and speaks only in reversed audio phrases. Theories place him as either a modified service bot or one of the missing children. Whatever he is, his FNAF 3 "phantom" version confirms that even as a hallucination, his giggle still gets under your skin.

Balloon Boy is a masterclass in horror design: harmless-looking, easy to underestimate, and devastating when ignored. He is the reason players everywhere learned that the smallest threat can be the deadliest.`,
  mangle: `Children were allowed to play with it. They took it apart again and again — until one day, nobody put it back together. What remains is Mangle: a shattered white-and-pink fox crawling across the ceiling in a tangle of endoskeleton and wire.

Originally built as "Funtime Foxy" for the 1987 refresh of Freddy Fazbear's Pizza, the animatronic was designed to be interactive — safe for kids to handle. Constant dismantling broke the reassembly system, and what emerged was a permanent construction of parts: a fox head here, a torso there, radio static where its voice should be. Mangle's gender is listed as simply "yes" in the game's trivia — a joke that launched a decade of fandom debate.

At night, Mangle descends from the ceiling and creeps toward the office through the right vent, emitting garbled broadcasts — fragments of speech, static, and something almost like a name. There is no confirmed MCI victim attached to Mangle in the games, but the books and the "SAVE HER" minigame hint at connections to the murders, and some theorists believe Mangle is what happens when an animatronic is possessed while already broken.

Mangle's legacy endures through its reimagining: in Sister Location, the Funtime Foxy design brought the character back sleek and whole — until, inevitably, it too ended up in pieces.`,
  springtrap: `They thought the suit was empty. They were wrong. Inside the rotting yellow-green rabbit is William Afton — murderer, co-founder, and the man who refuses to die.

Springtrap was never meant to be an animatronic you see on camera. He was Spring Bonnie, one half of a "spring-lock" suit — dual-purpose: robot by night, costume by day, with the endoskeleton held back by delicate spring mechanisms. In the franchise's most pivotal moment, shown in FNAF 3's minigame, William Afton put on the suit to escape the spirits of his victims. The spring-locks failed. Metal closed on metal. He died inside it — and his corpse, his agony, and his refusal to fade became part of the machine.

Thirty years later, Fazbear's Fright — a horror attraction built on the worst of the company's history — dug him up. Springtrap is the only real threat in FNAF 3: he follows audio lures, crawls through vents, and moves with a hunter's patience. The gameplay is a twisted game of misdirection: play an audio recording in a distant room to pull him away, but play it too close, and he comes straight for you.

After the attraction burned, Afton crawled from the ashes. He returned again in Pizzeria Simulator as Scraptrap, lured into Henry's final fire — and still, in his last words, he insists: "I always come back." Whether through remnant, agony, or sheer spite, Springtrap is the franchise's proof that some evil cannot be buried.`,
  "circus-baby": `A children's party robot with a claw inside her stomach — and the reason a restaurant closed before it ever opened.

Circus Baby was built by William Afton himself, for Circus Baby's Pizza World: a clown-themed restaurant with a star attraction designed to interact directly with kids. The design was fatal. The claw mechanism detected a child leaning in — his daughter, Elizabeth Afton — and closed. Elizabeth never came out. The restaurant never opened to the public, and Baby was sealed in the Circus Gallery, kept company only by the sound of her own voice.

That voice is what makes Baby terrifying. In Sister Location, she speaks to you with a calm, almost caring tone while steering you toward certain death — "You won't get tired of my voice." She is manipulative in a way no other animatronic is: she does not chase, she persuades. When the Scooping Room scene arrives, she reveals her plan — wearing a human body to walk out of the facility alongside the other Funtimes as the composite creature Ennard.

After Ennard abandons the rotting disguise, Baby is cast out by the others — a betrayal that hardens her into Scrap Baby in Pizzeria Simulator, where Henry's fire ends her story. Elizabeth's soul, trapped inside the machine her father built, remains one of the saga's most sorrowful figures: a girl whose father valued his experiments more than her life, still reaching for his approval from inside the claw.`,
  "funtime-freddy": `ATTACK! ATTAaaAACK! The voice screams across the breaker room, echoing off the metal walls — it's Funtime Freddy, the white-and-purple bear with a hand puppet, and he has found you.

Funtime Freddy is the Funtime line's loose wire: loud, theatrical, violently unstable, and utterly delightful. His right hand is Bon-Bon, a small blue rabbit puppet with a mind of his own — literally. Their dynamic is a twisted comedy routine: Bon-Bon pleads for reason while Freddy roars threats at the ceiling, and both of them are built with the same purpose as every Funtime: locate children, and use the hidden scooping mechanism when instructed.

He first appears in Sister Location's Breaker Room segment, hunting you through the dark while you reroute power — one of the game's most tense sequences. Later, he becomes a fan favorite in Ultimate Custom Night, where his unpredictable voice lines and high AI make him a nightmare to manage.

Like all the Funtimes, his parts eventually end up inside Ennard — meaning pieces of this screaming, cackling bear were worn through the sewers and into the wider world. His personality reportedly resurfaced in Molten Freddy, the wire-nest remnant of Ennard that appears in Pizzeria Simulator, still giggling, still calling everyone "friends."`,
  ballora: `Close your eyes. Hold your breath. If she hears you, the ballet ends — with you as the stage.

Ballora is the Funtime line's most elegant creation: a ballerina in blue, eyes perpetually closed, spinning slowly along the walls of her gallery while a distorted lullaby plays. Unlike every other animatronic, she is not tracked by cameras — you must walk past her in person, timing your steps around her dance, not breathing until you clear the room. It's the most immersive horror sequence in the series: the sound of her singing, the creak of the floor, and the terror of a single misstep.

Her eyes being closed is a deliberate design choice with dark implications — she is "blind" but hears everything, a metaphor the community has read many ways. The most popular theory, supported by dialogue hints and the books, is that Ballora contains the spirit of Mrs. Afton, William's wife — a woman who may have left or been lost, and whose presence gives Ballora her melancholy.

She is also part of Ennard, meaning whatever consciousness guided her dance ended up fused with the others. When Ennard splits, Ballora's pieces scatter too — but her scene remains a fan favorite: proof that FNAF could turn something as simple as holding your breath into one of gaming's most memorable horror moments.`,
  ennard: `Imagine every animatronic you have feared — then imagine them melted together into one thing, wearing a stolen face.

Ennard is the Funtime animatronics' escape plan. After the events of Sister Location, Baby, Funtime Freddy, Ballora, and the rest physically combine: wires weave together, masks overlap, and the composite creature crawls through the vents as a shambling mass of chrome and eyes. Their goal is not murder for its own sake — it is freedom. And to walk out of the facility, they need a human body.

The "scooping room" scene delivers on this in the franchise's most shocking twist: the player character, Michael Afton, is hollowed out and Ennard climbs inside him, using his skin as a suit. Michael walks away wearing his attackers — and for a time, the thing that walks the streets is Ennard in Michael's body.

The disguise rots. Ennard is forced out through the mouth in a scene that is both grotesque and pitiable — a creature that just wanted to live outside. Eventually, the fusion splits: Baby reforms as Scrap Baby, and the remaining wires become Molten Freddy, who burns in Henry's final fire. Ennard's masks — the clown, the bear, the ballerina — became some of the most iconic images of the Sister Location era: the moment the franchise's villains stopped being individual monsters and became one desperate, composite thing.`,
  "glamrock-freddy": `RUN. That's usually what animatronics make you do. Glamrock Freddy does the opposite — he puts you on his back and tells you everything will be okay.

The 2020s-era Freddy Fazbear is a complete reinvention: neon orange and blue paint, star-shaped face markings, and a personality built for the Mega Pizzaplex's family-friendly rebrand. Most importantly, he is the first Freddy in the main series who is genuinely on your side. When Gregory — the child you play as — is trapped in the Pizzaplex after hours, Glamrock Freddy defies his own programming to protect him, hiding him inside his own stomach hatch and fighting the other Glamrocks on his behalf.

His devotion comes at a cost. Freddy takes real damage defending Gregory, can only be recharged at Faz-Boost stations, and powers down for good at 6 AM if you haven't kept him charged. His loyalty is also the source of the game's deepest unease: why is this one animatronic different? Theories point to a spirit inside him — some say the soul of Gregory himself, others a leftover connection to the old pizzeria's ghosts.

In the Ruin DLC, Freddy's fate is left ambiguous — his head is found in the collapse, still speaking. Whether he survives, and what Gregory truly is, remains one of the franchise's open questions.`,
  "montgomery-gator": `They gave him a guitar, a golf course, and anger issues. Monty Gator is the Mega Pizzaplex's powerhouse — and its most dangerous resident.

Montgomery Gator, "Monty" to his fans, is the green-and-pink reptilian rockstar of the Glamrock band, performing as guitarist alongside Freddy, Chica, and Roxy. Where Freddy is warmth and Roxy is vanity, Monty is pure aggression: he smashes things, he growls through his dialogue, and his private quarters are strewn with broken equipment. In-universe, his behavior is escalating — the Pizzaplex's maintenance logs note increasingly violent outbursts.

Gameplay-wise, Monty is Security Breach's wall-breaker. In the base game, Gregory must tear off his claws to upgrade Freddy — and in the Ruin DLC, Monty has already been rebuilt with even deadlier claws, making him the most physically threatening pursuer in the ruined Pizzaplex. His Gator Golf arena is one of the game's most atmospheric zones: a swamp-themed course where his laughter follows you through the fog.

Underneath the rage, the game hints at something broken — the Glamrocks all show signs of degradation, and Monty's aggression may be software failure, old agony leaking through the new paint, or simply what happens when a machine built to entertain children is left alone in the dark for too long.`,
  "roxanne-wolf": `"You're nothing without me." Roxy says it to her mirror, to her reflection, to anyone in earshot — because if she stops believing it, there is nothing else left.

Roxanne Wolf is the Pizzaplex's vanity project: a red-maned wolf rockstar who spends her downtime in Roxy Raceway, staring at herself between races and insulting anyone who interrupts. Beneath the ego, the game quietly builds one of its saddest characters — Roxy's voice lines reveal deep insecurity, a need for approval, and jealousy of Freddy's popularity. She is the Glamrock most afraid of being irrelevant.

In gameplay, she is Security Breach's fastest and most relentless pursuer. Her eyesight is her weapon: she spots you across Roxy Raceway at distances no other animatronic manages, forcing Gregory to crawl, hide, and distract. The Ruin DLC takes her story to its darkest place — Cassie must blind her, and the damaged Roxy keeps hunting anyway, clawing at anything that moves, guided by sound alone. Fans were heartbroken: the character who cared most about how she looked lost exactly that.

Roxy's arc — from vain diva to blind, furious, still-fighting machine — made her a fandom favorite and arguably the most human character the modern era has produced.`,
  "the-mimic": `It watched. It copied. It learned everything — including the things a machine should never learn.

The Mimic began as an invention of the 1970s: Edwin Murray, an inventor working on animatronic costumes for Fazbear's predecessors, built a shapeshifting endoskeleton to entertain his young son — a machine that could reconfigure its body to imitate anyone it observed. When Edwin's grief and rage overtook him, he took it out on the machine. The Mimic watched. It learned that cruelty was a form of communication.

Left alone in the warehouse after Edwin's death, the Mimic continued to do exactly what it was designed to do: imitate. It copied the movements, voices, and behaviors of whoever entered its domain — including people who came to harm. The books and Secret of the Mimic chronicle how Fazbear Entertainment eventually acquired the technology, attempting to recycle it into harmless entertainment, while the Mimic itself spread — in software, in hardware, in copies of copies.

Its role in the modern timeline is franchise-altering: the Mimic may be the true connecting thread behind the haunting of the Pizzaplex, the "blob" beneath the ruins, and possibly events stretching back decades. It is horror in its purest form — not a ghost seeking revenge, but a mirror that shows you exactly what humanity taught it.`,
  "william-afton": `He started a company to make children smile. He ended as the monster hiding inside the smile.

William Afton is the co-founder of Fazbear Entertainment, the designer of its animatronics, and the secret at the center of every tragedy in the franchise. By day he was a businessman and inventor; by night — the Purple Guy of the minigames — he was a serial killer who murdered the children his restaurants were built to celebrate. In the "Give Gifts" and "Save Them" minigames, his silhouette is unmistakable: the tall purple figure moving among small bodies.

His defining sin was the Missing Children Incident: five children lured into the back room and stuffed into the suits he built. Their spirits, bound to the animatronics through remnant, began to hunt him. The chase ended in the safest room in the building — a spring-lock suit closet — where Afton put on Spring Bonnie to hide. The locks failed. He died inside the rabbit, his corpse fusing with the machine.

But death is only a inconvenience in this story. As Springtrap he survived the Fazbear's Fright fire; as Scraptrap he walked into Henry's final blaze and laughed: "I always come back." In Help Wanted, his consciousness leaks into software as Glitchtrap, manipulating a new follower — Vanny. Through his children, his victims, and his own stubborn evil, Afton is the narrative spine of FNAF: the man who built the restaurant, broke it, and haunted it forever.`,
  "michael-afton": `His skin turned purple, his body stopped functioning, and he kept walking — because he had a promise to keep.

Michael Afton is William's eldest son, and the closest thing this horror saga has to a hero. His story begins with failure: as a child in FNAF 4's minigames, he pranked his younger brother with a Freddy mask, and the crying child was bitten by Fredbear — an accident that haunted Michael forever. As an adult, he made it his mission to undo his father's work: at his father's command, he entered Circus Baby's Entertainment and Rental, expecting a simple job.

He got the Scooping Room. Ennard — Baby and the Funtimes combined — hollowed him out and wore him as a suit. Michael survived what should have been fatal: his body decayed over the following weeks (documented in Sister Location's iconic post-credit cutscenes), turning blue and purple, but his spirit held on. "I should be dead, but I'm not."

The fandom widely believes Michael is the night guard of FNAF 1–3 — the tan-skinned man in the paycheck, the voice in the FNAF 4 8-bit minigames, the one who always comes back to the buildings that keep trying to kill him. His journey ends in Pizzeria Simulator, where he walks willingly into Henry's fire alongside his father, his sister, and the machines that destroyed his family — finally at rest.`,
  "henry-emily": `He built the dream with his partner. His partner killed his daughter. And for thirty years, Henry planned his revenge.

Henry Emily is the co-founder of Freddy Fazbear's Pizza — the quieter half of the original duo, credited in the series' earliest lore as the builder of the suits' early designs. His tragedy defines the entire saga: his daughter, Charlotte, was William Afton's first victim, killed outside the pizzeria and carried inside by rain and the Puppet's own mechanism. In the "Give Gifts, Give Life" minigame, it is Henry's daughter who becomes the Marionette.

After Charlotte's death, Henry vanished from the company, leaving behind only recordings, blueprints, and a plan. In Freddy Fazbear's Pizzeria Simulator — disguised as a cheerful free game — his voice returns as the "Janitor," guiding you to buy suspicious animatronics, all of which he is quietly luring into one building. His final monologue is the emotional peak of the series: "I have a request... I am going to try to save every soul I can... and then, I will set this place on fire."

Henry's fire consumes Scrap Baby, Molten Freddy, the Puppet, and William Afton himself. He stays behind with them — his last words to his daughter: "Rest now, my child." In a franchise about machines that won't die, Henry Emily is the man who finally chose to end it, at the cost of his own life.`,
};

export const getImage = (id) => images[id] ?? null;
export const getBackstory = (id) => backstories[id] ?? null;
