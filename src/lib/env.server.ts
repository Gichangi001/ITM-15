import "server-only";
import { z } from "zod";

/**
 * SERVER-ONLY environment validation (runbook §13, Product Guide §31).
 *
 * The `server-only` import above makes it a build error to import this
 * module from a Client Component — a stronger guarantee than a naming
 * convention alone. `SUPABASE_SECRET_KEY` must never reach the browser.
 *
 * SUPABASE_JWKS_URL is optional for now: nothing in the app manually
 * verifies JWTs yet (`@supabase/ssr`'s server client handles session
 * validation internally). Add it to `required` only once something actually
 * reads it — don't pre-declare a requirement nothing consumes.
 *
 * `parseServerEnv` takes an explicit source rather than reading
 * `process.env` internally — see the comment in `src/lib/env.ts` for why
 * (tests use fake values, not real `.env.local` secrets).
 */

const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_JWKS_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Deliberately NOT eagerly evaluated against `process.env` at module scope
 * — see the equivalent comment in `src/lib/env.ts`. Call this inside the
 * function that actually needs it (see `src/lib/supabase/server.ts` and
 * `src/lib/supabase/admin.ts`), not at import time.
 */
export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  return serverSchema.parse({
    SUPABASE_URL: source.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: source.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: source.SUPABASE_SECRET_KEY,
    SUPABASE_JWKS_URL: source.SUPABASE_JWKS_URL,
  });
}
