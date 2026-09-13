import type { Metadata } from "next";
import { ComingSoon } from "@/components/player/ComingSoon";

export const metadata: Metadata = { title: "Notifications — ITM@15" };

export default function NotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="New missions, approvals and bonus points will show up here once the content engine and notification system exist (Product Guide §15)."
      phase="Product Guide Phase 12 — Admin Notifications & Live Controls"
    />
  );
}
