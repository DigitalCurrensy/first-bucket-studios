import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks";
import { goatLabel, playoffLine, recordLine } from "@/lib/nba";
import { loadSave, onSaveChange, unpinWalk } from "@/lib/studio-save";
import { decodeWalk } from "@/lib/walk";

function pinLine(id: string) {
  const walk = decodeWalk(id);
  if (!walk) return null;
  const line =
    walk.kind === "goat"
      ? goatLabel(walk.wins)
      : walk.kind === "playoff"
        ? playoffLine(walk.wins)
        : recordLine(walk.wins, walk.of || 82);
  return { team: walk.team, line };
}

export function PinnedRail() {
  const mounted = useMounted();
  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setPins(loadSave().pins);
    sync();
    return onSaveChange(sync);
  }, []);

  if (!mounted || pins.length === 0) return null;

  return (
    <div className="space-y-2">
      {pins.slice(0, 3).map((id) => {
        const view = pinLine(id);
        if (!view) return null;
        return (
          <div key={id} className="widget relative">
            <Link to="/walk/$id" params={{ id }} className="block pr-8">
              <p className="v-tertiary text-micro font-medium uppercase tracking-label">Pinned</p>
              <p className="mt-2 font-display text-base font-semibold">{view.team}</p>
              <p className="v-secondary mt-1 text-sm">{view.line}</p>
            </Link>
            <button
              type="button"
              className="absolute right-2 top-2 grid size-11 place-items-center text-muted"
              aria-label={`Unpin ${view.team}`}
              onClick={() => unpinWalk(id)}
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
