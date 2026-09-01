import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DeskKind =
  | "tape"
  | "brief"
  | "slate"
  | "press"
  | "wall"
  | "gym"
  | "keepers"
  | "trade"
  | "board"
  | "machine"
  | "daily"
  | "corners"
  | "wnba"
  | "goat"
  | "playoff"
  | "walk"
  | "score"
  | "about"
  | "log";

const HREF_MARK: Record<string, DeskKind> = {
  "/games/82-0": "machine",
  "/games/daily": "daily",
  "/games/corners": "corners",
  "/games/wnba": "wnba",
  "/games/goat": "goat",
  "/games/16-0": "playoff",
  "/tape": "tape",
  "/brief": "brief",
  "/slate": "slate",
  "/shop": "press",
  "/wall": "wall",
  "/gym": "gym",
  "/keepers": "keepers",
  "/trade": "trade",
  "/board": "board",
  "/score": "score",
  "/changelog": "log",
  "/about": "about",
  "/fantasy": "slate",
};

export function markForHref(href: string): DeskKind {
  if (href.startsWith("/walk")) return "walk";
  return HREF_MARK[href] ?? "about";
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.45,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const crop = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "square" as const,
};

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-5 shrink-0", className)} aria-hidden="true">
      {children}
    </svg>
  );
}

export function DeskMark({ kind, className }: { kind: DeskKind; className?: string }) {
  return <Frame className={className}>{paths(kind)}</Frame>;
}

/** Lithograph plate: crop, register, one ink square, the desk symbol. */
export function PlateSeal({ kind, className }: { kind: DeskKind; className?: string }) {
  return (
    <svg viewBox="-8 -8 56 56" className={cn("size-16 shrink-0", className)} aria-hidden="true">
      <path d="M-6 0 H0 M0 -6 V0" {...crop} />
      <path d="M40 -6 V0 H46" {...crop} />
      <path d="M-6 40 H0 M0 46 V40" {...crop} />
      <path d="M40 46 V40 H46" {...crop} />
      <g transform="translate(20 -4)">
        <circle r="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 -3.4 V3.4 M-3.4 0 H3.4" fill="none" stroke="currentColor" strokeWidth="1" />
      </g>
      <rect x="36.5" y="-6.5" width="3.2" height="3.2" fill="currentColor" />
      {paths(kind)}
    </svg>
  );
}

