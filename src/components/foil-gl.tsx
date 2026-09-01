import { useEffect, useRef } from "react";
import { foilGlSupported, mountFoil, type FoilHandle } from "@/lib/foil-gl";
import { subscribeGyro } from "@/lib/gyro";
import { cn } from "@/lib/utils";

function tiltFromPointer(host: HTMLElement, event: PointerEvent) {
  const box = host.getBoundingClientRect();
  if (box.width < 1 || box.height < 1) return { x: 0.5, y: 0.4 };
  return {
    x: Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)),
    y: Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)),
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
    const host = (canvas.closest(".rip-pack") as HTMLElement | null) ?? parent;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let dead = false;
    let next: FoilHandle | null = null;
    let ungyro: (() => void) | null = null;

    const onVis = () => {
      if (!next) return;
      if (document.hidden) next.stop();
      else next.start();
    };

    const onMove = (event: Event) => {
      if (!next) return;
      const pe = event as PointerEvent;
      if (typeof pe.clientX !== "number") return;
      const tilt = tiltFromPointer(host, pe);
      next.setTilt(tilt.x, tilt.y);
    };
    const onLeave = () => next?.setTilt(0.5, 0.4);

    void mountFoil(canvas, colors.current.foil, colors.current.flare, colors.current.ink)
      .then((mounted) => {
        if (!mounted) return;
        if (dead) {
          mounted.dispose();
          return;
        }
        next = mounted;
        handle.current = mounted;
        ready.current?.();
        document.addEventListener("visibilitychange", onVis);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        ungyro = subscribeGyro((x, y) => mounted.setTilt(x / 100, y / 100));
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
      })
      .catch(() => {
        /* CSS hologram stays. */
      });

    return () => {
      dead = true;
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ungyro?.();
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
