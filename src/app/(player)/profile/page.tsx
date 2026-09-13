import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/logout/actions";

export const metadata: Metadata = { title: "Profile — ITM@15" };

/**
 * Real signed-in profile data, not a placeholder — everything shown here
 * (name/email/country/entity) already exists from Phase 2/3, so there's no
 * "fake demo" reason to stub this one out like the other Phase 4 routes.
 * Read-only: editing isn't built (no server action exists to change
 * country_id/entity_id post-onboarding — see the foundation migration's
 * comment on why profiles has no client-writable UPDATE policy at all).
 */
export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();

  let countryLabel = "—";
  if (profile.country_id) {
    const { data: country } = await supabase
      .from("countries")
      .select("name, flag_emoji")
      .eq("id", profile.country_id)
      .maybeSingle();
    if (country) {
      countryLabel = `${country.flag_emoji ?? ""} ${country.name}`.trim();
    }
  }

  let entityLabel = "—";
  if (profile.entity_id) {
    const { data: entity } = await supabase
      .from("entities")
      .select("name")
      .eq("id", profile.entity_id)
      .maybeSingle();
    if (entity) {
      entityLabel = entity.name;
    }
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15
        </p>
        <h1 className="text-3xl">Your profile</h1>
      </div>

      <dl className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
        <ProfileRow label="Name" value={profile.full_name ?? "—"} />
        <ProfileRow label="Email" value={profile.email} />
        <ProfileRow label="Country" value={countryLabel} />
        <ProfileRow label="Entity" value={entityLabel} />
      </dl>

      <p className="text-sm text-muted">
        Editing your profile isn&apos;t built yet — contact your ITM@15
        administrator if any of this needs to change.
      </p>

      <form action={signOut}>
        <button type="submit" className="btn-secondary self-start">
          Sign out
        </button>
      </form>
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
