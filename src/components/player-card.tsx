import type { CSSProperties } from "react";
import { Crest, cardSerial, initials, nameParts, plateCrop, plateForPlayer } from "@/components/crest";
import { CourtBack, HoopMark, PlateRosette } from "@/components/court-mark";
import { emblemSrc } from "@/components/pack-emblem";
import { clubName, houseInk } from "@/lib/house-ink";
import { eraLabel, type Player } from "@/lib/nba";
import { lockHaptic } from "@/lib/tick";
import { cn } from "@/lib/utils";

function CardBackFace({ team, stamp, shelf }: { team?: string; stamp?: string; shelf?: Player["shelf"] }) {
  const club = clubName(team, shelf);
  const mark = club ? emblemSrc(club) : undefined;
  return (
    <div className="card-back card-edge carbon-fiber flex flex-col items-center justify-center rounded-sm px-3 text-accent">
      <CourtBack className="absolute inset-1 text-accent/35" />
      <span className="card-guilloche text-accent" aria-hidden="true" />
      <PlateRosette className="absolute inset-4 text-accent/20" />
      {mark ? (
        <img src={mark} alt="" className="relative size-12 object-contain" crossOrigin="anonymous" decoding="async" />
      ) : team ? (
        <Crest name={team} className="relative size-10 text-accent/90" />
      ) : (
        <HoopMark className="relative size-10 text-accent/85" />
      )}
      {stamp ? <p className="plate-letter relative mt-3 text-3xl text-fg">{stamp}</p> : null}
      <p className="relative mt-3 text-micro font-medium uppercase tracking-label text-fg/45">First Bucket</p>
      <p className="relative mt-1 plate-serial text-accent/40">5×7</p>
      <span className="card-holo" aria-hidden="true" />
    </div>
  );
}

export function PlayerCard({
  player,
  selected,
  index,
  mark,
  stamp,
  team,
  revealed = true,
  onToggle,
}: {
  player: Player;
  selected?: boolean;
  index?: number;
  mark?: string;
  stamp?: string;
  team?: string;
  revealed?: boolean;
  onToggle?: () => void;
}) {
  const inverted = Boolean(selected && revealed);
  const plate = revealed ? cardSerial(player.id) : "";
  const { first, last } = nameParts(player.name);
  const mute = inverted ? "text-fg/55" : "text-paper/55";
  const club = clubName(team || player.club, player.shelf);
  const pal = houseInk(club, player.shelf === "wnba" ? "wnba" : "nba");
  const vars = {
    "--pack-ink": pal.ink,
    "--pack-foil": pal.foil,
    "--pack-flare": pal.flare,
  } as CSSProperties;
  const inner = (
    <div className={cn("card-shell", !revealed && "is-down")}>
      {revealed ? (
        <div
          className={cn(
            "card-face card-edge flex flex-col overflow-hidden rounded-sm",
            inverted ? "bg-paper text-fg" : "paper-grain text-paper",
          )}
        >
          <span className="card-club-bar" aria-hidden="true" />
          <span className="card-holo" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-1 px-2 pt-1.5">
            <span className={cn("text-micro font-medium uppercase tracking-label", mute)}>{player.pos}</span>
            {selected && index != null && index >= 0 ? (
              <span
                className={cn(
                  "grid size-4 place-items-center text-[0.6rem] font-medium not-italic",
                  inverted ? "bg-fg text-paper" : "bg-paper text-fg",
                )}
              >
                {index + 1}
              </span>
            ) : null}
            <span className={cn("font-mono text-micro tabular-nums", mute)}>{player.peak}</span>
          </div>
          <div className="plate-window relative mx-1.5 mt-1 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <img
              src={plateForPlayer(player.id)}
              alt=""
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: plateCrop(player.id) }}
              crossOrigin="anonymous"
              decoding="async"
            />
            <span className={cn("absolute inset-0", inverted ? "bg-paper/45" : "bg-fg/40")} aria-hidden="true" />
            <span className={cn("plate-letter plate-cut relative", inverted ? "text-fg" : "text-paper")}>
              {initials(player.name)}
            </span>
          </div>
          <div className="card-caption relative">
            {first ? (
              <p className={cn("truncate text-micro font-medium uppercase tracking-label", mute)}>{first}</p>
            ) : null}
            <p className="plate-name truncate text-xs">{last}</p>
            <p className={cn("mt-0.5 truncate font-mono text-micro tabular-nums", mute)}>
              {eraLabel(player.era)} · {player.pts} · {player.reb} · {player.ast}
            </p>
            <p className={cn("plate-stamp mt-1", inverted ? "text-fg/40" : "text-paper/40")}>{plate}</p>
            {mark ? (
              <p className="mt-1 truncate text-micro font-medium uppercase tracking-label" style={{ color: pal.foil }}>
                {mark}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="card-face rounded-sm bg-paper" />
      )}
      <CardBackFace team={club ?? team} stamp={stamp} shelf={player.shelf} />
    </div>
  );

  if (!onToggle) {
    return (
      <div className="deal-card rounded-lg bg-surface p-2 shadow-border" style={vars}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        lockHaptic();
        onToggle();
      }}
      aria-pressed={selected}
      aria-label={revealed ? `${player.name} ${plate}` : "Face-down card"}
      style={vars}
      className={cn(
        "deal-card rounded-lg bg-surface p-2 text-left shadow-border transition-[box-shadow,scale] duration-150 ease-out hover:shadow-border-hover active:scale-[0.96]",
        selected && revealed && "ring-1 ring-fg",
      )}
    >
      {inner}
    </button>
  );
}

export function FaceDownCard({ stamp, compact = false }: { stamp?: string; compact?: boolean }) {
  return (
    <div
      className={cn("deal-card rounded-lg bg-surface p-2 shadow-border", compact && "max-w-[9rem]")}
      aria-hidden="true"
    >
      <div className="card-shell is-down">
        <div className="card-face rounded-sm bg-paper" />
        <CardBackFace stamp={stamp} />
      </div>
    </div>
  );
}
