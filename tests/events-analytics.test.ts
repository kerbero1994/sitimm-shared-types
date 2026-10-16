import { describe, expect, it } from "vitest";
import { V2_ENDPOINTS } from "../src/endpoints";
import type { EventAnalyticsQuery, EventAnalyticsV2Response } from "../src/events";

describe("analytics across events (SITIMM-1343)", () => {
  it("declares the endpoint under its own prefix", () => {
    expect(V2_ENDPOINTS.EVENT_ANALYTICS).toBe("/event-analytics");
  });

  it("types the query and the response", () => {
    const query: EventAnalyticsQuery = { from: "2026-07-18", groupBy: "venue", campusId: 4 };
    const res: EventAnalyticsV2Response = {
      from: "2026-07-18",
      to: "2026-10-15",
      groupBy: "venue",
      totals: {
        events: 2,
        registered: 3,
        attended: 2,
        noShow: 1,
        cancelled: 1,
        cancelledByEvent: 0,
        waitlisted: 1,
      },
      rows: [
        {
          key: "none",
          label: null,
          date: null,
          events: 1,
          registered: 1,
          attended: 0,
          noShow: 1,
          cancelled: 0,
          cancelledByEvent: 0,
          waitlisted: 0,
        },
      ],
    };
    expect([query.groupBy, res.rows[0].key, res.totals.noShow]).toEqual(["venue", "none", 1]);
  });
});
