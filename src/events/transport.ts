/**
 * Transport types for Events V2 — Wave 4, Phase 1.
 *
 * Backend: app/presentation/schemas/event_transport.py
 *          app/application/services/event_transport_service.py
 */

// ── Enums ──

/**
 * Transport mode for an event.
 * - `"none"` — No transport configured.
 * - `"manual"` — Stop whitelist only (no seat enforcement).
 * - `"capped"` — Capacity enforcement via atomic seat reservation.
 * - `"scheduled"` — Capped + pickup times + FCM reminders.
 * - `"live"` — Scheduled + boarding state machine + real-time outreach.
 */
export type TransportMode = "none" | "manual" | "capped" | "scheduled" | "live";

// ── Response Types ──

/**
 * A single bus stop configured for an event.
 * Backend: EventBusStopResponse (event_transport.py)
 */
export interface EventBusStopV2 {
  /** Bus stop event-link UUID. */
  uuid: string;
  /** Catalog bus stop ID. */
  busStopId: number;
  /** Bus stop display name from catalog. */
  busStopName: string | null;
  /** Bus stop address from catalog. Null if not set. */
  busStopAddress: string | null;
  /** Custom label for this stop on this event (e.g., "Zona Norte"). */
  label: string | null;
  /** Total seat capacity for this stop. Null in manual mode. */
  seatsTotal: number | null;
  /** Number of seats currently reserved. */
  seatsReserved: number;
  /** Remaining available seats. Null if seatsTotal is null. */
  seatsAvailable: number | null;
  /** Number of buses assigned to this stop. */
  busCount: number | null;
  /** ISO-8601 pickup datetime. */
  pickupTime: string | null;
  /** ISO-8601 return datetime. */
  returnTime: string | null;
  /** Admin notes for this stop. */
  notes: string | null;
  /** Ordering hint (0-based, ascending). */
  sortOrder: number;
  /** Whether this stop is closed to new reservations. */
  isClosed: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Full transport configuration for an event (admin view).
 * Backend: EventTransportListResponse (event_transport.py)
 * Embedded in EventDetailV2.transport.
 */
export interface EventTransportListV2 {
  /** Current transport mode for the event. */
  transportMode: TransportMode;
  /** If true, bus counts are auto-suggested based on demand. */
  transportAutoSize: boolean;
  /** If true, return trip seat tracking is enabled. */
  transportTrackReturn: boolean;
  /** Default seats per bus used for auto-suggest calculations. */
  seatsPerBus: number;
  /** Optional admin notes about transport logistics. */
  transportNotes: string | null;
  /** Configured bus stops for this event. */
  stops: EventBusStopV2[];
}

/**
 * User-facing minimal stop list for registration transport selection.
 * Backend: TransportAvailableResponse (event_transport.py)
 * Endpoint: GET /api/v2/events/{uuid}/transport/available
 */
export interface TransportAvailableV2 {
  /** Event UUID. */
  eventUuid: string;
  /** Current transport mode. */
  transportMode: TransportMode;
  /** Available (non-closed) stops for the user to choose from. */
  stops: Array<{
    uuid: string;
    busStopName: string | null;
    label: string | null;
    sortOrder: number;
  }>;
}

// ── Request Types ──

/**
 * Request body for POST /api/v2/events/{uuid}/transport/stops.
 * Backend: EventBusStopCreate (event_transport.py)
 */
export interface CreateEventBusStopRequest {
  /** Catalog bus stop ID. Required. */
  busStopId: number;
  /** Custom label for this stop. */
  label?: string | null;
  /** Total seat capacity. Required for capped/scheduled/live modes. */
  seatsTotal?: number | null;
  /** Number of buses assigned. */
  busCount?: number | null;
  /** ISO-8601 pickup datetime. Required for scheduled/live modes. */
  pickupTime?: string | null;
  /** ISO-8601 return datetime. */
  returnTime?: string | null;
  /** Admin notes. */
  notes?: string | null;
  /** Ordering hint (auto-assigned if omitted). */
  sortOrder?: number;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}/transport/stops/{stopUuid}.
 * Backend: EventBusStopUpdate (event_transport.py). All fields optional.
 */
export interface UpdateEventBusStopRequest {
  /** Custom label for this stop. */
  label?: string | null;
  /** Total seat capacity. */
  seatsTotal?: number | null;
  /** Number of buses assigned. */
  busCount?: number | null;
  /** ISO-8601 pickup datetime. */
  pickupTime?: string | null;
  /** ISO-8601 return datetime. */
  returnTime?: string | null;
  /** Admin notes. */
  notes?: string | null;
  /** Ordering hint. */
  sortOrder?: number;
  /** Close this stop to new reservations (existing reservations cleared). */
  isClosed?: boolean;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}/participants/{pUuid}/transport.
 * Backend: ParticipantTransportUpdate (event_transport.py)
 */
export interface UpdateParticipantTransportRequest {
  /** New bus stop catalog ID. */
  busStopId: number;
}
