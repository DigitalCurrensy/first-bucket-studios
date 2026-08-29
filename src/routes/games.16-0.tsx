import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import {
  PLAYERS,
  dealFrom,
  hashSeed,
  mulberry32,
  playoffLabel,
  playoffLine,
  type Era,
  type Franchise,
  type Player,
} from "@/lib/nba";
import { recapOf, type Recap } from "@/lib/recap";
import { playoffWalk, type Night } from "@/lib/sim";
import { recordRun } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/16-0")({ component: SixteenPage });

type Step = "spin" | "draft" | "season" | "result";

function dealPack(seed: string) {
  return dealFrom(PLAYERS, mulberry32(hashSeed(seed)), 8);
}

function SixteenPage() {
  const [step, setStep] = useState<Step>("spin");
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [pack, setPack] = useState<Player[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [projected, setProjected] = useState(0);
  const [nights, setNights] = useState<Night[]>([]);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [club, setClub] = useState("FBS");
  const [copied, setCopied] = useState(false);

  const roster = picks
    .map((id) => pack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const startDraft = useCallback((nextTeam: Franchise, nextEra: Era) => {
    setTeam(nextTeam);
    setEra(nextEra);
    setPack(dealPack(`${nextTeam}:${nextEra}:${Date.now()}`));
    setPicks([]);
    setStep("draft");
  }, []);

  function toggle(id: string) {
    setPicks((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur;
      return [...cur, id];
    });
  }

  function lock() {
    if (roster.length !== 5 || !team || !era) return;
    const walk = playoffWalk(team, era, roster);
    const last = walk.rounds[walk.rounds.length - 1];
    const exit = last?.taken ? "Banner" : last?.round;
    const summary = recapOf(walk.nights, walk.projected, exit);
    setWins(walk.wins);
    setProjected(walk.projected);
    setNights(walk.nights);
    setRecap(summary);
    setClub(walk.us);
    setStep("season");
    recordRun({
      id: `${Date.now()}`,
      at: Date.now(),
      mode: "16-0",
      team,
      era,
      wins: walk.wins,
      roster: roster.map((p) => p.id),
      recap: summary,
    });
  }

  function reset() {
    setStep("spin");
    setTeam("");
    setEra("");
    setPack([]);
    setPicks([]);
    setNights([]);
    setCopied(false);
  }

  async function copyLine() {
    const line = `Walked a ${playoffLine(wins)} ${era} ${team} playoff run at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
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
        lead="Spin the room. Start five. Then the series play. A banner is four series you did not lose."
      />

      {step === "spin" && <RoomSpin onReady={startDraft} />}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-micro font-medium uppercase tracking-label text-subtle">
                02 · Eight names · {team} · {era}
              </p>
              <p className="mt-1 text-sm text-muted">{picks.length} of 5 · Then the series play.</p>
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

      {step === "season" && (
        <SeasonWalk
          team={team}
          us={club}
          nights={nights}
          of={nights.length}
          projected={projected}
          onDone={() => setStep("result")}
        />
      )}

      {step === "result" && (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team={team} era={era} wins={wins} roster={roster} kind="playoff" />
          <div>
            <p className="font-display text-2xl font-semibold">{playoffLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {playoffLine(wins)} walked. Projected {projected} series wins as a formula. The rounds decide.
            </p>
            {recap && <SeasonRecap recap={recap} />}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton team={team} era={era} wins={wins} roster={roster} kind="playoff" />
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                Spin another
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