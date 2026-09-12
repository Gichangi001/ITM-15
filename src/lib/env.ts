import { z } from "zod";

/**
 * Server-side environment validation (runbook §13, Product Guide §31).
 *
 * Fails fast at startup if required configuration is missing, instead of
 * surfacing a confusing runtime error deep inside a request handler.
 *
 * IMPORTANT: only variables that are safe to read on the server belong in
 * `serverSchema`. Never add `SUPABASE_SECRET_KEY` or any other privileged
 * credential to `NEXT_PUBLIC_*` — those are bundled into client JavaScript.
 *
 * This file intentionally validates a minimal set today (Phase 0). Extend it
 * as each phase introduces a genuinely required variable — do not pre-declare
 * variables for services that aren't wired up yet, since that would make the
 * app fail to boot for a missing value nothing actually reads.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export const clientEnv: ClientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
