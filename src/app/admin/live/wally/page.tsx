import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canTriggerWally } from "@/lib/auth/roles";
import { WallyTriggerForm } from "./WallyTriggerForm";

export const metadata: Metadata = { title: "Wally Control Room — ITM@15" };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to trigger Wally.",
  invalid_input: "That didn't look right — nothing was sent.",
  no_campaign: "No campaign exists yet to send a Wally event for.",
  player_not_found: "No player account matches that email.",
  update_failed: "Something went wrong publishing that event. Try again.",
};

/**
 * docs/WALLY.md §16 "Admin Mission Control — Wally Control Room." Scope
 * for this first slice (Phase 13 W1/W2, see actions.ts's header comment):
 * GLOBAL or one named player, immediate publish only, custom message +
 * pose + priority — not the full 9-quick-action/skin/scheduling panel
 * §16.1/§16.4 eventually describes.
 */
export default async function WallyControlRoomPage({
  searchParams,
}: PageProps<"/admin/live/wally">) {
  const roles = await getCurrentRoles();
  if (!canTriggerWally(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Wally Control Room</h1>
        <p className="text-sm text-muted">
          Sends a real, audited Wally event — targeted players see it live, without a
          reload.
        </p>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Sent.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <WallyTriggerForm />
    </main>
  );
}
