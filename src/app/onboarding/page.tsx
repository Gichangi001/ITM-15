import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentRoles } from "@/lib/auth/session";
import { hasAdminSurfaceAccess } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Complete Your Profile — ITM@15",
};

/**
 * Product Guide §5.4. src/proxy.ts already redirects a signed-in visitor
 * with `onboarding_completed = true` away from this route before it ever
 * renders — this page's own re-check is the same belt-and-braces pattern
 * every other authenticated page in this app follows, not the primary
 * guard.
 */
export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  if (profile.onboarding_completed) {
    const roles = await getCurrentRoles();
    redirect(hasAdminSurfaceAccess(roles) ? "/admin" : "/play");
  }

  const supabase = await createClient();
  const [{ data: countries }, { data: entities }] = await Promise.all([
    supabase.from("countries").select("id, name, flag_emoji").order("name"),
    supabase.from("entities").select("id, name, country_id").order("name"),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15
        </p>
        <h1 className="text-3xl">Tell us who you are</h1>
        <p className="text-sm text-muted">
          Signed in as <span className="text-ink">{profile.email}</span>. Your name and
          country open your ITM Passport — this is the last step before Day 1.
        </p>
      </div>

      <OnboardingForm countries={countries ?? []} entities={entities ?? []} />
    </main>
  );
}
