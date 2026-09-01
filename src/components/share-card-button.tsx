import { useEffect, useRef, useState } from "react";
import { PinWalkButton } from "@/components/pin-walk-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { blobToDataUrl, nativeShare, presentFile, saveCardFile, shareSheetOk } from "@/lib/deliver";
import { markDemo } from "@/lib/demo-funnel";
import { cardCaption, cardFileName, renderShareCard, type CardKind } from "@/lib/share-card";
import { rememberWalk } from "@/lib/studio-save";
import { encodeGoatWalk, encodePlayoffWalk, encodeWalk, encodeWnbaWalk, publicWalkUrl } from "@/lib/walk";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/nba";

function walkOf(opts: { team: string; era: string; wins: number; roster: Player[]; kind: CardKind; luck?: string }) {
  const ids = opts.roster.map((p) => p.id);
  if (opts.kind === "goat") return encodeGoatWalk({ wins: opts.wins, ids });
  if (!opts.luck) return "";
  if (opts.kind === "playoff") {
    return encodePlayoffWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
  }
  if (opts.kind === "wnba") {
    return encodeWnbaWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
  }
  if (opts.kind === "season") {
    return encodeWalk({ team: opts.team, era: opts.era, luck: opts.luck, wins: opts.wins, ids });
  }
  return "";
}

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
  const [saveHref, setSaveHref] = useState("");
  const [saveName, setSaveName] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "saved" | "shared" | "fail">("idle");
  const ready = useRef<Blob | null>(null);
  const rosterKey = roster.map((p) => p.id).join("~");
  const walk = walkOf({ team, era, wins, roster, kind, luck });
  const publicHref = walk ? publicWalkUrl(walk) : "";
  const caption = cardCaption({ team, era, wins, roster, kind, luck, walk, beat });

  useEffect(() => {
    if (roster.length === 0) return;
    ready.current = null;
    setSaveHref("");
    const name = cardFileName(team, wins);
    setSaveName(name);
    let live = true;
    void renderShareCard({ team, era, wins, roster, kind, luck, nights, ghostNights })
      .then(async (blob) => {
        if (!live) return;
        ready.current = blob;
        const href = await blobToDataUrl(blob);
        if (!live) return;
        setSaveHref(href);
      })
      .catch(() => {
        if (live) setState("fail");
      });
    return () => {
      live = false;
    };
  }, [team, era, wins, rosterKey, kind, luck, roster, nights, ghostNights]);

  async function printCard() {
    const blob =
      ready.current ?? (await renderShareCard({ team, era, wins, roster, kind, luck, nights, ghostNights }));
    ready.current = blob;
    if (!saveHref) setSaveHref(await blobToDataUrl(blob));
    return blob;
  }

  async function onSave() {
    if (state === "busy" || roster.length === 0) return;
    setState("busy");
    try {
      const blob = await printCard();
      const name = saveName || cardFileName(team, wins);
      if (walk) rememberWalk(walk);
      markDemo("save", name);
      await saveCardFile(blob, name);
      setState("saved");
    } catch {
      setState("fail");
    }
  }

  async function onShare() {
    if (roster.length === 0) return;
    try {
      const blob = await printCard();
      const name = saveName || cardFileName(team, wins);
      if (walk) rememberWalk(walk);
      if (shareSheetOk()) {
        const result = await nativeShare(blob, name, caption, publicHref || undefined);
        if (result === "shared") {
          markDemo("save", "share");
          setState("shared");
          return;
        }
        if (result === "abort") return;
      }
      presentFile(blob, name, caption, publicHref || undefined);
    } catch {
      setState("fail");
    }
  }

  const empty = roster.length === 0;

  return (
    <>
      {saveHref ? (
        <a
          className={cn(buttonVariants({ variant: "primary" }))}
          href={saveHref}
          download={saveName}
          onClick={() => {
            if (walk) rememberWalk(walk);
            markDemo("save", saveName);
            setState("saved");
          }}
        >
          {state === "saved" ? "Card saved" : "Save the card"}
        </a>
      ) : (
        <Button onClick={() => void onSave()} disabled={empty || state === "busy"}>
          {state === "busy" ? "Printing…" : state === "fail" ? "Couldn’t save" : "Printing…"}
        </Button>
      )}
      <Button variant="bronze" onClick={() => void onShare()} disabled={empty}>
        {state === "shared" ? "Shared" : "Share"}
      </Button>
      {walk ? <PinWalkButton id={walk} /> : null}
    </>
  );
}
