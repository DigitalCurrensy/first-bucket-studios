import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import {
  ERAS,
  FRANCHISES,
  PLAYERS,
  dealFrom,
  hashSeed,
  mulberry32,
  playoffLabel,
  playoffLine,
  playoffWins,
  type Era,
  type Franchise,
  type Player,
} from "@/lib/nba";
import { recordRun } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/16-0")({ component: SixteenPage });

type Step = "franchise" | "era" | "draft" | "result";

function dealPack(seed: string) {
  return dealFrom(PLAYERS, mulberry32(hashSeed(seed)), 8);
}

function SixteenPage() {
  const [step, setStep] = useState<Step>("franchise");
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [pack, setPack] = useState<Player[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [copied, setCopied] = useState(false);

  const roster = picks
    .map((id) => pack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  function startDraft(nextTeam: Franchise, nextEra: Era) {
    setTeam(nextTeam);
    setEra(nextEra);
    setPack(dealPack(`${nextTeam}:${nextEra}:${Date.now()}`));
    setPicks([]);
    setStep("draft");
  }

  function toggle(id: string) {
    setPicks((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur;
      return [...cur, id];
    });
  }

  function lock() {
    if (roster.length !== 5 || !team || !era) return;
    const projected = playoffWins(roster);
    setWins(projected);
    setStep("result");
    recordRun({
      id: `${Date.now()}`,
      at: Date.now(),
      mode: "16-0",
      team,
      era,
      wins: projected,
      roster: roster.map((p) => p.id),
    });
  }

  function reset() {
    setStep("franchise");
    setTeam("");
    setEra("");
    setPack([]);
    setPicks([]);
    setCopied(false);
  }

  async function copyLine() {
    const line = `Built a ${playoffLine(wins)} ${era} ${team} playoff run at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
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
        kicker="Build a 16-0"
        title="Sixteen wins. One banner."
        lead="Playoffs, not the regular season. Deal eight, start five. Two-way names travel. A third guard does not."
      />

      {step === "franchise" && (
        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">01 · Franchise</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FRANCHISES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setTeam(name);
                  setStep("era");
                }}
                className="min-h-14 rounded-lg bg-paper px-3 text-left font-display text-lg font-semibold shadow-border transition-shadow duration-150 hover:shadow-border-hover"
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "era" && (
        <section>
          <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">02 · Era · {team}</p>
          <div className="flex flex-wrap gap-2">
            {ERAS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => startDraft(team as Franchise, name)}
                className="min-h-11 rounded-full bg-paper px-4 text-sm shadow-border transition-shadow duration-150 hover:shadow-border-hover"
              >
                {name}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep("franchise")} className="mt-6 min-h-11 text-sm text-muted">
            Back to franchises
          </button>
        </section>
      )}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-micro font-medium uppercase tracking-label text-subtle">
                03 · Eight names · {team} · {era}
              </p>
              <p className="mt-1 text-sm text-muted">{picks.length} of 5 · Two-way names travel.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => startDraft(team as Franchise, era as Era)}>
                Redeal
              </Button>
              <Button onClick={lock} disabled={picks.length !== 5}>
                Lock five
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pack.map((player) => (
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

      {step === "result" && (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team={team} era={era} wins={wins} roster={roster} kind="playoff" />
          <div>
            <p className="font-display text-2xl font-semibold">{playoffLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {playoffLine(wins)} in a 16-win draw. Peak, position mix, and steals plus blocks. This is not an 82-game
              number.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                Build another
              </Button>
              <Link to="/shop" className={cn("inline-flex min-h-11 items-center px-4 text-sm text-muted")}>
                Card Shop
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}