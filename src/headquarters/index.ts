/**
 * Headquarters metrics types for the SITIMM ecosystem.
 *
 * Backend source: app/presentation/schemas/headquarter_metrics.py
 * Router: app/presentation/api/v2/headquarters_v2.py
 *
 * All response fields use snake_case (matching BE Pydantic field names, no aliases).
 */

// ---------------------------------------------------------------------------
// Real-time metrics
// ---------------------------------------------------------------------------

/** Real-time metrics summary for a single headquarter. */
export interface HQMetricsSummary {
  /** Headquarter UUID. */
  uuid: string;
  /** Headquarter display name. */
  name: string;
  /** City name (from City catalog). */
  city: string | null;
  /** Number of active advisors assigned to this HQ. */
  advisors: number;
  /** Number of distinct companies assigned via advisor assignments. */
  companies_assigned: number;
  /** Total employees in assigned companies. */
  employees_total: number;
  /** Currently open consultations (placeholder — hardcoded 0 in BE). */
  consultations_open: number;
  /** Consultations closed in last 30 days (placeholder). */
  consultations_closed_30d: number;
  /** Average response time in hours (null if no data). */
  avg_response_hours: number | null;
}

/** GET /headquarters/metrics → V2Response<AllHQMetricsResponse>. Admin+ only. */
export interface AllHQMetricsResponse {
  headquarters: HQMetricsSummary[];
}

// ---------------------------------------------------------------------------
// Historical snapshots
// ---------------------------------------------------------------------------

/** A single day's snapshot of headquarter metrics. */
export interface SnapshotEntry {
  /** Snapshot date (YYYY-MM-DD). */
  date: string;
  /** Advisor count on that date. */
  advisors: number;
  /** Company count on that date. */
  companies: number;
  /** Employee count on that date. */
  employees: number;
  /** Open consultations on that date. */
  open: number;
  /** Closed consultations on that date. */
  closed: number;
  /** Average response hours (null if no data). */
  avg_hours: number | null;
}

/** GET /headquarters/{hq_uuid}/metrics/history → V2Response<HQHistoryResponse>. Manager only. */
export interface HQHistoryResponse {
  /** Headquarter name. */
  headquarter: string;
  /** Daily snapshots within requested date range. */
  snapshots: SnapshotEntry[];
}
