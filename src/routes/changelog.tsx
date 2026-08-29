import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/page-intro";

export const Route = createFileRoute("/changelog")({ component: ChangelogPage });

const ENTRIES = [
  {
    date: "August 29, 2026",
    title: "The walk",
    items: [
      "The card is a URL. /walk/:id. Same five, same walk. Beat it is a new pack in the same room.",
      "82 nights have a skeleton now. Home, road, B2Bs, sit nights. Skip to recap. A strip of dots on the poster.",
      "Daily is the same room for everyone that calendar day. The house walk prints in the Brief.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "Tuesday",
    items: [
      "One book. Current NBA plus WNBA. Desks resolve by id. Dummy rows are gone.",
      "Week key drives Tape, Slate, Brief. Daily stays on the date. Issue 002 and 003 live as files.",
      "Market Board prints density — games, B2Bs, pace as talk. No implied totals. Keepers warn on Trade.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The house",
    items: [
      "Export and import a studio file. Accounts wait. The wall is walks on this device.",
      "Four corners: start G/G/F/F/C. Gym PNG export. Thirty house crests, SVG = PNG.",
      "Nav is Play / Tape / Cards. Everything else stays linked.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The names",
    items: [
      "Tape, Slate, Keepers, and the Market Board wear plates. Initials on the still. Not a likeness.",
      "Classic, Daily, All-time, Playoffs sit on one bar. STEP 1 pull. STEP 2 pick. Search the pack.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The desk",
    items: [
      "Home is a desk now. Games, Fantasy, Dynasty, In-Season, Lab. Photo cards. A live tape feed. Marks, not a book.",
      "Night is the studio. Light still lives. Your five sits on the rail while you rip the pack.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The machine",
    items: [
      "One pull. Three strips — franchise, era, luck. Cylinder. Tick and haptic on land.",
      "Pack-rip: ten face-down, you turn five. Crest on the PNG. Copy a challenge URL and beat the walk.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The room flashes",
    items: [
      "Slot window is three rows. House crests flash past. The payline is the middle. Not NBA logos — First Bucket marks.",
      "Player plates on the deal. Anonymous gym stills, initials on the frame. Cards rise in.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "Share the mark",
    items: [
      "Share the card — PNG plus caption with the studio on the line. Native share when the device has it. Save PNG still lives.",
      "The Tape — UP / FLAT / DOWN, seeded to the date. Pin a mark. Share a mark. Not a book, not an NFT, not a player stock.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The card is the share",
    items: [
      "Save PNG from 82-0, Daily, GOAT Five, 16-0, and the Card Shop. Ink poster, no fake tape.",
      "After the walk: longest run, home/away, best night, worst night. The formula was the center. This is the path.",
    ],
  },
  {
    date: "August 29, 2026",
    title: "The season walks",
    items: [
      "Lock five and 82 nights play. Scorebug ticks. The poster is the walk, not the formula pretending to be a season.",
      "16-0 is four series. Lose one, the run is over. A banner is rare.",
    ],
  },
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
          <li key={entry.title}>
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
