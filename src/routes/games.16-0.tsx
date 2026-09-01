import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { DraftFilters, GameBar, StepKicker } from "@/components/game-bar";
import { MathSheet } from "@/components/math-sheet";
import { NamePlate } from "@/components/name-plate";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { RipPack } from "@/components/rip-pack";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { RosterRail } from "@/components/roster-rail";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import { ExportStudioButton } from "@/components/studio-file";
import { Button } from "@/components/ui/button";
import { filterPack, type PosFilter } from "@/lib/draft";
import { LUCKS, luckLine, type Luck } from "@/lib/luck";
import {
  nbaBook,
  dealFrom,
  freshEntropy,
  rngFrom,
  playoffLabel,
  playoffLine,
  ERAS,
  FRANCHISES,
  type Era,
  type Franchise,
  type Player,
} from "@/lib/nba";
import { recapOf, type Recap } from "@/lib/recap";
import { deltaVsBest } from "@/lib/ledger";
import { playoffTelemetry } from "@/lib/telemetry";
import { playoffWalk, type Night } from "@/lib/sim";
import { bestFrom, loadSave, recordRun } from "@/lib/studio-save";
import { ripTick, tick } from "@/lib/tick";
import { decodeChallengeIds, encodePlayoffWalk, playersOf } from "@/lib/walk";
import { cn } from "@/lib/utils";

type Search = {
  team?: string;
  era?: Era;
  luck?: Luck;
  beat?: number;
  ids?: string[];
};

export const Route = createFileRoute("/games/16-0")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const team = typeof raw.team === "string" && (FRANCHISES as readonly string[]).includes(raw.team) ? raw.team : undefined;
    const era = typeof raw.era === "string" && (ERAS as readonly string[]).includes(raw.era) ? (raw.era as Era) : undefined;
    const luck = typeof raw.luck === "string" && (LUCKS as readonly string[]).includes(raw.luck) ? (raw.luck as Luck) : undefined;
    const beat = Number(raw.beat);
    return {
      team,
      era,
      luck,
      beat: Number.isFinite(beat) ? beat : undefined,
      ids: decodeChallengeIds(raw.ids),
    };
  },
  component: SixteenPage,
});

type Step = "spin" | "draft" | "season" | "result";

function dealPack(seed: string) {
  return dealFrom(nbaBook(), rngFrom(seed), 10);
}

