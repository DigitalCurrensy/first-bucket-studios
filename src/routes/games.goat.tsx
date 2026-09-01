import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { initials, cardSerial } from "@/components/crest";
import { DraftFilters, GameBar, StepKicker } from "@/components/game-bar";
import { LithographLoader } from "@/components/lithograph-loader";
import { MathSheet } from "@/components/math-sheet";
import { NamePlate } from "@/components/name-plate";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { RipPack } from "@/components/rip-pack";
import { ResultPoster } from "@/components/result-poster";
import { RosterRail } from "@/components/roster-rail";
import { ShareCardButton } from "@/components/share-card-button";
import { ExportStudioButton } from "@/components/studio-file";
import { Button } from "@/components/ui/button";
import { filterPack, type PosFilter } from "@/lib/draft";
import { deltaVsBest } from "@/lib/ledger";
import { PLAYERS, dealFrom, freshEntropy, goatLabel, goatScore, rngFrom, type Player } from "@/lib/nba";
import { bestFrom, loadSave, recordRun } from "@/lib/studio-save";
import { goatTelemetry } from "@/lib/telemetry";
import { ripTick } from "@/lib/tick";
import { decodeChallengeIds, encodeGoatWalk, playersOf } from "@/lib/walk";

export const Route = createFileRoute("/games/goat")({
  validateSearch: (raw: Record<string, unknown>) => ({
    ids: decodeChallengeIds(raw.ids),
  }),
  component: GoatPage,
});

