import { Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { DraftFilters, GameBar, StepKicker, type GameMode } from "@/components/game-bar";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { RosterRail } from "@/components/roster-rail";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import { Button } from "@/components/ui/button";
import { filterPack, type PosFilter } from "@/lib/draft";
import { luckLine, type Luck } from "@/lib/luck";
import {
  cornersOk,
  dealFrom,
  hashSeed,
  mulberry32,
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
import { dailyRoom, encodeWalk } from "@/lib/walk";
import { cn } from "@/lib/utils";

type Mode = "82-0" | "daily" | "corners";
type Step = "spin" | "draft" | "season" | "result";

export type Challenge = {
  team?: Franchise;
  era?: Era;
  luck?: Luck;
  beat?: number;
};

function dealPack(seed: string) {
  const rng = mulberry32(hashSeed(seed));
  return dealFrom(PLAYERS, rng, 10);
}

function barFor(mode: Mode): GameMode {
  if (mode === "daily") return "daily";
  if (mode === "corners") return "corners";
  return "classic";
}

export function EightyTwo({ mode, challenge }: { mode: Mode; challenge?: Challenge }) {
  const daily = mode === "daily";
  const corners = mode === "corners";
  const stamp = todayKey();
  const house = useMemo(() => (daily ? dailyRoom(stamp) : null), [daily, stamp]);

  const locked = useMemo(() => {
    if (daily && house) {
      return { team: house.team, era: house.era, luck: house.luck, pack: house.pack };
    }
    if (challenge?.team && challenge.era) {
      return {
        team: challenge.team,
        era: challenge.era,
        luck: challenge.luck,
        pack: [] as Player[],
      };
    }
    return null;
  }, [daily, house, challenge]);

  const [step, setStep] = useState<Step>("spin");
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [luck, setLuck] = useState<Luck>(challenge?.luck ?? "Even");
  const [pack, setPack] = useState<Player[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PosFilter>("ALL");
  const [wins, setWins] = useState(0);
  const [projected, setProjected] = useState(0);
  const [nights, setNights] = useState<Night[]>([]);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [club, setClub] = useState("FBS");
  const [walkId, setWalkId] = useState("");
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [walkCopied, setWalkCopied] = useState(false);
  const [already, setAlready] = useState(false);
  const [streak, setStreak] = useState(0);

  const activeTeam = daily ? (locked?.team ?? team) : team;
  const activeEra = daily ? (locked?.era ?? era) : era;
  const activeLuck = daily ? (locked?.luck ?? luck) : luck;
  const activePack = daily && step !== "spin" ? (locked?.pack ?? pack) : pack;
  const roster = picks
    .map((id) => activePack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const shown = filterPack(activePack, query, pos);
  const lined = corners ? cornersOk(roster) : roster.length === 5;

  const startDraft = useCallback(
    (nextTeam: Franchise, nextEra: Era, nextLuck: Luck) => {
      setTeam(nextTeam);
      setEra(nextEra);
      setLuck(nextLuck);
      setPack(daily && locked?.pack?.length ? locked.pack : dealPack(`${nextTeam}:${nextEra}:${nextLuck}:${Date.now()}`));
      setPicks([]);
      setOpen([]);
      setQuery("");
      setPos("ALL");
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
    if (!lined || !activeEra || !activeTeam) return;
    const walk = seasonWalk(activeTeam, activeEra, roster, activeLuck);
    const summary = recapOf(walk.nights, walk.projected);
    const id = encodeWalk({
      team: activeTeam,
      era: activeEra,
      luck: activeLuck,
      wins: walk.wins,
      ids: roster.map((p) => p.id),
    });
    setWins(walk.wins);
    setProjected(walk.projected);
    setNights(walk.nights);
    setRecap(summary);
    setClub(walk.us);
    setWalkId(id);
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
        luck: activeLuck,
        walk: id,
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
    setQuery("");
    setPos("ALL");
    setCopied(false);
    setChallengeCopied(false);
    setWalkCopied(false);
    setNights([]);
    setWalkId("");
    setStep("spin");
    if (!daily) {
      setTeam("");
      setEra("");
      setPack([]);
    }
  }

  async function copyLine() {
    const line = `Walked a ${recordLine(wins)} ${activeEra} ${activeTeam} (${activeLuck}) at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}. /walk/${walkId}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyChallenge() {
    const url = `${window.location.origin}/games/82-0?team=${encodeURIComponent(activeTeam)}&era=${encodeURIComponent(activeEra)}&luck=${encodeURIComponent(activeLuck)}&beat=${wins}`;
    try {
      await navigator.clipboard.writeText(url);
      setChallengeCopied(true);
    } catch {
      setChallengeCopied(false);
    }
  }

  async function copyWalk() {
    const url = `${window.location.origin}/walk/${encodeURIComponent(walkId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setWalkCopied(true);
    } catch {
      setWalkCopied(false);
    }
  }

  const save = loadSave();
  const eraFits = roster.filter((p) => p.era === activeEra).length;
  const beat = challenge?.beat;
  const title = daily ? "One deal. One day." : corners ? "Start the corners." : "Pull the room. Rip the pack.";
  const lead = daily
    ? "The date pulls the room. Same five for the house. Rip ten. Turn five. Then 82 nights play."
    : corners
      ? "G, G, F, F, C. The corners have to hold. Then the season walks."
      : "One pull. Franchise, era, luck. Ten face-down. You turn five. The nights wander.";

  return (
    <div>
      <PageIntro
        kicker={daily ? "Daily Bucket" : corners ? "Four corners" : "Build an 82-0"}
        title={title}
        lead={lead}
      />

      <GameBar current={barFor(mode)} onNew={daily ? undefined : reset} />

      {beat != null && Number.isFinite(beat) && (
        <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm shadow-border">
          Beat {recordLine(beat)}. Same room. New pack. {challenge?.team} · {challenge?.era}
          {challenge?.luck ? ` · ${challenge.luck}` : ""}
        </p>
      )}

      {daily && house && (
        <p className="mb-8 text-sm text-muted">
          {stamp} · {house.team} · {house.era} · {house.luck}
          {save.streak > 0 && <span className="ml-3 text-fg">Streak {save.streak}</span>}
        </p>
      )}

      {step === "spin" && (
        <RoomSpin
          locked={
            daily && locked
              ? { team: locked.team, era: locked.era, luck: locked.luck }
              : challenge?.team && challenge.era
                ? { team: challenge.team, era: challenge.era, luck: challenge.luck }
                : undefined
          }
          auto={daily}
          onReady={startDraft}
        />
      )}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <StepKicker
              n={2}
              label="Pick"
              hint={`${activeTeam} · ${activeEra} · ${activeLuck}. ${open.length} turned · ${picks.length} of 5. ${luckLine(activeLuck)}${corners ? " Start G/G/F/F/C." : ""}`}
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={rip} disabled={open.length === activePack.length}>
                Turn them all
              </Button>
              <Button onClick={lock} disabled={!lined}>
                Lock five
              </Button>
            </div>
          </div>
          {corners && roster.length === 5 && !lined && (
            <p className="mb-4 text-sm text-warn">The corners have to hold. Two guards, two wings, one center.</p>
          )}
          <DraftFilters query={query} onQuery={setQuery} pos={pos} onPos={setPos} />
          <div className="grid gap-6 lg:grid-cols-dashboard">
            {shown.length === 0 ? (
              <p className="text-sm text-muted">Nothing in this pack matches. Clear the search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shown.map((player) => (
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
            )}
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
          <ResultPoster
            team={activeTeam}
            era={`${activeEra} · ${activeLuck}`}
            wins={wins}
            roster={roster}
            nights={nights}
          />
          <div>
            <p className="font-display text-2xl font-semibold">{winLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {recordLine(wins)} walked. Projected {projected}. {luckLine(activeLuck)}
              {eraFits ? ` ${eraFits} era fits in the five.` : " No era fits — the walk paid for that."}
            </p>
            {beat != null && Number.isFinite(beat) && (
              <p className="mt-3 text-sm text-fg">
                {wins > beat
                  ? `Beat it. ${recordLine(beat)} was the mark.`
                  : wins === beat
                    ? "Even. Same walk, different night."
                    : `Short. The mark was ${recordLine(beat)}.`}
              </p>
            )}
            {recap && <SeasonRecap recap={recap} />}
            {daily && already && <p className="mt-3 text-sm text-subtle">Replay logged. Streak already counted today.</p>}
            {daily && !already && streak > 0 && <p className="mt-3 text-sm text-fg">Streak {streak}.</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton
                team={activeTeam}
                era={activeEra}
                wins={wins}
                roster={roster}
                luck={activeLuck}
                nights={nights}
              />
              <Button variant="ghost" onClick={copyWalk}>
                {walkCopied ? "Walk copied" : "Copy walk"}
              </Button>
              <Button variant="ghost" onClick={copyLine}>
                {copied ? "Copied" : "Copy line"}
              </Button>
              <Button variant="ghost" onClick={copyChallenge}>
                {challengeCopied ? "Challenge copied" : "Beat it"}
              </Button>
              {!daily && (
                <Button variant="ghost" onClick={reset}>
                  Pull again
                </Button>
              )}
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
