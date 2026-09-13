import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The public "scan to connect" view of a player's passport card — Product
 * Guide §17 / the Phase 17 migration's own design (see its header
 * comment). Deliberately NOT gated by `src/proxy.ts` (see its
 * `PROTECTED_EXACT` comment) — this is a link meant to be opened by
 * whoever the QR code/link was shared with, signed in or not.
 *
 * Reads through the service-role client, never the RLS-scoped one:
 * `passport_cards`' only SELECT policy is "the owner may read their own
 * row" (see the migration), which would return nothing at all for a
 * third-party visitor. The lookup is by `passport_slug` only — a random
 * 18-character hex value, not enumerable — so this never exposes a way to
 * browse other players' cards, only to open one whose exact link you
 * already have.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: card } = await admin
    .from("passport_cards")
    .select("full_name, first_name")
    .eq("passport_slug", slug)
    .maybeSingle();

  const name = card?.first_name || card?.full_name;
  return { title: name ? `${name}'s Passport — ITM@15` : "Passport — ITM@15" };
}

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: card } = await admin
    .from("passport_cards")
    .select("player_id, full_name, first_name, phone, location_text, company_text, country_name, country_flag_emoji")
    .eq("passport_slug", slug)
    .maybeSingle();

  if (!card) {
    notFound();
  }

  const { data: achievementRows } = await admin
    .from("player_achievements")
    .select("achievements(title, icon)")
    .eq("player_id", card.player_id);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-surface p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15 Passport</p>
        <h1 className="text-3xl">{card.full_name || "ITM@15 Player"}</h1>
        {card.country_name ? (
          <p className="text-sm text-muted">
            {card.country_flag_emoji ? `${card.country_flag_emoji} ` : ""}
            {card.country_name}
          </p>
        ) : null}

        <div className="mt-4 flex w-full flex-col gap-2 text-left text-sm">
          {card.company_text ? (
            <p>
              <span className="text-muted">Entity/Company:</span> {card.company_text}
            </p>
          ) : null}
          {card.location_text ? (
            <p>
              <span className="text-muted">Location:</span> {card.location_text}
            </p>
          ) : null}
          {card.phone ? (
            <p>
              <span className="text-muted">Phone:</span> {card.phone}
            </p>
          ) : null}
        </div>

        {achievementRows && achievementRows.length > 0 ? (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {achievementRows.map((row, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
              >
                <span aria-hidden="true">{row.achievements?.icon}</span>
                {row.achievements?.title}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-center text-xs text-muted">An experience by Walumo.</p>
    </main>
  );
}
