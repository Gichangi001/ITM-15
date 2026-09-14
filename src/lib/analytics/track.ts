"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Product Guide §22 / docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §31 —
 * a genuinely generic event-tracking action (not Founder-Story-specific),
 * writing to the first real use of `analytics_events`
 * (supabase/migrations/20260914090000_analytics_events.sql — Product
 * Guide §23's original schema list named this table; nothing had created
 * it until now). Callable directly from a client component's event
 * handler/effect (a Server Action doesn't have to be a `<form action>`),
 * including from a genuinely anonymous, pre-login visitor — `player_id`
 * is simply null in that case, never fabricated.
 *
 * Deliberately fire-and-forget from the caller's perspective (no return
 * value, swallows its own errors) — a missed analytics write should never
 * break the story experience it's measuring.
 */
export async function trackEvent(eventName: string, metadata: Record<string, Json> = {}): Promise<void> {
  try {
    const user = await getCurrentUser();
    const admin = createAdminClient();
    await admin.from("analytics_events").insert({
      event_name: eventName,
      player_id: user?.id ?? null,
      metadata,
    });
  } catch {
    // See header comment — never let a tracking failure surface to the visitor.
  }
}
