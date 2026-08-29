import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { NamePlate } from "@/components/name-plate";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { KEEP_CALLS, KEEPER_ROWS, type KeepCall } from "@/lib/keepers";
import { loadSave, writeKeepers } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/keepers")({ component: KeepersPage });

function KeepersPage() {
  const [marks, setMarks] = useState<Record<string, KeepCall>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMarks(loadSave().keepers);
  }, []);

  const counts = useMemo(() => {
    const next = { KEEP: 0, TRADE: 0, CUT: 0, OPEN: 0 };
    for (const row of KEEPER_ROWS) {
      const call = marks[row.id];
      if (call) next[call] += 1;
      else next.OPEN += 1;
    }
    return next;
  }, [marks]);

  function mark(id: string, call: KeepCall) {
    const next = { ...marks };
    if (next[id] === call) delete next[id];
    else next[id] = call;
    setMarks(next);
    writeKeepers(next);
  }

  async function copyLine() {
    const grouped = (call: KeepCall) =>
      KEEPER_ROWS.filter((row) => marks[row.id] === call)
        .map((row) => row.name)
        .join(", ");
    const line = [
      "First Bucket Keeper Desk",
      `Keep: ${grouped("KEEP") || "—"}`,
      `Trade: ${grouped("TRADE") || "—"}`,
      `Cut: ${grouped("CUT") || "—"}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <PageIntro
        kicker="Keeper Desk"
        title="Keep. Trade. Cut."
        lead="Dynasty marks for this room. Editorial only. Not a league host. Not a commissioner. Sitting a B2B is not a trade."
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Keep {counts.KEEP} · Trade {counts.TRADE} · Cut {counts.CUT}
          {counts.OPEN > 0 ? ` · Open ${counts.OPEN}` : ""}
        </p>
        <Button onClick={copyLine} disabled={counts.OPEN === KEEPER_ROWS.length}>
          {copied ? "Copied" : "Copy marks"}
        </Button>
      </div>

      <ul className="grid gap-3">
        {KEEPER_ROWS.map((row) => (
          <li key={row.id} className="rounded-xl bg-paper p-3 shadow-border sm:p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <NamePlate name={row.name} pos={row.pos} id={row.id} />
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold">{row.name}</p>
                  <p className="text-xs text-subtle">
                    {row.team} · {row.pos}
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-muted">{row.note}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {KEEP_CALLS.map((call) => (
                  <button
                    key={call}
                    type="button"
                    onClick={() => mark(row.id, call)}
                    className={cn(
                      "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
                      marks[row.id] === call && "bg-fg text-paper shadow-none",
                    )}
                  >
                    {call}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-xl text-sm text-subtle">
        Marks live on this device. This is not a league and not a sportsbook.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/fantasy"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Market Board
        </Link>
        <Link to="/brief" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
          Brief Desk
        </Link>
      </div>
    </div>
  );
}
