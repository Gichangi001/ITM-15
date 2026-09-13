/**
 * `profiles.first_name` is stored separately from `full_name` (see the
 * foundation migration) because Wally dialogue templates use `{{first_name}}`
 * specifically (docs/WALLY.md §18.2), not the full name — "Alexander, your
 * squad just unlocked something" reads naturally; "Alexander Gichangi, your
 * squad..." doesn't. Derived once, at onboarding, from the full name the
 * player actually typed — never re-derived elsewhere, so it can't drift.
 */
export function deriveFirstName(fullName: string): string {
  const [first] = fullName.trim().split(/\s+/);
  return first ?? "";
}
