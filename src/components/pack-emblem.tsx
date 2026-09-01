import { useState } from "react";
import { Crest } from "@/components/crest";
import { cn } from "@/lib/utils";

const FILES = new Set([
  "76ers",
  "aces",
  "bucks",
  "bulls",
  "cavaliers",
  "celtics",
  "clippers",
  "dream",
  "fever",
  "goat",
  "grizzlies",
  "hawks",
  "heat",
  "hornets",
  "house",
  "jazz",
  "kings",
  "knicks",
  "lakers",
  "liberty",
  "lynx",
  "magic",
  "mavericks",
  "mercury",
  "mystics",
  "nets",
  "nuggets",
  "pacers",
  "pelicans",
  "pistons",
  "raptors",
  "rockets",
  "sky",
  "sparks",
  "spurs",
  "storm",
  "sun",
  "suns",
  "thunder",
  "timberwolves",
  "trail-blazers",
  "valkyries",
  "warriors",
  "wings",
  "wizards",
]);

export function emblemSlug(name?: string, room?: "nba" | "wnba" | "goat" | "playoff") {
  if (name) return name.toLowerCase().replace(/\s+/g, "-");
  if (room === "goat") return "goat";
  return "house";
}

export function emblemSrc(name?: string, room?: "nba" | "wnba" | "goat" | "playoff") {
  const slug = emblemSlug(name, room);
  return `/emblems/${FILES.has(slug) ? slug : "house"}.png`;
}

/** Circular lithograph plate. Transparent PNG. Crop marks live on the wrap. */
export function PackEmblem({
  name,
  room,
  className,
}: {
  name?: string;
  room?: "nba" | "wnba" | "goat" | "playoff";
  className?: string;
}) {
  const src = emblemSrc(name, room);
  const [ok, setOk] = useState(false);
  const mark = name ?? "First Bucket";

  return (
    <span className={cn("pack-plate", className)}>
      <svg viewBox="0 0 100 100" className="pack-plate-reg" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="0.7">
          <path d="M8 16 H16 V8 M84 8 V16 H92 M8 84 H16 V92 M84 92 V84 H92" />
          <circle cx="50" cy="7" r="2" />
          <path d="M50 3.5 V10.5 M46.5 7 H53.5" />
        </g>
      </svg>
      {ok ? null : <Crest name={mark} className="relative size-24 text-accent" />}
      <img
        src={src}
        alt=""
        className="pack-plate-mark"
        decoding="async"
        hidden={!ok}
        onLoad={() => setOk(true)}
        onError={() => setOk(false)}
      />
    </span>
  );
}
