import { initials, plateFor } from "@/components/crest";
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
      <div className="relative aspect-plate overflow-hidden rounded-md bg-fg">
        <img
          src={plateFor(player.pos, player.era)}
          alt=""
          crossOrigin="anonymous"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-fg/55 px-3 py-2">
          <span className="font-display text-2xl font-semibold leading-none text-paper">{initials(player.name)}</span>
          <span className="text-micro font-medium uppercase tracking-label text-paper/70">{player.pos}</span>
        </div>
        {selected && index != null && index >= 0 && (
          <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-paper text-micro font-medium text-fg">
            {index + 1}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-lg font-semibold leading-tight">{player.name}</p>
      <p className="mt-1 text-xs text-muted">
        {player.era} · {player.peak} peak
      </p>
      <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
        {player.pts} / {player.reb} / {player.ast}
        {mark ? ` · ${mark}` : ""}
      </p>
    </>
  );

  if (!onToggle) {
    return <div className="deal-card rounded-lg bg-paper p-3 shadow-border">{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "deal-card rounded-lg bg-paper p-3 text-left shadow-border transition-shadow duration-150 hover:shadow-border-hover",
        selected && "bg-surface ring-1 ring-fg",
      )}
    >
      {inner}
    </button>
  );
}
