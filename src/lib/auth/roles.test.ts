import { describe, expect, it } from "vitest";
import {
  canCreateEmployeeAccounts,
  canManageUserRoles,
  hasAdminSurfaceAccess,
} from "./roles";

describe("hasAdminSurfaceAccess", () => {
  it("denies a PLAYER-only role list", () => {
    expect(hasAdminSurfaceAccess(["PLAYER"])).toBe(false);
  });

  it("denies an empty role list", () => {
    expect(hasAdminSurfaceAccess([])).toBe(false);
  });

  it("allows any recognized admin-surface role", () => {
    expect(hasAdminSurfaceAccess(["MODERATOR"])).toBe(true);
    expect(hasAdminSurfaceAccess(["COUNTRY_ADMIN"])).toBe(true);
    expect(hasAdminSurfaceAccess(["GAME_MASTER"])).toBe(true);
    expect(hasAdminSurfaceAccess(["SUPER_ADMIN"])).toBe(true);
    expect(hasAdminSurfaceAccess(["ANALYTICS_VIEWER"])).toBe(true);
  });

  it("allows a user holding both PLAYER and an admin-surface role", () => {
    expect(hasAdminSurfaceAccess(["PLAYER", "MODERATOR"])).toBe(true);
  });
});

describe("canCreateEmployeeAccounts", () => {
  it("denies every role except SUPER_ADMIN, including GAME_MASTER (Product Guide §4.5 vs §4.4)", () => {
    expect(canCreateEmployeeAccounts(["PLAYER"])).toBe(false);
    expect(canCreateEmployeeAccounts(["MODERATOR"])).toBe(false);
    expect(canCreateEmployeeAccounts(["COUNTRY_ADMIN"])).toBe(false);
    expect(canCreateEmployeeAccounts(["ANALYTICS_VIEWER"])).toBe(false);
    expect(canCreateEmployeeAccounts(["GAME_MASTER"])).toBe(false);
  });

  it("allows SUPER_ADMIN", () => {
    expect(canCreateEmployeeAccounts(["SUPER_ADMIN"])).toBe(true);
  });

  it("denies an empty role list", () => {
    expect(canCreateEmployeeAccounts([])).toBe(false);
  });
});

describe("canManageUserRoles", () => {
  it("denies every role except SUPER_ADMIN", () => {
    expect(canManageUserRoles(["PLAYER"])).toBe(false);
    expect(canManageUserRoles(["GAME_MASTER"])).toBe(false);
    expect(canManageUserRoles(["MODERATOR"])).toBe(false);
  });

  it("allows SUPER_ADMIN", () => {
    expect(canManageUserRoles(["SUPER_ADMIN"])).toBe(true);
  });

  it("denies an empty role list", () => {
    expect(canManageUserRoles([])).toBe(false);
  });
});
