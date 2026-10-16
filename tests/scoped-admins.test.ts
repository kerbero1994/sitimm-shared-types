import { describe, expect, it } from "vitest";
import {
  STAFF_USER_TYPE_IDS,
  USER_TYPE_HIERARCHY,
  USER_TYPE_ORDER,
  UserType,
  ADMIN_LEVEL_IDS,
  hasAtLeast,
  isStaffUserType,
} from "../src/users";
import type {
  EventNotifyPreviewV2Response,
  EventNotifyV2Request,
  EventNotifyV2Response,
} from "../src/events";

describe("scoped admins (SITIMM-1316)", () => {
  it("has the backend ids at level 2, right after OFFICE", () => {
    expect(UserType.ADMIN_EVENTS).toBe(52719);
    expect(UserType.ADMIN_BONUSES).toBe(67384);
    expect(USER_TYPE_HIERARCHY[UserType.ADMIN_EVENTS]).toBe(2);
    expect(USER_TYPE_HIERARCHY[UserType.ADMIN_BONUSES]).toBe(2);
    const office = USER_TYPE_ORDER.indexOf(UserType.OFFICE);
    expect(USER_TYPE_ORDER.slice(office + 1, office + 3)).toEqual([
      UserType.ADMIN_EVENTS,
      UserType.ADMIN_BONUSES,
    ]);
  });

  it("is staff, but not advisor-level and not admin-level", () => {
    for (const ut of [UserType.ADMIN_EVENTS, UserType.ADMIN_BONUSES]) {
      expect(isStaffUserType(ut)).toBe(true);
      expect(STAFF_USER_TYPE_IDS).toContain(ut);
      expect(hasAtLeast(ut, UserType.ADVISOR)).toBe(false);
      expect(ADMIN_LEVEL_IDS.has(ut)).toBe(false);
    }
  });

  it("types the event notify contract", () => {
    const req: EventNotifyV2Request = { target: "audience", template: "announcement" };
    const res: EventNotifyV2Response = {
      target: "participants",
      template: "update",
      users: 3,
      queued: true,
      suppressed: false,
    };
    const preview: EventNotifyPreviewV2Response = { target: "audience", users: 0, cooldownUntil: null };
    expect([req.target, res.queued, preview.cooldownUntil]).toEqual(["audience", true, null]);
  });
});
