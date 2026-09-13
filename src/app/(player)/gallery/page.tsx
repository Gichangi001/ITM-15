import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

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
 */
export default async function GalleryPage() {
  const admin = createAdminClient();

  const { data: approvedSubmissions } = await admin
    .from("submissions")
    .select("id, storage_path, player_id, moderated_at")
    .eq("status", "APPROVED")
    .not("storage_path", "is", null)
    .order("moderated_at", { ascending: false })
    .limit(60);

  const playerIds = [...new Set((approvedSubmissions ?? []).map((s) => s.player_id))];
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

  const withUrls = await Promise.all(
    (approvedSubmissions ?? []).map(async (submission) => {
      if (!submission.storage_path) return null;
      const { data } = await admin.storage
        .from("challenge-submissions")
        .createSignedUrl(submission.storage_path, 3600);
      if (!data?.signedUrl) return null;
      const player = playerById.get(submission.player_id);
      const country = player?.country_id ? countryById.get(player.country_id) : undefined;
      return {
        id: submission.id,
        url: data.signedUrl,
        playerName: player?.full_name || player?.email || "A player",
        countryFlag: country?.flag_emoji ?? null,
      };
    }),
  );

  const photos = withUrls.filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Wally Takeover
        </p>
        <h1 className="text-3xl">Gallery</h1>
        <p className="max-w-lg text-sm text-muted">
          Approved photos from challenge submissions. Unapproved photos never
          appear here.
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-muted">No approved photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs pointing at private storage, not worth Next/Image's remote-pattern config for this */}
              <img src={photo.url} alt="Approved challenge submission" className="aspect-square w-full object-cover" />
              <figcaption className="px-2 pb-2 text-xs text-muted">
                {photo.playerName}
                {photo.countryFlag ? ` ${photo.countryFlag}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
