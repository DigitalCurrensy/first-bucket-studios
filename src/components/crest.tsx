import type { ReactNode } from "react";
import type { Era, Franchise } from "@/lib/nba";
import { cn } from "@/lib/utils";

const ABBR: Record<Franchise, string> = {
  Lakers: "LAL",
  Celtics: "BOS",
  Spurs: "SAS",
  Bulls: "CHI",
  Warriors: "GSW",
  Heat: "MIA",
  Pistons: "DET",
  Knicks: "NYK",
  Suns: "PHX",
  Nuggets: "DEN",
};

function Mark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10 shrink-0", className)} aria-hidden="true">
      {children}
    </svg>
  );
}

export function Crest({ name, className }: { name: string; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const };
  switch (name) {
    case "Lakers":
      return (
        <Mark className={className}>
          <rect x="6" y="6" width="28" height="28" rx="2" {...stroke} />
          <path d="M14 28 V12 H20 L26 28" {...stroke} />
        </Mark>
      );
    case "Celtics":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="14" {...stroke} />
          <path d="M13 24 Q20 10 27 24" {...stroke} />
        </Mark>
      );
    case "Spurs":
      return (
        <Mark className={className}>
          <polygon points="20,5 24,16 36,16 26,23 30,34 20,27 10,34 14,23 4,16 16,16" {...stroke} />
        </Mark>
      );
    case "Bulls":
      return (
        <Mark className={className}>
          <rect x="7" y="8" width="26" height="24" rx="3" {...stroke} />
          <path d="M14 26 V14 H20 Q26 14 26 20 Q26 26 20 26 Z" {...stroke} />
        </Mark>
      );
    case "Warriors":
      return (
        <Mark className={className}>
          <path d="M8 28 L14 12 L20 22 L26 12 L32 28" {...stroke} />
          <path d="M10 28 H30" {...stroke} />
        </Mark>
      );
    case "Heat":
      return (
        <Mark className={className}>
          <path d="M20 8 Q12 18 14 26 Q20 32 26 26 Q28 18 20 8 Z" {...stroke} />
        </Mark>
      );
    case "Pistons":
      return (
        <Mark className={className}>
          <rect x="10" y="8" width="20" height="24" rx="2" {...stroke} />
          <path d="M10 16 H30 M10 24 H30" {...stroke} />
        </Mark>
      );
    case "Knicks":
      return (
        <Mark className={className}>
          <path d="M8 28 V12 L20 22 L32 12 V28" {...stroke} />
        </Mark>
      );
    case "Suns":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="7" {...stroke} />
          <path d="M20 6 V11 M20 29 V34 M6 20 H11 M29 20 H34 M9 9 L13 13 M27 27 L31 31 M31 9 L27 13 M13 27 L9 31" {...stroke} />
        </Mark>
      );
    case "Nuggets":
      return (
        <Mark className={className}>
          <path d="M8 28 L20 8 L32 28 Z" {...stroke} />
          <path d="M14 28 L20 16 L26 28" {...stroke} />
        </Mark>
      );
    default:
      return (
        <Mark className={className}>
          <rect x="6" y="6" width="28" height="28" rx="4" {...stroke} />
        </Mark>
      );
  }
}

export function EraMark({ name, className }: { name: string; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const };
  switch (name as Era) {
    case "60s Celtic":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
          <path d="M14 20 H26 M20 14 V26" {...stroke} />
        </Mark>
      );
    case "Showtime":
      return (
        <Mark className={className}>
          <path d="M8 26 L20 8 L32 26" {...stroke} />
          <path d="M12 26 H28" {...stroke} />
        </Mark>
      );
    case "90s East":
      return (
        <Mark className={className}>
          <rect x="8" y="8" width="24" height="24" {...stroke} />
          <path d="M8 20 H32 M20 8 V32" {...stroke} />
        </Mark>
      );
    case "Twin Towers":
      return (
        <Mark className={className}>
          <rect x="8" y="10" width="8" height="20" {...stroke} />
          <rect x="24" y="10" width="8" height="20" {...stroke} />
        </Mark>
      );
    case "2000s":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="13" {...stroke} />
          <path d="M20 12 V20 H27" {...stroke} />
        </Mark>
      );
    case "Positionless":
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="4" {...stroke} />
          <circle cx="20" cy="20" r="13" {...stroke} />
        </Mark>
      );
    default:
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
        </Mark>
      );
  }
}

export function clubAbbr(name: string) {
  return ABBR[name as Franchise] ?? name.slice(0, 3).toUpperCase();
}

export function plateFor(pos: string, era: string) {
  if (era === "60s Celtic" || era === "Twin Towers") return "/plates/hardwood.jpg";
  if (era === "Showtime") return "/plates/night.jpg";
  if (era === "90s East") return pos === "G" ? "/plates/guard.jpg" : "/plates/locker.jpg";
  if (pos === "C") return "/plates/center.jpg";
  if (pos === "G") return "/plates/guard.jpg";
  return "/plates/forward.jpg";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
