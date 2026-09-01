import { PlateSeal, type DeskKind } from "@/components/desk-mark";

export function PageIntro({
  kicker,
  title,
  lead,
  mark,
}: {
  kicker: string;
  title: string;
  lead: string;
  mark?: DeskKind;
}) {
  return (
    <header className="mb-10">
      <div className="flex items-start gap-4 sm:gap-6">
        {mark ? <PlateSeal kind={mark} className="mt-1 size-[4.25rem] text-accent sm:size-20" /> : null}
        <div className="min-w-0 max-w-2xl">
          <p className="text-micro font-medium uppercase tracking-label text-subtle">{kicker}</p>
          <h1 className="opsz-hero mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1>
          <div className="hero-rule" />
          <p className="text-base text-muted sm:text-lg">{lead}</p>
        </div>
      </div>
    </header>
  );
}
