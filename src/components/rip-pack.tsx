import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PackEmblem } from "@/components/pack-emblem";
import { FoilGl } from "@/components/foil-gl";
import { requestGyro, subscribeGyro } from "@/lib/gyro";
import { houseInk } from "@/lib/house-ink";
import { cardSerial } from "@/lib/plates";
import { packTear } from "@/lib/tick";
import { cn } from "@/lib/utils";

export type PackRoom = "nba" | "wnba" | "goat" | "playoff";

const COPY: Record<PackRoom, { sub: string; issue: string; title: string }> = {
  nba: { sub: "Studio", issue: "ISSUE 001 · 2026", title: "SEASON 82" },
  wnba: { sub: "Studio · W", issue: "ISSUE 001 · 2026", title: "SEASON 40" },
  goat: { sub: "Studio", issue: "ISSUE ALL-TIME", title: "THE BOOK" },
  playoff: { sub: "Studio", issue: "ISSUE 001 · 2026", title: "SERIES" },
};

export function RipPack({
  room = "nba",
  team,
  lot,
  ripping,
  onRip,
}: {
  room?: PackRoom;
  team?: string;
  lot?: string;
  ripping?: boolean;
  onRip: () => void;
}) {
  const copy = COPY[room];
  const packRef = useRef<HTMLButtonElement>(null);
  const pal = houseInk(team, room);
  const serial = cardSerial(lot ?? `pack:${room}:${team ?? "house"}`);
  const [glFoil, setGlFoil] = useState(false);
  const vars = {
    "--pack-ink": pal.ink,
    "--pack-foil": pal.foil,
    "--pack-flare": pal.flare,
  } as CSSProperties;

  useEffect(() => {
    return subscribeGyro((x, y) => {
      const el = packRef.current;
      if (!el) return;
      el.style.setProperty("--foil-x", `${x}%`);
      el.style.setProperty("--foil-y", `${y}%`);
    });
  }, []);

  function tiltFromPointer(event: PointerEvent<HTMLButtonElement>) {
    const el = packRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    el.style.setProperty("--foil-x", `${Math.min(100, Math.max(0, x))}%`);
    el.style.setProperty("--foil-y", `${Math.min(100, Math.max(0, y))}%`);
  }

  function rip() {
    requestGyro();
    packTear();
    onRip();
  }

  return (
    <button
      type="button"
      ref={packRef}
      onClick={rip}
      onPointerMove={tiltFromPointer}
      aria-label={`Rip the ${team ?? (room === "wnba" ? "W" : "house")} prospect pack`}
      style={vars}
      className={cn(
        "rip-pack deal-card foil-gyro mx-auto block w-full max-w-[18rem] text-left",
        room === "wnba" && "is-w",
        ripping && "is-ripping",
        glFoil && "has-foil-gl",
      )}
    >
      <span className="rip-pack-foil" aria-hidden="true">
        Rip pack
        <span className="tracking-[0.3em]"> ›››</span>
      </span>
      <span className="rip-pack-body carbon-fiber">
        <span className="pack-holo" aria-hidden="true" />
        <span className="pack-holo-prism" aria-hidden="true" />
        <FoilGl foil={pal.foil} flare={pal.flare} ink={pal.ink} onReady={() => setGlFoil(true)} />
        <span className="rip-pack-shine" aria-hidden="true" />
        <span className="relative flex items-baseline justify-between px-4 pt-4">
          <span>
            <span className="block font-display text-lg font-semibold leading-none" style={{ color: pal.foil }}>
              First Bucket
            </span>
            <span className="mt-1 block text-micro font-medium uppercase tracking-label text-fg/50">{copy.sub}</span>
          </span>
          <span className="plate-serial" style={{ color: pal.foil }}>
            {serial}
          </span>
        </span>
        <span className="relative mx-2 mt-2 flex min-h-0 flex-1 items-center justify-center">
          <PackEmblem name={team} room={room} className="h-full max-h-56 w-full" />
        </span>
        <span className="relative px-4 pb-5 pt-1">
          <span className="block text-micro font-medium uppercase tracking-label text-fg/45">{copy.issue}</span>
          <span className="mt-1 block font-display text-xl font-semibold text-fg">{copy.title}</span>
          <span className="mt-1 block text-micro font-medium uppercase tracking-[0.22em]" style={{ color: pal.foil }}>
            Prospect pack
          </span>
          {team ? (
            <span className="mt-2 block truncate text-micro uppercase tracking-label" style={{ color: pal.foil }}>
              {team}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
