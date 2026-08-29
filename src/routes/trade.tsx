import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { PlayerCard } from "@/components/player-card";
import { CATS, catValue, sixScore } from "@/lib/market";
import { currentBook, PLAYERS_BY_ID, type Player } from "@/lib/nba";
import { loadSave } from "@/lib/studio-save";
import { gradeTrade } from "@/lib/trade";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trade")({ component: TradePage });

const TOOLS = [
  { id: "deal", label: "Trade" },
  { id: "compare", label: "Compare" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];
type Side = "you" | "them";

const POOL = currentBook();

function namesOf(ids: string[]) {
  return ids.map((id) => PLAYERS_BY_ID[id]).filter((p): p is Player => Boolean(p));
}

function TradePage() {
  const [tool, setTool] = useState<ToolId>("deal");
  const [side, setSide] = useState<Side>("you");
  const [you, setYou] = useState<string[]>([]);
  const [them, setThem] = useState<string[]>([]);
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const send = useMemo(() => namesOf(you), [you]);
  const get = useMemo(() => namesOf(them), [them]);
  const grade = gradeTrade(send, get);
  const keepers = loadSave().keepers;
  const keeperHits = [...you, ...them]
    .map((id) => PLAYERS_BY_ID[id])
    .filter((p): p is Player => Boolean(p) && keepers[p.id] === "KEEP");
  const a = left ? PLAYERS_BY_ID[left] : undefined;
  const b = right ? PLAYERS_BY_ID[right] : undefined;

  function toggleDeal(id: string) {
    if (you.includes(id) || them.includes(id)) {
      setYou((cur) => cur.filter((x) => x !== id));
      setThem((cur) => cur.filter((x) => x !== id));
      return;
    }
    if (side === "you" && you.length < 3) setYou((cur) => [...cur, id]);
    if (side === "them" && them.length < 3) setThem((cur) => [...cur, id]);
  }

  function pickCompare(id: string) {
    if (left === id) {
      setLeft(null);
      return;
    }
    if (right === id) {
      setRight(null);
      return;
    }
    if (!left) setLeft(id);
    else if (!right) setRight(id);
    else setRight(id);
  }

  async function copyDeal() {
    const line = grade.pending
      ? "First Bucket Trade Desk — mark both sides."
      : `First Bucket Trade Desk · ${grade.grade}\nYou send: ${send.map((p) => p.name).join(", ")}\nYou get: ${get.map((p) => p.name).join(", ")}\n${grade.note}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyCompare() {
    if (!a || !b) return;
    const aWins = CATS.filter((cat) => catValue(a, cat) > catValue(b, cat));
    const bWins = CATS.filter((cat) => catValue(b, cat) > catValue(a, cat));
    const line = [
      `First Bucket Compare · ${a.name} vs ${b.name}`,
      aWins.length ? `${a.name} in ${aWins.join(", ")}` : `${a.name} wins none`,
      bWins.length ? `${b.name} in ${bWins.join(", ")}` : `${b.name} wins none`,
    ].join("\n");
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
        kicker="Trade Desk"
        title="Grade the deal. Compare the cats."
        lead="Six counting cats. Editorial grade, not a book. Sitting a B2B is not a trade. Losing a center is."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTool(item.id);
              setCopied(false);
            }}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
              tool === item.id ? "bg-fg text-paper shadow-none" : "text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tool === "deal" && (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(["you", "them"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm shadow-border",
                    side === s && "bg-fg text-paper shadow-none",
                  )}
                >
                  {s === "you" ? `You send · ${you.length}/3` : `You get · ${them.length}/3`}
                </button>
              ))}
            </div>
            <Button onClick={copyDeal} disabled={grade.pending}>
              {copied ? "Copied" : "Copy grade"}
            </Button>
          </div>

          <article
            className={cn(
              "mb-8 rounded-xl bg-fg p-6 text-paper",
              grade.pending && "bg-paper text-fg shadow-border",
            )}
          >
            <p className="text-micro font-medium uppercase tracking-label text-accent">
              {grade.pending ? "Open" : grade.grade}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{grade.pending ? "Mark both sides." : grade.grade}</p>
            <p className={cn("mt-2 text-sm", grade.pending ? "text-muted" : "text-paper/70")}>{grade.note}</p>
            {!grade.pending && (
              <p className="mt-4 font-mono text-xs tabular-nums text-paper/50">
                Send {grade.sendScore} · Get {grade.getScore} · {grade.delta > 0 ? "+" : ""}
                {grade.delta}
              </p>
            )}
            {keeperHits.length > 0 && (
              <p className={cn("mt-4 text-sm", grade.pending ? "text-warn" : "text-paper/80")}>
                Keeper warning: {keeperHits.map((p) => p.name).join(", ")} is marked KEEP on this device. Sitting a B2B is not a trade.
              </p>
            )}
          </article>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {POOL.map((player) => {
              const onYou = you.includes(player.id);
              const onThem = them.includes(player.id);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selected={onYou || onThem}
                  index={onYou ? you.indexOf(player.id) : onThem ? them.indexOf(player.id) : undefined}
                  mark={onYou ? "you send" : onThem ? "you get" : undefined}
                  onToggle={() => toggleDeal(player.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {tool === "compare" && (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Tap two names. Six cats. No fake FT%.</p>
            <Button onClick={copyCompare} disabled={!a || !b}>
              {copied ? "Copied" : "Copy compare"}
            </Button>
          </div>

          {a && b && (
            <>
              <div className="mb-8 hidden overflow-x-auto rounded-xl bg-paper shadow-border md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-micro uppercase tracking-label text-subtle">
                      <th className="px-4 py-3 font-medium">Cat</th>
                      <th className="px-4 py-3 font-medium">{a.name}</th>
                      <th className="px-4 py-3 font-medium">{b.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATS.map((cat) => {
                      const av = catValue(a, cat);
                      const bv = catValue(b, cat);
                      return (
                        <tr key={cat} className="border-b border-line last:border-0">
                          <td className="px-4 py-3 text-subtle">{cat}</td>
                          <td className={cn("px-4 py-3 tabular-nums", av > bv && "font-medium")}>{av}</td>
                          <td className={cn("px-4 py-3 tabular-nums", bv > av && "font-medium")}>{bv}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="px-4 py-3 text-subtle">Six</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{sixScore(a)}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{sixScore(b)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="mb-8 grid gap-2 md:hidden">
                {CATS.map((cat) => {
                  const av = catValue(a, cat);
                  const bv = catValue(b, cat);
                  return (
                    <li key={cat} className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 shadow-border">
                      <span className="text-micro font-medium uppercase tracking-label text-subtle">{cat}</span>
                      <span className="text-sm tabular-nums">
                        <span className={cn(av > bv && "font-medium")}>{av}</span>
                        <span className="mx-2 text-subtle">·</span>
                        <span className={cn(bv > av && "font-medium")}>{bv}</span>
                      </span>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 shadow-border">
                  <span className="text-micro font-medium uppercase tracking-label text-subtle">Six</span>
                  <span className="text-sm font-medium tabular-nums">
                    {sixScore(a)} · {sixScore(b)}
                  </span>
                </li>
              </ul>
            </>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {POOL.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                selected={player.id === left || player.id === right}
                index={player.id === left ? 0 : player.id === right ? 1 : undefined}
                mark={player.id === left ? "left" : player.id === right ? "right" : undefined}
                onToggle={() => pickCompare(player.id)}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 max-w-xl text-sm text-subtle">Not a league host. Not a commissioner. Not a sportsbook.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/keepers"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Keeper Desk
        </Link>
        <Link to="/slate" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
          The Slate
        </Link>
      </div>
    </div>
  );
}