import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Mission — ITM@15" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Product Guide §7's player IA lists /play/mission/[missionId] as a real
 * route. Missions come from the content/submission engines (Phases 6-7),
 * which don't exist yet — validates the param shape and shows an honest
 * "not available yet" state rather than fabricating mission content.
 */
export default async function MissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;

  if (!UUID_RE.test(missionId)) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
        Mission
      </p>
      <h1 className="text-3xl">Not available yet</h1>
      <p className="text-sm text-muted">
        Missions come from the content and submission engines (Product
        Guide Phases 6-7), which aren&apos;t built yet.
      </p>
    </main>
  );
}
