import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { PLAYERS, goatLabel, goatScore, type Player, type Pos } from "@/lib/nba";
import { recordRun } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/goat")({ component: GoatPage });

type Filter = "ALL" | Pos;

function GoatPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [picks, setPicks] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const roster = picks
    .map((id) => PLAYERS.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const shown = useMemo(
    () => PLAYERS.filter((p) => (filter === "ALL" ? true : p.pos === filter)).sort((a, b) => b.peak - a.peak),
    [filter],
  );
  const live = goatScore(roster);
  const locked = score != null;

  function toggle(id: string) {
    if (locked) return;
    setPicks((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur;
      return [...cur, id];
    });
  }

  function lock() {
    if (roster.length !== 5) return;
    const next = goatScore(roster);
    setScore(next);
    recordRun({
      id: `${Date.now()}`,
      at: Date.now(),
      mode: "goat",
      team: "GOAT Five",
      era: "All-time",
      wins: next,
      roster: roster.map((p) => p.id),
    });
  }

  function reset() {
    setPicks([]);
    setScore(null);
    setCopied(false);
    setFilter("ALL");
  }

  async function copyLine() {
    const line = `GOAT Five ${score} · ${goatLabel(score ?? 0)} at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <PageIntro
        kicker="GOAT Five"
        title="Five names. No franchise. No era."
        lead="The whole book is open. Balance still travels. A third guard is taxed. Lock the five and we score the circle."
      />

      {locked ? (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team="GOAT Five" era="All-time" wins={score} roster={roster} kind="goat" />
          <div>
            <p className="font-display text-2xl font-semibold">{goatLabel(score)}</p>
            <p className="mt-2 text-muted">
              {score} on the circle. Peak, position mix, and era spread. A stacked mono-position five does not get a
              free 99.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                Build another
              </Button>
              <Link to="/games/82-0" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
                Build an 82-0
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">
                {picks.length} of 5
                {roster.length > 0 && (
                  <span className="ml-2 text-fg">
                    Live {live} · {goatLabel(live)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "G", "F", "C"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                    filter === key ? "bg-fg text-paper shadow-none" : "text-fg",
                  )}
                >
                  {key === "ALL" ? "All" : key}
                </button>
              ))}
              <Button onClick={lock} disabled={picks.length !== 5}>
                Lock five
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                selected={picks.includes(player.id)}
                index={picks.indexOf(player.id)}
                onToggle={() => toggle(player.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}