"use server";

import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";

export type SignInState = {
  error?: string;
} | null;

/**
 * Product Guide §5.2 login behaviour. Validates input, authenticates
 * against Supabase Auth, then re-checks the application-level `status`
 * (Supabase Auth alone doesn't know about ITM@15's DISABLED state) before
 * letting the session stand.
 *
 * This action computes its own redirect destination (rather than always
 * redirecting to one fixed route and relying on `src/proxy.ts` to correct
 * it on the next request) because of an observed Next.js 16 dev-mode
 * (Turbopack) quirk: when a Server Action's `redirect()` target is itself
 * immediately redirected again by proxy.ts, the client router renders the
 * *correct* final content but does not reliably sync the address bar to
 * match (confirmed: the content shown is always right, and any subsequent
 * real navigation — reload, back button — immediately shows the correct
 * URL, so this never bypasses the security gate; it's a cosmetic
 * double-redirect artifact). Getting the destination right here in the
 * common case avoids the double hop entirely. proxy.ts remains the actual
 * security backstop regardless of how a request arrives at a route.
 */
export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Deliberately generic — Product Guide §5.2 doesn't call for account
  // enumeration hardening explicitly, but there's no reason to give it away
  // for free either ("no such user" vs "wrong password" would let someone
  // probe which emails are enrolled).
  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, must_change_password, onboarding_completed")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.status === "DISABLED") {
    await supabase.auth.signOut();
    return { error: "This account is not able to sign in." };
  }

  if (profile.must_change_password) {
    redirect("/first-login");
  }

  // Product Guide §5.2 step 5, checked before the role-based destination —
  // same order src/proxy.ts enforces. Without this check here too, a
  // player would briefly land on /play (or an admin on /admin) before
  // proxy.ts's own onboarding gate caught the next request and redirected
  // again — the exact double-redirect artifact this action's destination
  // computation exists to avoid in the first place (see this function's
  // header comment).
  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);
  const roles = (roleRows ?? []).map((row) => row.role as Role);

  redirect(hasAdminSurfaceAccess(roles) ? "/admin" : "/play");
}
