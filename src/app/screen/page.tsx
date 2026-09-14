import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlayerLeaderboard, getCountryLeaderboard } from "@/lib/scoring/leaderboard";
import { ScreenRotator } from "@/components/screen/ScreenRotator";

export const metadata: Metadata = { title: "ITM@15 — Event Screen" };

// Reads exclusively through the service-role admin client — same reason
// leaderboards/gallery need this (see their own comments): without it,
// this page would be statically frozen at build time instead of showing
// live standings on the big screen.
export const dynamic = "force-dynamic";

const PHOTO_LIMIT = 6;

/**
 * Product Guide §21.2 (Spectator/Event Screen). Deliberately public — no
 * `src/proxy.ts` gate, no sign-in — this is meant to run unattended on a
 * physical display at the event, per the spec's own "does not expose
 * admin controls" framing; nothing rendered here is more sensitive than
 * what an already-approved public /gallery or /leaderboards page shows
 * any signed-in player.
 *
 * SCOPE DISCLOSED: only 3 of the spec's listed modules (leaderboard,
 * photo wall, country standings) — current mission/countdown/vote-reveal
 * modules need Phase 19-style richer state this slice doesn't build, and
 * the admin "choose what's showing" controller is deferred (see
 * ScreenRotator's header comment) in favor of a fixed, honest rotation.
 */
export default async function ScreenPage() {
  const admin = createAdminClient();

  const [players, countries, campaignResult, submissionPhotos, eventPhotos] = await Promise.all([
    getPlayerLeaderboard(10),
    getCountryLeaderboard(),
    admin.from("campaigns").select("name, status").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin
      .from("submissions")
      .select("id, storage_path")
      .eq("status", "APPROVED")
      .not("storage_path", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(PHOTO_LIMIT),
    admin
      .from("event_photos")
      .select("id, storage_path")
      .eq("status", "APPROVED")
      .order("moderated_at", { ascending: false })
      .limit(PHOTO_LIMIT),
  ]);

  const campaign = campaignResult.data;

  const photoRows = [
    ...(submissionPhotos.data ?? []).map((row) => ({ id: `s-${row.id}`, bucket: "challenge-submissions", path: row.storage_path as string })),
    ...(eventPhotos.data ?? []).map((row) => ({ id: `e-${row.id}`, bucket: "event-photos", path: row.storage_path })),
  ].slice(0, PHOTO_LIMIT);

  const photos = (
    await Promise.all(
      photoRows.map(async (row) => {
        const { data } = await admin.storage.from(row.bucket).createSignedUrl(row.path, 900);
        return data?.signedUrl ? { id: row.id, url: data.signedUrl } : null;
      }),
    )
  ).filter((p): p is { id: string; url: string } => p !== null);

  const leaderboardPanel = (
    <ScreenPanel key="leaderboard" title="Leaderboard" subtitle={campaign?.name}>
      {players.length === 0 ? (
        <ScreenEmpty text="No points scored yet." />
      ) : (
        <ol className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {players.map((entry, i) => (
            <li
              key={entry.playerId}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-surface px-6 py-4"
            >
              <span className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-walumo">{i + 1}</span>
                <span className="text-xl text-ink">
                  {entry.countryFlag ? `${entry.countryFlag} ` : ""}
                  {entry.displayName}
                </span>
              </span>
              <span className="text-xl font-semibold text-gold">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </ScreenPanel>
  );

  const countryPanel = (
    <ScreenPanel key="country" title="Country Standings" subtitle={campaign?.name}>
      {countries.length === 0 ? (
        <ScreenEmpty text="No country points yet." />
      ) : (
        <ol className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {countries.slice(0, 6).map((entry, i) => (
            <li
              key={entry.countryId}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-surface px-6 py-4"
            >
              <span className="flex items-center gap-4 text-xl text-ink">
                <span className="text-2xl font-semibold text-walumo">{i + 1}</span>
                {entry.countryFlag ? `${entry.countryFlag} ` : ""}
                {entry.countryName}
              </span>
              <span className="text-xl font-semibold text-gold">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </ScreenPanel>
  );

  const photoPanel = (
    <ScreenPanel key="photos" title="Photo Wall" subtitle="Approved moments from the event">
      {photos.length === 0 ? (
        <ScreenEmpty text="No approved photos yet." />
      ) : (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs on an unattended display, not worth Next/Image's pipeline
            <img
              key={photo.id}
              src={photo.url}
              alt="Approved event photo"
              className="aspect-square w-full rounded-lg border border-white/10 object-cover"
            />
          ))}
        </div>
      )}
    </ScreenPanel>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-8 py-12 text-center">
      <ScreenRotator panels={[leaderboardPanel, countryPanel, photoPanel]} />
    </main>
  );
}

function ScreenPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-semibold tracking-[0.3em] text-walumo uppercase">ITM@15</p>
        <h1 className="text-5xl font-semibold text-ink">{title}</h1>
        {subtitle ? <p className="text-lg text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function ScreenEmpty({ text }: { text: string }) {
  return <p className="text-xl text-muted">{text}</p>;
}
