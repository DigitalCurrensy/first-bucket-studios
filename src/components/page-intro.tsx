export function PageIntro({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="mb-10 max-w-2xl">
      <p className="mb-3 text-micro font-medium uppercase tracking-label text-subtle">{kicker}</p>
      <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-4 text-base text-muted sm:text-lg">{lead}</p>
    </header>
  );
}
