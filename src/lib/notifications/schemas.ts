import { z } from "zod";

/**
 * Phase 12 admin notification composer (Product Guide §15). Audience
 * vocabulary matches `admin_notifications.audience_type` / `notifications`
 * exactly — GLOBAL/COUNTRY/ENTITY/PLAYER, no SQUAD, same disclosed gap as
 * `missions.audience_type` and `wally_events.audience_type` (squads don't
 * exist yet).
 *
 * CTA label/href are optional but must both be present or both absent —
 * a link with no label (or vice versa) is a malformed notification, not a
 * partially-valid one.
 */
export const composeNotificationSchema = z
  .object({
    audienceType: z.enum(["GLOBAL", "COUNTRY", "ENTITY", "PLAYER"]),
    countryId: z.string().uuid().optional().or(z.literal("")),
    entityId: z.string().uuid().optional().or(z.literal("")),
    playerEmail: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
    title: z.string().trim().min(1, "A title is required").max(120),
    message: z.string().trim().min(1, "A message is required").max(500),
    severity: z.enum(["INFO", "CELEBRATION", "URGENT"]),
    ctaLabel: z.string().trim().max(60).optional().or(z.literal("")),
    ctaHref: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine((data) => data.audienceType !== "COUNTRY" || Boolean(data.countryId), {
    message: "Select a country.",
    path: ["countryId"],
  })
  .refine((data) => data.audienceType !== "ENTITY" || Boolean(data.entityId), {
    message: "Select an entity.",
    path: ["entityId"],
  })
  .refine((data) => data.audienceType !== "PLAYER" || Boolean(data.playerEmail), {
    message: "Enter the player's email.",
    path: ["playerEmail"],
  })
  .refine((data) => Boolean(data.ctaLabel) === Boolean(data.ctaHref), {
    message: "Provide both a CTA label and link, or neither.",
    path: ["ctaHref"],
  });

export type ComposeNotificationInput = z.infer<typeof composeNotificationSchema>;
