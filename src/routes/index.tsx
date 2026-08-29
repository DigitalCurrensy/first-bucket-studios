import { createFileRoute, Link } from "@tanstack/react-router";
import { useMounted } from "@/lib/hooks";
import { PLAYERS_BY_ID } from "@/lib/nba";
import { formatRun, loadSave } from "@/lib/studio-save";
import { LOVE } from "@/lib/week";

export const Route = createFileRoute("/")({ component: Home });

const PRODUCTS = [
  {
    href: "/games/82-0" as const,
    kicker: "Game",
    title: "Build an 82-0",
    body: "Spin the room. Draft five. The season walks. The poster is the walk.",
  },
  {
    href: "/games/daily" as const,
    kicker: "Game",
    title: "Daily Bucket",
    body: "One locked deal per day. Keep the streak. No second seed.",
  },
  {
    href: "/games/goat" as const,
    kicker: "Game",
    title: "GOAT Five",
    body: "Five names. No franchise. No era. Score the circle.",
  },
  {
    href: "/games/16-0" as const,
    kicker: "Game",
    title: "Build a 16-0",
    body: "Playoffs as series, not a clamp. Four rounds. A banner is rare.",
  },
  {
    href: "/keepers" as const,
    kicker: "Desk",
    title: "Keeper Desk",
    body: "Keep, trade, cut. Dynasty marks. Not a league host.",
  },
  {
    href: "/shop" as const,
    kicker: "Shop",
    title: "Card Shop",
    body: "The posters you already locked. Save the PNG. On this device.",
  },
  {
    href: "/brief" as const,
    kicker: "Desk",
    title: "Brief Desk",
    body: "Issue 001. Four games is the week. Copy the brief. No signup.",
  },
  {
    href: "/fantasy" as const,
    kicker: "Board",
    title: "Market Board",
    body: "This Week, Tiers, Stream, Cut, Pace. Editorial. Not a book.",
  },
  {
    href: "/slate" as const,
    kicker: "Board",
    title: "The Slate",
    body: "Tonight. One seeded board per day. Start, sit, or stream.",
  },
  {
    href: "/trade" as const,
    kicker: "Desk",
    title: "Trade Desk",
    body: "Grade the deal. Compare the cats. Not a book.",
  },
  {
    href: "/mock" as const,
    kicker: "Lab",
    title: "Mock Lab",
    body: "Snake. Numbered picks. Need-first rooms. Sit 1.01 through 1.04.",
  },
  {
    href: "/board" as const,
    kicker: "Studio",
    title: "The Board",
    body: "Grassroots cards. Fictional demo only. Consent before a real name.",
  },
  {
    href: "/gym" as const,
    kicker: "Kit",
    title: "The Gym",
    body: "Scorebug and lower-third templates. Overlays, not highlight tapes.",
  },
];

function Home() {
  const mounted = useMounted();
  const save = mounted ? loadSave() : null;
  const latest = save?.runs[0];
  const latestNames = latest?.roster.map((id) => PLAYERS_BY_ID[id]?.name).filter(Boolean) ?? [];

  return (
    <div>
      <p className="text-micro font-medium uppercase tracking-label text-subtle">First Bucket Studio</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-6xl">We build games + basketball tools.</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">Thoughtfully crafted. Used on purpose. A Digital Currensy house — not a sportsbook, not a recruiting desk.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/games/82-0"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Build an 82-0
        </Link>
        <Link
          to="/brief"
          className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium shadow-border"
        >
          Read the brief
        </Link>
      </div>

      {latest && (
        <p className="mt-8 text-sm text-muted">
          Last run: {latest.team} · {formatRun(latest)}
          {latestNames.length ? ` · ${latestNames.slice(0, 3).join(", ")}` : ""}
          {save && save.bestWins > 0 && <span className="ml-2 text-fg">Best {save.bestWins}</span>}
        </p>
      )}

      <section className="mt-16">
        <p className="mb-4 text-micro font-medium uppercase tracking-label text-subtle">This week we love</p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {LOVE.map((item) => (
            <li key={item.name} className="rounded-xl bg-paper p-5 shadow-border">
              <p className="font-display text-xl font-semibold">{item.name}</p>
              <p className="mt-2 text-sm text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <p className="mb-4 text-micro font-medium uppercase tracking-label text-subtle">On the board</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Link
              key={p.href}
              to={p.href}
              className="rounded-xl bg-paper p-6 shadow-border transition-shadow duration-150 hover:shadow-border-hover"
            >
              <p className="text-micro font-medium uppercase tracking-label text-subtle">{p.kicker}</p>
              <p className="mt-2 font-display text-2xl font-semibold">{p.title}</p>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
