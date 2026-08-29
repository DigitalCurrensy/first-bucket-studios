import { useCallback, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { RosterRail } from "@/components/roster-rail";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import { useMounted } from "@/lib/hooks";
import { LUCKS, luckLine, type Luck } from "@/lib/luck";
import {
  dealFrom,
  ERAS,
  FRANCHISES,
  hashSeed,
  mulberry32,
  pickIndex,
  PLAYERS,
  recordLine,
  winLabel,
  type Era,
  type Franchise,
  type Player,
} from "@/lib/nba";
import { recapOf, type Recap } from "@/lib/recap";
import { seasonWalk, type Night } from "@/lib/sim";
import { loadSave, recordRun, todayKey } from "@/lib/studio-save";
import { tick } from "@/lib/tick";
import { cn } from "@/lib/utils";

type Mode = "82-0" | "daily";
type Step = "spin" | "draft" | "season" | "result";

export type Challenge = {
  team?: Franchise;
  era?: Era;
  beat?: number;
};

function dealPack(seed: string) {
  const rng = mulberry32(hashSeed(seed));
  return dealFrom(PLAYERS, rng, 10);
}

export function EightyTwo({ mode, challenge }: { mode: Mode; challenge?: Challenge }) {
  const mounted = useMounted();
  const daily = mode === "daily";
  const stamp = mounted ? todayKey() : "";

  const locked = useMemo(() => {
    if (daily && stamp) {
      const rng = mulberry32(hashSeed(`daily:${stamp}`));
      return {
        team: pickIndex(rng, FRANCHISES),
        era: pickIndex(rng, ERAS),
        luck: pickIndex(rng, LUCKS),
        pack: dealFrom(PLAYERS, rng, 10),
      };
    }
    if (challenge?.team && challenge.era) {
      return { team: challenge.team, era: challenge.era, luck: undefined as Luck | undefined, pack: [] as Player[] };
    }
    return null;
  }, [daily, stamp, challenge]);

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
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [already, setAlready] = useState(false);
  const [streak, setStreak] = useState(0);

  const activeTeam = daily ? (locked?.team ?? team) : team;
  const activeEra = daily ? (locked?.era ?? era) : era;
  const activePack = daily && step !== "spin" ? (locked?.pack ?? pack) : pack;
  const roster = picks
    .map((id) => activePack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const startDraft = useCallback(
    (nextTeam: Franchise, nextEra: Era, nextLuck: Luck) => {
      setTeam(nextTeam);
      setEra(nextEra);
      setLuck(nextLuck);
      setPack(daily && locked?.pack?.length ? locked.pack : dealPack(`${nextTeam}:${nextEra}:${nextLuck}:${Date.now()}`));
      setPicks([]);
      setOpen([]);
      setStep("draft");
    },
    [daily, locked],
  );

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
    const ids = activePack.map((p) => p.id);
    ids.forEach((id, i) => {
      window.setTimeout(() => {
        setOpen((cur) => (cur.includes(id) ? cur : [...cur, id]));
        tick();
      }, i * 70);
    });
  }

  function lock() {
    if (roster.length !== 5 || !activeEra || !activeTeam) return;
    const walk = seasonWalk(activeTeam, activeEra, roster, luck);
    const summary = recapOf(walk.nights, walk.projected);
    setWins(walk.wins);
    setProjected(walk.projected);
    setNights(walk.nights);
    setRecap(summary);
    setClub(walk.us);
    setStep("season");
    const before = loadSave();
    const wasToday = Boolean(daily && before.lastDaily === stamp);
    const next = recordRun(
      {
        id: `${Date.now()}`,
        at: Date.now(),
        mode,
        team: activeTeam,
        era: activeEra,
        wins: walk.wins,
        roster: roster.map((p) => p.id),
        recap: summary,
      },
      daily ? stamp : undefined,
    );
    setAlready(wasToday);
    setStreak(next.streak);
  }

  function reset() {
    setPicks([]);
    setOpen([]);
    setCopied(false);
    setChallengeCopied(false);
    setNights([]);
    setStep("spin");
    if (!daily) {
      setTeam("");
      setEra("");
      setPack([]);
    }
  }

  async function copyLine() {
    const line = `Walked a ${recordLine(wins)} ${activeEra} ${activeTeam} (${luck}) at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyChallenge() {
    const url = `${window.location.origin}/games/82-0?team=${encodeURIComponent(activeTeam)}&era=${encodeURIComponent(activeEra)}&beat=${wins}`;
    try {
      await navigator.clipboard.writeText(url);
      setChallengeCopied(true);
    } catch {
      setChallengeCopied(false);
    }
  }

  if (daily && !mounted) {
    return (
      <div>
        <PageIntro kicker="Daily Bucket" title="One deal. One day." lead="The machine is about to pull…" />
      </div>
    );
  }

  const save = mounted ? loadSave() : null;
  const eraFits = roster.filter((p) => p.era === activeEra).length;
  const beat = challenge?.beat;

  return (
    <div>
      <PageIntro
        kicker={daily ? "Daily Bucket" : "Build an 82-0"}
        title={daily ? "One deal. One day." : "Pull the room. Rip the pack."}
        lead={
          daily
            ? "Three strips land on the date. Rip ten. Turn five. Then 82 nights play."
            : "One pull. Franchise, era, luck. Ten face-down. You turn five. The nights wander."
        }
      />

      {beat != null && Number.isFinite(beat) && (
        <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm shadow-border">
          Beat {recordLine(beat)}. Same room. New pack. {challenge?.team} · {challenge?.era}
        </p>
      )}

      {daily && locked && step !== "spin" && (
        <p className="mb-8 text-sm text-muted">
          {stamp} · {locked.team} · {locked.era}
          {save && save.streak > 0 && <span className="ml-3 text-fg">Streak {save.streak}</span>}
        </p>
      )}

      {step === "spin" && (
        <RoomSpin
          locked={
            daily && locked
              ? { team: locked.team, era: locked.era, luck: locked.luck }
              : challenge?.team && challenge.era
                ? { team: challenge.team, era: challenge.era }
                : undefined
          }
          auto={daily}
          onReady={startDraft}
        />
      )}

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
              <Button variant="ghost" onClick={rip} disabled={open.length === activePack.length}>
                Turn them all
              </Button>
              <Button onClick={lock} disabled={picks.length !== 5}>
                Lock five
              </Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-dashboard">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activePack.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  team={activeTeam}
                  revealed={open.includes(player.id)}
                  selected={picks.includes(player.id)}
                  index={picks.indexOf(player.id)}
                  onToggle={() => flip(player.id)}
                />
              ))}
            </div>
            <RosterRail roster={roster} />
          </div>
        </section>
      )}

      {step === "season" && (
        <SeasonWalk
          team={activeTeam}
          us={club}
          nights={nights}
          of={82}
          projected={projected}
          onDone={() => setStep("result")}
        />
      )}

      {step === "result" && (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team={activeTeam} era={`${activeEra} · ${luck}`} wins={wins} roster={roster} />
          <div>
            <p className="font-display text-2xl font-semibold">{winLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {recordLine(wins)} walked. Projected {projected}. {luckLine(luck)}
              {eraFits ? ` ${eraFits} era fits in the five.` : " No era fits — the walk paid for that."}
            </p>
            {beat != null && Number.isFinite(beat) && (
              <p className="mt-3 text-sm text-fg">
                {wins > beat ? `Beat it. ${recordLine(beat)} was the mark.` : wins === beat ? "Even. Same walk, different night." : `Short. The mark was ${recordLine(beat)}.`}
              </p>
            )}
            {recap && <SeasonRecap recap={recap} />}
            {daily && already && <p className="mt-3 text-sm text-subtle">Replay logged. Streak already counted today.</p>}
            {daily && !already && streak > 0 && <p className="mt-3 text-sm text-fg">Streak {streak}.</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton team={activeTeam} era={activeEra} wins={wins} roster={roster} luck={luck} />
              <Button variant="ghost" onClick={copyLine}>
                {copied ? "Copied" : "Copy line"}
              </Button>
              <Button variant="ghost" onClick={copyChallenge}>
                {challengeCopied ? "Challenge copied" : "Copy challenge"}
              </Button>
              <Button variant="ghost" onClick={reset}>
                {daily ? "Watch it pull" : "Pull again"}
              </Button>
              {mode === "82-0" ? (
                <Link to="/games/daily" className={cn("inline-flex min-h-11 items-center px-4 text-sm text-muted")}>
                  Daily Bucket
                </Link>
              ) : (
                <Link to="/games/82-0" className={cn("inline-flex min-h-11 items-center px-4 text-sm text-muted")}>
                  Free build
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}