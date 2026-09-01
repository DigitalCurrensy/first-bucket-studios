import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DeskMark, markForHref } from "@/components/desk-mark";
import { HouseMark } from "@/components/house-mark";
import { useSpecular } from "@/lib/hooks";
import { loadSave, writeSave } from "@/lib/studio-save";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/games/82-0" as const, label: "Rip the pack", house: false },
  { href: "/wall" as const, label: "The Wall", house: false },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "night">("night");
  const rail = useRef<HTMLElement | null>(null);
  useSpecular(rail);

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
    <nav className="flex flex-col gap-1 text-sm">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            search={item.house ? { pack: "house" as const } : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "nav-plate flex min-h-11 items-center gap-2 rounded-md px-3 py-2 transition-colors duration-150",
              active ? "is-active text-fg" : "v-secondary hover:text-fg",
            )}
          >
            <DeskMark
              kind={markForHref(item.href)}
              className={cn("size-4 shrink-0", active ? "text-accent" : "text-current")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <div className="studio-mesh" aria-hidden="true" />
      <div className="studio-grain" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-studio lg:grid-cols-shell">
        <aside ref={rail} className="glass-nav hidden h-dvh lg:block">
          <div className="studio-rail">
            <Link to="/" className="mb-10 flex items-center gap-3">
              <HouseMark className="size-11 shrink-0 outline outline-1 -outline-offset-1 outline-fg/10" />
              <span>
                <p className="font-display text-lg font-semibold leading-none">First Bucket</p>
                <p className="v-tertiary mt-1 text-micro uppercase tracking-label">Studio</p>
              </span>
            </Link>
            {nav}
            <div className="mt-auto pt-10">
              <Link to="/games/82-0" search={{ pack: "house" }} className="widget block">
                <p className="v-tertiary text-micro font-medium uppercase tracking-label">Pinned walk</p>
                <p className="mt-2 font-display text-base font-semibold">Thunder</p>
                <p className="v-secondary mt-1 text-sm">Positionless · Even</p>
                <span className="v-separator" />
                <p className="plate-stamp v-label text-accent">51–31 · House</p>
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="v-secondary mt-8 inline-flex min-h-11 items-center gap-2 text-sm"
              >
                {theme === "night" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "night" ? "Light studio" : "Night arena"}
              </button>
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="glass-chrome sticky top-0 z-20 flex items-center justify-between px-4 py-3 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-display font-semibold">
              <HouseMark className="size-8 shrink-0" />
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
          {open && <div className="glass-chrome border-b border-line px-4 py-4 lg:hidden">{nav}</div>}
          <main className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
          <footer className="overflow-x-clip px-4 pb-10 sm:px-8 lg:px-12">
            <p className="press-slug">
              <span className="stock-name" />
              <span> · Games and tools only · Not a sportsbook · Not a recruiting desk · </span>
              <Link to="/about" className="text-muted hover:text-fg">
                About
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
