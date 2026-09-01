/** House card. If it is not here, it is not the ranking. */

export const HOUSE = 96;

export const SCORED = "2026-08-29";

export type LoopStatus = "earned" | "acquired" | "potential" | "locked";
export type GapSize = "big" | "small";

export type Loop = {
  id: string;
  name: string;
  status: LoopStatus;
  score: number;
  note: string;
};

export type Skill = {
  id: string;
  name: string;
  status: LoopStatus;
  note: string;
};

export type Surface = {
  href: string;
  name: string;
  score: number;
  kind: "game" | "desk" | "card" | "lab";
  note: string;
};

export type Gap = {
  id: string;
  size: GapSize;
  title: string;
  note: string;
};

/**
 * Brutal 96. Last cards: 54 → 58 → 67 → 69 → 83 → 90 → 94 → 96.
 * Weighted: 96*0.34 + 94*0.12 + 94*0.12 + 98*0.12 + 96*0.08 + 96*0.08
 * + 94*0.05 + 96*0.05 + 94*0.04 = 95.58 → 96.
 * 88 waits on a stranger sending the PNG. 100 is a sportsbook with faces.
 * Unfurl stays locked. The table is two tabs plus a snapshot, not a mesh.
 */
export const LOOPS: Loop[] = [
  { id: "machine", name: "Play the machine", score: 96, status: "earned", note: "Pull, rip, walk. Night strip. Land and rip are distinct. Ceiling is taste, not 2K." },
  { id: "share", name: "Share the card", score: 94, status: "earned", note: "Prefetch PNG. Iframe trays. Files never +url. Gesture-safe share. Unfurl is still generic." },
  { id: "walk", name: "The card is a URL", score: 94, status: "earned", note: "Walk page is the poster. Attempts are lines. og stays generic." },
  { id: "tuesday", name: "Tuesday desk", score: 98, status: "earned", note: "W35 is a file. Grafs pick one job. Archive 001–004." },
  { id: "daily", name: "Daily streak", score: 96, status: "earned", note: "Seven holes on home and Daily. The streak is in the file." },
  { id: "wall", name: "The wall", score: 96, status: "earned", note: "Walks you sent hang here. Device only. No PII." },
  { id: "newsletter", name: "The brief as newsletter", score: 94, status: "earned", note: "One job per week. House WalkCard. No email." },
  { id: "dynasty", name: "Dynasty", score: 96, status: "earned", note: "KEEP five hashes the week. A W five walks WNBA." },
  { id: "challenge", name: "Beat the walk", score: 94, status: "earned", note: "Attempts are lines. Ghost nights on the poster. No fake strangers." },
  { id: "wnba-loop", name: "WNBA as a walk", score: 96, status: "earned", note: "Forty nights. KEEP five in the W. House five is the W." },
  { id: "file", name: "The file is the account", score: 92, status: "acquired", note: "First lock says the house is the file. Empty home offers Import. Auth stays off." },
  { id: "binder", name: "The binder", score: 82, status: "acquired", note: "Spread turns. Spine strip. Reduced-motion is a pager." },
  { id: "watch", name: "Watch the night", score: 80, status: "acquired", note: "Last-8 writes lastScrub. Gym loads that night. Not 2K." },
  { id: "table", name: "The table", score: 72, status: "acquired", note: "BroadcastChannel. Snapshot path. Remaining capped at 40. Not live." },
  { id: "return", name: "Tuesday return", score: 84, status: "acquired", note: "Mark, house WalkCard, streak holes, Next Tape. Empty Play is 82-0 + Daily." },
];

export const SKILLS: Skill[] = [
  { id: "reel", name: "CSS 3D cylinder", status: "earned", note: "Clip on the window. Perspective on .reel-scene." },
  { id: "pack", name: "Pack-rip", status: "earned", note: "Ten face-down. GOAT rips too. Corners is dealt. 16-0 rips ten." },
  { id: "seed", name: "Same-five walks", status: "earned", note: "Same five, same 82. WNBA is 40." },
  { id: "crests", name: "House crests", status: "earned", note: "30 NBA + 13 WNBA. SVG = canvas." },
  { id: "type", name: "Night type", status: "earned", note: "Fraunces (WONK italic monogram) + Instrument Sans. Tokens only." },
  { id: "plates", name: "Anonymous plates", status: "earned", note: "36 stills. First six unmoved." },
  { id: "png", name: "Ink poster PNG", status: "earned", note: "Share sends the file. Brief, trade, keepers, slate print too." },
  { id: "walk-v2", name: "Walk v2", status: "earned", note: "goat / playoff / wnba. Attempt cards." },
  { id: "nights-save", name: "Nights in the save", status: "earned", note: "VERSION 6. Scores round-trip. exportedAt." },
  { id: "position-pack", name: "Position-dealt pack", status: "earned", note: "dealCornersPack 2G 2F 1C." },
  { id: "house-five", name: "House-five truth", status: "earned", note: "Copy matches. Yesterday is a WalkCard." },
  { id: "issue-gen", name: "Issue generator", status: "earned", note: "W40 writes. First sentence is not W41. 001–004 stay archive." },
  { id: "share-files", name: "Share the file", status: "earned", note: "Send the card. Copy PNG where allowed." },
  { id: "night-scrub", name: "Night scrub", status: "earned", note: "Crest. Night n. Dots pick. Ticker is opt-in." },
  { id: "goat-pack", name: "GOAT pack-rip", status: "earned", note: "Default is ten face-down. Circle recap of five peaks. Book is a door." },
  { id: "tick", name: "Tick / haptic", status: "earned", note: "Land is 50ms. Rip is a quieter 100ms saw." },
  { id: "book", name: "The book", status: "acquired", note: "251 names. Editorial peaks." },
  { id: "export", name: "Studio file", status: "acquired", note: "First lock downloads and says so. Clipboard JSON." },
  { id: "snake", name: "Need-first snake", status: "acquired", note: "KEEP changes need. Two tabs can snake." },
  { id: "week", name: "Week key desks", status: "acquired", note: "Authored W35. Live issue + WNBA house walk." },
  { id: "keepers-book", name: "Keeper book", status: "earned", note: "KEEP five this week. Walk this five. Recap PNG." },
  { id: "issues", name: "Issue archive", status: "earned", note: "001–004 plus generated weeks." },
  { id: "binder", name: "Binder flip", status: "acquired", note: "Spread turns. Spine. Reduced-motion pager." },
  { id: "public-wall", name: "Public house wall", status: "earned", note: "Fourteen posters. Names. Send." },
  { id: "table-channel", name: "Table channel", status: "earned", note: "BroadcastChannel. Snapshot path. Remaining 40." },
];

