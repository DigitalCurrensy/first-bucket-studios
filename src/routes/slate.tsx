import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { useMounted } from "@/lib/hooks";
import { buildSlate } from "@/lib/slate";
import { todayKey } from "@/lib/studio-save";
import type { Call } from "@/lib/week";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/slate")({ component: SlatePage });

const CALLS: Array<Call | "ALL"> = ["ALL", "START", "SIT", "STREAM"];

function SlatePage() {
  const mounted = useMounted();
  const key = mounted ? todayKey() : "";
  const rows = useMemo(() => (key ? buildSlate(key) : []), [key]);
  const [call, setCall] = useState<Call | "ALL">("ALL");
  const [copied, setCopied] = useState(false);
  const shown = rows.filter((row) => call === "ALL" || row.call === call);
  const stamp = mounted
    ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  async function copyLine() {
    const line = [
      `First Bucket Slate · ${stamp}`,
      ...shown.map(
        (row) =>
          `${row.call} ${row.player.name} ${row.home ? "vs" : "@"} ${row.opp}${row.b2b ? " · B2B" : ""} — ${row.why}`,
      ),
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
        kicker="The Slate"
        title="Tonight. Not the week."
        lead="One seeded board per day. Start, sit, or stream the names on it. Editorial. Not a book. No second seed."
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{mounted ? stamp : "Opening tonight…"}</p>
        <Button onClick={copyLine} disabled={!mounted}>
          {copied ? "Copied" : "Copy slate"}
        </Button>
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

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((row) => (
          <li key={row.player.id} className="rounded-xl bg-paper p-4 shadow-border sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold">{row.player.name}</p>
                <p className="text-xs text-subtle">
                  {row.club} {row.home ? "vs" : "@"} {row.opp}
                  {row.b2b ? " · B2B" : ""}
                </p>
              </div>
              <span
                className={cn(
                  "text-micro font-medium uppercase tracking-label",
                  row.call === "START" && "text-good",
                  row.call === "SIT" && "text-warn",
                  row.call === "STREAM" && "text-subtle",
                )}
              >
                {row.call}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{row.why}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-xl text-sm text-subtle">
        Seeded to this device date. Not a sportsbook. Sitting a B2B is not a trade.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/trade"
          className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-paper"
        >
          Trade Desk
        </Link>
        <Link to="/fantasy" className="inline-flex min-h-11 items-center px-4 text-sm text-muted">
          Market Board
        </Link>
      </div>
    </div>
  );
}