import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageIntro } from "@/components/page-intro";
import {
  CATS,
  CUTS,
  LEAN,
  TOOLS,
  buildTiers,
  streamsFor,
  type Cat,
  type ToolId,
} from "@/lib/market";
import { HATE, LOVE, TOTALS, WEEK_ROWS, type Call } from "@/lib/week";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fantasy")({ component: FantasyPage });

const CALLS: Array<Call | "ALL"> = ["ALL", "START", "SIT", "STREAM"];

function FantasyPage() {
  const [tool, setTool] = useState<ToolId>("week");
  const [call, setCall] = useState<Call | "ALL">("ALL");
  const [cat, setCat] = useState<Cat | "ALL">("ALL");
  const tiers = useMemo(() => buildTiers(), []);
  const week = WEEK_ROWS.filter((row) => call === "ALL" || row.call === call);
  const streams = streamsFor(cat);

  return (
    <div>
      <PageIntro
        kicker="Market Board"
        title="This week, not this book."
        lead="Five tools. Editorial only. Six counting cats. No lines you can bet. No sportsbook."
      />

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
              <article key={row.name} className="rounded-xl bg-paper p-4 shadow-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-subtle">
                      {row.team} · {row.pos} · {row.games}G{row.b2b ? " · B2B" : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-micro font-medium uppercase tracking-label",
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

          <div className="hidden overflow-x-auto rounded-xl bg-paper shadow-border md:block">
            <table className="w-full min-w-board text-left text-sm">
              <thead className="text-micro font-medium uppercase tracking-label text-subtle">
                <tr className="border-b border-line">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Pos</th>
                  <th className="px-4 py-3">G</th>
                  <th className="px-4 py-3">Call</th>
                  <th className="px-4 py-3">Why</th>
                </tr>
              </thead>
              <tbody>
                {week.map((row) => (
                  <tr key={row.name} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-subtle">
                        {row.team}
                        {row.b2b ? " · B2B" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.pos}</td>
                    <td className="px-4 py-3 tabular-nums">{row.games}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-micro font-medium uppercase tracking-label",
                          row.call === "START" && "text-good",
                          row.call === "SIT" && "text-warn",
                          row.call === "STREAM" && "text-muted",
                        )}
                      >
                        {row.call}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <section>
              <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">Love</p>
              <ul className="space-y-4">
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
              <ul className="space-y-4">
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
        <div>
          <p className="mb-6 max-w-xl text-sm text-muted">
            Six counting cats: points, threes, boards, dimes, steals, blocks. Current book only — not the 82-0 pool.
            Peak is not the rank.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((tier) => (
              <section key={tier.id} className="rounded-xl bg-paper p-4 shadow-border">
                <p className="font-mono text-xs tabular-nums text-subtle">{tier.label}</p>
                <p className="mt-1 font-display text-xl font-semibold">{tier.blurb}</p>
                <ol className="mt-4 space-y-3">
                  {tier.rows.map((row) => (
                    <li key={row.player.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span>
                        <span className="mr-2 font-mono text-micro tabular-nums text-subtle">{row.rank}</span>
                        {row.player.name}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-subtle">{row.score}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      )}

      {tool === "stream" && (
        <div>
          <p className="mb-4 max-w-xl text-sm text-muted">
            Filter by the column you are losing. If they do not help that cat, they are not a stream this week.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {(["ALL", ...CATS] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCat(key)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                  cat === key ? "bg-fg text-paper shadow-none" : "text-fg",
                )}
              >
                {key === "ALL" ? "All cats" : key}
              </button>
            ))}
          </div>
          {streams.length === 0 ? (
            <p className="text-sm text-muted">Nothing in that column this week. Do not force a stream.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {streams.map((row) => (
                <li key={row.name} className="rounded-xl bg-paper p-5 shadow-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold">{row.name}</p>
                      <p className="text-xs text-subtle">
                        {row.team} · {row.pos} · {row.games}G{row.b2b ? " · B2B" : ""}
                      </p>
                    </div>
                    <p className="font-mono text-micro tabular-nums text-subtle">{row.cats.join(" · ")}</p>
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
            {CUTS.map((row) => (
              <li key={row.name} className="rounded-xl bg-paper p-5 shadow-border">
                <p className="font-display text-xl font-semibold">{row.name}</p>
                <p className="text-xs text-subtle">
                  {row.team} · {row.pos} · {row.games}G
                </p>
                <p className="mt-3 text-sm text-muted">{row.why}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool === "pace" && (
        <section>
          <p className="mb-4 max-w-xl text-sm text-subtle">
            Editorial environment, not a betting line. Totals here describe pace talk. You cannot wager in this studio.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TOTALS.map((t) => (
              <div key={t.team} className="rounded-xl bg-paper p-4 shadow-border">
                <p className="text-micro uppercase tracking-label text-subtle">{t.team}</p>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{t.total}</p>
                <p className="mt-1 text-xs text-muted">{t.pace}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
