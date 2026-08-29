import type { Player } from "@/lib/nba";
import { cn } from "@/lib/utils";

export function PlayerCard({
  player,
  selected,
  index,
  mark,
  onToggle,
}: {
  player: Player;
  selected?: boolean;
  index?: number;
  mark?: string;
  onToggle?: () => void;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("font-display text-lg font-semibold leading-tight", selected && "pl-8")}>{player.name}</p>
        <span className="text-micro font-medium uppercase tracking-label text-subtle">{player.pos}</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {player.era} · {player.peak} peak
      </p>
      <p className="mt-3 font-mono text-xs tabular-nums text-subtle">
        {player.pts} / {player.reb} / {player.ast}
        {mark ? ` · ${mark}` : ""}
      </p>
      {selected && index != null && index >= 0 && (
        <span className="absolute left-3 top-3 grid size-6 place-items-center rounded-full bg-fg text-micro font-medium text-paper">
          {index + 1}
        </span>
      )}
    </>
  );

  if (!onToggle) {
    return <div className="relative rounded-lg bg-paper p-4 pt-5 shadow-border">{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative rounded-lg bg-paper p-4 pt-5 text-left shadow-border transition-shadow duration-150 hover:shadow-border-hover",
        selected && "bg-surface ring-1 ring-fg",
      )}
    >
      {inner}
    </button>
  );
}
