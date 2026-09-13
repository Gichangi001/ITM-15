"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@/lib/auth/schemas";
import { deriveFirstName } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminSurfaceAccess, type Role } from "@/lib/auth/roles";

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
 */
export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    countryId: formData.get("countryId"),
    entityId: formData.get("entityId"),
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

  const { fullName, countryId, entityId } = parsed.data;
  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      first_name: deriveFirstName(fullName),
      country_id: countryId,
      entity_id: entityId ?? null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Could not save your details. Try again." };
  }

  // Computed directly rather than relying on src/proxy.ts to redirect a
  // second time — see the comment on src/app/login/actions.ts's signIn for
  // the Next.js dev-mode double-redirect artifact this avoids.
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row) => row.role as Role);

  redirect(hasAdminSurfaceAccess(roles) ? "/admin" : "/play");
}
