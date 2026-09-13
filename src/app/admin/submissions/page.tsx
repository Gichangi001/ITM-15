import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canModerateSubmissions } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { moderateSubmission } from "./actions";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";

export const metadata: Metadata = { title: "Submissions — ITM@15" };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to moderate submissions.",
  invalid_input: "That action didn't look right — nothing was changed.",
  not_found: "That submission no longer exists.",
  already_moderated: "That submission was already moderated by someone else.",
  update_failed: "Something went wrong saving that decision. Try again.",
};

/**
 * Product Guide §26 Phase 10 acceptance: "unapproved media never appears on
 * public/event surfaces" — the flip side is that MODERATORS need to see
 * pending evidence to review it at all, which is exactly what this page
 * does via the service-role client (the "players can read their own
 * submissions" RLS policy correctly refuses a moderator any other
 * player's row). Photo evidence is shown via a short-lived signed URL —
 * the challenge-submissions bucket itself is private, so nothing here is
 * ever publicly reachable outside this authenticated, role-gated page.
 */
export default async function SubmissionsPage({
  searchParams,
}: PageProps<"/admin/submissions">) {
  const roles = await getCurrentRoles();
  if (!canModerateSubmissions(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  const admin = createAdminClient();
  const { data: submissions } = await admin
    .from("submissions")
    .select("id, challenge_id, player_id, answer_text, storage_path, submitted_at, attempt_number")
    .eq("status", "PENDING")
    .order("submitted_at");

  const challengeIds = [...new Set((submissions ?? []).map((s) => s.challenge_id))];
  const playerIds = [...new Set((submissions ?? []).map((s) => s.player_id))];

  const [{ data: challenges }, { data: players }] = await Promise.all([
    challengeIds.length > 0
      ? admin.from("challenges").select("id, type, prompt, mission_id").in("id", challengeIds)
      : Promise.resolve({ data: [] as { id: string; type: string; prompt: string; mission_id: string }[] }),
    playerIds.length > 0
      ? admin.from("profiles").select("id, email, full_name").in("id", playerIds)
      : Promise.resolve({ data: [] as { id: string; email: string; full_name: string | null }[] }),
  ]);

  const missionIds = [...new Set((challenges ?? []).map((c) => c.mission_id))];
  const { data: missions } =
    missionIds.length > 0
      ? await admin.from("missions").select("id, title").in("id", missionIds)
      : { data: [] as { id: string; title: string }[] };

  const challengeById = new Map((challenges ?? []).map((c) => [c.id, c]));
  const missionById = new Map((missions ?? []).map((m) => [m.id, m]));
  const playerById = new Map((players ?? []).map((p) => [p.id, p]));

  // Mint signed URLs only for submissions that actually have photo evidence
  // — never a broader "list the whole bucket" call.
  const photoSubmissions = (submissions ?? []).filter((s) => s.storage_path);
  const signedUrlBySubmission = new Map<string, string>();
  await Promise.all(
    photoSubmissions.map(async (submission) => {
      if (!submission.storage_path) return;
      const { data } = await admin.storage
        .from("challenge-submissions")
        .createSignedUrl(submission.storage_path, 300);
      if (data?.signedUrl) {
        signedUrlBySubmission.set(submission.id, data.signedUrl);
      }
    }),
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      {/* A new pending submission (submission.pending) or another
          moderator's decision (activity.created) both refresh this queue
          live — no reload needed to see a photo land or disappear once
          someone else moderates it. */}
      <LiveRefresh topic="admin:mission-control" events={["activity.created", "submission.pending"]} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Submissions</h1>
        <p className="text-sm text-muted">
          Pending review, oldest first. Approving awards the mission&apos;s points
          immediately.
        </p>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Saved.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {!submissions || submissions.length === 0 ? (
        <p className="text-sm text-muted">Nothing pending review.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((submission) => {
            const challenge = challengeById.get(submission.challenge_id);
            const mission = challenge ? missionById.get(challenge.mission_id) : undefined;
            const player = playerById.get(submission.player_id);
            const signedUrl = signedUrlBySubmission.get(submission.id);

            return (
              <div key={submission.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-ink">
                    {mission?.title ?? "Unknown mission"} · attempt {submission.attempt_number}
                  </p>
                  <p className="text-xs text-muted">
                    {player?.full_name || player?.email || "Unknown player"} ·{" "}
                    {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>

                {challenge?.prompt ? <p className="text-xs text-muted">{challenge.prompt}</p> : null}

                {submission.answer_text ? (
                  <p className="rounded-md bg-black/20 p-3 text-sm text-ink whitespace-pre-wrap">
                    {submission.answer_text}
                  </p>
                ) : null}

                {signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL, not worth Next/Image's optimization pipeline for an admin-only moderation view
                  <img
                    src={signedUrl}
                    alt="Submitted evidence"
                    className="max-h-80 rounded-md border border-white/10 object-contain"
                  />
                ) : null}

                <form action={moderateSubmission} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <input
                    type="text"
                    name="note"
                    placeholder="Note (optional)"
                    className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-ink"
                  />
                  <button
                    type="submit"
                    name="decision"
                    value="APPROVE"
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="REJECT"
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Reject
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
