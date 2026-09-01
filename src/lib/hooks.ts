import { useEffect, useState, type RefObject } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Pointer specular for Apple-style glass. No-ops when reduced motion is on. */
export function useSpecular(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;
      el.style.setProperty("--spec-x", `${x}%`);
      el.style.setProperty("--spec-y", `${y}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--spec-x", "50%");
      el.style.setProperty("--spec-y", "0%");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}
