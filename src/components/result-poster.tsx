import { Crest } from "@/components/crest";
import { DotStrip } from "@/components/dot-strip";
import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel, type Player } from "@/lib/nba";

export function ResultPoster({
  team,
  era,
  wins,
  roster,
  kind = "season",
  nights,
}: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: "season" | "goat" | "playoff";
  nights?: { win: boolean }[];
}) {
  const line =
    kind === "goat" ? goatLabel(wins) : kind === "playoff" ? `${playoffLine(wins)} · ${playoffLabel(wins)}` : `${recordLine(wins)} · ${winLabel(wins)}`;
  return (
    <article className="rise overflow-hidden rounded-xl bg-fg p-6 text-paper sm:p-8">
      <p className="text-micro font-medium uppercase tracking-label text-accent">First Bucket</p>
      <div className="mt-3 flex items-center gap-3">
        {kind !== "goat" && <Crest name={team} className="size-9 text-paper" />}
        <p className="text-sm text-paper/70">
          {team} · {era}
        </p>
      </div>
      <p className="mt-8 font-display text-7xl font-semibold tabular-nums leading-none">{wins}</p>
      <p className="mt-3 text-lg">{line}</p>
      <ul className="mt-8 space-y-1 text-sm text-paper/80">
        {roster.map((p) => (
          <li key={p.id}>
            {p.name}
            <span className="ml-2 text-xs text-paper/50">{p.pos}</span>
          </li>
        ))}
      </ul>
      {nights && nights.length > 0 && <DotStrip nights={nights} className="mt-8" />}
    </article>
  );
}
