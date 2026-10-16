import { describe, expect, it } from "vitest";
import { V2_ENDPOINTS } from "../src/endpoints";
import { V2_ENDPOINTS_GENERATED } from "../src/endpoints/v2_endpoints_generated";
import { EVENT_CHANGE_ACTIONS } from "../src/events";
import type { EventChangesParams, EventChangesV2Response } from "../src/events";

describe("readable event history (SITIMM-1345)", () => {
  it("declares the endpoint", () => {
    expect(V2_ENDPOINTS.EVENT_CHANGES).toBe("/events/{uuid}/changes");
    expect(V2_ENDPOINTS_GENERATED.events.LIST_EVENT_CHANGES("ev-1")).toBe(
      "/api/v2/events/ev-1/changes",
    );
  });

  it("lists every action the backend records", () => {
    expect(EVENT_CHANGE_ACTIONS).toEqual([
      "updated",
      "enabled",
      "disabled",
      "cancelled",
      "deleted",
      "cloned",
      "waitlist_promoted",
      "door_checkin",
      "notified",
      "participants_bulk",
      "participants_import",
    ]);
  });

  it("types the query and the response as the backend sends them", () => {
    const params: EventChangesParams = { uuid: "ev-1", pageSize: 100, action: "door_checkin" };
    const res: EventChangesV2Response = {
      items: [
        {
          uuid: "c-1",
          action: "updated",
          actor: { uuid: "u-1", name: "Ana López" },
          changes: [
            {
              field: "eventDate",
              before: "2026-11-20T16:00:00+00:00",
              after: "2026-11-21T16:00:00+00:00",
              opaque: false,
            },
            { field: "description", before: null, after: null, opaque: true },
          ],
          meta: {},
          participants: [],
          createdAt: "2026-10-16T23:33:13.323149Z",
        },
        {
          uuid: "c-2",
          action: "door_checkin",
          actor: null,
          changes: [],
          meta: { participantUuids: ["p-1"], registeredAtDoor: true },
          participants: [{ uuid: "p-1", name: "Juan Pérez" }],
          createdAt: "2026-10-16T23:33:13.323149Z",
        },
      ],
      actors: [{ uuid: "u-1", name: "Ana López" }],
      total: 2,
      page: 1,
      pageSize: 20,
      hasNext: false,
    };
    expect([params.action, res.items[1].participants[0].name, res.items[0].changes[1].opaque]).toEqual([
      "door_checkin",
      "Juan Pérez",
      true,
    ]);
  });
});
