import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { VoteForm } from "./VoteForm";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";

const LIVE_EVENTS = ["poll.updated", "vote.cast"] as const;

export const metadata: Metadata = { title: "Vote — ITM@15" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Product Guide §11.3 (reveal experience) / §26 Phase 9. Poll/options read
 * via the RLS-scoped client (a DRAFT poll is genuinely invisible — same
 * "query returns nothing, renders as not-found" pattern as the mission
 * page). Vote counts are computed separately, via the service-role client,
 * and ONLY when the poll's own results_visibility rule says this viewer
 * should see them — never exposed as a side effect of any other query.
 */
export default async function VotePage({
  params,
}: {
  params: Promise<{ pollId: string }>;
}) {
  const { pollId } = await params;
  if (!UUID_RE.test(pollId)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) notFound();

  const supabase = await createClient();
  const { data: poll } = await supabase
    .from("polls")
    .select("id, title, description, status, reason_required, results_visibility")
    .eq("id", pollId)
    .maybeSingle();

  if (!poll) {
    return (
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
        <LiveRefresh topic={`poll:${pollId}`} events={LIVE_EVENTS} />
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Vote</p>
        <h1 className="text-3xl">Not available</h1>
        <p className="text-sm text-muted">
          This poll doesn&apos;t exist yet, or hasn&apos;t opened.
        </p>
      </main>
    );
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("id, label")
    .eq("poll_id", poll.id)
    .order("order_index");

  const { data: myVote } = await supabase
    .from("votes")
    .select("option_id")
    .eq("poll_id", poll.id)
    .eq("voter_id", user.id)
    .maybeSingle();

  const showResults =
    poll.results_visibility === "LIVE" ||
    (poll.results_visibility === "AFTER_VOTE" && !!myVote) ||
    (poll.results_visibility === "ADMIN_REVEAL" && poll.status === "REVEALED");

  let voteCounts: Map<string, number> | null = null;
  if (showResults) {
    const admin = createAdminClient();
    const { data: votes } = await admin.from("votes").select("option_id").eq("poll_id", poll.id);
    voteCounts = new Map();
    for (const vote of votes ?? []) {
      voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <LiveRefresh topic={`poll:${pollId}`} events={LIVE_EVENTS} />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">Vote</p>
        <h1 className="text-3xl">{poll.title}</h1>
        {poll.description ? <p className="text-sm text-muted">{poll.description}</p> : null}
      </div>

      {voteCounts ? (
        <ul className="flex flex-col gap-2">
          {(options ?? []).map((option) => (
            <li
              key={option.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <span className="text-ink">{option.label}</span>
              <span className="text-muted">{voteCounts?.get(option.id) ?? 0} votes</span>
            </li>
          ))}
        </ul>
      ) : null}

      {poll.status !== "OPEN" ? (
        <p className="text-sm text-muted">
          {poll.status === "CLOSED" || poll.status === "REVEALED"
            ? "Voting has closed."
            : "Voting hasn't opened yet."}
        </p>
      ) : myVote ? (
        <p className="text-sm text-walumo">You&apos;ve already voted in this poll.</p>
      ) : (
        <VoteForm pollId={poll.id} options={options ?? []} reasonRequired={poll.reason_required} />
      )}
    </main>
  );
}
