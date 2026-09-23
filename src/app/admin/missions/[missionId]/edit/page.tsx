import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageContent } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditMissionForm } from "./EditMissionForm";

export const metadata: Metadata = { title: "Edit mission — ITM@15" };
export const dynamic = "force-dynamic";

export default async function EditMissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin");
  }

  const { missionId } = await params;
  const admin = createAdminClient();

  const { data: mission } = await admin
    .from("missions")
    .select("id, title, description, base_points, unity_points, is_unity_challenge, game_days(day_number, title)")
    .eq("id", missionId)
    .maybeSingle();

  if (!mission) {
    notFound();
  }

  const { data: challenge } = await admin
    .from("challenges")
    .select("id, type, prompt")
    .eq("mission_id", missionId)
    .maybeSingle();

  const { data: options } = challenge
    ? await admin
        .from("challenge_options")
        .select("id, label, is_correct")
        .eq("challenge_id", challenge.id)
        .order("order_index")
    : { data: [] };

  const { count: submissionCount } = challenge
    ? await admin.from("submissions").select("id", { count: "exact", head: true }).eq("challenge_id", challenge.id)
    : { count: 0 };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15 — Mission Control</p>
        <h1 className="text-3xl">Edit mission</h1>
        <p className="text-sm text-muted">
          {mission.game_days ? `Day ${mission.game_days.day_number} — ${mission.game_days.title}` : ""}
        </p>
      </div>

      <EditMissionForm
        mission={mission}
        challenge={challenge}
        options={options ?? []}
        submissionCount={submissionCount ?? 0}
      />
    </main>
  );
}
