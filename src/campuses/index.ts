/**
 * Campus types — V2 venues system.
 *
 * Backend: app/presentation/schemas/campus_v2.py
 *
 * Covers: campus catalog CRUD, event-campus venue slots.
 */

// ── Campus Catalog ──

/**
 * Seat access mode for an event venue slot.
 * - `"general"` — General admission; no assigned seating.
 * - `"reserved"` — Reserved seating blocks (specific sections held back).
 * - `"numbered"` — Individual numbered seats.
 */
export type AccessMode = "general" | "reserved" | "numbered";

/**
 * Campus catalog entry.
 * Backend: campus_v2.py :: CampusV2Response
 */
export interface CampusV2 {
  /** Campus UUID — primary identifier. */
  uuid: string;
  /** Campus display name. Max 255 chars. */
  name: string;
  /** Free-text address. Null if not set. */
  address: string | null;
  /** Total seated capacity of the campus. Null if unknown. */
  capacity: number | null;
  /** Latitude (WGS84). Null if not geolocated. */
  latitude: number | null;
  /** Longitude (WGS84). Null if not geolocated. */
  longitude: number | null;
  /** Structured address JSON blob (street, city, state, zip, country, etc.). */
  addressStructured: Record<string, unknown> | null;
  /** IANA timezone identifier (e.g. "America/Monterrey"). Default: "America/Monterrey". */
  timezone: string;
  /** Internal notes. Null if none. */
  notes: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Request body for POST /api/v2/campuses.
 * Backend: campus_v2.py :: CreateCampusV2
 */
export interface CreateCampusV2Request {
  /** Campus display name. Required. Min 1, max 255 chars. */
  name: string;
  /** Free-text address. */
  address?: string | null;
  /** Total seated capacity. */
  capacity?: number | null;
  /** Latitude (WGS84, -90..90). */
  latitude?: number | null;
  /** Longitude (WGS84, -180..180). */
  longitude?: number | null;
  /** Structured address JSON blob. */
  addressStructured?: Record<string, unknown> | null;
  /** IANA timezone. Default: "America/Monterrey". */
  timezone?: string;
  /** Internal notes. */
  notes?: string | null;
}

/**
 * Request body for PATCH /api/v2/campuses/{uuid}. All fields optional (partial update).
 * Backend: campus_v2.py :: UpdateCampusV2
 */
export interface UpdateCampusV2Request {
  /** Campus display name. Min 1, max 255 chars. */
  name?: string;
  /** Free-text address. */
  address?: string | null;
  /** Total seated capacity. */
  capacity?: number | null;
  /** Latitude (WGS84, -90..90). */
  latitude?: number | null;
  /** Longitude (WGS84, -180..180). */
  longitude?: number | null;
  /** Structured address JSON blob. */
  addressStructured?: Record<string, unknown> | null;
  /** IANA timezone. */
  timezone?: string;
  /** Internal notes. */
  notes?: string | null;
}

/**
 * Paginated campus list response.
 * Backend: campus_v2.py :: CampusListV2Response
 */
export interface CampusListV2Response {
  /** Array of campuses for the current page. */
  items: CampusV2[];
  /** Total number of campuses matching filters. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Whether there are more pages after this one. */
  hasNext: boolean;
}

// ── Event-Campus Venue Slots ──

/**
 * A venue slot linking an event to a specific campus with capacity and schedule details.
 * Backend: campus_v2.py :: EventCampusV2Response
 */
export interface EventCampusV2 {
  /** EventCampus UUID — primary identifier. */
  uuid: string;
  /** Campus catalog numeric ID. */
  campusId: number;
  /** Campus display name, denormalized. Null if campus not found. */
  campusName: string | null;
  /** Campus address, denormalized. Null if not set. */
  campusAddress: string | null;
  /** Optional sub-label for this slot (e.g., "Salón Norte"). Null if none. */
  label: string | null;
  /** Whether this is the primary venue for the event. Default: false. */
  isPrimary: boolean;
  /** Capacity allocated for this venue slot. Null = unlimited. */
  seatsTotal: number | null;
  /** Number of confirmed/reserved seats. Default: 0. */
  seatsReserved: number;
  /** Remaining seats (`max(0, seatsTotal - seatsReserved)`). Null if seatsTotal is null. */
  seatsAvailable: number | null;
  /** Seat access mode. */
  accessMode: AccessMode;
  /** ISO-8601 datetime when doors open. Null if not set. */
  doorsOpenAt: string | null;
  /** ISO-8601 datetime when reception/check-in begins. Null if not set. */
  receptionStartAt: string | null;
  /** ISO-8601 datetime when reception/check-in ends. Null if not set. */
  receptionEndAt: string | null;
  /** ISO-8601 datetime when doors close. Null if not set. */
  doorsCloseAt: string | null;
  /** Internal notes for this venue slot. Null if none. */
  notes: string | null;
  /** Ordering hint among venue slots for the event (ascending). Default: 0. */
  sortOrder: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Request body for POST /api/v2/events/{uuid}/campuses.
 * Backend: campus_v2.py :: CreateEventCampusV2
 */
export interface CreateEventCampusV2Request {
  /** Campus catalog numeric ID. Required. */
  campusId: number;
  /** Optional sub-label. */
  label?: string | null;
  /** Mark as primary venue. Default: false. */
  isPrimary?: boolean;
  /** Capacity for this slot. Null = unlimited. */
  seatsTotal?: number | null;
  /** Seat access mode. Default: "general". */
  accessMode?: AccessMode;
  /** ISO-8601 doors open time. */
  doorsOpenAt?: string | null;
  /** ISO-8601 reception start time. */
  receptionStartAt?: string | null;
  /** ISO-8601 reception end time. */
  receptionEndAt?: string | null;
  /** ISO-8601 doors close time. */
  doorsCloseAt?: string | null;
  /** Internal notes. */
  notes?: string | null;
  /** Ordering hint. Default: 0. */
  sortOrder?: number;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}/campuses/{campusUuid}. All fields optional.
 * Backend: campus_v2.py :: UpdateEventCampusV2
 */
export interface UpdateEventCampusV2Request {
  /** Optional sub-label. */
  label?: string | null;
  /** Mark as primary venue. */
  isPrimary?: boolean;
  /** Capacity for this slot. Null = unlimited. */
  seatsTotal?: number | null;
  /** Seat access mode. */
  accessMode?: AccessMode;
  /** ISO-8601 doors open time. */
  doorsOpenAt?: string | null;
  /** ISO-8601 reception start time. */
  receptionStartAt?: string | null;
  /** ISO-8601 reception end time. */
  receptionEndAt?: string | null;
  /** ISO-8601 doors close time. */
  doorsCloseAt?: string | null;
  /** Internal notes. */
  notes?: string | null;
  /** Ordering hint. */
  sortOrder?: number;
}
