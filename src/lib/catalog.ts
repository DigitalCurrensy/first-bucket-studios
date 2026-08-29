export const TABS = ["Games", "Fantasy", "Dynasty", "In-Season", "Lab"] as const;

export type Tab = (typeof TABS)[number];

export type Product = {
  href:
    | "/games/82-0"
    | "/games/daily"
    | "/games/goat"
    | "/games/16-0"
    | "/keepers"
    | "/shop"
    | "/brief"
    | "/tape"
    | "/fantasy"
    | "/slate"
    | "/trade"
    | "/mock"
    | "/board"
    | "/gym";
  tab: Tab;
  kicker: string;
  title: string;
  body: string;
  image: string;
  badge?: "Popular" | "New" | "Daily";
};

export const PRODUCTS: Product[] = [
  {
    href: "/games/82-0",
    tab: "Games",
    kicker: "Game",
    title: "Build an 82-0",
    body: "One pull. Three strips. Rip ten. The season walks.",
    image: "/cards/arena.jpg",
    badge: "Popular",
  },
  {
    href: "/games/goat",
    tab: "Games",
    kicker: "Game",
    title: "GOAT Five",
    body: "Five names. No franchise. No era. Score the circle.",
    image: "/cards/gym.jpg",
    badge: "Popular",
  },
  {
    href: "/games/16-0",
    tab: "Games",
    kicker: "Game",
    title: "Build a 16-0",
    body: "Playoffs as series, not a clamp. Four rounds. A banner is rare.",
    image: "/cards/rim.jpg",
  },
  {
    href: "/games/daily",
    tab: "Games",
    kicker: "Game",
    title: "Daily Bucket",
    body: "The date pulls the room. Rip the pack. Keep the streak.",
    image: "/cards/tunnel.jpg",
    badge: "Daily",
  },
  {
    href: "/fantasy",
    tab: "Fantasy",
    kicker: "Board",
    title: "Market Board",
    body: "This Week, Tiers, Stream, Cut, Pace. Editorial. Not a book.",
    image: "/plates/hardwood.jpg",
  },
  {
    href: "/slate",
    tab: "Fantasy",
    kicker: "Board",
    title: "The Slate",
    body: "Tonight. One seeded board per day. Start, sit, or stream.",
    image: "/plates/guard.jpg",
  },
  {
    href: "/trade",
    tab: "Fantasy",
    kicker: "Desk",
    title: "Trade Desk",
    body: "Grade the deal. Compare the cats. Not a book.",
    image: "/plates/forward.jpg",
  },
  {
    href: "/brief",
    tab: "Fantasy",
    kicker: "Desk",
    title: "Brief Desk",
    body: "Issue 001. Four games is the week. Copy the brief. No signup.",
    image: "/plates/locker.jpg",
  },
  {
    href: "/keepers",
    tab: "Dynasty",
    kicker: "Desk",
    title: "Keeper Desk",
    body: "Keep, trade, cut. Dynasty marks. Not a league host.",
    image: "/cards/locker.jpg",
  },
  {
    href: "/mock",
    tab: "Dynasty",
    kicker: "Lab",
    title: "Mock Lab",
    body: "Snake. Numbered picks. Need-first rooms. Sit 1.01 through 1.04.",
    image: "/plates/center.jpg",
  },
  {
    href: "/tape",
    tab: "In-Season",
    kicker: "Tape",
    title: "The Tape",
    body: "UP / FLAT / DOWN. Marks, not a book. Share the print.",
    image: "/cards/rim.jpg",
  },
  {
    href: "/slate",
    tab: "In-Season",
    kicker: "Board",
    title: "The Slate",
    body: "Tonight’s board. Start, sit, or stream.",
    image: "/plates/night.jpg",
  },
  {
    href: "/fantasy",
    tab: "In-Season",
    kicker: "Board",
    title: "Market Board",
    body: "The week as a desk. Editorial. Not a book.",
    image: "/plates/hardwood.jpg",
  },
  {
    href: "/gym",
    tab: "Lab",
    kicker: "Kit",
    title: "The Gym",
    body: "Scorebug and lower-third templates. Overlays, not highlight tapes.",
    image: "/cards/gym.jpg",
  },
  {
    href: "/board",
    tab: "Lab",
    kicker: "Studio",
    title: "The Board",
    body: "Grassroots cards. Fictional demo only. Consent before a real name.",
    image: "/plates/hardwood.jpg",
  },
  {
    href: "/shop",
    tab: "Lab",
    kicker: "Shop",
    title: "Card Shop",
    body: "The posters you already locked. Save the PNG. On this device.",
    image: "/plates/night.jpg",
  },
];
