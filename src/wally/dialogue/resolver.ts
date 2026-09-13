/**
 * docs/WALLY.md §18 (dialogue engine) + §29.4 (missing-dialogue fallback
 * chain). Pure functions — no database/network access here, so the
 * fallback-chain and variable-substitution logic is directly unit-tested
 * (runbook §18.1: "Wally dialogue variable resolution" is explicitly
 * listed as required unit-test coverage) rather than only exercised live.
 *
 * `wally_dialogues` rows are fetched by the caller (a Server
 * Component/action, RLS-scoped or service-role as appropriate) and passed
 * in here — this module never talks to Supabase itself.
 */

export interface DialogueRow {
  key: string;
  locale: string;
  event_type: string;
  variant: string | null;
  text: string;
  weight: number;
  is_active: boolean;
}

const FALLBACK_LOCALE = "en";

/**
 * WALLY.md §29.4's exact fallback chain: requested locale+variant →
 * requested locale+default (no variant) → fallback locale+variant →
 * fallback locale+default → null (caller supplies the safe generic text).
 * Among multiple matches at the same chain step, picks by `weight`
 * (highest first) — deterministic, not random, so this stays unit-testable
 * without mocking `Math.random`.
 */
export function selectDialogue(
  rows: readonly DialogueRow[],
  args: { key: string; locale?: string; variant?: string | null },
): DialogueRow | null {
  const locale = args.locale ?? FALLBACK_LOCALE;
  const candidates = rows.filter((r) => r.is_active && r.key === args.key);

  const steps: { locale: string; variant: string | null | undefined }[] = [
    { locale, variant: args.variant },
    { locale, variant: null },
  ];
  if (locale !== FALLBACK_LOCALE) {
    steps.push({ locale: FALLBACK_LOCALE, variant: args.variant });
    steps.push({ locale: FALLBACK_LOCALE, variant: null });
  }

  for (const step of steps) {
    const matches = candidates.filter(
      (r) => r.locale === step.locale && (step.variant === undefined || r.variant === step.variant),
    );
    if (matches.length > 0) {
      return matches.reduce((best, row) => (row.weight > best.weight ? row : best));
    }
  }

  return null;
}

/**
 * WALLY.md §18.3: "Never render raw {{variable}} text. If a required
 * variable is missing: use a fallback dialogue variant; or omit the
 * variable-dependent sentence." This implementation takes the simpler,
 * safer half of that rule — if any token the template references has no
 * corresponding value, return null so the caller can fall back to a safe
 * generic string, rather than silently emitting a half-filled sentence.
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string | number | boolean | null | undefined>,
): string | null {
  let missing = false;
  const result = template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
    const value = variables[name];
    if (value === undefined || value === null) {
      missing = true;
      return "";
    }
    return String(value);
  });
  return missing ? null : result;
}

/** Absolute last resort, per WALLY.md §29.4's chain ending in "safe generic text." */
export const SAFE_GENERIC_DIALOGUE = "Wally has something to say.";
