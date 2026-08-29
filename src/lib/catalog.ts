export const TABS = ["Play", "Tape", "Cards"] as const;

export type Tab = (typeof TABS)[number];

export type Product = {
  href:
    | "/games/82-0"
    | "/games/daily"
    | "/games/goat"
    | "/games/16-0"
    | "/games/corners"
    | "/keepers"
    | "/shop"
    | "/brief"
    | "/tape"
    | "/fantasy"
    | "/slate"
    | "/trade"
    | "/mock"
    | "/board"
    | "/gym"
    | "/wall";
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
    tab: "Play",
    kicker: "Game",
    title: "Build an 82-0",
    body: "One pull. Three strips. Rip ten. The season walks. The card is a URL.",
    image: "/cards/arena.jpg",
    badge: "Popular",
  },
  {
    href: "/games/daily",
    tab: "Play",
    kicker: "Game",
    title: "Daily Bucket",
    body: "The date pulls the room. Same five for the house. Keep the streak.",
    image: "/cards/tunnel.jpg",
    badge: "Daily",
  },
  {
    href: "/games/corners",
    tab: "Play",
    kicker: "Game",
    title: "Four corners",
    body: "Start G/G/F/F/C. The corners have to hold. Then 82 nights.",
    image: "/cards/gym.jpg",
    badge: "New",
  },
  {
    href: "/games/goat",
    tab: "Play",
    kicker: "Game",
    title: "GOAT Five",
    body: "Five names. No franchise. No era. Score the circle.",
    image: "/cards/gym.jpg",
  },
  {
    href: "/games/16-0",
    tab: "Play",
    kicker: "Game",
    title: "Build a 16-0",
    body: "Playoffs as series. Four rounds. 2-2-1-1-1. A banner is rare.",
    image: "/cards/rim.jpg",
  },
  {
    href: "/tape",
    tab: "Tape",
    kicker: "Tape",
    title: "The Tape",
    body: "UP / FLAT / DOWN. Marks, not a book. The week is the print.",
    image: "/cards/rim.jpg",
  },
  {
    href: "/brief",
    tab: "Tape",
    kicker: "Desk",
    title: "Brief Desk",
    body: "The week in one issue. House walk on the page. No signup.",
    image: "/plates/locker.jpg",
  },
  {
    href: "/slate",
    tab: "Tape",
    kicker: "Board",
    title: "The Slate",
    body: "This week’s board. Start, sit, or stream. Seeded to the week.",
    image: "/plates/night.jpg",
  },
  {
    href: "/shop",
    tab: "Cards",
    kicker: "Shop",
    title: "Card Shop",
    body: "The posters you already locked. Save the PNG. Export the studio.",
    image: "/plates/night.jpg",
  },
  {
    href: "/wall",
    tab: "Cards",
    kicker: "Wall",
    title: "The Wall",
    body: "Walks on this device. Share the URL. No graffiti, no database.",
    image: "/cards/arena.jpg",
    badge: "New",
  },
  {
    href: "/gym",
    tab: "Cards",
    kicker: "Kit",
    title: "The Gym",
    body: "Scorebug and lower-third. Export the PNG. Overlays, not tapes.",
    image: "/cards/gym.jpg",
  },
];
