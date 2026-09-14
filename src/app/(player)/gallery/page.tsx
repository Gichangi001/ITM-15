import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";
import { getCurrentUser } from "@/lib/auth/session";
import { EventPhotoUploadForm } from "@/components/gallery/EventPhotoUploadForm";

export const metadata: Metadata = { title: "Gallery — ITM@15" };

// See the comment on src/app/(player)/leaderboards/page.tsx — this page
// reads exclusively through the service-role admin client (no
// cookies()/headers() touched), so without this it would be statically
// frozen at build time instead of showing newly-approved photos.
export const dynamic = "force-dynamic";

/**
 * Product Guide §12/§26 Phase 10 acceptance: "Unapproved media never
 * appears on public/event surfaces." Only status = 'APPROVED' rows are
 * ever queried here — never a partial/pending one, and the underlying
 * storage bucket is private, so even a signed URL only ever gets minted
 * for evidence that already passed moderation.
 *
 * Two photo sources merged into one feed, both held to the same
 * moderation rule: mission-tied `submissions` (unchanged, Phase 10) and
 * free-form `event_photos` (2026-09-13, product owner's direction — "take
 * photos... upload photos of the event, the more the better").
 */
export default async function GalleryPage() {
  const admin = createAdminClient();
  const user = await getCurrentUser();

  const [{ data: approvedSubmissions }, { data: approvedEventPhotos }] = await Promise.all([
    admin
      .from("submissions")
      .select("id, storage_path, player_id, moderated_at")
      .eq("status", "APPROVED")
      .not("storage_path", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(60),
    admin
      .from("event_photos")
      .select("id, storage_path, player_id, caption, moderated_at")
      .eq("status", "APPROVED")
      .order("moderated_at", { ascending: false })
      .limit(60),
  ]);

  const playerIds = [
    ...new Set([
      ...(approvedSubmissions ?? []).map((s) => s.player_id),
      ...(approvedEventPhotos ?? []).map((p) => p.player_id),
    ]),
  ];
  const { data: players } =
    playerIds.length > 0
      ? await admin.from("profiles").select("id, full_name, email, country_id").in("id", playerIds)
      : { data: [] as { id: string; full_name: string | null; email: string; country_id: string | null }[] };
  const playerById = new Map((players ?? []).map((p) => [p.id, p]));

  const countryIds = [...new Set((players ?? []).map((p) => p.country_id).filter(Boolean))] as string[];
  const { data: countries } =
    countryIds.length > 0
      ? await admin.from("countries").select("id, flag_emoji").in("id", countryIds)
      : { data: [] as { id: string; flag_emoji: string | null }[] };
  const countryById = new Map((countries ?? []).map((c) => [c.id, c]));

  function resolvePlayer(playerId: string) {
    const player = playerById.get(playerId);
    const country = player?.country_id ? countryById.get(player.country_id) : undefined;
    return {
      // Never fall back to email — this is visible to every signed-in
      // player, same class of finding a security review caught on
      // /leaderboards (see src/lib/scoring/leaderboard.ts).
      playerName: player?.full_name || "A player",
      countryFlag: country?.flag_emoji ?? null,
    };
  }

  const [submissionPhotos, eventPhotos] = await Promise.all([
    Promise.all(
      (approvedSubmissions ?? []).map(async (submission) => {
        if (!submission.storage_path) return null;
        const { data } = await admin.storage
          .from("challenge-submissions")
          .createSignedUrl(submission.storage_path, 3600);
        if (!data?.signedUrl) return null;
        const { playerName, countryFlag } = resolvePlayer(submission.player_id);
        return {
          id: `submission-${submission.id}`,
          url: data.signedUrl,
          caption: null as string | null,
          playerName,
          countryFlag,
          moderatedAt: submission.moderated_at,
        };
      }),
    ),
    Promise.all(
      (approvedEventPhotos ?? []).map(async (photo) => {
        const { data } = await admin.storage.from("event-photos").createSignedUrl(photo.storage_path, 3600);
        if (!data?.signedUrl) return null;
        const { playerName, countryFlag } = resolvePlayer(photo.player_id);
        return {
          id: `event-${photo.id}`,
          url: data.signedUrl,
          caption: photo.caption,
          playerName,
          countryFlag,
          moderatedAt: photo.moderated_at,
        };
      }),
    ),
  ]);

  const photos = [...submissionPhotos, ...eventPhotos]
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => (b.moderatedAt ?? "").localeCompare(a.moderatedAt ?? ""));

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <LiveRefresh topic="gallery" events={["submission.approved", "event_photo.approved"]} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Gallery</h1>
        <p className="max-w-lg text-sm text-muted">
          Approved photos from challenges and from players&apos; own uploads. Unapproved
          photos never appear here.
        </p>
      </div>

      {user ? <EventPhotoUploadForm playerId={user.id} /> : null}

      {photos.length === 0 ? (
        <p className="text-sm text-muted">No approved photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs pointing at private storage, not worth Next/Image's remote-pattern config for this */}
              <img src={photo.url} alt={photo.caption ?? "Approved photo"} className="aspect-square w-full object-cover" />
              <figcaption className="px-2 pb-2 text-xs text-muted">
                {photo.playerName}
                {photo.countryFlag ? ` ${photo.countryFlag}` : ""}
                {photo.caption ? ` — ${photo.caption}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