export const POTENTIAL: Skill[] = [
  { id: "notify", name: "Tuesday ping", status: "potential", note: "ICS exists. No push." },
  { id: "p2p", name: "Two tabs", status: "potential", note: "Two tabs work. Mesh relay stays off." },
  { id: "more-plates", name: "More stills", status: "potential", note: "36 crops / 251 names." },
  { id: "stranger", name: "Stranger proof", status: "potential", note: "Path is one tap. Nobody has sent it yet." },
];

export const LOCKED: Skill[] = [
  { id: "auth", name: "Accounts", status: "locked", note: "Saves live on this device. Export the studio file to carry them." },
  { id: "logos", name: "League logos", status: "locked", note: "House crests only." },
  { id: "faces", name: "Likenesses", status: "locked", note: "Plates and initials. The serial is the print." },
  { id: "bookie", name: "Sportsbook", status: "locked", note: "Marks. Not a line you can bet." },
  { id: "ncaa", name: "NCAA / recruiting", status: "locked", note: "The Board stays fictional." },
  { id: "tape-video", name: "Highlight tapes", status: "locked", note: "Overlays, not clips." },
  { id: "sisters", name: "Sister houses", status: "locked", note: "They stay separate." },
  { id: "og", name: "Custom walk unfurl", status: "locked", note: "The PNG already leaves. The URL opens in the house." },
  { id: "nft", name: "Player stock / NFT", status: "locked", note: "The Tape is a mark, not a token." },
  { id: "two-k", name: "Possession engine", status: "locked", note: "The nights wander. The poster is the point." },
];

export const SURFACES: Surface[] = [
  { href: "/games/82-0", name: "Build an 82-0", score: 96, kind: "game", note: "Thunder foil. Rip. Send. The five is marked. Same nights." },
  { href: "/games/daily", name: "Daily Bucket", score: 96, kind: "game", note: "Same pack every calendar day. Rip five. Walk." },
  { href: "/games/corners", name: "Four corners", score: 88, kind: "game", note: "The pack deals G/G/F/F/C. Then 82 nights." },
  { href: "/games/wnba", name: "WNBA walk", score: 92, kind: "game", note: "A W club. Forty nights. Honest length." },
  { href: "/games/goat", name: "GOAT Five", score: 92, kind: "game", note: "Five names. No franchise. No era." },
  { href: "/games/16-0", name: "Build a 16-0", score: 90, kind: "game", note: "Four series. Lose one, the run is over." },
  { href: "/", name: "Home desk", score: 94, kind: "desk", note: "One CTA. Rip the pack. The walk is a URL." },
  { href: "/tape", name: "The Tape", score: 88, kind: "desk", note: "Redirects into the Thunder room. Off the loop." },
  { href: "/brief", name: "Brief Desk", score: 94, kind: "desk", note: "The week in one issue. House walk on the page." },
  { href: "/slate", name: "The Slate", score: 86, kind: "desk", note: "Start, sit, or stream. Printed to the week." },
  { href: "/shop", name: "The Press", score: 90, kind: "card", note: "Proofs of walks you locked. Export the sheet." },
  { href: "/wall", name: "The Wall", score: 96, kind: "card", note: "Walks you sent. Device only." },
  { href: "/keepers", name: "Keeper Desk", score: 94, kind: "desk", note: "KEEP fills this week’s five. Then walk them." },
];

export const GAPS: Gap[] = [
  { id: "unfurl", size: "big", title: "Walk URLs unfurl the house card", note: "One 1200×630 JPEG 97KB. x-banner 50:11. Injector owns og:*. Walk titles name the five. Send the PNG." },
  { id: "stranger-proof", size: "big", title: "No stranger has sent the card", note: "Path is one tap. Not proven. 88 waits here." },
  { id: "more-stills", size: "small", title: "Crops split the stills", note: "36 paths stay. Nine crops each. Collisions drop." },
  { id: "streak-dies", size: "small", title: "The house can still die with the browser", note: "Backup copy on write. Persist asked. Auth stays off. Walk URL is the account." },
  { id: "board-thin", size: "small", title: "Board is six demos", note: "Redirects into the Thunder room. Do not expand into NCAA." },
  { id: "silent-cap", size: "small", title: "Caps are labeled, still tight", note: "24 runs. 48 walks." },
];

export const RANKED_NEXT = [
  "A stranger sends the PNG. That is the 88.",
  "Unfurl stays one house card. The PNG already leaves. The walk title names the five.",
  "Do not add auth. Do not add 2K. Do not add NCAA. Do not add a book.",
] as const;

export function loopsByStatus(status: LoopStatus) {
  return LOOPS.filter((row) => row.status === status);
}

export function gapCount(size: GapSize) {
  return GAPS.filter((row) => row.size === size).length;
}
