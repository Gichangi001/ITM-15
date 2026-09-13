import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canCreateEmployeeAccounts, ROLES } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { NewPlayerForm } from "./NewPlayerForm";

export const metadata: Metadata = {
  title: "Add Player — ITM@15",
};

/**
 * Third independent check of the same authorization decision (after
 * middleware.ts's coarse admin-surface gate and the server action's own
 * check) — this one just controls whether the page renders the form at
 * all. Belt-and-braces is intentional here: account creation is one of the
 * highest-impact admin actions in the product.
 */
export default async function NewPlayerPage() {
  const roles = await getCurrentRoles();
  if (!canCreateEmployeeAccounts(roles)) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: countries } = await supabase
    .from("countries")
    .select("id, name, flag_emoji")
    .order("name");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Add player</h1>
        <p className="text-sm text-muted">
          Most accounts (Player) sign in with a one-time emailed link — no password
          needed. Admin-surface roles (Moderator and above) still get a temporary
          password (<span className="text-ink">Walumo</span>) and set a private one on
          first sign-in.
        </p>
      </div>

      <NewPlayerForm countries={countries ?? []} roles={ROLES} />
    </main>
  );
}
