import { useEffect, useState } from "react";
import { Crest } from "@/components/crest";
import { DotStrip } from "@/components/dot-strip";
import { Button } from "@/components/ui/button";
import type { Night } from "@/lib/sim";
import { writeLastScrub } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export function SeasonWalk({
  team,
  us,
  nights,
  of,
  projected,
  onDone,
}: {
  team: string;
  us: string;
  nights: Night[];
  of: number;
  projected: number;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [ticker, setTicker] = useState(true);
  const night = nights[Math.min(i, Math.max(0, nights.length - 1))];
  const played = nights.slice(0, Math.min(i + 1, nights.length));
  const wins = played.filter((n) => n.win).length;
  const losses = played.length - wins;
  const done = nights.length === 0 || i >= nights.length - 1;
  const ms = nights.length > 40 ? 40 : 110;

  function go(n: number) {
    const next = Math.max(0, Math.min(nights.length - 1, n));
    setI(next);
    const hit = nights[next];
    if (hit) writeLastScrub({ n: hit.n, us: hit.us, them: hit.them, opp: hit.opp, home: hit.home, team });
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setI(Math.max(0, nights.length - 1));
      const skip = window.setTimeout(onDone, 80);
      return () => window.clearTimeout(skip);
    }
    if (!ticker || nights.length === 0) return;
    const id = window.setInterval(() => {
      setI((cur) => {
        if (cur >= nights.length - 1) {
          window.clearInterval(id);
          return cur;
        }
        return cur + 1;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [nights, ms, ticker, onDone]);

  useEffect(() => {
    if (!ticker) return;
    if (nights.length === 0 || i < nights.length - 1) return;
    const id = window.setTimeout(onDone, 700);
    return () => window.clearTimeout(id);
  }, [i, nights.length, ticker, onDone]);

  if (!night) return null;

  return (
    <section>
      <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">
        {night.round ?? "The season"} · Night {night.n} / {of}
        {night.b2b ? " · B2B" : ""}
        {night.sit ? " · Sit" : ""}
      </p>
      <div className="overflow-hidden rounded-xl bg-fg p-4 text-paper sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <Crest name={team} className="size-10 text-paper" />
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold leading-tight">{team}</p>
            <p className="text-micro font-medium uppercase tracking-label text-paper/55">
              Night {night.n} · {night.home ? "Home" : "Away"}
              {night.b2b ? " · B2B" : ""}
              {night.sit ? " · Sit" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 font-display text-2xl font-semibold tabular-nums sm:text-3xl">
          <span>
            {us}
            <span className="ml-2">{night.us}</span>
          </span>
          <span className="font-sans text-xs font-medium uppercase tracking-label text-paper/60">
            {night.win ? "W" : "L"}
          </span>
          <span>
            <span className="mr-2">{night.them}</span>
            {night.opp}
          </span>
        </div>
      </div>
      <p className="mt-6 font-display text-4xl font-semibold tabular-nums">
        {wins}–{losses}
      </p>
      <p className="mt-2 text-sm text-muted">
        {team}. Projected {projected}. One night at a time.
      </p>
      <DotStrip nights={nights} tone="ink" className="mt-6 max-w-xl" active={i} onPick={go} />
      <ol className="mt-4 flex flex-wrap gap-1">
        {nights.slice(Math.max(0, i - 7), i + 1).map((n, idx) => {
          const abs = Math.max(0, i - 7) + idx;
          return (
            <li key={n.n}>
              <button
                type="button"
                onClick={() => go(abs)}
                className={cn(
                  "min-h-11 rounded-lg px-2 py-1 text-left shadow-border",
                  abs === i ? "bg-fg text-paper shadow-none" : "bg-paper",
                )}
              >
                <span className="block font-mono text-micro tabular-nums text-subtle">N{n.n}</span>
                <span className="font-display text-sm font-semibold tabular-nums">
                  {n.us}–{n.them}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => go(i - 1)} disabled={i === 0}>
          Prev
        </Button>
        <Button variant="ghost" onClick={() => go(i + 1)} disabled={done}>
          Next
        </Button>
        <Button onClick={onDone}>{done ? "The card" : "Skip to the card"}</Button>
        {!done && (
          <Button
            variant="ghost"
            onClick={() => {
              setTicker((on) => !on);
            }}
          >
            {ticker ? "Pause" : "Play"}
          </Button>
        )}
      </div>
    </section>
  );
}