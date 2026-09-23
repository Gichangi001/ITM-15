import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { ActionToast } from "@/components/admin/ActionToast";
import { canModerateSubmissions } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";
import { moderateEventPhoto } from "./actions";

export const metadata: Metadata = { title: "Gallery Moderation — ITM@15" };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to moderate gallery photos.",
  invalid_input: "That action didn't look right — nothing was changed.",
  not_found: "That photo no longer exists.",
  already_moderated: "That photo was already moderated by someone else.",
  update_failed: "Something went wrong saving that decision. Try again.",
};

/**
 * Free-form gallery contributions (event_photos, product owner's
 * 2026-09-13 direction), moderated exactly like mission-tied submissions
 * (Product Guide §26 Phase 10 rule) but on its own page/queue rather than
 * mixed into /admin/submissions.
 */
export default async function GalleryModerationPage() {
  const roles = await getCurrentRoles();
  if (!canModerateSubmissions(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const { data: photos } = await admin
    .from("event_photos")
    .select("id, storage_path, caption, player_id, created_at")
    .eq("status", "PENDING")
    .order("created_at");

  const playerIds = [...new Set((photos ?? []).map((p) => p.player_id))];
  const { data: players } =
    playerIds.length > 0
      ? await admin.from("profiles").select("id, email, full_name").in("id", playerIds)
      : { data: [] as { id: string; email: string; full_name: string | null }[] };
  const playerById = new Map((players ?? []).map((p) => [p.id, p]));

  const withUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await admin.storage.from("event-photos").createSignedUrl(photo.storage_path, 3600);
      const player = playerById.get(photo.player_id);
      return {
        ...photo,
        signedUrl: data?.signedUrl ?? null,
        playerLabel: player?.full_name || player?.email || "A player",
      };
    }),
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <LiveRefresh topic="admin:mission-control" events={["event_photo.pending"]} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Gallery moderation</h1>
        <p className="text-sm text-muted">
          Free-form event photo uploads. Nothing here appears in the public gallery
          until approved.
        </p>
      </div>

      <ActionToast successMessage="Saved." errorMessages={ERROR_MESSAGES} />

      {withUrls.length === 0 ? (
        <p className="text-sm text-muted">Nothing pending.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {withUrls.map((photo) => (
            <div key={photo.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted">
                {photo.playerLabel} · {new Date(photo.created_at).toLocaleString()}
              </p>
              {photo.caption ? <p className="text-sm text-ink">{photo.caption}</p> : null}
              {photo.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL, not worth Next/Image's remote-pattern config for this admin-only queue
                <img
                  src={photo.signedUrl}
                  alt="Submitted event photo"
                  className="max-h-80 rounded-md border border-white/10 object-contain"
                />
              ) : null}
              <form action={moderateEventPhoto} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="eventPhotoId" value={photo.id} />
                <button type="submit" name="decision" value="APPROVE" className="btn-secondary px-3 py-1.5 text-xs">
                  Approve
                </button>
                <button type="submit" name="decision" value="REJECT" className="btn-secondary px-3 py-1.5 text-xs">
                  Reject
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
