import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { parseServerEnv } from "@/lib/env.server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server Component / Server Action / Route Handler Supabase client.
 *
 * Uses the publishable (anon) key — RLS still applies. This is the
 * RLS-scoped, user-session-aware client (reads the auth cookie), NOT the
 * service-role client. For anything that must bypass RLS (admin account
 * creation, score/vote writes, audit logging), use
 * `src/lib/supabase/admin.ts` instead — never widen this client's key to
 * the secret key to "make something work."
 *
 * Must be called fresh per request (do not cache the returned client across
 * requests) since it captures the current request's cookies.
 */
export async function createClient() {
  const env = parseServerEnv(process.env);
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component (not a Server Action / Route
            // Handler) — cookies can't be written here. Safe to ignore as
            // long as session refresh also runs in middleware.
          }
        },
      },
    },
  );
}
