"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Not itemized in Product Guide §5 (which focuses on getting in, not out),
 * but a working session has to be endable — without this there is no way
 * to switch accounts or actually leave a shared/borrowed device signed in
 * as a real employee.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
