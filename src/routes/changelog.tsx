import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";

export const Route = createFileRoute("/changelog")({ component: ChangelogPage });

const ENTRIES = [
  {
    date: "August 29, 2026",
    title: "The room spins",
    items: [
      "82-0, Daily Bucket, and 16-0 spin the franchise and era like a reel. The names move. Who lands is the room.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The Slate · Trade Desk",
    items: [
      "The Slate — tonight’s board, seeded to this device date. Start / sit / stream.",
      "Trade Desk — grade the deal, compare six cats. Losing a center is a note. Sitting a B2B is not.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "16-0 · Keepers · Card Shop",
    items: [
      "Build a 16-0 — playoff draw, eight names, five starters, 16-win banner.",
      "Keeper Desk — keep / trade / cut. Marks stay on this device. Not a league.",
      "Card Shop — every locked poster, reopened.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "Brief Desk · GOAT Five",
    items: [
      "Brief Desk ships Issue 001. Copy the brief. No signup.",
      "GOAT Five — five names from the whole book. Live score. Balance still travels.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "Market Board tools · need math",
    items: [
      "Market Board desk: This Week, Tiers, Stream, Cut, Pace.",
      "Stream filters by the cat you are losing. Six counting cats, no fake FT%.",
      "Need-first math is on the Lab. Sort remaining by Need to see the room's next lock.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "Lab snake · N-rules",
    items: [
      "Mock Lab is a real snake: 1.01–5.04, odd run / even reverse.",
      "Sit 1.01 through 1.04. 1.04 owns the turnaround (2.01).",
      "N1–N8 on the desk. Room drafts need-first, not peak-only.",
      "Twenty locks. Room card grades peak sum and G/F/C spread.",
    ],
  },
  {
    date: "August 28, 2026",
    title: "Heavy wave",
    items: [
      "Build an 82-0 ships: franchise, era, five-man draft, projected record.",
      "Daily Bucket — one seeded deal, local streak, stored on this device.",
      "Market Board with start / sit / stream. Editorial. Not a book.",
      "Mock Lab, a four-seat snake against the room.",
      "The Board — fictional demo cards only. Consent before a real name.",
      "The Gym overlay templates. No highlight tapes.",
    ],
  },
];

function ChangelogPage() {
  return (
    <div>
      <PageIntro
        kicker="Changelog"
        title="What shipped."
        lead="Studio notes, not a marketing feed. If it is not on this page, it is not in the product yet."
      />
      <ol className="space-y-12">
        {ENTRIES.map((entry) => (
          <li key={entry.date}>
            <p className="text-micro font-medium uppercase tracking-label text-subtle">{entry.date}</p>
            <h2 className="mt-2 text-3xl font-semibold">{entry.title}</h2>
            <ul className="mt-4 max-w-xl space-y-2 text-muted">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
