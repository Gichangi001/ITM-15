"use server";

import { createEmployeeSchema } from "@/lib/auth/schemas";
import { canCreateEmployeeAccounts } from "@/lib/auth/roles";
import { getCurrentRoles, getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/admin/audit";

export type CreateEmployeeState = {
  error?: string;
  success?: { email: string };
} | null;

/**
 * Product Guide §5.1 / §28.1: admin-only employee account creation.
 *
 * Authorization: `getCurrentRoles()` reads the caller's OWN role rows
 * through the RLS-scoped session client — a player cannot make this return
 * a role they don't actually have (there is no id parameter to spoof; see
 * the comment on `src/lib/auth/session.ts`). This check happens here, in
 * the server action itself, independent of `middleware.ts`'s coarser
 * admin-surface gate — exactly the "every admin server action independently
 * re-checks the role server-side" pattern already documented on the
 * `profiles` RLS policy.
 *
 * Every successful creation writes an audit_logs row (Product Guide §24.5,
 * runbook "admin actions affecting gameplay are auditable").
 */
export async function createEmployeeAccount(
  _prevState: CreateEmployeeState,
  formData: FormData,
): Promise<CreateEmployeeState> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { error: "Not signed in." };
  }

  const roles = await getCurrentRoles();
  if (!canCreateEmployeeAccounts(roles)) {
    return { error: "You are not authorized to create accounts." };
  }

  const parsed = createEmployeeSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    countryId: formData.get("countryId"),
    // The form has no entityId field at all (entity assignment isn't built
    // yet) — formData.get returns null for a field that was never
    // rendered, which optionalFormField in schemas.ts normalizes the same
    // as an empty string.
    entityId: formData.get("entityId"),
    role: formData.get("role") || "PLAYER",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, fullName, countryId, entityId, role } = parsed.data;
  const admin = createAdminClient();

  // Product Guide §5.1: "Temporary password - default value: Walumo." Server
  // creates the Supabase Auth user directly — no self-service sign-up path
  // exists anywhere in this app, so this is the only way an account comes
  // into being. email_confirm: true because this is invite-only: there is
  // no email-verification loop to run, the admin vouches for the address.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: "Walumo",
    email_confirm: true,
  });

  if (createError || !created.user) {
    if (createError?.code === "email_exists") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Could not create the account. Try again." };
  }

  const newUserId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: newUserId,
    email,
    full_name: fullName || null,
    country_id: countryId || null,
    entity_id: entityId || null,
    status: "ACTIVE",
    must_change_password: true,
    onboarding_completed: false,
  });

  if (profileError) {
    // Compensating rollback — don't leave an orphaned Auth user with no
    // profile behind if the very next write fails.
    await admin.auth.admin.deleteUser(newUserId);
    if (profileError.code === "23505") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Could not create the account. Try again." };
  }

  const { error: roleError } = await admin.from("user_roles").insert({
    user_id: newUserId,
    role,
    country_id: countryId || null,
  });

  if (roleError) {
    await admin.auth.admin.deleteUser(newUserId);
    return { error: "Could not assign the account's role. Try again." };
  }

  await logAdminActivity(admin, {
    actorId: actor.id,
    action: "employee_account_created",
    targetType: "profile",
    targetId: newUserId,
    metadata: { email, role },
  });

  return { success: { email } };
}
