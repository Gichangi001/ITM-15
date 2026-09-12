import { z } from "zod";

/**
 * CLIENT-SAFE environment validation (runbook §13, Product Guide §31).
 *
 * Only variables safe to bundle into browser JavaScript belong here — i.e.
 * only `NEXT_PUBLIC_*`. Never add a privileged credential to this file. The
 * server-only counterpart lives in `src/lib/env.server.ts` and must never be
 * imported from a Client Component.
 *
 * `parseClientEnv` takes an explicit source object rather than reading
 * `process.env` internally so tests can assert against fake values instead
 * of depending on whatever `.env.local` happens to contain on a given
 * machine (Next.js also deliberately does not load `.env.local` when
 * `NODE_ENV=test`, which Vitest sets by default — coupling tests to real
 * env files would make them fail identically in CI, where no secrets are
 * configured yet).
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Deliberately NOT eagerly evaluated against `process.env` at module scope
 * here (e.g. `export const clientEnv = parseClientEnv(process.env)`) — that
 * would throw the moment anything imports this module, including a test
 * that only wants the `parseClientEnv` function with fake values. Call this
 * inside the function that actually needs the env (see
 * `src/lib/supabase/client.ts`), not at import time.
 */
export function parseClientEnv(
  source: Record<string, string | undefined>,
): ClientEnv {
  return clientSchema.parse({
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
