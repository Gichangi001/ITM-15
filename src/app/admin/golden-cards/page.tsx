import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageGoldenCards } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { AllocateGoldenCardForm } from "./AllocateGoldenCardForm";
import { expireGoldenCard } from "./actions";

export const metadata: Metadata = { title: "Golden Cards — ITM@15" };
export const dynamic = "force-dynamic";

export default async function GoldenCardsPage() {
  const roles = await getCurrentRoles();
  if (!canManageGoldenCards(roles)) {
    redirect("/admin");
  }

  const admin = createAdminClient();
  const [{ data: players }, { data: days }, { data: cards }] = await Promise.all([
    admin.from("profiles").select("id, email, full_name").eq("status", "ACTIVE").order("email"),
    admin.from("game_days").select("id, day_number, title").order("day_number"),
    admin.from("golden_cards").select("id, game_day_id, carrier_id, claimed_by, code, bonus_points, status, claimed_at, created_at").order("created_at", { ascending: false }),
  ]);

  const dayById = new Map((days ?? []).map((d) => [d.id, d]));
  const playerIds = new Set<string>();
  for (const c of cards ?? []) {
    playerIds.add(c.carrier_id);
    if (c.claimed_by) playerIds.add(c.claimed_by);
  }
  const { data: cardPlayers } =
    playerIds.size > 0
      ? await admin.from("profiles").select("id, email, full_name").in("id", [...playerIds])
      : { data: [] as { id: string; email: string; full_name: string | null }[] };
  const playerById = new Map((cardPlayers ?? []).map((p) => [p.id, p]));

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE: "text-walumo",
    CLAIMED: "text-gold",
    EXPIRED: "text-muted",
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">ITM@15 — Mission Control</p>
        <h1 className="text-3xl">🥚 Chairman&apos;s Egg — golden cards</h1>
        <p className="text-sm text-muted">
          Allocate a golden card to one real player for a day — they become the person everyone else has to find in
          person. Whoever tracks them down and enters the code they&apos;re given claims a real bonus, once. Every
          allocation and claim is a real, auditable, server-side action — nothing here is decorative.
        </p>
      </div>

      <AllocateGoldenCardForm players={players ?? []} days={days ?? []} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">All golden cards</h2>
        {!cards || cards.length === 0 ? (
          <p className="text-sm text-muted">No golden cards allocated yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map((card) => {
              const day = dayById.get(card.game_day_id);
              const carrier = playerById.get(card.carrier_id);
              const claimer = card.claimed_by ? playerById.get(card.claimed_by) : null;
              return (
                <div key={card.id} className="itm-card flex flex-col gap-2 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-ink">
                      Day {day?.day_number ?? "?"} · carried by {carrier?.full_name || carrier?.email || "Unknown"}
                    </p>
                    <span className={`text-xs font-semibold uppercase ${STATUS_STYLE[card.status] ?? "text-muted"}`}>
                      {card.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Code: <span className="font-mono text-ink">{card.code}</span> · {card.bonus_points} bonus points
                    {claimer ? ` · found by ${claimer.full_name || claimer.email}` : ""}
                  </p>
                  {card.status === "ACTIVE" ? (
                    <form action={expireGoldenCard} className="self-start">
                      <input type="hidden" name="cardId" value={card.id} />
                      <button type="submit" className="btn-secondary text-xs">
                        Expire
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
