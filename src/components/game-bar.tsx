import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PosFilter } from "@/lib/draft";
import { useMounted } from "@/lib/hooks";
import { playoffLine, recordLine } from "@/lib/nba";
import { bestFrom, loadSave } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const GAME_MODES = [
  { id: "classic", label: "Classic", href: "/games/82-0", mode: "82-0" },
  { id: "daily", label: "Daily", href: "/games/daily", mode: "daily" },
  { id: "corners", label: "Corners", href: "/games/corners", mode: "corners" },
  { id: "wnba", label: "WNBA", href: "/games/wnba", mode: "wnba" },
  { id: "alltime", label: "All-time", href: "/games/goat", mode: "goat" },
  { id: "playoffs", label: "Playoffs", href: "/games/16-0", mode: "16-0" },
] as const;

export type GameMode = (typeof GAME_MODES)[number]["id"];

function formatBest(current: GameMode) {
  const item = GAME_MODES.find((m) => m.id === current);
  if (!item) return null;
  const runs = loadSave().runs.filter((r) => r.mode === item.mode);
  if (runs.length === 0) return null;
  const n = bestFrom(runs, item.mode);
  if (item.mode === "goat") return String(n);
  if (item.mode === "16-0") return playoffLine(n);
  if (item.mode === "wnba") return recordLine(n, 40);
  return recordLine(n);
}

export function GameBar({ current, onNew }: { current: GameMode; onNew?: () => void }) {
  const mounted = useMounted();
  const best = mounted ? formatBest(current) : null;
  if (!best && !onNew) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center justify-end gap-3 border-b border-line pb-3">
      {best && (
        <p className="text-sm text-muted">
          Best <span className="font-medium tabular-nums text-fg">{best}</span>
        </p>
      )}
      {onNew && (
        <Button variant="ghost" onClick={onNew}>
          New game
        </Button>
      )}
    </div>
  );
}

export function StepKicker({
  n,
  label,
  hint,
  className,
}: {
  n: 1 | 2;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-micro font-medium uppercase tracking-label text-subtle">
        STEP {n} · {label}
      </p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function DraftFilters({
  query,
  onQuery,
  pos,
  onPos,
  placeholder = "Search this pack",
}: {
  query: string;
  onQuery: (value: string) => void;
  pos: PosFilter;
  onPos: (value: PosFilter) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-full bg-paper pl-11 pr-4 text-sm text-fg shadow-border placeholder:text-subtle"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {(["ALL", "G", "F", "C"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onPos(key)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
              pos === key ? "bg-fg text-paper shadow-none" : "text-fg",
            )}
          >
            {key === "ALL" ? "All" : key}
          </button>
        ))}
      </div>
    </div>
  );
}
