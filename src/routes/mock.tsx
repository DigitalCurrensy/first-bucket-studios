import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { currentBook, type Player, type Pos } from "@/lib/nba";
import {
  NRULES,
  ROUNDS,
  SEAT_COUNT,
  TOTAL_PICKS,
  NEED_MATH,
  lastName,
  overallFor,
  peakSum,
  pickLabel,
  pickMeta,
  posCounts,
  roomSelect,
  scoreNeed,
  seatNames,
  snakeSeat,
} from "@/lib/snake";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mock")({ component: MockPage });

type Filter = "ALL" | Pos;

const POOL = [...currentBook()].sort((a, b) => b.peak - a.peak);

function MockPage() {
  const [youSlot, setYouSlot] = useState(0);
  const [available, setAvailable] = useState<Player[]>(POOL);
  const [board, setBoard] = useState<Array<Player | null>>(Array(TOTAL_PICKS).fill(null));
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<"peak" | "need">("peak");

  const names = useMemo(() => seatNames(youSlot), [youSlot]);
  const pickIndex = board.findIndex((slot) => slot == null);
  const done = pickIndex === -1;
  const meta = done ? pickMeta(TOTAL_PICKS - 1) : pickMeta(pickIndex);
  const onClock = names[meta.seat] ?? "";
  const yourTurn = !done && onClock === "You";
  const lockedSeat = board.some(Boolean);

  const bySeat = names.map((_, seat) =>
    Array.from({ length: ROUNDS }, (__, round0) => board[overallFor(round0, seat)] ?? null),
  );
  const yours = bySeat[youSlot]?.filter((p): p is Player => p != null) ?? [];
  const clockRoster = (!done ? bySeat[meta.seat]?.filter((p): p is Player => p != null) : yours) ?? [];
  const shown = available
    .filter((p) => (filter === "ALL" ? true : p.pos === filter))
    .sort((a, b) =>
      sort === "need" ? scoreNeed(b, clockRoster) - scoreNeed(a, clockRoster) : b.peak - a.peak,
    );

  useEffect(() => {
    if (done || yourTurn) return;
    const idx = pickIndex;
    const seat = snakeSeat(idx);
    const roster: Player[] = [];
    for (let round0 = 0; round0 < ROUNDS; round0 += 1) {
      const held = board[overallFor(round0, seat)];
      if (held) roster.push(held);
    }
    const take = roomSelect(available, roster);
    if (!take) return;
    const t = window.setTimeout(() => {
      setBoard((cur) => {
        if (cur[idx] != null) return cur;
        const next = [...cur];
        next[idx] = take;
        return next;
      });
      setAvailable((cur) => cur.filter((p) => p.id !== take.id));
    }, 420);
    return () => window.clearTimeout(t);
  }, [available, board, done, pickIndex, yourTurn]);

  function draft(player: Player) {
    if (!yourTurn || done) return;
    const idx = pickIndex;
    setBoard((cur) => {
      if (cur[idx] != null) return cur;
      const next = [...cur];
      next[idx] = player;
      return next;
    });
    setAvailable((cur) => cur.filter((p) => p.id !== player.id));
  }

  function reset() {
    setAvailable(POOL);
    setBoard(Array(TOTAL_PICKS).fill(null));
    setFilter("ALL");
    setSort("peak");
  }

  function sit(slot: number) {
    if (lockedSeat) return;
    setYouSlot(slot);
  }

  return (
    <div>
      <PageIntro
        kicker="Mock Lab"
        title="Snake. Numbered. Need-first."
        lead="Four rooms, five rounds, twenty locks. Odd rounds run left. Even rounds reverse. The room drafts need, not peak-only."
      />

      <div className="mb-10 rounded-xl bg-paper p-5 shadow-border">
        <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">N-rules</p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {NRULES.map((rule) => (
            <li key={rule.n} className="flex gap-3">
              <span className="font-mono text-xs tabular-nums text-subtle">{rule.n}</span>
              <span className="text-sm text-muted">{rule.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-10 rounded-xl bg-paper p-5 shadow-border">
        <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Need-first</p>
        <p className="mb-4 max-w-xl text-sm text-muted">
          The room does not take the highest peak once a hole exists. Need score starts at peak, then the math below.
          Sort remaining by Need to see the room's next lock before it happens.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {NEED_MATH.map((row) => (
            <li key={row.n} className="flex gap-3">
              <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-subtle">{row.n}</span>
              <span className="text-sm text-muted">{row.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">Sit</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: SEAT_COUNT }, (_, slot) => (
              <button
                key={slot}
                type="button"
                disabled={lockedSeat && youSlot !== slot}
                onClick={() => sit(slot)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                  youSlot === slot ? "bg-fg text-paper shadow-none" : "text-fg",
                )}
              >
                {pickLabel(slot)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-subtle">Sit 1.04 if you want the turnaround. Seat locks on the first name.</p>
        </div>
        <Button variant="ghost" onClick={reset}>
          Reset lab
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted">
        {done
          ? "Board is closed. Twenty locks. Rules held."
          : yourTurn
            ? `Your clock · ${meta.label}${meta.reversing ? " · rev" : " · run"}`
            : `${onClock} on the clock · ${meta.label} · need-first`}
        <span className="ml-2 text-subtle">
          {Math.min((done ? TOTAL_PICKS : pickIndex) + (done ? 0 : 1), TOTAL_PICKS)} of {TOTAL_PICKS}
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        {names.map((name, seat) => (
          <div key={name} className={cn("rounded-xl bg-paper p-4 shadow-border", seat === youSlot && "ring-1 ring-fg")}>
            <p className="text-micro font-medium uppercase tracking-label text-subtle">{name}</p>
            <ol className="mt-3 space-y-2 text-sm">
              {Array.from({ length: ROUNDS }, (_, round0) => {
                const overall0 = overallFor(round0, seat);
                const player = board[overall0];
                const current = !done && overall0 === pickIndex;
                return (
                  <li key={overall0} className={cn("rounded-md px-2 py-1", current && "bg-surface ring-1 ring-fg")}>
                    <span className="mr-2 font-mono text-micro tabular-nums text-subtle">{pickLabel(overall0)}</span>
                    {player ? lastName(player.name) : "—"}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-board border-collapse text-left text-sm">
          <caption className="sr-only">Snake board, four seats, five rounds</caption>
          <thead>
            <tr>
              <th className="pb-3 pr-3 text-micro font-medium uppercase tracking-label text-subtle">Rd</th>
              {names.map((name, seat) => (
                <th
                  key={name}
                  className={cn(
                    "pb-3 pr-3 text-micro font-medium uppercase tracking-label text-subtle",
                    seat === youSlot && "text-fg",
                  )}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROUNDS }, (_, round0) => (
              <tr key={round0} className="border-t border-line">
                <th className="py-3 pr-3 font-mono text-xs tabular-nums text-subtle">
                  {round0 + 1}
                  <span className="ml-2 font-sans font-normal">{round0 % 2 === 1 ? "rev" : "run"}</span>
                </th>
                {names.map((name, seat) => {
                  const overall0 = overallFor(round0, seat);
                  const player = board[overall0];
                  const current = !done && overall0 === pickIndex;
                  return (
                    <td key={`${name}-${round0}`} className="py-3 pr-3 align-top">
                      <div
                        className={cn(
                          "rounded-md px-3 py-2",
                          current && "bg-surface ring-1 ring-fg",
                          player && !current && "bg-paper",
                        )}
                      >
                        <p className="font-mono text-micro tabular-nums text-subtle">{pickLabel(overall0)}</p>
                        <p className={cn("mt-1 font-medium", !player && "text-subtle")}>
                          {player ? lastName(player.name) : "—"}
                        </p>
                        {player && <p className="text-micro uppercase tracking-label text-subtle">{player.pos}</p>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {done && (
        <section className="mt-12">
          <p className="font-display text-2xl font-semibold">Room card</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-4">
            {names.map((name, seat) => {
              const roster = bySeat[seat]?.filter((p): p is Player => p != null) ?? [];
              const counts = posCounts(roster);
              return (
                <li key={name} className={cn("rounded-xl bg-paper p-4 shadow-border", name === "You" && "ring-1 ring-fg")}>
                  <p className="text-micro font-medium uppercase tracking-label text-subtle">{name}</p>
                  <p className="mt-2 font-mono text-lg tabular-nums">{peakSum(roster)}</p>
                  <p className="text-xs text-subtle">peak sum</p>
                  <p className="mt-3 font-mono text-xs tabular-nums text-muted">
                    {counts.G}G · {counts.F}F · {counts.C}C
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {yours.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}

      {!done && (
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-micro font-medium uppercase tracking-label text-subtle">
              Remaining · {shown.length}
              {!done && onClock !== "You" ? ` · ${onClock} need` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {(["peak", "need"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                    sort === key ? "bg-fg text-paper shadow-none" : "text-fg",
                  )}
                >
                  {key === "peak" ? "Peak" : "Need"}
                </button>
              ))}
              {(["ALL", "G", "F", "C"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                    filter === key ? "bg-fg text-paper shadow-none" : "text-fg",
                  )}
                >
                  {key === "ALL" ? "All" : key}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                mark={`need ${scoreNeed(player, clockRoster)}`}
                onToggle={yourTurn ? () => draft(player) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
