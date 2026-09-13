import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageContent } from "@/lib/auth/roles";
import { NewMissionForm } from "./NewMissionForm";

export const metadata: Metadata = { title: "New Mission — ITM@15" };

export default async function NewMissionPage() {
  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 bg-bg px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">New mission</h1>
        <p className="text-sm text-muted">
          Created as a draft — players won&apos;t see it until you publish it
          from the missions list.
        </p>
      </div>

      <NewMissionForm />
    </main>
  );
}
