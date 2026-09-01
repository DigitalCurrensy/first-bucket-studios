import { useEffect, useRef } from "react";
import { foilGlSupported, mountFoil, type FoilHandle } from "@/lib/foil-gl";
import { cn } from "@/lib/utils";

function tiltOf(el: HTMLElement) {
  const styles = getComputedStyle(el);
  const x = Number.parseFloat(styles.getPropertyValue("--foil-x")) / 100;
  const y = Number.parseFloat(styles.getPropertyValue("--foil-y")) / 100;
  return {
    x: Number.isFinite(x) ? x : 0.5,
    y: Number.isFinite(y) ? y : 0.4,
  };
}

export function FoilGl({
  foil,
  flare,
  ink,
  className,
  onReady,
}: {
  foil: string;
  flare: string;
  ink?: string;
  className?: string;
  onReady?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<FoilHandle | null>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  const colors = useRef({ foil, flare, ink: ink ?? foil });
  colors.current = { foil, flare, ink: ink ?? foil };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !foilGlSupported()) return;
    const parent = canvas.parentElement ?? canvas;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let dead = false;
    let next: FoilHandle | null = null;

    const onVis = () => {
      if (!next) return;
      if (document.hidden) next.stop();
      else next.start();
    };

    void mountFoil(canvas, colors.current.foil, colors.current.flare, colors.current.ink, () => tiltOf(parent)).then(
      (mounted) => {
        if (!mounted) return;
        if (dead) {
          mounted.dispose();
          return;
        }
        next = mounted;
        handle.current = mounted;
        ready.current?.();
        document.addEventListener("visibilitychange", onVis);
        if (typeof IntersectionObserver === "function") {
          io = new IntersectionObserver((entries) => {
            if (entries.some((row) => row.isIntersecting)) mounted.start();
            else mounted.stop();
          });
          io.observe(parent);
        }
        ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => mounted.resize()) : null;
        if (ro) ro.observe(parent);
        mounted.resize();
        mounted.start();
      },
    ).catch(() => {
      /* CSS hologram stays. */
    });

    return () => {
      dead = true;
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
      ro?.disconnect();
      next?.dispose();
      handle.current = null;
    };
  }, []);

  useEffect(() => {
    handle.current?.setColors(foil, flare, ink ?? foil);
  }, [foil, flare, ink]);

  return <canvas ref={ref} className={cn("foil-gl", className)} aria-hidden="true" />;
}
