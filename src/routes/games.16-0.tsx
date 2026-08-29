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
import { luckLine, type Luck } from "@/lib/luck";
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
import { tick } from "@/lib/tick";
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
  const [luck, setLuck] = useState<Luck>("Even");
  const [pack, setPack] = useState<Player[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [projected, setProjected] = useState(0);
  const [nights, setNights] = useState<Night[]>([]);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [club, setClub] = useState("FBS");
  const [copied, setCopied] = useState(false);

  const roster = picks
    .map((id) => pack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const startDraft = useCallback((nextTeam: Franchise, nextEra: Era, nextLuck: Luck) => {
    setTeam(nextTeam);
    setEra(nextEra);
    setLuck(nextLuck);
    setPack(dealPack(`${nextTeam}:${nextEra}:${nextLuck}:${Date.now()}`));
    setPicks([]);
    setOpen([]);
    setStep("draft");
  }, []);

  function flip(id: string) {
    if (!open.includes(id)) {
      setOpen((cur) => [...cur, id]);
      tick();
      return;
    }
    setPicks((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur;
      return [...cur, id];
    });
  }

  function rip() {
    pack.forEach((p, i) => {
      window.setTimeout(() => {
        setOpen((cur) => (cur.includes(p.id) ? cur : [...cur, p.id]));
        tick();
      }, i * 70);
    });
  }

  function lock() {
    if (roster.length !== 5 || !team || !era) return;
    const walk = playoffWalk(team, era, roster, luck);
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
    setLuck("Even");
    setPack([]);
    setPicks([]);
    setOpen([]);
    setNights([]);
    setCopied(false);
  }

  async function copyLine() {
    const line = `Walked a ${playoffLine(wins)} ${era} ${team} (${luck}) playoff run at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
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
        lead="One pull. Franchise, era, luck. Eight face-down. You turn five. Then the series play."
      />

      {step === "spin" && <RoomSpin onReady={startDraft} />}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-micro font-medium uppercase tracking-label text-subtle">
                02 · Rip · {team} · {era} · {luck}
              </p>
              <p className="mt-1 text-sm text-muted">
                {open.length} turned · {picks.length} of 5 locked in. {luckLine(luck)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={rip} disabled={open.length === pack.length}>
                Turn them all
              </Button>
              <Button variant="ghost" onClick={() => startDraft(team as Franchise, era as Era, luck)}>
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
                team={team}
                revealed={open.includes(player.id)}
                selected={picks.includes(player.id)}
                index={picks.indexOf(player.id)}
                onToggle={() => flip(player.id)}
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
          <ResultPoster team={team} era={`${era} · ${luck}`} wins={wins} roster={roster} kind="playoff" />
          <div>
            <p className="font-display text-2xl font-semibold">{playoffLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {playoffLine(wins)} walked. Projected {projected} series wins as a formula. {luckLine(luck)}
            </p>
            {recap && <SeasonRecap recap={recap} />}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton team={team} era={era} wins={wins} roster={roster} kind="playoff" luck={luck} />
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
