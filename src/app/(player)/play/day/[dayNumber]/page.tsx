import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Day — ITM@15" };

/**
 * Product Guide §7's player IA lists /play/day/[dayNumber] as a real route.
 * The content engine that would populate a real day (Product Guide §9,
 * Phase 6) doesn't exist yet, so this validates the param (a real campaign
 * only ever has 7 days) and shows an honest "not published yet" state
 * rather than fabricating story/mission content.
 */
export default async function DayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  const day = Number(dayNumber);

  if (!Number.isInteger(day) || day < 1 || day > 7) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
        Day {day}
      </p>
      <h1 className="text-3xl">Not published yet</h1>
      <p className="text-sm text-muted">
        Day {day}&apos;s story and missions come from the content engine
        (Product Guide Phase 6), which isn&apos;t built yet. Curious what Day{" "}
        {day} will feel like? The{" "}
        <a
          href="/preview"
          className="text-walumo underline underline-offset-4"
        >
          narrative walkthrough
        </a>{" "}
        previews the whole story arc.
      </p>
    </main>
  );
}
