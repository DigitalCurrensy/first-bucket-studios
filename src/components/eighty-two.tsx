import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DraftFilters, GameBar, StepKicker, type GameMode } from "@/components/game-bar";
import { NamePlate } from "@/components/name-plate";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { JobTicket, StepRail } from "@/components/press-furniture";
import { RipPack } from "@/components/rip-pack";
import { ResultPoster } from "@/components/result-poster";
import { RoomSpin } from "@/components/room-spin";
import { RosterRail } from "@/components/roster-rail";
import { LithographLoader } from "@/components/lithograph-loader";
import { MathSheet } from "@/components/math-sheet";
import { SeasonRecap } from "@/components/season-recap";
import { SeasonWalk } from "@/components/season-walk";
import { ShareCardButton } from "@/components/share-card-button";
import { ExportStudioButton } from "@/components/studio-file";
import { StreakStrip } from "@/components/streak-strip";
import { WalkCard } from "@/components/walk-card";
import { Button } from "@/components/ui/button";
import { filterPack, type PosFilter } from "@/lib/draft";
import { copyText } from "@/lib/deliver";
import { luckLine, type Luck } from "@/lib/luck";
import { HOUSE_PACK, dealHousePack, housePackSeed, walkHouse } from "@/lib/house-pack";
import {
  cornersOk,
  dealCornersPack,
  dealFrom,
  freshEntropy,
  rngFrom,
  nbaBook,
  recordLine,
  winLabel,
  wnbaBook,
  WNBA_FRANCHISES,
  type Era,
  type Player,
} from "@/lib/nba";
import { markDemo } from "@/lib/demo-funnel";
import { recapOf, type Recap } from "@/lib/recap";
import { deltaVsBest } from "@/lib/ledger";
import { seasonTelemetry } from "@/lib/telemetry";
import { seasonWalk, wnbaWalk, type Night } from "@/lib/sim";
import { bestFrom, justFiled, loadSave, needsExportNag, recordRun, todayKey, yesterdayKey } from "@/lib/studio-save";
import { ripTick } from "@/lib/tick";
import { dailyRoom, encodeChallengeIds, encodeWalk, encodeWnbaWalk, houseWalk, playersOf, walkUrl } from "@/lib/walk";
import { cn } from "@/lib/utils";

type Mode = "82-0" | "daily" | "corners" | "wnba";
type Step = "spin" | "draft" | "season" | "result";

export type Challenge = {
  team?: string;
  era?: Era;
  luck?: Luck;
  beat?: number;
  ids?: string[];
  pack?: "house";
};

function barFor(mode: Mode): GameMode {
  if (mode === "daily") return "daily";
  if (mode === "corners") return "corners";
  if (mode === "wnba") return "wnba";
  return "classic";
}

