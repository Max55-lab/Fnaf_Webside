// In-world wire dispatches for the newsroom trickle.
//
// These are fictional, Fazbear-flavored stories that trickle into the top of
// the newsroom while you browse (see Newsroom.jsx). They carry the same
// fields as news.json items so the existing cards render them untouched.
// `image` only references artwork that already exists in public/art; leave it
// null and the card falls back to the mono source tile.

export const DISPATCHES = [
  {
    id: "dispatch-stock-tick",
    title: "Fazbear Entertainment stock ticks up on ‘nostalgia cycle’ rumor",
    source: "Dixie County Herald",
    sourceType: "outlet",
    url: "#/games/fnaf-1",
    iso: "2026-10-28T01:12:00.000Z",
    image: "game-fnaf-1",
    tag: "Franchise",
    summary:
      "Shares climbed 4 percent in after-hours trading as analysts pointed to a ‘collectible nostalgia cycle’ surrounding the original 1993 pizzeria brand. One firm advised caution: ‘The balance sheet has too many line items simply labeled parts.’",
  },
  {
    id: "dispatch-odor-closure",
    title: "Local pizzeria closes after ‘odor complaint’ from next-door laundromat",
    source: "Dixie County Herald",
    sourceType: "outlet",
    url: "#/games/fnaf-1",
    iso: "2026-10-27T22:40:00.000Z",
    image: null,
    tag: "Franchise",
    summary:
      "Inspectors sided with the laundromat after ‘an odor no amount of detergent can mask’ drifted through the shared wall. The owner insists the smell is ‘legacy character’ and plans to reopen under new management.",
  },
  {
    id: "dispatch-maker-fair",
    title: "Fan-built Foxy animatronic wins ‘Best in Show’ at regional maker fair",
    source: "Pizzaplex Insider",
    sourceType: "creator",
    url: "#/characters/foxy",
    iso: "2026-10-27T19:05:00.000Z",
    image: "fan",
    tag: "Community",
    summary:
      "Judges praised the hand-wired endoskeleton and ‘an alarming but technically impressive’ hook servo. The builder says the curtain-opening mechanism alone took eleven months and ‘one very brave friend’ to test.",
  },
  {
    id: "dispatch-fazcam-recall",
    title: "‘Faz-Cam’ baby monitor line recalled after units keep recording at night",
    source: "Fazbear Entertainment PR",
    sourceType: "official",
    url: "#/play",
    iso: "2026-10-27T15:30:00.000Z",
    image: "cam-1a",
    tag: "Franchise",
    summary:
      "The company asks customers to ‘disregard any footage recorded between midnight and 6 AM,’ calling it a ‘firmware scheduling quirk.’ Parents report the devices also hum the Toreador March at 3 AM. Firmware fix pending.",
  },
  {
    id: "dispatch-toreador-ad",
    title: "Toreador March re-recorded for holiday ad campaign; fans divided",
    source: "Pizzaplex Insider",
    sourceType: "creator",
    url: "#/media",
    iso: "2026-10-27T11:18:00.000Z",
    image: null,
    tag: "Franchise",
    summary:
      "The new arrangement swaps the tuba section for synths ‘to feel cozier.’ Longtime fans have started a petition to restore the original recording, currently sitting at 14,000 signatures and one very loud accordion cover.",
  },
  {
    id: "dispatch-speedrun",
    title: "Security Breach speedrun record falls to 3 minutes 41 seconds",
    source: "Pizzaplex Insider",
    sourceType: "creator",
    url: "#/games/security-breach",
    iso: "2026-10-27T08:47:00.000Z",
    image: "game-security-breach",
    tag: "Games",
    summary:
      "The new route skips the entire daycare section using a door-clip that runners say ‘is either frame-perfect or deeply unfair.’ Video proof is under review; moderators have already asked everyone to stop tagging the animatronics in the comments.",
  },
  {
    id: "dispatch-boxed-set",
    title: "New imprint announces complete ‘Tales from the Pizzaplex’ boxed set",
    source: "Fazbear Field Journal",
    sourceType: "outlet",
    url: "#/lore",
    iso: "2026-10-26T21:00:00.000Z",
    image: "book-tales-pizzaplex",
    tag: "Books",
    summary:
      "The collector’s edition adds forewords, an index of recurring locations, and a fold-out Pizzaplex map ‘for cross-referencing incidents you were definitely not supposed to connect.’ Pre-orders open next month.",
  },
  {
    id: "dispatch-museum-exhibit",
    title: "Museum exhibit of 1983 pizzeria artifacts sells out opening month",
    source: "Dixie County Herald",
    sourceType: "outlet",
    url: "#/characters/the-puppet",
    iso: "2026-10-26T17:25:00.000Z",
    image: "endo",
    tag: "Community",
    summary:
      "Curators describe the collection as ‘a time capsule with opinions,’ featuring a restored prize counter and one sealed cabinet labeled only ‘do not open during tours.’ Extra weekend slots are being added.",
  },
  {
    id: "dispatch-family-night",
    title: "Freddy Fazbear’s Pizza announces Family Night — organizers urge ‘daylight attendance’",
    source: "Fazbear Entertainment PR",
    sourceType: "official",
    url: "#/characters/freddy-fazbear",
    iso: "2026-10-26T13:10:00.000Z",
    image: "cupcake",
    tag: "Franchise",
    summary:
      "Free cupcakes with every ticket and ‘enhanced lighting in all hallways.’ The press release makes no mention of the evening program, stating only that ‘the show will go on as scheduled.’",
  },
  {
    id: "dispatch-film-production",
    title: "Film sequel enters production; studio teases ‘practical animatronics again’",
    source: "Fazbear Field Journal",
    sourceType: "outlet",
    url: "#/media",
    iso: "2026-10-26T09:55:00.000Z",
    image: "film-fnaf-movie-2",
    tag: "Film",
    summary:
      "Production has quietly started with the original suit-building team returning. Sources say the set ‘smells like latex and ambition,’ and that filming will again favor physical props over CGI wherever the plot allows.",
  },
];

export default DISPATCHES;