function GoatPage() {
  const challenge = Route.useSearch();
  const [book, setBook] = useState(false);
  const [pos, setPos] = useState<PosFilter>("ALL");
  const [query, setQuery] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [pack, setPack] = useState<Player[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [walkId, setWalkId] = useState("");
  const [walkCopied, setWalkCopied] = useState(false);
  const [ripped, setRipped] = useState(false);
  const [ripping, setRipping] = useState(false);

  useEffect(() => {
    setPack(dealFrom(PLAYERS, rngFrom(`goat:${freshEntropy()}`), 10));
  }, []);

  const ghost = challenge.ids ? playersOf(challenge.ids) : [];
  const roster = picks
    .map((id) => PLAYERS.find((p) => p.id === id) ?? pack.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const shown = useMemo(
    () => (book ? filterPack(PLAYERS, query, pos).sort((a, b) => b.peak - a.peak) : filterPack(pack, query, pos)),
    [book, query, pos, pack],
  );
  const live = goatScore(roster);
  const locked = score != null;

  function toggle(id: string) {
    if (locked) return;
    if (!book && !open.includes(id)) {
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

  function redeal() {
    setPack(dealFrom(PLAYERS, rngFrom(`goat:${freshEntropy()}`), 10));
    setPicks([]);
    setOpen([]);
    setRipped(false);
    setRipping(false);
  }

  function tearPack() {
    if (ripping || ripped) return;
    if (pack.length === 0) setPack(dealFrom(PLAYERS, rngFrom(`goat:${freshEntropy()}`), 10));
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
    if (roster.length !== 5) return;
    const next = goatScore(roster);
    const id = encodeGoatWalk({ wins: next, ids: roster.map((p) => p.id) });
    setScore(next);
    setWalkId(id);
    recordRun({
      id: `${Date.now()}`,
      at: Date.now(),
      mode: "goat",
      team: "GOAT Five",
      era: "All-time",
      wins: next,
      roster: roster.map((p) => p.id),
      walk: id,
    });
  }

  function reset() {
    setPicks([]);
    setScore(null);
    setCopied(false);
    setWalkId("");
    setWalkCopied(false);
    setPos("ALL");
    setQuery("");
    setOpen([]);
    setRipped(false);
    setRipping(false);
    setPack(dealFrom(PLAYERS, rngFrom(`goat:${freshEntropy()}`), 10));
  }

  async function copyLine() {
    const line = `GOAT Five ${score} · ${goatLabel(score ?? 0)} at First Bucket Studio: ${roster.map((p) => p.name).join(", ")}. /walk/${walkId}`;
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
        kicker="GOAT Five"
        title="Five names. No franchise. No era."
        lead="Rip ten from the whole book. Turn five. Or open the book. Lock the five and we score the circle."
        mark="goat"
      />



      <GameBar current="alltime" onNew={reset} />

      {ghost.length === 5 && !locked && (
        <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm shadow-border">
          They walked with {ghost.map((p) => p.name).join(", ")}. Yours is a new five.
        </p>
      )}

      {locked ? (
        <section className="grid gap-8 lg:grid-cols-2">
          <ResultPoster team="GOAT Five" era="All-time" wins={score} roster={roster} kind="goat" />
          <div>
            <p className="font-display text-2xl font-semibold">{goatLabel(score)}</p>
            <p className="mt-2 text-muted">
              {score} on the circle. Peak, position mix, and era spread. A stacked mono-position five does not get a
              free 99.
            </p>
            <ol className="mt-6 grid grid-cols-5 gap-2">
              {roster.map((p) => (
                <li key={p.id} className="rounded-lg bg-paper px-1 py-3 text-center text-fg">
                  <p className="plate-letter text-lg">{initials(p.name)}</p>
                  <p className="mt-2 font-mono text-sm tabular-nums leading-none">{p.peak}</p>
                  <p className="mt-2 truncate text-micro uppercase tracking-label text-subtle">{p.pos}</p>
                  <p className="plate-stamp mt-2 text-subtle">{cardSerial(p.id)}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-muted">{goatLabel(score)}. Five peaks. Not 82 nights.</p>
            <div className="mt-4">
              <MathSheet
                telemetry={goatTelemetry(roster)}
                roster={roster}
                best={deltaVsBest(score ?? 0, bestFrom(loadSave().runs, "goat") || score || 0)}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareCardButton
                team="GOAT Five"
                era="All-time"
                wins={score ?? 0}
                roster={roster}
                kind="goat"
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
                Build another
              </Button>
              <Link
                to="/games/82-0"
                className="inline-flex min-h-11 items-center px-4 text-sm text-muted"
              >
                Rip the pack
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <StepKicker
              n={1}
              label={book || ripped ? "Pick" : "Rip"}
              hint={
                roster.length > 0
                  ? `${picks.length} of 5. Live ${live} · ${goatLabel(live)}`
                  : book
                    ? "Five names. Search the book."
                    : ripped
                      ? "Ten face-down. Turn five. Or open the book."
                      : "Tear the foil. Ten inside."
              }
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-2">
              {!book && ripped && (
                <Button variant="ghost" onClick={rip} disabled={open.length === pack.length}>
                  Turn them all
                </Button>
              )}
              {!book && ripped && (
                <Button variant="ghost" onClick={redeal}>
                  Redeal
                </Button>
              )}
              {!book && !ripped && (
                <Button onClick={tearPack} disabled={ripping}>
                  {ripping ? "Ripping…" : "Rip pack"}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  setBook((v) => {
                    if (v) {
                      setRipped(false);
                      setRipping(false);
                      setOpen([]);
                      return false;
                    }
                    setRipped(true);
                    return true;
                  });
                }}
              >
                {book ? "Rip a pack" : "Open the book"}
              </Button>
              <Button onClick={lock} disabled={picks.length !== 5}>
                Lock five
              </Button>
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
          {(book || ripped) && (
            <DraftFilters query={query} onQuery={setQuery} pos={pos} onPos={setPos} placeholder={book ? "Search the book" : "Search the pack"} />
          )}
          <div className="grid gap-6 lg:grid-cols-dashboard">
            {!book && !ripped ? (
              <RipPack room="goat" lot="goat-alltime" ripping={ripping} onRip={tearPack} />
            ) : !book && pack.length === 0 ? (
              <LithographLoader label="The book is on press." />
            ) : shown.length === 0 ? (
              <p className="text-sm text-muted">No names match. Clear the search.</p>
            ) : (
              <div className="pack-grid">
                {shown.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    revealed={book || open.includes(player.id)}
                    selected={picks.includes(player.id)}
                    index={picks.indexOf(player.id)}
                    onToggle={() => toggle(player.id)}
                  />
                ))}
              </div>
            )}
            <RosterRail roster={roster} title="Your five" />
          </div>
        </section>
      )}
    </div>
  );
}
