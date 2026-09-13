"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { optionalFormField } from "@/lib/auth/schemas";

const updatePassportSchema = z.object({
  phone: optionalFormField(z.string().trim().max(40)),
  locationText: optionalFormField(z.string().trim().max(200)),
  companyText: optionalFormField(z.string().trim().max(200)),
});

export type UpdatePassportState = { error?: string; success?: boolean } | null;

/**
 * Product Guide §17 / the Phase 17 migration's own design (see its header
 * comment): passport "location" is always free-text the player types
 * themselves — never live GPS, no geolocation permission flow anywhere in
 * this app. `country_name`/`country_flag_emoji` are looked up here from
 * the player's real `profiles.country_id`, never accepted as form input —
 * a player cannot claim a country they didn't actually onboard with.
 */
export async function updatePassportCard(
  _prevState: UpdatePassportState,
  formData: FormData,
): Promise<UpdatePassportState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = updatePassportSchema.safeParse({
    phone: formData.get("phone"),
    locationText: formData.get("locationText"),
    companyText: formData.get("companyText"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, first_name, countries(name, flag_emoji)")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await admin
    .from("passport_cards")
    .update({
      full_name: profile?.full_name ?? null,
      first_name: profile?.first_name ?? null,
      phone: parsed.data.phone ?? null,
      location_text: parsed.data.locationText ?? null,
      company_text: parsed.data.companyText ?? null,
      country_name: profile?.countries?.name ?? null,
      country_flag_emoji: profile?.countries?.flag_emoji ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("player_id", user.id);

  if (error) {
    return { error: "Could not save your passport. Try again." };
  }

  revalidatePath("/passport");
  return { success: true };
}
