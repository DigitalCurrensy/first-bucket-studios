export function LithographLoader({ label = "The plate is on press." }: { label?: string }) {
  return (
    <div className="grid place-items-center rounded-xl bg-paper py-16 shadow-border" role="status">
      <svg viewBox="0 0 120 80" className="h-20 w-32 text-accent" aria-hidden="true">
        <rect x="8" y="8" width="104" height="64" fill="none" stroke="currentColor" strokeWidth="0.6" className="litho-draw" />
        <circle cx="60" cy="48" r="18" fill="none" stroke="currentColor" strokeWidth="0.6" className="litho-draw" />
        <path d="M8 48h104M60 8v64M20 20h16M84 20h16" fill="none" stroke="currentColor" strokeWidth="0.5" className="litho-draw" />
      </svg>
      <p className="mt-4 text-sm text-muted">{label}</p>
    </div>
  );
}
