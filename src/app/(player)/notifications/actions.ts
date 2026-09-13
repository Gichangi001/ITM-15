"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Uses the RLS-scoped client, not the service-role one — the migration's
 * own "players can update read_at on their own notifications" policy
 * (`with check (player_id = auth.uid())`) is the real authorization
 * boundary here, matching its own comment: there's no meaningful way to
 * abuse "I marked my own notification read," so this can safely stay a
 * direct RLS-gated write instead of a service-role-mediated one.
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("player_id", user.id)
    .is("read_at", null);
  revalidatePath("/notifications");
}
