"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";
import { resolveRoleBasedDestination } from "@/lib/auth/session";
import { isRateLimited } from "@/lib/security/rateLimit";

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

// .toLowerCase() (security review, Phase 20 — a data-hygiene finding, not
// independently exploitable since Supabase Auth already normalizes case
// at the auth.users level, but this app's own exact-string `profiles`
// lookups in checkLoginMethod/instantJoin didn't, which could otherwise
// treat "Name@x.com" and "name@x.com" as two different accounts here even
// though Supabase Auth would refuse to create the second one).
const emailOnlySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase(),
});

export type LoginMethod = "password" | "instant";

/**
 * Decides what the email field on `/login` asks for next — called by
 * `LoginForm` once the visitor has typed a real-looking email.
 * Admin-surface accounts (Product Guide §4: everything but plain PLAYER)
 * keep the password they were explicitly given; every other email —
 * existing or never seen before — goes straight in via `instantJoin`
 * below, no password, no link, no wait. `instantJoin` re-derives this
 * same admin/non-admin check server-side before doing anything, so a
 * client can't force a different outcome than what this returned.
 *
 * Rate-limited (security review finding, Phase 20): without a limit, this
 * function is an unauthenticated oracle — call it with enough different
 * emails and you learn exactly which ones hold an admin-surface role,
 * with no friction. Rate-limited by IP, not by the email being checked
 * (see rateLimit.ts's own comment on why). When limited, defaults to
 * `"instant"` — the answer that reveals nothing about admin status —
 * rather than erroring, so a legitimately-fast typist never sees a
 * broken login form; `instantJoin`'s own re-derivation of this same check
 * still refuses the password branch for a real admin account regardless
 * of what this returned.
 */
export async function checkLoginMethod(email: string): Promise<LoginMethod> {
  const parsed = emailOnlySchema.safeParse({ email });
  if (!parsed.success) return "password"; // malformed input — no meaningful answer either way; the real submit path re-validates regardless

  const admin = createAdminClient();

  if (await isRateLimited(admin, "login_method_check", 30, 300)) {
    return "instant";
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (!profile) return "instant";

  const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", profile.id);
  const roles = (roleRows ?? []).map((row) => row.role as Role);
  return hasAdminSurfaceAccess(roles) ? "password" : "instant";
}

export type InstantJoinState = { error?: string } | null;

/**
 * Signs a non-admin visitor in the instant they type their email — no
 * password, no emailed link to wait for or click. Product owner's
 * explicit, repeated instruction (an earlier version of this feature sent
 * a real one-time emailed link instead; asked to remove that and make it
 * immediate — see `docs/PROJECT_STATE.md` for the full record of both
 * decisions and the trade-off each one makes).
 *
 * DISCLOSED SECURITY TRADE-OFF, not an oversight: this means anyone who
 * knows or guesses a colleague's email can open that colleague's account
 * — there is no proof-of-ownership step left in this path at all (not
 * even "clicked the link in their inbox"). Deliberately bounded to make
 * that acceptable for what this actually is — an internal company event
 * game, not a system holding money or sensitive records — by never
 * letting this path touch an admin-surface account (`checkLoginMethod`
 * above never offers it one, and this function independently re-checks
 * that before doing anything) and never assigning anything but PLAYER to
 * a brand-new account. A password remains mandatory for every
 * admin-surface role. If real participant privacy/integrity concerns
 * outweigh the requested convenience, the fix is re-adding a real
 * verification step here (a password, an emailed link, an OTP the user
 * actually types) — not something to silently reintroduce without being
 * asked, since that would reverse an explicit instruction the same way
 * skipping it now would.
 *
 * Implementation: `auth.admin.generateLink` mints a real one-time email
 * OTP without emailing anything (generating a link/code is a distinct
 * admin operation from sending one — nothing here calls `signInWithOtp`,
 * which would dispatch a real email), then `auth.verifyOtp` redeems it in
 * the same request, server-side, using the ordinary cookie-aware client
 * so the resulting session is written the normal way. The visitor never
 * sees a code or a link.
 */
export async function instantJoin(
  _prevState: InstantJoinState,
  formData: FormData,
): Promise<InstantJoinState> {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  const { email } = parsed.data;
  const admin = createAdminClient();

  // Rate-limited (security review finding, Phase 20): this path creates a
  // real auth.users + profiles row for an unrecognized email with zero
  // other friction — without a limit, it's a way to harvest arbitrary
  // email addresses into the app at no cost. Tighter than
  // checkLoginMethod's limit since this actually mutates state.
  if (await isRateLimited(admin, "instant_join", 8, 600)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  let roles: Role[] = [];
  if (existingProfile) {
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", existingProfile.id);
    roles = (roleRows ?? []).map((row) => row.role as Role);
  }

  if (existingProfile && hasAdminSurfaceAccess(roles)) {
    return { error: "This is an admin account — use the password field instead." };
  }
  if (existingProfile && existingProfile.status === "DISABLED") {
    return { error: "This account is not able to sign in." };
  }

  let userId: string;
  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return { error: "Could not create your account. Try again." };
    }
    userId = created.user.id;

    const { error: profileInsertError } = await admin.from("profiles").insert({
      id: userId,
      email,
      status: "ACTIVE",
      must_change_password: false,
      onboarding_completed: false,
    });
    // PLAYER, hardcoded — the one line in this entire flow that decides
    // what a self-onboarded account can do. Never derived from anything
    // the visitor supplies.
    const { error: roleInsertError } = await admin.from("user_roles").insert({ user_id: userId, role: "PLAYER" });
    if (profileInsertError || roleInsertError) {
      await admin.auth.admin.deleteUser(userId); // roll back the orphaned auth user
      return { error: "Could not create your account. Try again." };
    }
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkError || !linkData.properties?.email_otp) {
    return { error: "Could not sign you in. Try again." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "magiclink",
  });
  if (verifyError) {
    return { error: "Could not sign you in. Try again." };
  }

  if (existingProfile) {
    // Same rationale as this project's earlier link-based version: a
    // verified sign-in through this path is treated as an equally valid
    // identity check as a password, so there's no reason to also force
    // the temporary-password-replacement screen afterward.
    if (
      (await admin.from("profiles").select("must_change_password").eq("id", userId).maybeSingle()).data
        ?.must_change_password
    ) {
      await admin.from("profiles").update({ must_change_password: false }).eq("id", userId);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  // Never /admin here — every account this function ever touches is
  // confirmed non-admin-surface above before this point is reached.
  redirect("/play");
}
