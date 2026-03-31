/**
 * Headquarters types for the SITIMM ecosystem.
 *
 * Backend source:
 *   - app/presentation/schemas/headquarter.py (CRUD schemas)
 *   - app/presentation/schemas/headquarter_metrics.py (metrics schemas)
 * Router: app/presentation/api/v2/headquarters_v2.py
 *
 * All response fields use snake_case (matching BE Pydantic field names, no aliases).
 */

// ---------------------------------------------------------------------------
// CRUD — Request schemas
// ---------------------------------------------------------------------------

/** POST /headquarters — create a new headquarter. Admin+ only. */
export interface CreateHeadquarterRequest {
  /** Headquarter name (1–255 chars). */
  name: string;
  /** Street address (1–255 chars). */
  address: string;
  /** Suburb / neighborhood (optional, max 255 chars). */
  suburb?: string | null;
  /** City catalog ID. */
  CityId: number;
  /** State catalog ID. */
  StateId: number;
  /** Latitude for geo-reference (-90 to 90). */
  latitude?: number | null;
  /** Longitude for geo-reference (-180 to 180). */
  longitude?: number | null;
  /** Venue capacity in persons (> 0). */
  capacity?: number | null;
}

/** PATCH /headquarters/{uuid} — update a headquarter. Admin+ only. All fields optional. */
export interface UpdateHeadquarterRequest {
  name?: string | null;
  address?: string | null;
  suburb?: string | null;
  CityId?: number | null;
  StateId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number | null;
}

// ---------------------------------------------------------------------------
// CRUD — Response schemas
// ---------------------------------------------------------------------------

/**
 * Single headquarter detail.
 * Backend: HeadquarterDetailV2 (app/presentation/schemas/headquarter.py)
 */
export interface HeadquarterDetail {
  /** Headquarter UUID. */
  uuid: string;
  /** Display name. */
  name: string;
  /** Street address. */
  address: string | null;
  /** Suburb / neighborhood. */
  suburb: string | null;
  /** Resolved city name from City catalog. */
  city_name: string | null;
  /** Resolved state name from State catalog. */
  state_name: string | null;
  /** Latitude for geo-reference. */
  latitude: number | null;
  /** Longitude for geo-reference. */
  longitude: number | null;
  /** Venue capacity in persons. */
  capacity: number | null;
  /** Non-advisor staff assigned to this HQ. */
  staff_count: number;
  /** ISO datetime when created. */
  created_at: string | null;
}

/** GET /headquarters — list response. */
export interface HeadquarterListResponse {
  headquarters: HeadquarterDetail[];
  total: number;
}

// ---------------------------------------------------------------------------
// Real-time metrics
// ---------------------------------------------------------------------------

/**
 * Real-time metrics summary for a single headquarter.
 * Backend: HQMetricsSummary (app/presentation/schemas/headquarter_metrics.py)
 */
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
  /** Non-advisor staff assigned to this HQ (userType != ADVISOR). */
  staff_count: number;
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

/**
 * A single day's snapshot of headquarter metrics.
 * Backend: SnapshotEntry (app/presentation/schemas/headquarter_metrics.py)
 */
export interface SnapshotEntry {
  /** Snapshot date (YYYY-MM-DD). */
  date: string;
  /** Advisor count on that date. */
  advisors: number;
  /** Staff count on that date (non-advisor users). */
  staff: number;
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
