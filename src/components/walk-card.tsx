import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ResultPoster } from "@/components/result-poster";
import { cardCaption, renderShareCard, shareFile } from "@/lib/share-card";
import { decodeWalk, playersOf, walkUrl, type WalkPayload } from "@/lib/walk";
import { rememberWalk } from "@/lib/studio-save";
import type { Player } from "@/lib/nba";

export function WalkCard({ id }: { id: string }) {
  const payload = decodeWalk(id);
  const roster = payload ? playersOf(payload.ids) : [];

  if (!payload || roster.length !== 5) {
    return (
      <Link
        to="/walk/$id"
        params={{ id }}
        className="group block min-h-11 rounded-xl bg-fg p-4 text-sm text-paper/70 shadow-border"
      >
        This card didn’t land.
      </Link>
    );
  }

  return (
    <article>
      <Link to="/walk/$id" params={{ id }} className="group block min-h-11">
        <ResultPoster
          compact
          team={payload.team}
          era={payload.era}
          wins={payload.wins}
          roster={roster}
          kind={payload.kind}
        />
      </Link>
      <WalkSend id={id} payload={payload} roster={roster} />
    </article>
  );
}

function WalkSend({ id, payload, roster }: { id: string; payload: WalkPayload; roster: Player[] }) {
  const [state, setState] = useState<"idle" | "busy" | "shared" | "saved" | "fail">("idle");

  async function send() {
    if (state === "busy") return;
    setState("busy");
    try {
      const blob = await renderShareCard({
        team: payload.team,
        era: payload.era,
        wins: payload.wins,
        roster,
        kind: payload.kind === "playoff" ? "playoff" : payload.kind === "wnba" ? "wnba" : payload.kind === "goat" ? "goat" : "season",
        luck: payload.kind === "goat" ? undefined : payload.luck,
      });
      const text = cardCaption({
        team: payload.team,
        era: payload.era,
        wins: payload.wins,
        roster,
        kind: payload.kind === "playoff" ? "playoff" : payload.kind === "wnba" ? "wnba" : payload.kind === "goat" ? "goat" : "season",
        luck: payload.kind === "goat" ? undefined : payload.luck,
        walk: id,
      });
      rememberWalk(id);
      const result = await shareFile(blob, `first-bucket-${payload.wins}.png`, text, walkUrl(id));
      setState(result === "shared" ? "shared" : "saved");
    } catch {
      setState("fail");
    }
  }

  return (
    <Button variant="ghost" onClick={() => void send()} className="mt-2">
      {state === "busy"
        ? "Sending…"
        : state === "shared"
          ? "Sent"
          : state === "saved"
            ? "Saved"
            : state === "fail"
              ? "Couldn’t send"
              : "Send the card"}
    </Button>
  );
}
