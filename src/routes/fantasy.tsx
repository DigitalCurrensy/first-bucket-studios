import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NamePlate } from "@/components/name-plate";
import { PageIntro } from "@/components/page-intro";
import {
  CATS,
  LEAN,
  TOOLS,
  buildTiers,
  cutRows,
  paceBoard,
  streamsFor,
  type Cat,
  type ToolId,
} from "@/lib/market";
import { weekKey } from "@/lib/studio-save";
import { HATE, LOVE, weekRows, type Call } from "@/lib/week";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fantasy")({ component: FantasyPage });

const CALLS: Array<Call | "ALL"> = ["ALL", "START", "SIT", "STREAM"];

function FantasyPage() {
  const weekStamp = weekKey();
  const [tool, setTool] = useState<ToolId>("week");
  const [call, setCall] = useState<Call | "ALL">("ALL");
  const [cat, setCat] = useState<Cat | "ALL">("ALL");
  const tiers = useMemo(() => buildTiers(), []);
  const rows = useMemo(() => weekRows(weekStamp), [weekStamp]);
  const week = rows.filter((row) => call === "ALL" || row.call === call);
  const streams = streamsFor(cat, weekStamp);
  const cuts = cutRows(weekStamp);
  const density = paceBoard(weekStamp);

  return (
    <div>
      <PageIntro
        kicker="Market Board"
        title="This week, not this book."
        lead="Five tools. Editorial only. Six counting cats. Pace is talk. Schedule is the tool. No lines you can bet."
      />

      <p className="mb-6 text-sm text-subtle">{weekStamp} · Density, not a total.</p>

      <div className="mb-8 flex flex-wrap gap-2">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
              tool === item.id ? "bg-fg text-paper shadow-none" : "text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tool === "week" && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LEAN.map((row) => (
              <div key={row.cat} className="rounded-xl bg-paper p-4 shadow-border">
                <p className="text-micro font-medium uppercase tracking-label text-subtle">
                  {row.cat} · {row.tilt}
                </p>
                <p className="mt-2 text-sm text-muted">{row.note}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {CALLS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCall(f)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm shadow-border",
                  call === f && "bg-fg text-paper shadow-none",
                )}
              >
                {f === "ALL" ? "All calls" : f}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:hidden">
            {week.map((row) => (
              <article key={row.id} className="rounded-xl bg-paper p-3 shadow-border sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <NamePlate name={row.name} pos={row.pos} id={row.id} />
                    <div className="min-w-0">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-subtle">
                        {row.team} · {row.pos} · {row.games}G{row.b2b ? " · B2B" : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-micro font-medium uppercase tracking-label",
                      row.call === "START" && "text-good",
                      row.call === "SIT" && "text-warn",
                      row.call === "STREAM" && "text-muted",
                    )}
                  >
                    {row.call}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{row.why}</p>
              </article>
            ))}
          </div>

          <div className="mb-8 hidden overflow-x-auto rounded-xl bg-paper shadow-border md:block">
            <table className="w-full min-w-board text-left text-sm">
              <thead>
                <tr className="border-b border-line text-micro uppercase tracking-label text-subtle">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">G</th>
                  <th className="px-4 py-3 font-medium">Call</th>
                  <th className="px-4 py-3 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {week.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <NamePlate name={row.name} pos={row.pos} size="sm" id={row.id} />
                        <span>
                          <span className="block font-medium">{row.name}</span>
                          <span className="text-xs text-subtle">
                            {row.team} · {row.pos}
                            {row.b2b ? " · B2B" : ""}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.games}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-micro font-medium uppercase tracking-label",
                        row.call === "START" && "text-good",
                        row.call === "SIT" && "text-warn",
                      )}
                    >
                      {row.call}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <section>
              <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Love</p>
              <ul className="space-y-3">
                {LOVE.map((item) => (
                  <li key={item.name}>
                    <p className="font-display text-xl font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Hate</p>
              <ul className="space-y-3">
                {HATE.map((item) => (
                  <li key={item.name}>
                    <p className="font-display text-xl font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {tool === "tiers" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <section key={tier.id} className="rounded-xl bg-paper p-4 shadow-border">
              <p className="text-micro font-medium uppercase tracking-label text-subtle">
                {tier.label} · {tier.blurb}
              </p>
              <ol className="mt-4 space-y-3">
                {tier.rows.map((row) => (
                  <li key={row.player.id} className="flex items-center gap-3">
                    <NamePlate name={row.player.name} pos={row.player.pos} era={row.player.era} size="sm" id={row.player.id} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.player.name}</p>
                      <p className="text-xs text-subtle">
                        {row.player.club} · {row.player.pos} · {row.score}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {tool === "stream" && (
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {(["ALL", ...CATS] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCat(item)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm shadow-border",
                  cat === item && "bg-fg text-paper shadow-none",
                )}
              >
                {item === "ALL" ? "All cats" : item}
              </button>
            ))}
          </div>
          {streams.length === 0 ? (
            <p className="text-sm text-muted">No stream in that column this week.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {streams.map((row) => (
                <li key={row.id} className="rounded-xl bg-paper p-3 shadow-border sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <NamePlate name={row.name} pos={row.pos} id={row.id} />
                      <div>
                        <p className="font-display text-xl font-semibold">{row.name}</p>
                        <p className="text-xs text-subtle">
                          {row.team} · {row.pos} · {row.games}G{row.b2b ? " · B2B" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-mono text-micro tabular-nums text-subtle">{row.cats.join(" · ")}</p>
                  </div>
                  <p className="mt-3 text-sm text-muted">{row.why}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tool === "cut" && (
        <div>
          <p className="mb-6 max-w-xl text-sm text-muted">
            A cut is a roster spot. Sitting is not cutting. Tatum is on this list so you do not confuse the two.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cuts.map((row) => (
              <li key={row.id} className="rounded-xl bg-paper p-3 shadow-border sm:p-4">
                <div className="flex items-start gap-3">
                  <NamePlate name={row.name} pos={row.pos} id={row.id} />
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold">{row.name}</p>
                    <p className="text-xs text-subtle">
                      {row.team} · {row.pos} · {row.games}G
                    </p>
                    <p className="mt-3 text-sm text-muted">{row.why}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool === "pace" && (
        <section>
          <p className="mb-4 max-w-xl text-sm text-subtle">
            Schedule density. Games, B2Bs, home nights, pace as talk. Not a betting total. Not a line.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {density.map((t) => (
              <div key={t.team} className="rounded-xl bg-paper p-4 shadow-border">
                <p className="text-micro uppercase tracking-label text-subtle">{t.team}</p>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{t.games}G</p>
                <p className="mt-1 text-xs text-muted">
                  {t.pace} · {t.home} home{t.b2b ? " · B2B" : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
