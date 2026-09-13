import { describe, expect, it } from "vitest";
import {
  canAwardBonusPoints,
  canCreateEmployeeAccounts,
  canManageContent,
  canManageUserRoles,
  canManageVoting,
  canModerateSubmissions,
  canTriggerWally,
  canViewAuditLog,
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

describe("canViewAuditLog", () => {
  it("denies every role except SUPER_ADMIN", () => {
    expect(canViewAuditLog(["PLAYER"])).toBe(false);
    expect(canViewAuditLog(["GAME_MASTER"])).toBe(false);
    expect(canViewAuditLog(["MODERATOR"])).toBe(false);
  });

  it("allows SUPER_ADMIN", () => {
    expect(canViewAuditLog(["SUPER_ADMIN"])).toBe(true);
  });
});

describe("canManageContent", () => {
  it("allows GAME_MASTER and SUPER_ADMIN (Product Guide §4.4)", () => {
    expect(canManageContent(["GAME_MASTER"])).toBe(true);
    expect(canManageContent(["SUPER_ADMIN"])).toBe(true);
  });

  it("denies PLAYER, MODERATOR, COUNTRY_ADMIN, ANALYTICS_VIEWER", () => {
    expect(canManageContent(["PLAYER"])).toBe(false);
    expect(canManageContent(["MODERATOR"])).toBe(false);
    expect(canManageContent(["COUNTRY_ADMIN"])).toBe(false);
    expect(canManageContent(["ANALYTICS_VIEWER"])).toBe(false);
  });
});

describe("canModerateSubmissions", () => {
  it("allows MODERATOR, GAME_MASTER and SUPER_ADMIN (Product Guide §4.2/§4.4)", () => {
    expect(canModerateSubmissions(["MODERATOR"])).toBe(true);
    expect(canModerateSubmissions(["GAME_MASTER"])).toBe(true);
    expect(canModerateSubmissions(["SUPER_ADMIN"])).toBe(true);
  });

  it("denies PLAYER, COUNTRY_ADMIN, ANALYTICS_VIEWER", () => {
    expect(canModerateSubmissions(["PLAYER"])).toBe(false);
    expect(canModerateSubmissions(["COUNTRY_ADMIN"])).toBe(false);
    expect(canModerateSubmissions(["ANALYTICS_VIEWER"])).toBe(false);
  });
});

describe("canAwardBonusPoints", () => {
  it("allows GAME_MASTER and SUPER_ADMIN, denies MODERATOR", () => {
    expect(canAwardBonusPoints(["GAME_MASTER"])).toBe(true);
    expect(canAwardBonusPoints(["SUPER_ADMIN"])).toBe(true);
    expect(canAwardBonusPoints(["MODERATOR"])).toBe(false);
  });
});

describe("canManageVoting", () => {
  it("allows GAME_MASTER and SUPER_ADMIN, denies MODERATOR", () => {
    expect(canManageVoting(["GAME_MASTER"])).toBe(true);
    expect(canManageVoting(["SUPER_ADMIN"])).toBe(true);
    expect(canManageVoting(["MODERATOR"])).toBe(false);
  });
});

describe("canTriggerWally", () => {
  it("allows GAME_MASTER and SUPER_ADMIN, denies MODERATOR", () => {
    expect(canTriggerWally(["GAME_MASTER"])).toBe(true);
    expect(canTriggerWally(["SUPER_ADMIN"])).toBe(true);
    expect(canTriggerWally(["MODERATOR"])).toBe(false);
  });
});
