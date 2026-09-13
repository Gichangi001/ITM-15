import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveRoleBasedDestination } from "@/lib/auth/session";

/**
 * The landing point for a magic-link sign-in (`src/app/login/actions.ts`'s
 * `sendMagicLink`, `emailRedirectTo`). Supabase appends either `?code=...`
 * (success — needs exchanging for a real session) or its own
 * `?error=...&error_description=...` (an expired/already-used/invalid
 * link) to this URL before the browser ever reaches it.
 *
 * Deliberately re-does the same DISABLED check `signIn` and `src/proxy.ts`
 * both do — this is the first server-side code to run for a brand new
 * session, and Supabase Auth itself has no concept of this app's DISABLED
 * status, so nothing upstream of this route enforces it. Without this
 * check, a disabled participant's stale invited email could still
 * complete a real Supabase Auth session for a few hundred milliseconds
 * before their very next request hit `src/proxy.ts`'s own re-check —
 * closing that gap here matches the "fail closed at the earliest point"
 * pattern already used everywhere else in this file's siblings.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, must_change_password, onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile || profile.status === "DISABLED") {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=disabled`);
      }

      // A successful magic-link sign-in is proof of owning the invited
      // inbox — an equally valid identity proof as a password, and for a
      // participant who signs in this way, likely the *only* proof they
      // will ever give. Continuing to gate them behind "/first-login"
      // (whose whole purpose is replacing the temporary shared `Walumo`
      // password — Product Guide §5.3) no longer makes sense once they've
      // authenticated a completely different way; the RLS-scoped session
      // client can't write this field itself (see the migration's comment
      // on `profiles`), so it goes through the service-role client, same
      // single-field write `changePassword` already does after an actual
      // password change.
      if (profile.must_change_password) {
        const admin = createAdminClient();
        await admin.from("profiles").update({ must_change_password: false }).eq("id", data.user.id);
      }

      if (!profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      const destination = await resolveRoleBasedDestination(supabase, data.user.id);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=magic_link_failed`);
}
