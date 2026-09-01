import { cn } from "@/lib/utils";

const BEATS = {
  house: [
    { n: "01", title: "Rip", body: "Thunder foil. Same pack every time." },
    { n: "02", title: "Tear", body: "The five is marked." },
    { n: "03", title: "Walk", body: "51–31. Playoff lock." },
    { n: "04", title: "Send", body: "The card leaves. The walk hangs." },
  ],
  machine: [
    { n: "01", title: "Pull", body: "Franchise, era, luck. One pull sets the room." },
    { n: "02", title: "Rip", body: "Tear the foil. Ten carbon backs. Turn five. Lock the five." },
    { n: "03", title: "Walk", body: "82 nights. Same five, same walk." },
    { n: "04", title: "Send", body: "The serial is the plate. The URL is the certificate." },
  ],
  daily: [
    { n: "01", title: "Same pack", body: "The date pulls the room. Everyone that day." },
    { n: "02", title: "Rip five", body: "House five hangs on the Brief. Yours is yours." },
    { n: "03", title: "Walk", body: "82 nights. Streak lives in the file." },
    { n: "04", title: "Tuesday", body: "Tape, Brief, Daily. Come back next week." },
  ],
  goat: [
    { n: "01", title: "Rip", body: "Tear the foil. Ten from the whole book. Or open it." },
    { n: "02", title: "Five", body: "No franchise. No era. Turn five names." },
    { n: "03", title: "Circle", body: "Peak, mix, spread. Not 82 nights." },
    { n: "04", title: "Send", body: "The serial is the plate. The URL is the certificate." },
  ],
  wnba: [
    { n: "01", title: "Pull", body: "A W club, era, luck. One pull." },
    { n: "02", title: "Rip", body: "Tear the W pack. Ten carbon backs. Turn five." },
    { n: "03", title: "Forty", body: "Honest length. Not 82." },
    { n: "04", title: "Send", body: "The serial is the plate. The URL is the certificate." },
  ],
  corners: [
    { n: "01", title: "Pull", body: "Franchise, era, luck. One pull." },
    { n: "02", title: "Deal", body: "The pack is G / G / F / F / C. Corners hold." },
    { n: "03", title: "Walk", body: "Then 82 nights, same as the machine." },
    { n: "04", title: "Send", body: "The serial is the plate. The URL is the certificate." },
  ],
  playoff: [
    { n: "01", title: "Pull", body: "Franchise, era, luck. One pull." },
    { n: "02", title: "Rip", body: "Ten face-down. Turn five." },
    { n: "03", title: "Sixteen", body: "Four rounds. Banner or out." },
    { n: "04", title: "Send", body: "The serial is the plate. The URL is the certificate." },
  ],
  keepers: [
    { n: "01", title: "KEEP", body: "That call fills the five. TRADE and CUT stay on the desk." },
    { n: "02", title: "Fill", body: "Empty slots take this week’s Tape UPs." },
    { n: "03", title: "Walk", body: "Same five. 82 nights, or 40 if the five is W." },
    { n: "04", title: "Send", body: "Copy the marks. Save the week card." },
  ],
  gym: [
    { n: "01", title: "Fill", body: "Scorebug and lower third. Type the night." },
    { n: "02", title: "Load", body: "Last night from a walk you already locked." },
    { n: "03", title: "Print", body: "Export the card." },
    { n: "04", title: "Use", body: "The file is the overlay." },
  ],
  wall: [
    { n: "01", title: "Today", body: "The house five. Same card for everyone that calendar day." },
    { n: "02", title: "Hang", body: "Walks you lock sit under the house grid." },
    { n: "03", title: "Send", body: "The card leaves. The URL is the walk." },
    { n: "04", title: "Quiet", body: "No likes. No accounts." },
  ],
  board: [
    { n: "01", title: "Names", body: "Six fictional cards. Not a recruiting board." },
    { n: "02", title: "Move", body: "Watch, Board, Can't miss." },
    { n: "03", title: "Empty", body: "Names only." },
    { n: "04", title: "Stay", body: "Fictional names. The clips never land." },
  ],
  tape: [
    { n: "01", title: "Week", body: "Printed to this Tuesday." },
    { n: "02", title: "Read", body: "Heavy, even, or light." },
    { n: "03", title: "Room", body: "NBA or WNBA." },
    { n: "04", title: "Hold", body: "You cannot buy a mark." },
  ],
  press: [
    { n: "01", title: "Stock", body: "Walks you have already locked." },
    { n: "02", title: "Proof", body: "Crop marks. One ink. 16pt." },
    { n: "03", title: "File", body: "Export the card or the studio file." },
    { n: "04", title: "Carry", body: "The file is the account." },
  ],
  trade: [
    { n: "01", title: "Give", body: "A name you would send out." },
    { n: "02", title: "Want", body: "A name you would take back." },
    { n: "03", title: "Grade", body: "Six counting cats. Editorial, not a line." },
    { n: "04", title: "Hold", body: "KEEP is not a trade. A sit night is not a trade." },
  ],
} as const;

export type HowKind = keyof typeof BEATS;

export function HowItWorks({
  kind = "machine",
  className,
}: {
  kind?: HowKind;
  className?: string;
}) {
  const beats = BEATS[kind];
  return (
    <section className={cn("mb-10 border-b border-line pb-10", className)}>
      <p className="mb-4 text-micro font-medium uppercase tracking-label text-subtle">How it works</p>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {beats.map((beat) => (
          <li key={beat.n} className="border-t border-line pt-3">
            <p className="plate-stamp text-accent">{beat.n}</p>
            <p className="mt-3 font-display text-xl font-semibold opsz-deck">{beat.title}</p>
            <p className="mt-1 text-sm text-muted">{beat.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
