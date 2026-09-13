import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageVoting } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { NewPollForm } from "./NewPollForm";

export const metadata: Metadata = { title: "New Poll — ITM@15" };

export default async function NewPollPage() {
  const roles = await getCurrentRoles();
  if (!canManageVoting(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const { data: campaign } = await admin
    .from("campaigns")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 bg-bg px-6 py-16">
        <p className="text-sm text-muted">No campaign exists yet. Create one first.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">New poll</h1>
        <p className="text-sm text-muted">
          Created as a draft — open it from the voting list when you&apos;re
          ready.
        </p>
      </div>

      <NewPollForm campaignId={campaign.id} />
    </main>
  );
}
