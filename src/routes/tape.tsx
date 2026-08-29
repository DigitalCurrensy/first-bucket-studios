import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/page-intro";
import { useMounted } from "@/lib/hooks";
import { downloadBlob, renderMarkCard, shareFile } from "@/lib/share-card";
import { loadSave, todayKey, writeTapePins } from "@/lib/studio-save";
import { buildTape, markLine, type TapeRow } from "@/lib/tape";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tape")({ component: TapePage });

const FILTERS = ["ALL", "UP", "FLAT", "DOWN"] as const;
type Filter = (typeof FILTERS)[number];

function TapePage() {
  const mounted = useMounted();
  const stamp = mounted ? todayKey() : "";
  const rows = useMemo(() => (stamp ? buildTape(stamp) : []), [stamp]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [pins, setPins] = useState<string[]>([]);
  const [sharing, setSharing] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "shared" | "saved">("idle");

  useEffect(() => {
    if (!mounted) return;
    setPins(loadSave().tapePins);
  }, [mounted]);

  const shown = rows.filter((row) => (filter === "ALL" ? true : row.mark === filter));

  function togglePin(id: string) {
    const next = pins.includes(id) ? pins.filter((x) => x !== id) : [...pins, id];
    setPins(next);
    writeTapePins(next);
  }

  async function shareRow(row: TapeRow) {
    if (sharing) return;
    setSharing(row.player.id);
    try {
      const blob = await renderMarkCard({
        name: row.player.name,
        mark: row.mark,
        note: row.note,
        date: stamp,
      });
      const name = `first-bucket-tape-${row.player.id}.png`;
      const result = await shareFile(blob, name, markLine(row));
      if (result !== "abort") setShareState(result === "shared" ? "shared" : "saved");
    } catch {
      downloadBlob(
        await renderMarkCard({
          name: row.player.name,
          mark: row.mark,
          note: row.note,
          date: stamp,
        }),
        `first-bucket-tape-${row.player.id}.png`,
      );
      setShareState("saved");
    } finally {
      setSharing(null);
    }
  }

  if (!mounted) {
    return (
      <div>
        <PageIntro kicker="The Tape" title="Marks. Not a book." lead="The print is opening…" />
      </div>
    );
  }

  return (
    <div>
      <PageIntro
        kicker="The Tape"
        title="Marks. Not a book."
        lead="UP, FLAT, DOWN. Seeded to this device date. Top Shot sells moments. Sorare sells cards. This desk prints a mark. You cannot buy it."
      />
      <p className="mb-6 text-sm text-muted">
        {stamp} · {rows.filter((r) => r.mark === "UP").length} up · {rows.filter((r) => r.mark === "DOWN").length} down
        {shareState === "shared" && <span className="ml-3 text-fg">Shared.</span>}
        {shareState === "saved" && <span className="ml-3 text-fg">Card saved.</span>}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium shadow-border",
              filter === key ? "bg-fg text-paper shadow-none" : "text-fg",
            )}
          >
            {key === "ALL" ? "The print" : key}
          </button>
        ))}
      </div>

      <ol className="space-y-2">
        {shown.map((row) => {
          const pinned = pins.includes(row.player.id);
          return (
            <li key={row.player.id}>
              <div className="flex flex-col gap-3 rounded-xl bg-paper px-4 py-4 shadow-border sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="font-display text-xl font-semibold">{row.player.name}</p>
                    <p
                      className={cn(
                        "text-micro font-medium uppercase tracking-label",
                        row.mark === "UP" && "text-good",
                        row.mark === "DOWN" && "text-warn",
                        row.mark === "FLAT" && "text-muted",
                      )}
                    >
                      {row.mark}
                      <span className="ml-2 text-subtle">{Array.from({ length: row.heat }, () => "·").join("")}</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{row.note}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => togglePin(row.player.id)}>
                    {pinned ? "Pinned" : "Pin"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => shareRow(row)}
                    disabled={sharing === row.player.id}
                  >
                    {sharing === row.player.id ? "Sharing…" : "Share mark"}
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-8 max-w-xl text-sm text-subtle">
        Editorial tape. Not a sportsbook, not an NFT drop, not a player-stock exchange. Heat is intensity, not a
        price. Pins live on this device.
      </p>
    </div>
  );
}
