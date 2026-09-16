import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QrCode, getAppUrl } from "@/components/QrCode";
import { PassportForm } from "./PassportForm";

export const metadata: Metadata = { title: "Passport — ITM@15" };

/**
 * Product owner's explicit 2026-09-13 direction (beyond Product Guide
 * §17's original "stamp collection" concept): a scannable, shareable
 * networking badge — name, country, and whatever contact fields the
 * player has chosen to fill in. `passport_cards` is a deliberately
 * separate, narrow table from `profiles` (see the migration's own header
 * comment for why) with deny-all RLS except an "own row" SELECT policy —
 * this page reads through the RLS-scoped session client, same as any
 * other "my own data" page in this app.
 */
export default async function PassportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  let { data: card } = await supabase
    .from("passport_cards")
    .select("passport_slug, phone, location_text, company_text, updated_at")
    .eq("player_id", user.id)
    .maybeSingle();

  // First visit — no row exists yet. `passport_cards` has no
  // client-writable policy at all (see the migration's own comment), so
  // the initial row is created through the service-role client, same
  // "server derives everything real, client never inserts" rule as every
  // other first-write-on-first-visit path in this app.
  if (!card) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, first_name, countries(name, flag_emoji)")
      .eq("id", user.id)
      .maybeSingle();

    const { data: created } = await admin
      .from("passport_cards")
      .insert({
        player_id: user.id,
        full_name: profile?.full_name ?? null,
        first_name: profile?.first_name ?? null,
        country_name: profile?.countries?.name ?? null,
        country_flag_emoji: profile?.countries?.flag_emoji ?? null,
      })
      .select("passport_slug, phone, location_text, company_text, updated_at")
      .single();
    card = created;
  }

  const shareUrl = card ? `${getAppUrl()}/passport/${card.passport_slug}` : null;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15
        </p>
        <h1 className="text-3xl">Your passport</h1>
        <p className="text-sm text-muted">
          Your shareable badge for the event — scan to connect. Only what you fill in below
          appears on it.
        </p>
      </div>

      {shareUrl ? (
        <div className="itm-card itm-hero-card flex flex-col items-center gap-3 p-6 text-center">
          <QrCode url={shareUrl} size={180} />
          <p className="text-xs text-muted break-all">{shareUrl}</p>
          <p className="text-xs text-muted">
            Anyone who scans this sees your badge — no sign-in needed on their end.
          </p>
        </div>
      ) : (
        <p className="itm-card p-4 text-sm text-muted">
          Save your passport once below to get your shareable QR code.
        </p>
      )}

      <PassportForm
        phone={card?.phone ?? null}
        locationText={card?.location_text ?? null}
        companyText={card?.company_text ?? null}
      />
    </main>
  );
}
