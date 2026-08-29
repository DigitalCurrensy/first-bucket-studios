import { useCallback, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import { useMounted } from "@/lib/hooks";
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
import { cn } from "@/lib/utils";

type Mode = "82-0" | "daily";
type Step = "spin" | "draft" | "season" | "result";

function dealPack(seed: string) {
  const rng = mulberry32(hashSeed(seed));
  return dealFrom(PLAYERS, rng, 10);
}

export function EightyTwo({ mode }: { mode: Mode }) {
  const mounted = useMounted();
  const daily = mode === "daily";
  const stamp = mounted ? todayKey() : "";

  const locked = useMemo(() => {
    if (!daily || !stamp) return null;
    const rng = mulberry32(hashSeed(`daily:${stamp}`));
    return {
      team: pickIndex(rng, FRANCHISES),
      era: pickIndex(rng, ERAS),
      pack: dealFrom(PLAYERS, rng, 10),
    };
  }, [daily, stamp]);

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
  const [already, setAlready] = useState(false);
  const [streak, setStreak] = useState(0);

  const activeTeam = daily ? (locked?.team ?? team) : team;
  const activeEra = daily ? (locked?.era ?? era) : era;
  const activePack = daily && step !== "spin" ? (locked?.pack ?? pack) : pack;
  const roster = picks
    .map((id) => activePack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const startDraft = useCallback(
    (nextTeam: Franchise, nextEra: Era) => {
      setTeam(nextTeam);
      setEra(nextEra);
      setPack(daily && locked ? locked.pack : dealPack(`${nextTeam}:${nextEra}:${Date.now()}`));
      setPicks([]);
      setStep("draft");
    },
    [daily, locked],
  );

  function toggle(id: string) {
    setPicks((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur;
      return [...cur, id];
    });
  }

  function lock() {
    if (roster.length !== 5 || !activeEra || !activeTeam) return;
    const walk = seasonWalk(activeTeam, activeEra, roster);
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
    setCopied(false);
    setNights([]);
    setStep("spin");
    if (!daily) {
      setTeam("");
      setEra("");
      setPack([]);
    }
  }

  async function copyLine() {
    const line = `Walked a ${recordLine(wins)} ${activeEra} ${activeTeam} at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (daily && !mounted) {
    return (
      <div>
        <PageIntro kicker="Daily Bucket" title="One deal. One day." lead="The room is about to move…" />
      </div>
    );
  }

  const save = mounted ? loadSave() : null;
  const eraFits = roster.filter((p) => p.era === activeEra).length;

  return (
    <div>
      <PageIntro
        kicker={daily ? "Daily Bucket" : "Build an 82-0"}
        title={daily ? "One deal. One day." : "Spin the room. Walk the season."}
        lead={
          daily
            ? "The franchise and era spin to the date. Draft five. Then 82 nights play."
            : "The names move. Draft five. The formula is the center. The nights wander."
        }
      />

      {daily && locked && step !== "spin" && (
        <p className="mb-8 text-sm text-muted">
          {stamp} · {locked.team} · {locked.era}
          {save && save.streak > 0 && <span className="ml-3 text-fg">Streak {save.streak}</span>}
        </p>
      )}

      {step === "spin" && (
        <RoomSpin
          locked={daily && locked ? { team: locked.team, era: locked.era } : undefined}
          auto={daily}
          onReady={startDraft}
        />
      )}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-micro font-medium uppercase tracking-label text-subtle">
                {daily ? "Today’s pack" : `02 · Draft five · ${team} · ${era}`}
              </p>
              <p className="mt-1 text-sm text-muted">{picks.length} of 5 · Then the season plays.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!daily && (
                <Button variant="ghost" onClick={() => startDraft(team as Franchise, era as Era)}>
                  Redeal
                </Button>
              )}
              <Button onClick={lock} disabled={picks.length !== 5}>
                Lock five
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activePack.map((player) => (
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
          <ResultPoster team={activeTeam} era={activeEra} wins={wins} roster={roster} />
          <div>
            <p className="font-display text-2xl font-semibold">{winLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {recordLine(wins)} walked. Projected {projected}.
              {eraFits ? ` ${eraFits} era fits in the five.` : " No era fits — the walk paid for that."}
            </p>
            {recap && <SeasonRecap recap={recap} />}
            {daily && already && <p className="mt-3 text-sm text-subtle">Replay logged. Streak already counted today.</p>}
            {daily && !already && streak > 0 && <p className="mt-3 text-sm text-fg">Streak {streak}.</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton team={activeTeam} era={activeEra} wins={wins} roster={roster} />
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                {daily ? "Watch it spin" : "Spin another"}
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