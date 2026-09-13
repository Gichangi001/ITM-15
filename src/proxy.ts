import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { hasAdminSurfaceAccess } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

/**
 * Route protection for Phase 2 (Product Guide §5.2 login behaviour, §26
 * Phase 2 acceptance: "Admin routes reject normal players").
 *
 * IMPORTANT — file location and naming, learned the hard way: Next.js 16
 * renamed the "middleware" convention to "proxy". A file named
 * `middleware.ts` (old name) is silently never invoked at runtime in this
 * version — it compiles without error and even shows as "ƒ Proxy
 * (Middleware)" in `next build` output, but the dev/prod router's
 * middleware-manifest never registers it, so it has zero effect at
 * request time. The exported function must also be named `proxy` (not
 * `middleware`) or Next throws "Proxy is missing expected function export
 * name" at request time. Just as importantly: in a project using the
 * `src/` directory convention (this one has `src/app/`), this file must
 * live at `src/proxy.ts`, NOT root-level `proxy.ts` — a root-level file
 * compiles and bundles correctly but, like the wrong-name case, never
 * actually gets registered/invoked. Verified empirically with a
 * short-circuit probe route before finding the fix.
 *
 * Test the whole request pipeline (not just types/build) after moving or
 * renaming this file — a code review or `pnpm verify` alone would not
 * have caught this class of bug, since compilation succeeds and the
 * function looks completely correct in isolation.
 *
 * Uses `supabase.auth.getUser()`, not `getSession()` — `getUser()` revalidates
 * the JWT against the Supabase Auth server on every call, while `getSession()`
 * only reads the (possibly stale/forged-looking, though signature-valid)
 * cookie payload. This is Supabase's own documented recommendation for any
 * server-side code making an authorization decision.
 *
 * Known cost, accepted for this phase: every request to a protected route
 * does 1-2 extra DB round trips (profile status/must_change_password, and —
 * for /admin — role rows). Fine at ITM@15's scale; if this ever needs to be
 * cheaper, the standard fix is custom JWT claims populated by a Postgres
 * hook, not a change to the authorization logic itself.
 */

const PROTECTED_PREFIXES = [
  "/first-login",
  "/onboarding",
  "/play",
  "/leaderboards",
  "/gallery",
  "/achievements",
  "/notifications",
  "/profile",
  "/help",
  "/vote",
  "/admin",
];

// `/passport` (the edit page) needs a session; `/passport/[slug]` (a
// player's public shareable card, Product Guide §17 / the Phase 17
// migration's own design) deliberately does not — it's a link meant to be
// opened by anyone it's shared with, not just other signed-in players.
// Kept out of PROTECTED_PREFIXES's prefix match (which would protect
// every sub-path) and gated here at the exact path only.
const PROTECTED_EXACT = ["/passport"];

function isProtected(pathname: string): boolean {
  return (
    PROTECTED_EXACT.includes(pathname) ||
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

/**
 * Redirects while carrying over any cookie mutations Supabase made on this
 * request (a token refresh from `getUser()`, or `signOut()`'s cookie
 * clearing). A bare `NextResponse.redirect(url)` is a brand-new response
 * object that never sees those mutations — they only ever land on the
 * `response` `createMiddlewareClient`'s `setAll` callback builds — so using
 * it directly for every redirect branch below would silently drop them
 * (found by security review: not an auth bypass, since `getUser()`
 * revalidates server-side on the very next request regardless, but a real
 * session-hygiene defect — e.g. a signed-out/disabled user's stale cookie
 * lingering in the browser, or unnecessary forced re-logins as an
 * un-persisted refreshed token expires).
 */
function redirectWithCookies(url: URL, response: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  }
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, getResponse } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated visitor hitting a protected route -> /login.
  if (!user) {
    if (isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return redirectWithCookies(url, getResponse());
    }
    return getResponse();
  }

  // Authenticated from here on. Load the profile once — every remaining
  // check depends on it.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, must_change_password, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  // No profile row at all is not a normal state (every account creation
  // path writes one) — fail closed rather than guess.
  if (!profile) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=account_not_found";
    return redirectWithCookies(url, getResponse());
  }

  // Product Guide §5.2 step 3: "Reject disabled application profiles even
  // if an auth session exists" — re-checked on every request, not just at
  // sign-in, so disabling an account mid-session takes effect immediately.
  if (profile.status === "DISABLED") {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=disabled";
    return redirectWithCookies(url, getResponse());
  }

  const mustChangePassword = profile.must_change_password === true;

  if (mustChangePassword && pathname !== "/first-login") {
    const url = request.nextUrl.clone();
    url.pathname = "/first-login";
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  // Product Guide §5.2 step 5: "If required profile fields are incomplete,
  // go to /onboarding" — checked right after the password gate and before
  // anything role-based, matching the login-behaviour order in the spec
  // (password gate, then onboarding gate, then role-based destination).
  // Applies uniformly regardless of role: an admin account created the same
  // way a player's is (Product Guide §5.1) still needs a real name/country
  // on file. This check needs no role data, so it runs before the roles
  // fetch below.
  const onboardingIncomplete = profile.onboarding_completed !== true;

  if (!mustChangePassword && onboardingIncomplete && pathname !== "/onboarding") {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  // Roles are needed for three decisions below (where an admin-capable user
  // lands by default, whether /admin is reachable at all, and bouncing an
  // already-onboarded visitor away from /onboarding) — fetched once and
  // reused rather than repeatedly.
  const needsRoles =
    !mustChangePassword &&
    (pathname === "/first-login" ||
      pathname === "/login" ||
      pathname === "/onboarding" ||
      pathname.startsWith("/admin"));
  let roles: Role[] = [];
  if (needsRoles) {
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    roles = (roleRows ?? []).map((row) => row.role as Role);
  }
  const defaultDestination = hasAdminSurfaceAccess(roles) ? "/admin" : "/play";

  if (!mustChangePassword && pathname === "/first-login") {
    const url = request.nextUrl.clone();
    url.pathname = defaultDestination;
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  // Already onboarded but landing back on /onboarding (e.g. a stale
  // bookmark, or browser back after completing it) — send them onward
  // instead of showing the form again.
  if (!mustChangePassword && !onboardingIncomplete && pathname === "/onboarding") {
    const url = request.nextUrl.clone();
    url.pathname = defaultDestination;
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  // Already-authenticated visitor landing on /login — send them onward
  // instead of showing the form again.
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = mustChangePassword
      ? "/first-login"
      : onboardingIncomplete
        ? "/onboarding"
        : defaultDestination;
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  // Coarse admin-surface gate (Product Guide §26 Phase 2 acceptance:
  // "Admin routes reject normal players"). Each admin action/page still
  // independently re-checks the *specific* role it requires — see
  // src/lib/auth/roles.ts.
  if (pathname.startsWith("/admin") && !hasAdminSurfaceAccess(roles)) {
    const url = request.nextUrl.clone();
    url.pathname = "/play";
    url.search = "";
    return redirectWithCookies(url, getResponse());
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Match every request except Next.js internals and static assets, per
     * @supabase/ssr's own documented middleware matcher pattern.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
