"use client";

import { createBrowserClient } from "@supabase/ssr";
import { parseClientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Browser Supabase client. Uses the publishable (anon) key — RLS applies to
 * every query made through this client. Never construct a client with the
 * secret key here; that belongs only in `src/lib/supabase/admin.ts`, which
 * is server-only.
 *
 * `NEXT_PUBLIC_*` values are referenced here as direct, static
 * `process.env.NEXT_PUBLIC_X` expressions rather than via a passed-through
 * `process.env` object — Next.js's compiler only inlines the literal value
 * into the browser bundle for exactly that static shape. Passing the whole
 * `process.env` object into a helper function (as `parseClientEnv` does
 * internally, deliberately, for validation) would silently break in the
 * browser, since `process.env` there is empty except for whatever the
 * compiler statically found and inlined.
 */
export function createClient() {
  const env = parseClientEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
