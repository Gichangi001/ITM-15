import type { Metadata } from "next";
import { ComingSoon } from "@/components/player/ComingSoon";

export const metadata: Metadata = { title: "Gallery — ITM@15" };

export default function GalleryPage() {
  return (
    <ComingSoon
      title="Gallery"
      description="Approved photos from challenge submissions will appear here once uploads exist and pass moderation (Product Guide §12) — unapproved media never reaches this page, even once it's built."
      phase="Product Guide Phase 10 — Media Uploads & Moderation"
    />
  );
}
