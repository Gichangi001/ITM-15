"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateUserSchema } from "@/lib/auth/schemas";
import { canManageUserRoles } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";

/**
 * Product Guide §4.5: "user administration, permission management" is
 * Super Admin's capability, not shared with Game Master (see the comment on
 * `canManageUserRoles`). This is the only place in the app that can change
 * an existing account's role or status after creation.
 *
 * Plain server action (not paired with useActionState) — this internal
 * table works via full-page form submits and a redirect-with-query-param
 * for errors, same pattern as middleware.ts's error signaling, so the page
 * stays a Server Component with no client-side interactivity needed.
 */
export async function updateUser(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) {
    redirect("/login");
  }

  const roles = await getCurrentRoles();
  if (!canManageUserRoles(roles)) {
    redirect("/admin?error=not_authorized");
  }

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect("/admin/players?error=invalid_input");
  }

  const { userId, role, status } = parsed.data;

  // Self-lockout guard: block editing your own row entirely, rather than
  // trying to reason about "is this specific change safe" (e.g. disabling
  // yourself, or — since alexander.gichangi@walumoafrica.com is currently
  // the only Super Admin — demoting the only account that can undo the
  // demotion). The admin page also hides the form for the actor's own row;
  // this is the server-side half of that same guarantee.
  if (userId === actor.id) {
    redirect("/admin/players?error=cannot_edit_self");
  }

  const admin = createAdminClient();

  const { data: existingRoleRows } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const previousRoles = (existingRoleRows ?? []).map((row) => row.role);

  // Update-in-place when a role row already exists (the normal case — every
  // account gets exactly one on creation); fall back to inserting if
  // somehow there isn't one yet, rather than assuming delete+insert is safe
  // as two separate round trips.
  const { data: updated, error: updateRoleError } = await admin
    .from("user_roles")
    .update({ role })
    .eq("user_id", userId)
    .select("id");

  if (updateRoleError) {
    redirect("/admin/players?error=update_failed");
  }

  if (!updated || updated.length === 0) {
    const { error: insertRoleError } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (insertRoleError) {
      redirect("/admin/players?error=update_failed");
    }
  }

  const { error: statusError } = await admin
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (statusError) {
    redirect("/admin/players?error=update_failed");
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "user_role_status_updated",
    targetType: "profile",
    targetId: userId,
    metadata: { previous_roles: previousRoles, new_role: role, new_status: status },
  });

  revalidatePath("/admin/players");
  redirect("/admin/players?success=1");
}
