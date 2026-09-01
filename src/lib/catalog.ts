export const TABS = ["Play", "Cards"] as const;

export type Tab = (typeof TABS)[number];

export type Product = {
  href:
    | "/games/82-0"
    | "/games/daily"
    | "/games/goat"
    | "/games/16-0"
    | "/games/corners"
    | "/games/wnba"
    | "/keepers"
    | "/shop"
    | "/brief"
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
    body: "Thunder in the foil. Rip ten. The five is marked. Send the card.",
    image: "/cards/arena.jpg",
    badge: "Popular",
  },
  {
    href: "/games/daily",
    tab: "Play",
    kicker: "Game",
    title: "Daily Bucket",
    body: "The date pulls the room. Same pack. The house five hangs on the Brief. Yours is yours.",
    image: "/cards/tunnel.jpg",
    badge: "Daily",
  },
  {
    href: "/games/corners",
    tab: "Play",
    kicker: "Game",
    title: "Four corners",
    body: "The pack deals G/G/F/F/C. Then 82 nights.",
    image: "/cards/gym.jpg",
    badge: "New",
  },
  {
    href: "/games/goat",
    tab: "Play",
    kicker: "Game",
    title: "GOAT Five",
    body: "Five names. No franchise. No era. Score the circle. The card is a URL.",
    image: "/cards/locker.jpg",
  },
  {
    href: "/games/16-0",
    tab: "Play",
    kicker: "Game",
    title: "Build a 16-0",
    body: "Playoffs as series. Four rounds. 2-2-1-1-1. Ten face-down. Lose a series, the run is over.",
    image: "/cards/rim.jpg",
  },
  {
    href: "/games/wnba",
    tab: "Play",
    kicker: "Game",
    title: "WNBA walk",
    body: "Forty nights. House crests. A walk, not a shelf.",
    image: "/plates/rafters.jpg",
    badge: "New",
  },
  {
    href: "/brief",
    tab: "Cards",
    kicker: "Desk",
    title: "Brief Desk",
    body: "The week in one issue. House walk on the page. No signup.",
    image: "/plates/locker.jpg",
  },
  {
    href: "/shop",
    tab: "Cards",
    kicker: "Shop",
    title: "The press",
    body: "Proofs with trim marks. The file is the sheet. Export the studio file.",
    image: "/plates/night.jpg",
  },
  {
    href: "/wall",
    tab: "Cards",
    kicker: "Wall",
    title: "The Wall",
    body: "Fourteen house walks. No accounts. Yours hang under the rule.",
    image: "/cards/arena.jpg",
    badge: "New",
  },
  {
    href: "/keepers",
    tab: "Cards",
    kicker: "Dynasty",
    title: "Keepers",
    body: "KEEP first. Holes fill from this week’s Tape. Walk this five.",
    image: "/plates/locker.jpg",
  },
];
