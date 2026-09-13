/**
 * Product Guide §17.3 "Pause Game." Server-rendered from the real
 * `campaigns.status` value (no client-side guess) — `PresenceHeartbeat` in
 * the parent layout calls `router.refresh()` on `game.paused`/
 * `game.resumed`, so the banner appears/disappears live for every
 * connected player, not just on their next full navigation.
 */
export function GamePausedBanner({ paused }: { paused: boolean }) {
  if (!paused) return null;

  return (
    <div className="border-b border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm text-gold">
      The game is paused right now — missions and voting will reopen shortly.
    </div>
  );
}
