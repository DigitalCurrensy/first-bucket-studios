import { initials, plateForPlayer } from "@/components/crest";
import { PLAYERS } from "@/lib/nba";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-9",
  md: "size-11",
  lg: "size-14",
} as const;

const TYPE = {
  sm: "text-micro",
  md: "text-micro",
  lg: "text-sm",
} as const;

export function NamePlate({
  name,
  pos,
  era,
  id,
  size = "md",
  empty = false,
}: {
  name?: string;
  pos?: string;
  era?: string;
  id?: string;
  size?: keyof typeof SIZES;
  empty?: boolean;
}) {
  if (empty || !name) {
    return <span className={cn(SIZES[size], "block shrink-0 rounded-full shadow-border")} aria-hidden="true" />;
  }

  const hit = PLAYERS.find((p) => p.id === id || p.name === name || p.id === name);
  const src = plateForPlayer(hit?.id ?? id ?? name);
  void pos;
  void era;

  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-fg", SIZES[size])}>
      <img src={src} alt="" crossOrigin="anonymous" className="media-frame size-full object-cover" />
      <span className={cn("absolute inset-0 grid place-items-center bg-fg/50 font-medium text-paper", TYPE[size])}>
        {initials(name)}
      </span>
    </span>
  );
}
