/**
 * Shared shell for a Phase 4 player route whose real content depends on a
 * backend system that isn't built yet (scoring, media moderation,
 * achievements, notifications...). Per the Storyline Build Bible §39, a
 * fabricated leaderboard or a fake badge would be exactly the "fake demo"
 * it forbids — an honestly labeled "not live yet" is the alternative this
 * component standardizes, so every such page reads consistently rather
 * than each inventing its own placeholder copy/layout.
 */
export function ComingSoon({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
        {title}
      </p>
      <h1 className="text-3xl">Not live yet</h1>
      <p className="text-sm text-muted">{description}</p>
      <p className="text-xs text-muted">{phase}</p>
    </main>
  );
}
