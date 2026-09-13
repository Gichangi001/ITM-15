"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";
import { resolveRoleBasedDestination } from "@/lib/auth/session";

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

  redirect(await resolveRoleBasedDestination(supabase, data.user.id));
}

const emailOnlySchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export type LoginMethod = "password" | "magic_link";

/**
 * Decides which credential the email field on `/login` should ask for —
 * called by `LoginForm` once the visitor has typed a real-looking email.
 * Admin-surface accounts (Product Guide §4: everything but plain PLAYER)
 * keep the password they were explicitly given; every other invited
 * account signs in with a one-time emailed link instead, per the product
 * owner's explicit instruction that non-admin accounts shouldn't need a
 * password at all.
 *
 * An unrecognized email also gets "magic_link" back — never "we don't
 * know that email" — so this endpoint can't be used to enumerate which
 * addresses are enrolled (same rationale as `signIn`'s generic "Incorrect
 * email or password."). `sendMagicLink` below re-derives this same check
 * server-side before actually sending anything, so a client can't force a
 * different answer by skipping this call.
 *
 * Trade-off, disclosed rather than hidden: this endpoint *does* reveal
 * whether a specific known email belongs to an admin-surface account
 * (password) versus everyone else (magic link) — an explicit, accepted
 * cost of the product owner's requested UX, not a gap nobody noticed. It
 * does not reveal whether an unknown email is enrolled at all.
 */
export async function checkLoginMethod(email: string): Promise<LoginMethod> {
  const parsed = emailOnlySchema.safeParse({ email });
  if (!parsed.success) return "password"; // malformed input — no meaningful answer either way; the real submit path re-validates regardless

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (!profile) return "magic_link";

  const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", profile.id);
  const roles = (roleRows ?? []).map((row) => row.role as Role);
  return hasAdminSurfaceAccess(roles) ? "password" : "magic_link";
}

export type MagicLinkState = { error?: string; success?: boolean } | null;

/**
 * Sends a real, single-use, expiring sign-in link — never a bare "typing
 * an email logs you in" shortcut. `shouldCreateUser: false` is load-bearing:
 * this product is invite-only (Product Guide §5, no self-registration
 * path anywhere), and Supabase would otherwise happily create a brand new
 * account for any email typed here.
 *
 * Always returns the same generic success response regardless of whether
 * an OTP was actually sent — mirrors `signIn`'s account-enumeration
 * hardening. The email is silently *not* sent for: an unknown address
 * (invite-only), a DISABLED account (Product Guide §5.2 step 3), or an
 * admin-surface account (those use `signIn` with a password instead — see
 * `checkLoginMethod`). None of that distinction ever reaches the caller.
 */
export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  const { email } = parsed.data;
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id, status").eq("email", email).maybeSingle();

  let roles: Role[] = [];
  if (profile) {
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", profile.id);
    roles = (roleRows ?? []).map((row) => row.role as Role);
  }

  if (profile && profile.status !== "DISABLED" && !hasAdminSurfaceAccess(roles)) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
  }

  return { success: true };
}
