import { NamePlate } from "@/components/name-plate";
import type { Player } from "@/lib/nba";
import { cn } from "@/lib/utils";

export function RosterRail({
  roster,
  of = 5,
  title = "Your five",
}: {
  roster: Player[];
  of?: number;
  title?: string;
}) {
  const slots = Array.from({ length: of }, (_, i) => roster[i] ?? null);

  return (
    <aside className="w-full self-start rounded-xl bg-paper p-4 shadow-border lg:sticky lg:top-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-micro font-medium uppercase tracking-label text-subtle">{title}</p>
        <p className="text-micro font-medium tabular-nums text-muted">
          {roster.length}/{of}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {slots.map((player, i) => (
          <li
            key={player?.id ?? `open-${i}`}
            className={cn("flex min-h-11 items-center gap-3 rounded-lg px-2 py-2", player ? "bg-surface shadow-border" : "")}
          >
            {player ? (
              <>
                <NamePlate name={player.name} pos={player.pos} era={player.era} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{player.name}</span>
                  <span className="text-micro uppercase tracking-label text-subtle">{player.pos}</span>
                </span>
              </>
            ) : (
              <>
                <NamePlate empty size="sm" />
                <span className="text-sm text-muted">Open</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
