import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageVoting } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePollStatus } from "./actions";

export const metadata: Metadata = { title: "Voting — ITM@15" };

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to manage voting.",
  invalid_input: "That update didn't look right — nothing was changed.",
  update_failed: "Something went wrong saving that change. Try again.",
};

const STATUS_OPTIONS = ["DRAFT", "OPEN", "CLOSED", "REVEALED"] as const;

/**
 * Product Guide §26 Phase 9. Game Master/Super Admin only. Shows live vote
 * counts to the admin regardless of the poll's results_visibility setting
 * (that setting controls what PLAYERS see, not what the admin managing the
 * poll can see) — reads via the service-role client, same pattern as every
 * other cross-user admin aggregate view in this project.
 */
export default async function VotingPage({
  searchParams,
}: PageProps<"/admin/voting">) {
  const roles = await getCurrentRoles();
  if (!canManageVoting(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  const admin = createAdminClient();
  const [{ data: polls }, { data: options }, { data: votes }] = await Promise.all([
    admin.from("polls").select("id, title, status").order("created_at", { ascending: false }),
    admin.from("poll_options").select("id, poll_id, label").order("order_index"),
    admin.from("votes").select("poll_id, option_id"),
  ]);

  const optionsByPoll = new Map<string, { id: string; label: string }[]>();
  for (const option of options ?? []) {
    const list = optionsByPoll.get(option.poll_id) ?? [];
    list.push({ id: option.id, label: option.label });
    optionsByPoll.set(option.poll_id, list);
  }

  const voteCountByOption = new Map<string, number>();
  for (const vote of votes ?? []) {
    voteCountByOption.set(vote.option_id, (voteCountByOption.get(vote.option_id) ?? 0) + 1);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Voting</h1>
        <p className="text-sm text-muted">
          Duplicate/self votes are enforced at the database level, not just
          here.
        </p>
        <Link href="/admin/voting/new" className="btn-secondary self-start">
          New poll
        </Link>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Updated.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {!polls || polls.length === 0 ? (
        <p className="text-sm text-muted">No polls yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {polls.map((poll) => {
            const pollOptions = optionsByPoll.get(poll.id) ?? [];
            return (
              <div key={poll.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink">{poll.title}</p>
                  <form action={updatePollStatus} className="flex items-center gap-2">
                    <input type="hidden" name="pollId" value={poll.id} />
                    <select
                      name="status"
                      defaultValue={poll.status}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-ink"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      Save
                    </button>
                  </form>
                </div>
                <ul className="flex flex-col gap-1 text-xs text-muted">
                  {pollOptions.map((option) => (
                    <li key={option.id} className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <span>{voteCountByOption.get(option.id) ?? 0} votes</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
