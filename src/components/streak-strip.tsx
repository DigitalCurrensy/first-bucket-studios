import { streakStrip, type StreakHole } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export function StreakStrip({ today, lastDaily, streak }: { today: string; lastDaily: string | null; streak: number }) {
  const holes = streakStrip(today, lastDaily, streak);
  return (
    <ol className="flex flex-wrap gap-1" aria-label="Seven-day streak">
      {holes.map((hole) => (
        <li key={hole.date}>
          <span
            title={`${hole.date} · ${hole.state}`}
            className={cn(
              "flex size-9 items-center justify-center rounded-md text-micro font-medium uppercase tracking-label",
              hole.state === "played" && "bg-fg text-paper",
              hole.state === "today" && "bg-surface text-fg shadow-border",
              hole.state === "missed" && "border border-dashed border-line text-subtle",
            )}
          >
            {label(hole)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function label(hole: StreakHole) {
  const day = Number(hole.date.slice(-2));
  if (hole.state === "today") return "Now";
  return String(day);
}
