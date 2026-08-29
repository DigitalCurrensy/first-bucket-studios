import type { ReactNode } from "react";
import { marksFor, type CrestOp } from "@/lib/crest-marks";
import { clubAbbr as clubCode, hashSeed, type Era } from "@/lib/nba";
import { cn } from "@/lib/utils";

const PLATES = [
  "/plates/center.jpg",
  "/plates/forward.jpg",
  "/plates/guard.jpg",
  "/plates/hardwood.jpg",
  "/plates/locker.jpg",
  "/plates/night.jpg",
] as const;

function Mark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10 shrink-0", className)} aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const };

function opNode(op: CrestOp, i: number) {
  if (op.t === "rect") return <rect key={i} x={op.x} y={op.y} width={op.w} height={op.h} rx={op.rx} {...stroke} />;
  if (op.t === "circle") return <circle key={i} cx={op.cx} cy={op.cy} r={op.r} {...stroke} />;
  return <path key={i} d={op.d} {...stroke} />;
}

export function Crest({ name, className }: { name: string; className?: string }) {
  return <Mark className={className}>{marksFor(name).map(opNode)}</Mark>;
}

export function EraMark({ name, className }: { name: string; className?: string }) {
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

export function LuckMark({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Hot":
      return (
        <Mark className={className}>
          <path d="M20 8 Q14 18 16 26 Q20 31 24 26 Q26 18 20 8 Z" {...stroke} />
        </Mark>
      );
    case "Grit":
      return (
        <Mark className={className}>
          <path d="M10 28 L20 10 L30 28" {...stroke} />
          <path d="M14 28 H26" {...stroke} />
        </Mark>
      );
    case "Thin":
      return (
        <Mark className={className}>
          <path d="M12 10 V30 M20 10 V30 M28 10 V30" {...stroke} />
        </Mark>
      );
    case "Pace":
      return (
        <Mark className={className}>
          <path d="M8 20 H32 M24 12 L32 20 L24 28" {...stroke} />
        </Mark>
      );
    case "Steel":
      return (
        <Mark className={className}>
          <rect x="10" y="10" width="20" height="20" {...stroke} />
          <path d="M10 20 H30 M20 10 V30" {...stroke} />
        </Mark>
      );
    default:
      return (
        <Mark className={className}>
          <circle cx="20" cy="20" r="12" {...stroke} />
          <path d="M14 20 H26" {...stroke} />
        </Mark>
      );
  }
}

export function clubAbbr(name: string) {
  return clubCode(name);
}

export function plateForPlayer(id: string) {
  return PLATES[hashSeed(id) % PLATES.length]!;
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
