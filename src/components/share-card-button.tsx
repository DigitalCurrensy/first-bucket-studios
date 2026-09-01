import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cardCaption, cardFileName, renderShareCard, shareFile, type CardKind } from "@/lib/share-card";
import { encodeGoatWalk, encodePlayoffWalk, encodeWalk, encodeWnbaWalk, walkUrl } from "@/lib/walk";
import { rememberWalk } from "@/lib/studio-save";
import type { Player } from "@/lib/nba";

export function ShareCardButton({
  team,
  era,
  wins,
  roster,
  kind = "season",
  luck,
  nights,
  ghostNights,
  beat,
}: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  nights?: { win: boolean }[];
  ghostNights?: { win: boolean }[];
  beat?: number;
}) {
  const [state, setState] = useState<"idle" | "busy" | "shared" | "fail">("idle");
  const ready = useRef<Blob | null>(null);
  const rosterKey = roster.map((p) => p.id).join("~");

  useEffect(() => {
    if (roster.length === 0) return;
    ready.current = null;
    let live = true;
    void renderShareCard({ team, era, wins, roster, kind, luck, nights, ghostNights }).then((blob) => {
      if (!live) return;
      ready.current = blob;
    });
    return () => {
      live = false;
    };
  }, [team, era, wins, rosterKey, kind, luck, roster, nights, ghostNights]);

  async function run() {
    if (state === "busy" || roster.length === 0) return;
    setState("busy");
    try {
      const blob = ready.current ?? (await renderShareCard({ team, era, wins, roster, kind, luck, nights, ghostNights }));
      ready.current = blob;
      const name = cardFileName(team, wins);
      const ids = roster.map((p) => p.id);
      const walk =
        kind === "goat"
          ? encodeGoatWalk({ wins, ids })
          : luck && kind === "playoff"
            ? encodePlayoffWalk({ team, era, luck, wins, ids })
            : luck && kind === "wnba"
              ? encodeWnbaWalk({ team, era, luck, wins, ids })
              : luck && kind === "season"
                ? encodeWalk({ team, era, luck, wins, ids })
                : undefined;
      const text = cardCaption({ team, era, wins, roster, kind, luck, walk, beat });
      if (walk) rememberWalk(walk);
      const result = await shareFile(blob, name, text, walk ? walkUrl(walk) : undefined);
      if (result === "abort") {
        setState("idle");
        return;
      }
      setState("shared");
    } catch {
      setState("fail");
    }
  }

  const shareLabel =
    state === "busy"
      ? "Sharing…"
      : state === "shared"
        ? "On the press"
        : state === "fail"
          ? "Couldn’t share"
          : "Send the card";

  return (
    <Button onClick={() => void run()} disabled={state === "busy" || roster.length === 0}>
      {shareLabel}
    </Button>
  );
}