function paths(kind: DeskKind) {
  switch (kind) {
    case "tape":
      return (
        <>
          <path d="M7 26 L14 14 L20 22 L28 10 L34 16" {...stroke} />
          <path d="M8 32 H32" {...stroke} />
          <circle cx="28" cy="10" r="1.7" fill="currentColor" />
        </>
      );
    case "brief":
      return (
        <>
          <rect x="8" y="9" width="24" height="24" rx="1" {...stroke} />
          <path d="M8 15 H32 M12 21 H28 M12 26 H22" {...stroke} />
          <rect x="26" y="6" width="8" height="7" rx="0.5" {...stroke} />
        </>
      );
    case "slate":
      return (
        <>
          <circle cx="20" cy="15" r="7.5" {...stroke} />
          <circle cx="20" cy="15" r="2.4" {...stroke} />
          <path d="M13 19 Q20 34 27 19" {...stroke} />
          <path d="M16 25 V34 M20 27 V36 M24 25 V34" {...stroke} />
        </>
      );
    case "press":
      return (
        <>
          <circle cx="20" cy="14" r="8" {...stroke} />
          <path d="M12 17 Q20 32 28 17" {...stroke} />
          <path d="M16 21 V31 M20 23 V33 M24 21 V31" {...stroke} />
          <rect x="10" y="31" width="20" height="5" rx="0.5" {...stroke} />
        </>
      );
    case "wall":
      return (
        <>
          <path d="M8 12 H14 M8 12 V18" {...stroke} />
          <path d="M26 12 H32 M32 12 V18" {...stroke} />
          <path d="M8 28 V34 H14" {...stroke} />
          <path d="M32 28 V34 H26" {...stroke} />
          <rect x="13" y="13" width="14" height="14" rx="1" {...stroke} />
        </>
      );
    case "gym":
      return (
        <>
          <rect x="6" y="9" width="28" height="22" rx="1" {...stroke} />
          <path d="M6 18 H34 M20 9 V18" {...stroke} />
          <path d="M10 27 H16 M24 27 H30" {...stroke} />
        </>
      );
    case "keepers":
      return (
        <>
          <circle cx="20" cy="10" r="2.3" {...stroke} />
          <circle cx="10" cy="18" r="2.3" {...stroke} />
          <circle cx="30" cy="18" r="2.3" {...stroke} />
          <circle cx="13" cy="29" r="2.3" {...stroke} />
          <circle cx="27" cy="29" r="2.3" {...stroke} />
          <path d="M20 12.3 L10 18 L13 26.7 L27 26.7 L30 18 Z" {...stroke} />
        </>
      );
    case "trade":
      return (
        <>
          <path d="M20 7 V14" {...stroke} />
          <path d="M10 14 H30" {...stroke} />
          <path d="M10 14 L6 24 H14 Z" {...stroke} />
          <path d="M30 14 L26 24 H34 Z" {...stroke} />
          <path d="M16 30 H24 M18 34 H22" {...stroke} />
        </>
      );
    case "board":
      return (
        <>
          <rect x="9" y="16" width="22" height="18" rx="1" {...stroke} />
          <path d="M9 25 H31" {...stroke} />
          <circle cx="20" cy="25" r="4.2" {...stroke} />
          <path d="M20 16 V11" {...stroke} />
          <circle cx="20" cy="8.5" r="2.4" {...stroke} />
        </>
      );
    case "machine":
      return (
        <>
          <rect x="7" y="8" width="8" height="24" rx="1" {...stroke} />
          <rect x="16" y="8" width="8" height="24" rx="1" {...stroke} />
          <rect x="25" y="8" width="8" height="24" rx="1" {...stroke} />
          <path d="M7 20 H33" {...stroke} />
        </>
      );
    case "daily":
      return (
        <>
          <circle cx="20" cy="20" r="11" {...stroke} />
          <path d="M20 20 L20 11 M20 20 L27 20" {...stroke} />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </>
      );
    case "corners":
      return (
        <>
          <rect x="7" y="7" width="8" height="8" {...stroke} />
          <rect x="25" y="7" width="8" height="8" {...stroke} />
          <rect x="7" y="25" width="8" height="8" {...stroke} />
          <rect x="25" y="25" width="8" height="8" {...stroke} />
          <circle cx="20" cy="20" r="3.2" {...stroke} />
        </>
      );
    case "wnba":
      return (
        <>
          <circle cx="20" cy="15" r="8" {...stroke} />
          <path d="M12 19 Q20 33 28 19" {...stroke} />
          <path d="M16 11 L20 22 L24 11" {...stroke} />
        </>
      );
    case "goat":
      return (
        <>
          <circle cx="20" cy="10" r="3" {...stroke} />
          <circle cx="8" cy="22" r="3" {...stroke} />
          <circle cx="16" cy="22" r="3" {...stroke} />
          <circle cx="24" cy="22" r="3" {...stroke} />
          <circle cx="32" cy="22" r="3" {...stroke} />
        </>
      );
    case "playoff":
      return (
        <>
          <path d="M10 31 V12 L20 7 L30 12 V31 Z" {...stroke} />
          <path d="M16 31 V20 H24 V31" {...stroke} />
        </>
      );
    case "walk":
      return (
        <>
          <rect x="8" y="10" width="24" height="20" rx="1" {...stroke} />
          <path d="M14 18 H26 M14 23 H21" {...stroke} />
          <circle cx="20" cy="10" r="2.2" {...stroke} />
        </>
      );
    case "score":
      return (
        <>
          <path d="M8 28 L16 16 L22 22 L32 10" {...stroke} />
          <circle cx="32" cy="10" r="2" fill="currentColor" />
          <path d="M8 32 H32" {...stroke} />
        </>
      );
    case "about":
      return (
        <>
          <circle cx="20" cy="20" r="11" {...stroke} />
          <path d="M20 17 V27 M20 13 V14.2" {...stroke} />
        </>
      );
    case "log":
      return (
        <>
          <path d="M9 12 H31 M9 18 H27 M9 24 H23 M9 30 H19" {...stroke} />
          <rect x="9" y="7" width="7" height="2.2" fill="currentColor" />
        </>
      );
    default:
      return <circle cx="20" cy="20" r="10" {...stroke} />;
  }
}
