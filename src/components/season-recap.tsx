import type { Recap } from "@/lib/recap";

export function SeasonRecap({ recap }: { recap: Recap }) {
  const rows = [
    ["Longest run", String(recap.streak)],
    ["Home", `${recap.homeW}–${recap.homeL}`],
    ["Away", `${recap.awayW}–${recap.awayL}`],
    ["B2Bs", String(recap.b2b ?? 0)],
    ["Sit nights", String(recap.sits ?? 0)],
    ["Best night", recap.bestLine],
    ["Worst night", recap.worstLine],
    ["Projected", String(recap.projected)],
  ];
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {recap.exit && (
        <div className="col-span-2 sm:col-span-3">
          <dt className="text-micro font-medium uppercase tracking-label text-subtle">Exit</dt>
          <dd className="mt-1 font-display text-xl font-semibold">{recap.exit}</dd>
        </div>
      )}
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-micro font-medium uppercase tracking-label text-subtle">{k}</dt>
          <dd className="mt-1 text-sm tabular-nums text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
