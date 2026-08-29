import { useEffect, useState } from "react";
import { DotStrip } from "@/components/dot-strip";
import { Button } from "@/components/ui/button";
import type { Night } from "@/lib/sim";
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
  const night = nights[Math.min(i, nights.length - 1)];
  const played = nights.slice(0, Math.min(i + 1, nights.length));
  const wins = played.filter((n) => n.win).length;
  const losses = played.length - wins;
  const done = i >= nights.length - 1;
  const ms = nights.length > 40 ? 40 : 110;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || nights.length === 0) {
      setI(Math.max(0, nights.length - 1));
      return;
    }
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
  }, [nights, ms]);

  if (!night) return null;

  return (
    <section>
      <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">
        {night.round ?? "The season"} · Game {night.n} / {of}
        {night.b2b ? " · B2B" : ""}
        {night.sit ? " · Sit" : ""}
      </p>
      <div className="overflow-hidden rounded-xl bg-fg p-4 text-paper sm:p-5">
        <div className="flex items-center justify-between gap-4 font-display text-2xl font-semibold tabular-nums sm:text-3xl">
          <span>
            {us}
            <span className="ml-2">{night.us}</span>
          </span>
          <span className="font-sans text-xs font-medium uppercase tracking-label text-paper/60">
            {night.home ? "HOME" : "AWAY"} · {night.win ? "W" : "L"}
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
        {team}. Projected {projected}. The nights wander.
      </p>
      <DotStrip nights={played} tone="ink" className="mt-6 max-w-xl" />
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onDone} disabled={!done && nights.length > 0}>
          {done ? "The card" : "Walking…"}
        </Button>
        {!done && (
          <Button
            variant="ghost"
            onClick={() => {
              setI(nights.length - 1);
            }}
          >
            Skip to recap
          </Button>
        )}
      </div>
      <p className={cn("mt-8 max-w-xl text-sm text-subtle")}>
        Seeded walk. Not a sportsbook. Not a broadcast. The Gym scorebug, attached to a season that lives on this
        device.
      </p>
    </section>
  );
}
