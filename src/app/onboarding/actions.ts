"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@/lib/auth/schemas";
import { deriveFirstName } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveRoleBasedDestination } from "@/lib/auth/session";
import { WORLD_COUNTRIES, isoToFlagEmoji } from "@/content/worldCountries";

export type OnboardingState = {
  error?: string;
} | null;

/**
 * Product Guide §5.4 (Player onboarding). "On completion, create/update the
 * player profile and assign the player to an eligible squad if automatic
 * squad assignment is enabled" — the squad-assignment half is deliberately
 * NOT attempted here: `squads`/`squad_members` don't exist yet (later than
 * the Phase 1 foundation schema this app currently has). Revisit once those
 * tables exist.
 *
 * Written through the service-role admin client, same reason as every other
 * `profiles` write in this app — see the foundation migration's comment on
 * why there is no client-writable UPDATE policy on `profiles` (a player
 * could otherwise edit `country_id` again after onboarding by calling the
 * REST API directly, bypassing whatever country-scoped game mechanics rely
 * on it staying fixed once set).
 *
 * Country and (optionally) entity are get-or-created here rather than
 * requiring both to already exist — see `docs/PROJECT_STATE.md` for why:
 * event-scale onboarding, many participants, no admin realistically
 * pre-seeds every country/entity by hand first. Country is get-or-created
 * against the fixed `WORLD_COUNTRIES` reference list (never free text —
 * see that file for why); entity has no such external list, so a
 * genuinely free-text `entityName` is get-or-created case-insensitively
 * scoped to the resolved country.
 */
export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    countryIsoCode: formData.get("countryIsoCode"),
    entityId: formData.get("entityId"),
    entityName: formData.get("entityName"),
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

  const { fullName, countryIsoCode, entityId: pickedEntityId, entityName } = parsed.data;
  const admin = createAdminClient();

  const countryMeta = WORLD_COUNTRIES.find((c) => c.isoCode === countryIsoCode);
  if (!countryMeta) {
    return { error: "Select a valid country." };
  }

  const countryId = await getOrCreateCountryId(admin, countryMeta);
  if (!countryId) {
    return { error: "Could not save your country. Try again." };
  }

  let entityId: string | null = null;
  if (entityName) {
    entityId = await getOrCreateEntityId(admin, countryId, entityName);
    if (!entityId) {
      return { error: "Could not save your entity. Try again." };
    }
  } else if (pickedEntityId) {
    entityId = pickedEntityId;
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      first_name: deriveFirstName(fullName),
      country_id: countryId,
      entity_id: entityId,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Could not save your details. Try again." };
  }

  // Computed directly rather than relying on src/proxy.ts to redirect a
  // second time — see the comment on src/app/login/actions.ts's signIn for
  // the Next.js dev-mode double-redirect artifact this avoids.
  redirect(await resolveRoleBasedDestination(supabase, user.id));
}

/**
 * `countries.iso_code` and `.name` are both `unique` (foundation
 * migration), so a genuine concurrent-onboarding race — two participants
 * picking the same not-yet-seeded country in the same instant, plausible
 * at event scale — can make the *insert* lose to someone else's insert
 * that landed a moment earlier. Falls back to reading the now-existing
 * row instead of treating that as a failure.
 */
async function getOrCreateCountryId(
  admin: ReturnType<typeof createAdminClient>,
  countryMeta: { name: string; isoCode: string },
): Promise<string | null> {
  const { data: existing } = await admin
    .from("countries")
    .select("id")
    .eq("iso_code", countryMeta.isoCode)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error: insertError } = await admin
    .from("countries")
    .insert({
      name: countryMeta.name,
      iso_code: countryMeta.isoCode,
      flag_emoji: isoToFlagEmoji(countryMeta.isoCode),
    })
    .select("id")
    .single();

  if (!insertError && created) return created.id;

  const { data: raceWinner } = await admin
    .from("countries")
    .select("id")
    .eq("iso_code", countryMeta.isoCode)
    .maybeSingle();
  return raceWinner?.id ?? null;
}

/** Same get-or-create-with-race-fallback shape as the country helper above, scoped to `(name, country_id)` — `entities`' own unique constraint. */
async function getOrCreateEntityId(
  admin: ReturnType<typeof createAdminClient>,
  countryId: string,
  name: string,
): Promise<string | null> {
  const { data: existing } = await admin
    .from("entities")
    .select("id")
    .eq("country_id", countryId)
    .ilike("name", name)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error: insertError } = await admin
    .from("entities")
    .insert({ name, country_id: countryId })
    .select("id")
    .single();

  if (!insertError && created) return created.id;

  const { data: raceWinner } = await admin
    .from("entities")
    .select("id")
    .eq("country_id", countryId)
    .ilike("name", name)
    .maybeSingle();
  return raceWinner?.id ?? null;
}
