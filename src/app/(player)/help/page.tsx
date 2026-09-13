import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help — ITM@15" };

/**
 * Product Guide §7 lists /help in the player IA; §5.2 also references a
 * "Need help?" login-page action. No specific support contact/process is
 * defined anywhere in the controlling docs, so this stays generic rather
 * than inventing a fake support email or process.
 */
export default function HelpPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15
        </p>
        <h1 className="text-3xl">Need help?</h1>
      </div>

      <div className="flex flex-col gap-4 text-sm text-muted">
        <p>
          <span className="text-ink">Can&apos;t sign in?</span> Use the email
          address your administrator invited you with. If you&apos;ve forgotten
          your password, contact them to reset your account — there&apos;s no
          public self-service reset.
        </p>
        <p>
          <span className="text-ink">A page says &quot;not live yet&quot;?</span>{" "}
          ITM@15 is being built one phase at a time. Pages like that are
          honest placeholders for parts of the game that aren&apos;t built yet —
          not bugs.
        </p>
        <p>For anything else, reach out to whoever invited you to ITM@15.</p>
      </div>
    </main>
  );
}
