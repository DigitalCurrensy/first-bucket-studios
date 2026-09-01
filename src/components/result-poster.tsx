import { Crest } from "@/components/crest";
import { CourtMark } from "@/components/court-mark";
import { DotStrip } from "@/components/dot-strip";
import { PressSheet } from "@/components/press-sheet";
import { goatLabel, playoffLabel, playoffLine, recordLine, winLabel, eraLabel, type Player } from "@/lib/nba";
import { cardSerial, initials } from "@/lib/plates";
import { cn } from "@/lib/utils";

export function ResultPoster({
  team,
  era,
  wins,
  roster,
  kind = "season",
  nights,
  ghostNights,
  compact = false,
}: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: "season" | "goat" | "playoff" | "wnba";
  nights?: { win: boolean }[];
  ghostNights?: { win: boolean }[];
  compact?: boolean;
}) {
  const of = kind === "wnba" ? 40 : 82;
  const line =
    kind === "goat"
      ? goatLabel(wins)
      : kind === "playoff"
        ? `${playoffLine(wins)} · ${playoffLabel(wins)}`
        : `${recordLine(wins, of)} · ${winLabel(wins, of)}`;
  const stamp =
    kind === "goat" ? goatLabel(wins) : kind === "playoff" ? playoffLabel(wins) : winLabel(wins, of);
  const poster = (
    <article className={cn("poster-card relative overflow-hidden rounded-xl", compact ? "p-4" : "p-6 sm:p-8")}>
      <div className="poster-mesh" aria-hidden="true" />
      <CourtMark className={cn("pointer-events-none absolute text-ink/6", compact ? "-right-10 -bottom-16 size-40" : "-right-8 -bottom-10 size-56")} />
      <p className="relative text-micro font-medium uppercase tracking-label text-accent">First Bucket · The card</p>
      <div className={cn("relative flex items-center gap-3", compact ? "mt-2" : "mt-3")}>
        {kind !== "goat" && <Crest name={team} className={cn("text-ink", compact ? "size-7" : "size-9")} />}
        <p className="text-sm text-ink/65">
          {team} · {eraLabel(era)}
        </p>
      </div>
      <div className={cn("relative flex items-end justify-between gap-6", compact ? "mt-4" : "mt-8")}>
        <p className={cn("opsz-hero font-display font-semibold tabular-nums leading-none", compact ? "text-5xl" : "text-7xl")}>
          {wins}
        </p>
        <div className="pb-1 text-right">
          <p className="text-micro font-medium uppercase tracking-label text-accent">{stamp}</p>
          <p className={cn("mt-1 text-ink/75", compact ? "text-sm" : "text-lg")}>{line}</p>
        </div>
      </div>
      <div className="hero-rule relative" />
      {compact ? (
        <ul className="relative mt-4 space-y-2">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="poster-plate">{initials(p.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-semibold leading-none">{p.name}</span>
                <span className="mt-1 block text-micro uppercase tracking-label text-ink/40">
                  {p.pos} · {cardSerial(p.id)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="relative mt-8 grid grid-cols-5 gap-2">
          {roster.map((p) => (
            <li key={p.id} className="min-w-0 text-center">
              <span className="poster-plate mx-auto size-16 text-xl">{initials(p.name)}</span>
              <span className="mt-2 block truncate text-micro font-medium">{p.name.split(" ").slice(-1)[0]}</span>
              <span className="mt-1 block text-[0.6rem] uppercase tracking-label text-ink/35">{cardSerial(p.id)}</span>
            </li>
          ))}
        </ul>
      )}
      {!compact && nights && nights.length > 0 && (
        <DotStrip nights={nights} marks="ticks" tone="card" className="relative mt-8" />
      )}
      {!compact && ghostNights && ghostNights.length > 0 && (
        <div className="relative mt-3">
          <p className="mb-1 text-micro font-medium uppercase tracking-label text-ink/35">Ghost</p>
          <DotStrip nights={ghostNights} marks="ticks" tone="card" className="opacity-50" />
        </div>
      )}
    </article>
  );

  return (
    <PressSheet compact={compact} job={team}>
      {poster}
    </PressSheet>
  );
}