export function EightyTwo({ mode, challenge }: { mode: Mode; challenge?: Challenge }) {
  const daily = mode === "daily";
  const corners = mode === "corners";
  const wnba = mode === "wnba";
  const cue = challenge?.pack === "house";
  const of = wnba ? 40 : 82;
  const stamp = todayKey();
  const house = useMemo(() => (daily ? dailyRoom(stamp) : null), [daily, stamp]);
  const houseFive = useMemo(() => (daily ? houseWalk(stamp).five : []), [daily, stamp]);

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

  const [step, setStep] = useState<Step>(challenge?.pack === "house" ? "draft" : "spin");
  const [team, setTeam] = useState<string>(challenge?.pack === "house" ? HOUSE_PACK.team : "");
  const [era, setEra] = useState<Era | "">(challenge?.pack === "house" ? HOUSE_PACK.era : "");
  const [luck, setLuck] = useState<Luck>(challenge?.luck ?? (challenge?.pack === "house" ? HOUSE_PACK.luck : "Even"));
  const [pack, setPack] = useState<Player[]>(() => (challenge?.pack === "house" ? dealHousePack() : []));
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
  const [ripped, setRipped] = useState(false);
  const [ripping, setRipping] = useState(false);
  const houseBoot = useRef(false);

  useEffect(() => {
    if (step === "result" && walkId) markDemo("card", walkId);
  }, [step, walkId]);

  const activeTeam = daily ? (locked?.team ?? team) : team;
  const activeEra = daily ? (locked?.era ?? era) : era;
  const activeLuck = daily ? (locked?.luck ?? luck) : luck;
  const activePack = daily && step !== "spin" ? (locked?.pack ?? pack) : pack;
  const roster = picks
    .map((id) => activePack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const shown = filterPack(activePack, query, pos);
  const lined = corners ? cornersOk(roster) : roster.length === 5;
  const ghost = challenge?.ids ? playersOf(challenge.ids) : [];
  const ghostNights = useMemo(() => {
    if (ghost.length !== 5 || !activeTeam || !activeEra) return [];
    const walk = wnba
      ? wnbaWalk(activeTeam, activeEra, ghost, activeLuck)
      : seasonWalk(activeTeam, activeEra, ghost, activeLuck);
    return walk.nights;
  }, [challenge?.ids, activeTeam, activeEra, activeLuck, wnba]);

  const startDraft = useCallback(
    (nextTeam: string, nextEra: Era, nextLuck: Luck) => {
      setTeam(nextTeam);
      setEra(nextEra);
      setLuck(nextLuck);
      const seed =
        challenge?.pack === "house"
          ? housePackSeed()
          : `${nextTeam}:${nextEra}:${nextLuck}:${freshEntropy()}`;
      const rng = rngFrom(seed);
      const nextPack =
        challenge?.pack === "house"
          ? dealHousePack()
          : daily && locked?.pack?.length
            ? locked.pack
            : corners
              ? dealCornersPack(nbaBook(), rng, 10)
              : dealFrom(wnba ? wnbaBook() : nbaBook(), rng, 10);
      setPack(nextPack);
      setPicks([]);
      setOpen([]);
      setQuery("");
      setPos("ALL");
      setRipped(false);
      setRipping(false);
      setStep("draft");
      markDemo("room", `${nextTeam} · ${nextEra} · ${nextLuck}`);
    },
    [daily, locked, corners, wnba, challenge?.pack],
  );

  useEffect(() => {
    if (houseBoot.current) return;
    if (mode !== "82-0" || challenge?.pack !== "house") return;
    houseBoot.current = true;
    startDraft(HOUSE_PACK.team, HOUSE_PACK.era, HOUSE_PACK.luck);
  }, [mode, challenge?.pack, startDraft]);

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
    const ids = activePack.map((p) => p.id);
    ids.forEach((id, i) => {
      window.setTimeout(() => {
        setOpen((cur) => (cur.includes(id) ? cur : [...cur, id]));
        ripTick();
      }, i * 70);
    });
  }

  function tearPack() {
    if (ripping || ripped) return;
    setRipping(true);
    markDemo("foil");
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ids = activePack.map((p) => p.id);
    window.setTimeout(() => {
      setRipped(true);
      setRipping(false);
      if (challenge?.pack === "house") {
        const staged = walkHouse();
        setOpen(staged.ten.map((p) => p.id));
        setPicks(staged.five.map((p) => p.id));
        return;
      }
      ids.forEach((id, i) => {
        window.setTimeout(
          () => {
            setOpen((cur) => (cur.includes(id) ? cur : [...cur, id]));
            ripTick();
          },
          reduce ? 0 : i * 70,
        );
      });
    }, reduce ? 0 : 480);
  }

  function commitWalk(nextRoster: Player[], staged?: { wins: number; projected: number; nights: Night[]; us: string }) {
    const ok = corners ? cornersOk(nextRoster) : nextRoster.length === 5;
    if (!ok || !activeEra || !activeTeam) return;
    const walk =
      staged ??
      (wnba ? wnbaWalk(activeTeam, activeEra, nextRoster, activeLuck) : seasonWalk(activeTeam, activeEra, nextRoster, activeLuck));
    const summary = recapOf(walk.nights, walk.projected);
    const id = wnba
      ? encodeWnbaWalk({
          team: activeTeam,
          era: activeEra,
          luck: activeLuck,
          wins: walk.wins,
          ids: nextRoster.map((p) => p.id),
        })
      : encodeWalk({
          team: activeTeam,
          era: activeEra,
          luck: activeLuck,
          wins: walk.wins,
          ids: nextRoster.map((p) => p.id),
        });
    setWins(walk.wins);
    setProjected(walk.projected);
    setNights(walk.nights);
    setRecap(summary);
    setClub(walk.us);
    setWalkId(id);
    setStep(challenge?.pack === "house" ? "result" : "season");
    markDemo("lock", id);
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
        roster: nextRoster.map((p) => p.id),
        luck: activeLuck,
        walk: id,
        recap: summary,
        nights: walk.nights.map((n) => ({ win: n.win, us: n.us, them: n.them, opp: n.opp, home: n.home })),
      },
      daily ? stamp : undefined,
    );
    setAlready(wasToday);
    setStreak(next.streak);
  }

  function lock() {
    commitWalk(roster);
  }

  function reset() {
    if (cue) {
      startDraft(HOUSE_PACK.team, HOUSE_PACK.era, HOUSE_PACK.luck);
      return;
    }
    setPicks([]);
    setOpen([]);
    setQuery("");
    setPos("ALL");
    setCopied(false);
    setChallengeCopied(false);
    setWalkCopied(false);
    setNights([]);
    setWalkId("");
    setRipped(false);
    setRipping(false);
    setStep("spin");
    if (!daily) {
      setTeam("");
      setEra("");
      setPack([]);
    }
  }

  async function copyLine() {
    const line = `Walked a ${recordLine(wins, of)} ${activeEra} ${activeTeam} (${activeLuck}) at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}. /walk/${walkId}`;
    setCopied(await copyText(line));
  }

  async function copyChallenge() {
    const href = wnba ? "/games/wnba" : corners ? "/games/corners" : "/games/82-0";
    const ids = encodeChallengeIds(roster.map((p) => p.id));
    const query = `${href}?team=${encodeURIComponent(activeTeam)}&era=${encodeURIComponent(activeEra)}&luck=${encodeURIComponent(activeLuck)}&beat=${wins}&ids=${ids}`;
    setChallengeCopied(await copyText(query));
  }

  async function copyWalk() {
    const url = walkUrl(walkId);
    const ok = await copyText(url);
    setWalkCopied(ok);
    if (ok) markDemo("copy", walkId);
  }

  const save = loadSave();
  const yKey = yesterdayKey();
  const yHouse = daily ? houseWalk(yKey) : null;
  const broke = daily && save.lastDaily && save.lastDaily !== stamp && save.lastDaily !== yKey;
  const eraFits = roster.filter((p) => p.era === activeEra).length;
  const beat = challenge?.beat;
  const title = cue
    ? "Rip the pack. Send the card."
    : daily
      ? "One deal. One day."
      : corners
        ? "Start the corners."
        : wnba
          ? "Forty nights."
          : "Rip the pack. Send the card.";
  const lead = cue
    ? "Thunder. Positionless. Tear the foil. Send the card."
    : daily
      ? "Same pack. The house five hangs on the Brief. Yours is yours. Rip ten. Turn five. Then 82 nights play."
      : corners
        ? "The pack deals G/G/F/F/C. The corners have to hold. Then the season walks."
        : wnba
          ? "One pull. A W club, era, luck. Ten face-down. Forty nights. Honest length."
          : "A franchise lands. Ten cards. Five names. Eighty-two nights. No two walks match.";

  return (
    <div>
      <PageIntro
        kicker={cue ? "House pack" : daily ? "Daily Bucket" : corners ? "Four corners" : wnba ? "WNBA walk" : "Prospect pack"}
        title={title}
        lead={lead}
        mark={daily ? "daily" : corners ? "corners" : wnba ? "wnba" : "machine"}
      />

      {mode !== "82-0" && !cue && <GameBar current={barFor(mode)} onNew={daily ? undefined : reset} />}

      {beat != null && Number.isFinite(beat) && (
        <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm shadow-border">
          Beat {recordLine(beat, of)}. Same room. New pack. {challenge?.team} · {challenge?.era}
          {challenge?.luck ? ` · ${challenge.luck}` : ""}
          {ghost.length === 5 ? ` · They walked with ${ghost.map((p) => p.name).join(", ")}.` : ""}
        </p>
      )}

      {daily && house && (
        <div className="mb-8">
          <p className="mb-3 text-sm text-muted">
            {stamp} · {house.team} · {house.era} · {house.luck}
            {save.streak > 0 && <span className="ml-3 text-fg">Streak {save.streak}</span>}
          </p>
          <StreakStrip today={stamp} lastDaily={save.lastDaily} streak={save.streak} />
        </div>
      )}
      {daily && broke && yHouse && (
        <div className="mb-6">
          <p className="mb-3 text-sm text-muted">Streak broke. Yesterday’s house five still hangs on the Brief.</p>
          <div className="max-w-md">
            <WalkCard id={yHouse.id} />
          </div>
        </div>
      )}
      {daily && yHouse && save.lastDaily === yKey && (
        <div className="mb-6 max-w-md">
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">Yesterday</p>
          <WalkCard id={yHouse.id} />
        </div>
      )}

      {step === "spin" && (
        <>
          {daily && (
            <div className="mb-8 max-w-md">
              <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">House five · Brief</p>
              <WalkCard id={houseWalk(stamp).id} />
            </div>
          )}
          <RoomSpin
            clubs={wnba ? WNBA_FRANCHISES : undefined}
            clubLabel={wnba ? "Club" : "Franchise"}
            locked={
              daily && locked
                ? { team: locked.team, era: locked.era, luck: locked.luck }
                : !daily && challenge?.team && challenge.era
                  ? { team: challenge.team, era: challenge.era, luck: challenge.luck }
                  : undefined
            }
            auto
            onReady={startDraft}
          />
        </>
      )}

      {step === "draft" && (
        <section>
          {cue ? <StepRail current={2} className="mb-6" /> : null}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <StepKicker
              n={2}
              label={ripped ? "Pick" : "Rip"}
              hint={
                ripped
                  ? cue
                    ? `${activeTeam} · ${activeEra} · ${activeLuck}. House five is marked. Lock and send.`
                    : `${activeTeam} · ${activeEra} · ${activeLuck}. ${open.length} turned · ${picks.length} of 5. ${luckLine(activeLuck)}${corners ? " Start G/G/F/F/C." : ""}`
                  : `${activeTeam} · ${activeEra} · ${activeLuck}. Tear the foil.`
              }
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-2">
              {ripped ? (
                <>
                  {!cue && (
                    <Button variant="ghost" onClick={rip} disabled={open.length === activePack.length}>
                      Turn them all
                    </Button>
                  )}
                  <Button onClick={lock} disabled={!lined}>
                    {cue ? "Walk this five" : "Lock five"}
                  </Button>
                </>
              ) : (
                <Button onClick={tearPack} disabled={ripping}>
                  {ripping ? "Ripping…" : "Rip pack"}
                </Button>
              )}
            </div>
          </div>
          {corners && roster.length === 5 && !lined && (
            <p className="mb-4 text-sm text-warn">The corners have to hold. Two guards, two wings, one center.</p>
          )}
          {daily && houseFive.length === 5 && (
            <ul className="mb-4 flex flex-wrap gap-3">
              {houseFive.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-muted">
                  <NamePlate name={p.name} id={p.id} pos={p.pos} era={p.era} size="sm" />
                  {p.name}
                </li>
              ))}
            </ul>
          )}
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
          {ripped && !cue && <DraftFilters query={query} onQuery={setQuery} pos={pos} onPos={setPos} />}
          <div className="grid items-start gap-6 lg:grid-cols-dashboard">
            {!ripped ? (
              <RipPack
                room={wnba ? "wnba" : "nba"}
                team={activeTeam}
                lot={`${mode}:${activeTeam}:${activeEra}:${activeLuck}`}
                ripping={ripping}
                onRip={tearPack}
              />
            ) : pack.length === 0 ? (
              <LithographLoader />
            ) : shown.length === 0 ? (
              <p className="text-sm text-muted">Nothing in this pack matches. Clear the search.</p>
            ) : (
              <div className="pack-grid">
                {shown.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    team={activeTeam}
                    revealed={open.includes(player.id)}
                    selected={picks.includes(player.id)}
                    index={picks.indexOf(player.id)}
                    stamp={corners ? player.pos : undefined}
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
          of={of}
          projected={projected}
          onDone={() => setStep("result")}
        />
      )}

      {step === "result" && (
        <section>
          {cue ? <StepRail current={4} className="mb-8" /> : null}
          <div className="grid gap-8 lg:grid-cols-2">
          <ResultPoster
            team={activeTeam}
            era={`${activeEra} · ${activeLuck}`}
            wins={wins}
            roster={roster}
            kind={wnba ? "wnba" : "season"}
            nights={nights}
            ghostNights={ghostNights}
          />
          <JobTicket kicker={cue ? "Step 4 · Send" : "The walk"}>
            <p className="mt-2 font-display text-2xl font-semibold">{winLabel(wins, of)}</p>
            <p className="mt-2 text-muted">
              {cue
                ? `${recordLine(wins, of)} walked. Same five. Same nights.`
                : `${recordLine(wins, of)} walked. Projected ${projected}. ${luckLine(activeLuck)}${eraFits ? ` ${eraFits} era fits in the five.` : " No era fits — the walk paid for that."}`}
            </p>
            {beat != null && Number.isFinite(beat) && (
              <p className="mt-3 text-sm text-fg">
                {wins > beat
                  ? `Beat it. ${recordLine(beat, of)} was the mark.`
                  : wins === beat
                    ? "Even. Same walk, different night."
                    : `Short. The mark was ${recordLine(beat, of)}.`}
              </p>
            )}
            {recap && <SeasonRecap recap={recap} />}
            {mode !== "82-0" && !cue && (
              <div className="mt-4">
                <MathSheet
                  telemetry={seasonTelemetry(roster, activeEra, of)}
                  roster={roster}
                  best={deltaVsBest(wins, bestFrom(save.runs, mode) || wins)}
                />
              </div>
            )}
            {daily && already && <p className="mt-3 text-sm text-subtle">Replay logged. Streak already counted today.</p>}
            {daily && !already && streak > 0 && <p className="mt-3 text-sm text-fg">Streak {streak}.</p>}
            {mode !== "82-0" && !cue && justFiled() && <p className="mt-3 text-sm text-fg">Studio file saved. The house is the file.</p>}
            {daily && justFiled() && <p className="mt-2 text-sm text-muted">The streak is in the file.</p>}
            {daily && (
              <div className="mt-4">
                <StreakStrip today={stamp} lastDaily={save.lastDaily} streak={streak || save.streak} />
              </div>
            )}
            {mode !== "82-0" && !cue && (
              <p className="mt-3 text-sm text-muted">This room, this device, best {bestFrom(save.runs, mode) || wins}.</p>
            )}
            {mode !== "82-0" && !cue && ((daily && streak >= 2 && !save.exportedAt) || needsExportNag(save)) && (
              <p className="mt-3 text-sm text-fg">The streak dies with this browser. Export the file.</p>
            )}
            {walkId ? (
                <p className="mt-4 break-all font-mono text-micro text-subtle">/walk/{walkId}</p>
              ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton
                team={activeTeam}
                era={activeEra}
                wins={wins}
                roster={roster}
                luck={activeLuck}
                nights={nights}
                kind={wnba ? "wnba" : "season"}
                ghostNights={ghostNights}
                beat={beat}
              />
              {!cue && mode !== "82-0" && <ExportStudioButton loud={needsExportNag(save) || (daily && streak >= 2 && !save.exportedAt)} />}
              {walkId ? (
                <Link
                  to="/walk/$id"
                  params={{ id: walkId }}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium",
                    cue ? "shadow-border" : "bg-fg text-paper",
                  )}
                >
                  Open the walk
                </Link>
              ) : null}
              <Button variant="ghost" onClick={copyWalk}>
                {walkCopied ? "Walk copied" : "Copy walk"}
              </Button>
              {mode !== "82-0" && !cue && (
                <Button variant="ghost" onClick={copyLine}>
                  {copied ? "Copied" : "Copy line"}
                </Button>
              )}
              {mode !== "82-0" && !cue && (
                <Button variant="ghost" onClick={copyChallenge}>
                  {challengeCopied ? "Challenge copied" : "Beat it"}
                </Button>
              )}
              {!daily && (
                <Button variant="ghost" onClick={reset}>
                  {cue ? "Rip again" : "Pull again"}
                </Button>
              )}
            </div>
          </JobTicket>
          </div>
        </section>
      )}
    </div>
  );
}
