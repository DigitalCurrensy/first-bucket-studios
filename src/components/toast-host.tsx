import { useEffect, useState } from "react";

type Toast = { id: number; text: string };
let push: ((text: string) => void) | null = null;
let seq = 1;

export function toast(text: string) {
  push?.(text);
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (text) => {
      const id = seq++;
      setItems((cur) => [...cur.slice(-3), { id, text }]);
      window.setTimeout(() => setItems((cur) => cur.filter((row) => row.id !== id)), 2400);
    };
    return () => {
      push = null;
    };
  }, []);

  if (!items.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[min(24rem,calc(100%-1.5rem))] -translate-x-1/2 flex-col gap-2">
      {items.map((row) => (
        <p key={row.id} className="glass-toast rounded-full px-4 py-2 text-center text-sm shadow-border">
          {row.text}
        </p>
      ))}
    </div>
  );
}
