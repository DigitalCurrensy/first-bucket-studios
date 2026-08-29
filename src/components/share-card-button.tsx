import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cardFileName, downloadBlob, renderShareCard, type CardKind } from "@/lib/share-card";
import type { Player } from "@/lib/nba";

export function ShareCardButton({
  team,
  era,
  wins,
  roster,
  kind = "season",
}: {
  team: string;
  era: string;
  wins: number;
  roster: Player[];
  kind?: CardKind;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "fail">("idle");

  async function save() {
    if (state === "busy") return;
    setState("busy");
    try {
      const blob = await renderShareCard({ team, era, wins, roster, kind });
      downloadBlob(blob, cardFileName(team, wins));
      setState("done");
    } catch {
      setState("fail");
    }
  }

  const label = state === "busy" ? "Saving…" : state === "done" ? "Saved PNG" : state === "fail" ? "Couldn’t save" : "Save PNG";

  return (
    <Button variant="ghost" onClick={save} disabled={state === "busy" || roster.length === 0}>
      {label}
    </Button>
  );
}
