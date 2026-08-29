import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { ResultPoster } from "@/components/result-poster";
import { useMounted } from "@/lib/hooks";
import {
  dealFrom,
  ERAS,
  FRANCHISES,
  hashSeed,
  mulberry32,
  pickIndex,
  PLAYERS,
  projectWins,
  recordLine,
  winLabel,
  type Era,
  type Franchise,
  type Player,
} from "@/lib/nba";
import { loadSave, recordRun, todayKey } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

type Mode = "82-0" | "daily";
type Step = "franchise" | "era" | "draft" | "result";

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

  const [step, setStep] = useState<Step>(daily ? "draft" : "franchise");
  const [team, setTeam] = useState<Franchise | "">("");
  const [era, setEra] = useState<Era | "">("");
  const [pack, setPack] = useState<Player[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [copied, setCopied] = useState(false);
  const [already, setAlready] = useState(false);
  const [streak, setStreak] = useState(0);

  const activeTeam = daily ? (locked?.team ?? "") : team;
  const activeEra = daily ? (locked?.era ?? "") : era;
  const activePack = daily ? (locked?.pack ?? []) : pack;
  const roster = picks
    .map((id) => activePack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  function startDraft(nextTeam: Franchise, nextEra: Era) {
    const seed = `${nextTeam}:${nextEra}:${Date.now()}`;
    setTeam(nextTeam);
    setEra(nextEra);
    setPack(dealPack(seed));
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
    if (roster.length !== 5 || !activeEra || !activeTeam) return;
    const projected = projectWins(roster, activeEra);
    setWins(projected);
    setStep("result");
    const before = loadSave();
    const wasToday = Boolean(daily && before.lastDaily === stamp);
    const next = recordRun(
      {
        id: `${Date.now()}`,
        at: Date.now(),
        mode,
        team: activeTeam,
        era: activeEra,
        wins: projected,
        roster: roster.map((p) => p.id),
      },
      daily ? stamp : undefined,
    );
    setAlready(wasToday);
    setStreak(next.streak);
  }

  function reset() {
    setPicks([]);
    setCopied(false);
    if (daily) {
      setStep("draft");
      return;
    }
    setStep("franchise");
    setTeam("");
    setEra("");
    setPack([]);
  }

  async function copyLine() {
    const line = `Built a ${recordLine(wins)} ${activeEra} ${activeTeam} at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}.`;
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
        <PageIntro kicker="Daily Bucket" title="One deal. One day." lead="Dealing today’s pack…" />
      </div>
    );
  }

  const save = mounted ? loadSave() : null;
  const eraFits = roster.filter((p) => p.era === activeEra).length;

  return (
    <div>
      <PageIntro
        kicker={daily ? "Daily Bucket" : "Build an 82-0"}
        title={daily ? "One deal. One day." : "Stack five. Project the season."}
        lead={
          daily
            ? "Franchise and era are locked to the date. Draft five. A balanced five travels."
            : "Pick a franchise, pick an era, draft five names. Balance and era-fit move the number."
        }
      />

      {daily && locked && (
        <p className="mb-8 text-sm text-muted">
          {stamp} · {locked.team} · {locked.era}
          {save && save.streak > 0 && <span className="ml-3 text-fg">Streak {save.streak}</span>}
        </p>
      )}

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
                {daily ? "Today’s pack" : `03 · Draft five · ${team} · ${era}`}
              </p>
              <p className="mt-1 text-sm text-muted">{picks.length} of 5 · A balanced five travels.</p>
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

      {step === "result" && (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team={activeTeam} era={activeEra} wins={wins} roster={roster} />
          <div>
            <p className="font-display text-2xl font-semibold">{winLabel(wins)}</p>
            <p className="mt-2 text-muted">
              {recordLine(wins)}. Peak average and position mix did the work
              {eraFits ? `, plus ${eraFits} era fits.` : ". No era fits — the number paid for that."}
            </p>
            {daily && already && <p className="mt-3 text-sm text-subtle">Replay logged. Streak already counted today.</p>}
            {daily && !already && streak > 0 && <p className="mt-3 text-sm text-fg">Streak {streak}.</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={copyLine}>{copied ? "Copied" : "Copy line"}</Button>
              <Button variant="ghost" onClick={reset}>
                {daily ? "Draft again" : "Build another"}
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
