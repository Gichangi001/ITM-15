/**
 * Role vocabulary (Product Guide §4). Kept as a single source of truth so
 * the check constraint in the migration, the Zod schema, and every
 * authorization check in the app agree on the exact same set of strings.
 */
export const ROLES = [
  "PLAYER",
  "MODERATOR",
  "COUNTRY_ADMIN",
  "GAME_MASTER",
  "SUPER_ADMIN",
  "ANALYTICS_VIEWER",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * Roles that may access anything under `/admin` at all (Product Guide §4 —
 * every role except plain PLAYER has some admin-surface access). This is a
 * coarse, route-group-level gate applied in middleware; each individual
 * admin action/page independently re-checks the *specific* role it actually
 * requires (e.g. only GAME_MASTER/SUPER_ADMIN may create accounts) — a
 * readable/matched role here is not itself a fine-grained authorization
 * decision, matching the pattern already documented in the profiles RLS
 * policy comment.
 */
const ADMIN_SURFACE_ROLES: readonly Role[] = [
  "MODERATOR",
  "COUNTRY_ADMIN",
  "GAME_MASTER",
  "SUPER_ADMIN",
  "ANALYTICS_VIEWER",
];

export function hasAdminSurfaceAccess(roles: readonly Role[]): boolean {
  return roles.some((role) => ADMIN_SURFACE_ROLES.includes(role));
}

/**
 * Product Guide §4.5 assigns "user administration, permission management"
 * to Super Admin specifically — it is not in Game Master's §4.4 capability
 * list (missions, points, themes, notifications, chapter locks; nothing
 * about accounts or roles). So both creating new accounts and changing an
 * existing account's role/status are Super-Admin-only, not shared with
 * Game Master. Two distinct functions (not one shared check) so call sites
 * name the capability they actually need, even though today both resolve
 * to the same role set.
 */
const USER_ADMINISTRATION_ROLES: readonly Role[] = ["SUPER_ADMIN"];

export function canCreateEmployeeAccounts(roles: readonly Role[]): boolean {
  return roles.some((role) => USER_ADMINISTRATION_ROLES.includes(role));
}

export function canManageUserRoles(roles: readonly Role[]): boolean {
  return roles.some((role) => USER_ADMINISTRATION_ROLES.includes(role));
}

/**
 * Product Guide §4.5 lists "audit records" as a Super Admin capability
 * specifically (not shared with Game Master's §4.4 list). Same underlying
 * role set as user administration today, but named as its own function —
 * matching this file's existing pattern of one function per capability —
 * so it can diverge later without every call site needing to change.
 */
export function canViewAuditLog(roles: readonly Role[]): boolean {
  return roles.some((role) => USER_ADMINISTRATION_ROLES.includes(role));
}

/**
 * Product Guide §4.4: Game Master "Create and edit missions. Create and
 * schedule or launch missions... Lock/unlock chapters" — content
 * management (game days, missions, challenges — Phase 6) is Game
 * Master/Super Admin, not Moderator/Country Admin/Analytics Viewer.
 */
const CONTENT_MANAGEMENT_ROLES: readonly Role[] = ["GAME_MASTER", "SUPER_ADMIN"];

export function canManageContent(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §4.2: Moderator "Review photo/video/text evidence. Approve,
 * reject or request resubmission." Game Master/Super Admin can do
 * everything Moderator can, per §4.4/§4.5's broader scope.
 */
const SUBMISSION_MODERATION_ROLES: readonly Role[] = ["MODERATOR", "GAME_MASTER", "SUPER_ADMIN"];

export function canModerateSubmissions(roles: readonly Role[]): boolean {
  return roles.some((role) => SUBMISSION_MODERATION_ROLES.includes(role));
}

/**
 * Product Guide §4.4: Game Master "Award approved bonus points."
 */
export function canAwardBonusPoints(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §4.4: Game Master "Open/close voting."
 */
export function canManageVoting(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §17.3 lists "Pause Game" as a quick action without naming a
 * specific role — treated as campaign-wide content control, the same
 * capability that already governs missions/days, rather than inventing a
 * new role tier for one button.
 */
export function canControlGameState(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §4.4: Game Master "Send notifications."
 */
export function canSendNotifications(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §4.4: Game Master "Trigger Wally events" — docs/WALLY.md
 * §34's "Publishing to GLOBAL requires Game Master or Super Admin" confirms
 * the same role set, not a new tier.
 */
export function canTriggerWally(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}

/**
 * Product Guide §19.2: "Admin clicks Activate Theme" — filed under the
 * same Game Master content-control capability as missions/days/voting,
 * matching §4.4's "Change live themes" line in Game Master's own
 * capability list.
 */
export function canManageThemes(roles: readonly Role[]): boolean {
  return roles.some((role) => CONTENT_MANAGEMENT_ROLES.includes(role));
}