function SixteenPage() {
  const challenge = Route.useSearch();
  const [step, setStep] = useState<Step>("spin");
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [luck, setLuck] = useState<Luck>(challenge.luck ?? "Even");
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
  const [copied, setCopied] = useState(false);
  const [walkId, setWalkId] = useState("");
  const [walkCopied, setWalkCopied] = useState(false);
  const [ripped, setRipped] = useState(false);
  const [ripping, setRipping] = useState(false);

  const roster = picks
    .map((id) => pack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const shown = filterPack(pack, query, pos);
  const ghost = useMemo(() => (challenge.ids ? playersOf(challenge.ids) : []), [challenge.ids]);
  const beat = challenge.beat;
  const ghostNights = useMemo(() => {
    if (ghost.length !== 5 || !team || !era) return [];
    return playoffWalk(team, era, ghost, luck).nights;
  }, [ghost, team, era, luck]);

  const startDraft = useCallback((nextTeam: string, nextEra: Era, nextLuck: Luck) => {
    setTeam(nextTeam as Franchise);
    setEra(nextEra);
    setLuck(nextLuck);
    setPack(dealPack(`${nextTeam}:${nextEra}:${nextLuck}:${freshEntropy()}`));
    setPicks([]);
    setOpen([]);
    setQuery("");
    setPos("ALL");
    setRipped(false);
    setRipping(false);
    setStep("draft");
  }, []);

  function flip(id: string) {
    if (!open.includes(id)) {
      setOpen((cur) => [...cur, id]);
      ripTick();
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
        ripTick();
      }, i * 70);
    });
  }

  function tearPack() {
    if (ripping || ripped) return;
    setRipping(true);
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      setRipped(true);
      setRipping(false);
      pack.forEach((p, i) => {
        window.setTimeout(
          () => {
            setOpen((cur) => (cur.includes(p.id) ? cur : [...cur, p.id]));
            ripTick();
          },
          reduce ? 0 : i * 70,
        );
      });
    }, reduce ? 0 : 480);
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
    const id = encodePlayoffWalk({
      team,
      era,
      luck,
      wins: walk.wins,
      ids: roster.map((p) => p.id),
    });
    setWalkId(id);
    setStep("season");
    recordRun({
      id: `${Date.now()}`,
      at: Date.now(),
      mode: "16-0",
      team,
      era,
      wins: walk.wins,
      roster: roster.map((p) => p.id),
      luck,
      walk: id,
      recap: summary,
      nights: walk.nights.map((n) => ({ win: n.win, us: n.us, them: n.them, opp: n.opp, home: n.home })),
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
    setQuery("");
    setPos("ALL");
    setNights([]);
    setRipped(false);
    setRipping(false);
    setCopied(false);
    setWalkId("");
    setWalkCopied(false);
  }

  async function copyLine() {
    const line = `Walked a ${playoffLine(wins)} ${era} ${team} (${luck}) playoff run at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}. /walk/${walkId}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyWalk() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/walk/${encodeURIComponent(walkId)}`);
      setWalkCopied(true);
    } catch {
      setWalkCopied(false);
    }
  }

  return (
    <div>
      <PageIntro
        kicker="Build a 16-0"
        title="Sixteen wins. One banner."
        lead="One pull. Franchise, era, luck. Ten face-down. You turn five. Then the series play. Lose a series, the run is over."
        mark="playoff"
      />



      <GameBar current="playoffs" onNew={reset} />

      {beat != null && Number.isFinite(beat) && (
        <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm shadow-border">
          Beat {playoffLine(beat)}. Same room. New pack. {challenge.team} · {challenge.era}
          {challenge.luck ? ` · ${challenge.luck}` : ""}
          {ghost.length === 5 ? ` · They walked with ${ghost.map((p) => p.name).join(", ")}.` : ""}
        </p>
      )}

      {step === "spin" && (
        <RoomSpin
          auto
          onReady={startDraft}
          locked={challenge.team && challenge.era ? { team: challenge.team, era: challenge.era, luck: challenge.luck } : undefined}
        />
      )}

      {step === "draft" && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <StepKicker
              n={2}
              label={ripped ? "Pick" : "Rip"}
              hint={
                ripped
                  ? `${team} · ${era} · ${luck}. ${open.length} turned · ${picks.length} of 5. ${luckLine(luck)}`
                  : `${team} · ${era} · ${luck}. Tear the foil.`
              }
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-2">
              {ripped ? (
                <>
                  <Button variant="ghost" onClick={rip} disabled={open.length === pack.length}>
                    Turn them all
                  </Button>
                  <Button variant="ghost" onClick={() => startDraft(team as Franchise, era as Era, luck)}>
                    Redeal
                  </Button>
                  <Button onClick={lock} disabled={picks.length !== 5}>
                    Lock five
                  </Button>
                </>
              ) : (
                <Button onClick={tearPack} disabled={ripping}>
                  {ripping ? "Ripping…" : "Rip pack"}
                </Button>
              )}
            </div>
          </div>
          {ghost.length === 5 && (
            <ul className="mb-4 flex flex-wrap gap-3">
              {ghost.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-muted">
                  <NamePlate name={p.name} id={p.id} pos={p.pos} era={p.era} size="sm" />
                  {p.name}
                </li>
              ))}
            </ul>
          )}
          {ripped && <DraftFilters query={query} onQuery={setQuery} pos={pos} onPos={setPos} />}
          <div className="grid gap-6 lg:grid-cols-dashboard">
            {!ripped ? (
              <RipPack
                room="playoff"
                team={team || undefined}
                lot={`16-0:${team}:${era}:${luck}`}
                ripping={ripping}
                onRip={tearPack}
              />
            ) : shown.length === 0 ? (
              <p className="text-sm text-muted">Nothing in this pack matches. Clear the search.</p>
            ) : (
              <div className="pack-grid">
                {shown.map((player) => (
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
            )}
            <RosterRail roster={roster} />
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
          <ResultPoster
            team={team}
            era={`${era} · ${luck}`}
            wins={wins}
            roster={roster}
            kind="playoff"
            nights={nights}
            ghostNights={ghostNights}
          />
          <div>
            <p className="font-display text-2xl font-semibold">{playoffLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {playoffLine(wins)} walked. Projected {projected} series wins as a formula. {luckLine(luck)}
            </p>
            {beat != null && Number.isFinite(beat) && (
              <p className="mt-3 text-sm text-fg">
                {wins > beat ? `Beat it. ${playoffLine(beat)} was the mark.` : wins === beat ? "Even." : `Short. The mark was ${playoffLine(beat)}.`}
              </p>
            )}
            {recap && <SeasonRecap recap={recap} />}
            {era ? (
              <div className="mt-4">
                <MathSheet
                  telemetry={playoffTelemetry(roster, era)}
                  roster={roster}
                  best={deltaVsBest(wins, bestFrom(loadSave().runs, "16-0") || wins)}
                />
              </div>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              This room, this device, best {bestFrom(loadSave().runs, "16-0") || wins}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton
                team={team}
                era={era}
                wins={wins}
                roster={roster}
                kind="playoff"
                luck={luck}
                nights={nights}
                ghostNights={ghostNights}
                beat={beat}
              />
              <ExportStudioButton />
              {walkId ? (
                <Link
                  to="/walk/$id"
                  params={{ id: walkId }}
                  className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
                >
                  Open the walk
                </Link>
              ) : null}
              <Button variant="ghost" onClick={copyWalk}>{walkCopied ? "Walk copied" : "Copy walk"}</Button>
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                Spin another
              </Button>
              <Link to="/shop" className={cn("inline-flex min-h-11 items-center px-4 text-sm text-muted")}>
                The press
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
