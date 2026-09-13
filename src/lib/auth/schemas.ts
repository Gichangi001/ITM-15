import { z } from "zod";
import { ROLES } from "@/lib/auth/roles";

/**
 * Phase 2 (Product Guide §5) validation schemas. Kept separate from the
 * server actions that use them so they can be unit-tested without touching
 * Supabase.
 */

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Product Guide §5.3: "Minimum 10 characters... Disallow exact reuse of
 * Walumo." Deliberately does NOT pile on composition rules ("must contain a
 * symbol", etc.) beyond length — the spec explicitly says not to add
 * frustrating rules "solely for appearance."
 */
export const changePasswordSchema = z
  .object({
    password: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password !== "Walumo", {
    message: "Choose a password other than the temporary one",
    path: ["password"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * A form field that might be absent from the submitted FormData entirely
 * (in which case `FormData.get()` returns `null`, not `undefined` or `""`),
 * present but empty (`""`, e.g. an untouched optional text input or a
 * "Not set" <select> option), or a real value. Normalizes all three "no
 * value" shapes to `undefined` before the real validator runs, so callers
 * building input objects straight from `formData.get(...)` don't each need
 * to remember which of the three shapes their particular field can take.
 */
function optionalFormField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    schema.optional(),
  );
}

/**
 * Product Guide §5.1 / §28.1 admin "Add Player" form. Country/entity/role
 * all optional-with-defaults at creation time — country becomes required
 * later, at onboarding (§5.4), not at admin-creation time.
 */
export const createEmployeeSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  fullName: optionalFormField(z.string().trim().min(1)),
  countryId: optionalFormField(z.string().uuid()),
  entityId: optionalFormField(z.string().uuid()),
  role: z.enum(ROLES).default("PLAYER"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Super-Admin-only "change an existing user's role/status" action (Product
 * Guide §4.5 "user administration, permission management"; §27
 * `/admin/players`). One combined schema since the admin page edits both
 * fields from a single per-row form.
 */
export const updateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Product Guide §5.4 (Player onboarding). "The minimum required game
 * identity is exactly: name, email, country" — email is already known from
 * Auth and never re-collected here. Entity is "recommended," not required,
 * matching the spec's own wording.
 */
export const onboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Your name is required"),
  countryId: z.string().trim().min(1, "Select your country").uuid("Select your country"),
  entityId: optionalFormField(z.string().uuid()),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
