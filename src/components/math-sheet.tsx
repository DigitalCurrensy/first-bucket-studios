import { flexOf, type Telemetry } from "@/lib/telemetry";
import type { Player } from "@/lib/nba";
import { cn } from "@/lib/utils";

export function MathSheet({
  telemetry,
  roster,
  best,
}: {
  telemetry: Telemetry;
  roster?: Player[];
  best?: { label: string; pts: number };
}) {
  return (
    <section className="rounded-xl bg-paper p-4 shadow-border sm:p-5">
      <p className="text-micro font-medium uppercase tracking-label text-subtle">The math</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{telemetry.projected}</p>
      <ul className="mt-4 space-y-2">
        {telemetry.lines.map((row) => (
          <li key={row.label} className="flex items-start justify-between gap-3 text-sm">
            <span>
              <span className="text-fg">{row.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{row.why}</span>
            </span>
            <span className={cn("shrink-0 font-mono tabular-nums", row.pts < 0 ? "text-warn" : "text-good")}>
              {row.pts > 0 ? `+${row.pts}` : row.pts}
            </span>
          </li>
        ))}
      </ul>
      {best ? (
        <p className={cn("mt-4 text-sm", best.pts >= 0 ? "text-good" : "text-muted")}>{best.label}</p>
      ) : null}
      {roster && roster.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {roster.map((p) => {
            const flex = flexOf(p);
            return (
              <li key={p.id} className="rounded-full bg-surface px-3 py-1 text-micro text-muted">
                {p.name.split(" ").pop()} · {p.pos}
                {flex !== "none" ? ` · ${flex}` : ""}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
