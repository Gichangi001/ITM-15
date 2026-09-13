"use server";

import { redirect } from "next/navigation";
import { changePasswordSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveRoleBasedDestination } from "@/lib/auth/session";

export type ChangePasswordState = {
  error?: string;
} | null;

/**
 * Product Guide §5.3: forced first-login password replacement.
 *
 * Two separate writes, deliberately: `auth.updateUser({ password })` runs
 * against the RLS-scoped session client — Supabase Auth lets a signed-in
 * user change their own password directly, no service role needed. Flipping
 * `profiles.must_change_password` to false, however, is NOT something the
 * RLS-scoped client can do — there is no client-writable UPDATE policy on
 * `profiles` at all (see the migration's comment on why), so that one
 * narrow field is written through the service-role admin client instead,
 * exactly the pattern that policy comment describes. This also means the
 * gate can never be lifted by a client redoing the same request with a
 * different payload — it is lifted only as a side effect of a real password
 * change actually succeeding first.
 */
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return { error: "Could not update your password. Try again." };
  }

  const admin = createAdminClient();
  const { error: profileError } = await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  if (profileError) {
    // Password changed but the gate didn't lift — surface this rather than
    // silently leaving the account stuck re-prompting forever.
    return {
      error: "Password updated, but we couldn't finish setup. Contact your administrator.",
    };
  }

  // Computed directly rather than always redirecting to one fixed route —
  // see the comment on src/app/login/actions.ts's signIn for why. Same
  // reasoning extends to the onboarding gate (Product Guide §5.2 step 5):
  // without checking it here too, this would redirect straight to
  // /admin or /play and rely on src/proxy.ts to redirect a second time.
  const { data: profileAfter } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileAfter?.onboarding_completed) {
    redirect("/onboarding");
  }

  redirect(await resolveRoleBasedDestination(supabase, user.id));
}
