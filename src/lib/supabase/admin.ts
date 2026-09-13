import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { parseServerEnv } from "@/lib/env.server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY ENTIRELY.
 *
 * Never import this from a Client Component (the `server-only` import makes
 * that a build error) and never send its result to the browser. Use only in
 * Server Actions / Route Handlers that need to perform an action a player's
 * own RLS-scoped session is intentionally not allowed to do — admin account
 * creation, awarding score events, writing audit_logs, etc. Every call site
 * using this client is exactly the kind of change `security-gate` should
 * review before merge.
 */
export function createAdminClient() {
  const env = parseServerEnv(process.env);

  return createSupabaseClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
