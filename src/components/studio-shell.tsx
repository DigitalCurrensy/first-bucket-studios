import { Link, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Bookmark,
  CalendarDays,
  Circle,
  FileText,
  History,
  Image,
  Info,
  Layers,
  LayoutTemplate,
  LineChart,
  ListOrdered,
  Menu,
  Moon,
  Newspaper,
  ArrowLeftRight,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { loadSave, writeSave } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

const NAV = [
  {
    group: "Play",
    items: [
      { href: "/games/82-0" as const, label: "Build an 82-0", icon: Circle },
      { href: "/games/daily" as const, label: "Daily Bucket", icon: Sun },
      { href: "/games/corners" as const, label: "Four corners", icon: Trophy },
      { href: "/games/goat" as const, label: "GOAT Five", icon: Award },
      { href: "/games/16-0" as const, label: "Build a 16-0", icon: Trophy },
    ],
  },
  {
    group: "Tape",
    items: [
      { href: "/tape" as const, label: "The Tape", icon: Newspaper },
      { href: "/brief" as const, label: "Brief Desk", icon: FileText },
      { href: "/slate" as const, label: "The Slate", icon: CalendarDays },
    ],
  },
  {
    group: "Cards",
    items: [
      { href: "/shop" as const, label: "Card Shop", icon: Image },
      { href: "/wall" as const, label: "The Wall", icon: Layers },
      { href: "/gym" as const, label: "The Gym", icon: LayoutTemplate },
    ],
  },
  {
    group: "Desk",
    items: [
      { href: "/fantasy" as const, label: "Market Board", icon: LineChart },
      { href: "/trade" as const, label: "Trade Desk", icon: ArrowLeftRight },
      { href: "/keepers" as const, label: "Keeper Desk", icon: Bookmark },
      { href: "/mock" as const, label: "Mock Lab", icon: ListOrdered },
    ],
  },
  {
    group: "Lab",
    items: [
      { href: "/board" as const, label: "The Board", icon: Layers },
      { href: "/changelog" as const, label: "Changelog", icon: History },
      { href: "/about" as const, label: "About", icon: Info },
    ],
  },
];
export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "night">("night");

  useEffect(() => {
    const save = loadSave();
    setTheme(save.theme);
    document.documentElement.dataset.theme = save.theme === "light" ? "light" : "";
  }, []);

  function toggleTheme() {
    const next = theme === "night" ? "light" : "night";
    setTheme(next);
    document.documentElement.dataset.theme = next === "light" ? "light" : "";
    const save = loadSave();
    writeSave({ ...save, theme: next });
  }

  const nav = (
    <nav className="flex flex-col gap-6 text-sm">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-2 text-micro font-medium uppercase tracking-label text-subtle">{g.group}</p>
          <div className="flex flex-col gap-1">
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-muted transition-colors duration-150 hover:text-fg",
                    pathname === item.href && "bg-surface text-fg shadow-border",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto grid min-h-dvh max-w-studio lg:grid-cols-shell">
        <aside className="hidden border-r border-line px-5 py-8 lg:block">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <Circle className="size-4 text-accent" aria-hidden="true" />
            <span>
              <p className="font-display text-lg font-semibold tracking-tight">First Bucket</p>
              <p className="text-xs text-muted">Studio</p>
            </span>
          </Link>
          {nav}
          <button type="button" onClick={toggleTheme} className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted">
            {theme === "night" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {theme === "night" ? "Light studio" : "Night arena"}
          </button>
        </aside>
        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
            <Link to="/" className="font-display font-semibold">
              First Bucket
            </Link>
            <div className="flex items-center gap-1">
              <button type="button" className="grid size-11 place-items-center" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "night" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}>
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </header>
          {open && <div className="border-b border-line bg-paper px-4 py-4 lg:hidden">{nav}</div>}
          <main className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
          <footer className="px-4 pb-10 text-xs text-subtle sm:px-8 lg:px-12">
            First Bucket Studio is a Digital Currensy house. Games and tools only. Not a sportsbook. Not an NCAA
            determination. Not a live recruiting service.
          </footer>
        </div>
      </div>
    </div>
  );
}
