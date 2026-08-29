import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cardCaption,
  cardFileName,
  downloadBlob,
  renderShareCard,
  shareFile,
  type CardKind,
} from "@/lib/share-card";
import { encodeWalk } from "@/lib/walk";
import type { Player } from "@/lib/nba";

export function ShareCardButton({
  team,
  era,
  wins,
  roster,
  kind = "season",
  luck,
  nights,
}: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
  luck?: string;
  nights?: { win: boolean }[];
}) {
  const [state, setState] = useState<"idle" | "busy" | "shared" | "saved" | "fail">("idle");

  async function run(mode: "share" | "save") {
    if (state === "busy" || roster.length === 0) return;
    setState("busy");
    try {
      const blob = await renderShareCard({ team, era, wins, roster, kind, luck, nights });
      const name = cardFileName(team, wins);
      const walk =
        kind !== "goat" && kind !== "playoff" && luck
          ? encodeWalk({ team, era, luck, wins, ids: roster.map((p) => p.id) })
          : undefined;
      const text = cardCaption({ team, era, wins, roster, kind, luck, walk });
      if (mode === "save") {
        downloadBlob(blob, name);
        setState("saved");
        return;
      }
      const result = await shareFile(blob, name, text);
      if (result === "abort") {
        setState("idle");
        return;
      }
      setState(result === "shared" ? "shared" : "saved");
    } catch {
      setState("fail");
    }
  }

  const shareLabel =
    state === "busy" ? "Sharing…" : state === "shared" ? "Shared" : state === "fail" ? "Couldn’t share" : "Share";
  const saveLabel = state === "saved" ? "Saved PNG" : "Save PNG";

  return (
    <>
      <Button onClick={() => run("share")} disabled={state === "busy" || roster.length === 0}>
        {shareLabel}
      </Button>
      <Button variant="ghost" onClick={() => run("save")} disabled={state === "busy" || roster.length === 0}>
        {saveLabel}
      </Button>
    </>
  );
}
