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

// ============================================================
// Phase 2 — Capped + Scheduled
// ============================================================

/**
 * Participant transport edit request (switch to a different whitelisted stop).
 * PATCH /api/v2/event-participants/{participantUuid}/transport
 */
export interface ParticipantTransportEditRequest {
  busStopId: number;
}

export interface ParticipantTransportEditResponse {
  participantUuid: string;
  oldStopUuid: string | null;
  newStopUuid: string;
}

export interface ParticipantTransportReleaseResponse {
  released: boolean;
}

// Error codes emitted by capacity / mode transitions
export type TransportCapacityErrorCode =
  | "transport_stop_full"
  | "transport_stop_closed"
  | "transport_stop_not_whitelisted"
  | "transport_not_live_mode"
  | "stops_required_for_mode"
  | "stop_missing_seats_total"
  | "stop_missing_pickup_time"
  | "invalid_transport_mode";

// ============================================================
// Phase 3 — Live Tier
// ============================================================

/**
 * Boarding state machine values — column EventParticipantV2.boardingStatus.
 * NOTE: DB column is `boardingStatus`, not `transportStatus`.
 */
export type BoardingStatus =
  | "not_boarded"
  | "boarded_out"
  | "boarded_return"
  | "no_show_out"
  | "no_show_return";

export type BoardDirection = "out" | "return";
export type BoardAction = "boarded" | "no_show";

/**
 * POST /api/v2/events/{eventUuid}/transport/stops/{stopUuid}/board
 * Exactly one of participantUuid or ticket must be provided.
 */
export interface BoardActionRequest {
  participantUuid?: string;
  ticket?: string;
  direction: BoardDirection;
  action: BoardAction;
  force?: boolean;
}

export interface BoardedByInfo {
  userId: number;
  name: string | null;
}

export interface BoardResponse {
  participantUuid: string;
  boardingStatus: BoardingStatus;
  boardedOutAt: string | null;   // ISO 8601
  boardedOutBy: BoardedByInfo | null;
  boardedReturnAt: string | null;
  boardedReturnBy: BoardedByInfo | null;
  stopUuid: string;
  wasIdempotent?: boolean;
  warning?: "stop_mismatch";
  expectedStop?: string;
  actualStop?: string | null;
}

export interface BoardBulkRequest {
  actions: BoardActionRequest[];
}

export interface BoardBulkResultItem {
  status: "ok" | "error";
  data?: BoardResponse;
  code?: string;
  message?: string;
}

export interface BoardBulkResponse {
  results: BoardBulkResultItem[];
}

// Outreach
export type OutreachChannel = "push" | "email" | "call_logged";
export type OutreachTemplate =
  | "pickup_reminder"
  | "where_are_you"
  | "last_call"
  | "custom";

/**
 * POST /api/v2/events/{eventUuid}/transport/stops/{stopUuid}/outreach
 * Rate-limited: 1 per channel per participant per 180s.
 * If template=="custom", message is required (≤ 280 chars).
 */
export interface OutreachCreateRequest {
  participantUuid: string;
  channel: OutreachChannel;
  template: OutreachTemplate;
  message?: string | null;
}

export interface OutreachResponse {
  outreachUuid: string;
  channel: OutreachChannel;
  template: OutreachTemplate | null;
  sentAt: string;                 // ISO 8601
  delivered: boolean | null;      // null for call_logged (staff confirms manually)
  telUrl: string | null;          // populated only for call_logged
}

export interface OutreachHistoryItem {
  outreachUuid: string;
  participantUuid: string | null;
  channel: OutreachChannel;
  template: OutreachTemplate | null;
  sentAt: string;
  sentByUserId: number;
  delivered: boolean | null;
}

export interface OutreachListResponse {
  items: OutreachHistoryItem[];
}

// Error codes for outreach
export type OutreachErrorCode =
  | "invalid_channel"
  | "invalid_template"
  | "custom_message_invalid"
  | "outreach_rate_limited"
  | "participant_not_at_stop";

// Boarding counters (live mode only)
export interface TransportBoardingCounters {
  boardedOut: number;
  pending: number;
  noShowOut: number;
  boardedReturn: number;
  noShowReturn: number;
  total: number;
}

// Manifest
export interface ManifestRiderContact {
  phone: string | null;
  email: string | null;
}

export interface ManifestRider {
  participantUuid: string;
  userName: string | null;
  companyName: string | null;
  boardingStatus: BoardingStatus;
  boardedOutAt: string | null;
  boardedOutBy: BoardedByInfo | null;
  boardedReturnAt: string | null;
  boardedReturnBy: BoardedByInfo | null;
  contact?: ManifestRiderContact;   // Only when caller has events:transport_board
}

export interface ManifestStop {
  uuid: string;
  label: string | null;
  pickupTime: string | null;       // ISO 8601
  seatsTotal: number | null;
  counters: TransportBoardingCounters;
}

export interface ManifestEvent {
  uuid: string;
  title: string;
  eventDate: string | null;        // ISO 8601
}

export interface ManifestResponse {
  event: ManifestEvent;
  stop: ManifestStop;
  riders: ManifestRider[];
}

// Boarding state error codes
export type BoardingErrorCode =
  | "invalid_direction"
  | "invalid_action"
  | "transport_invalid_transition"
  | "transport_not_live_mode"
  | "transport_stop_closed"
  | "participant_not_found"
  | "stop_not_found"
  | "event_not_found"
  | "forbidden"
  | "ticket_decode_not_implemented"
  | "invalid_ticket";

// ============================================================
// Socket.IO — transport-phase WS events
// ============================================================

export interface WSTransportStopFull {
  stopUuid: string;
  stopLabel: string | null;
}

export interface WSTransportStopUpdated {
  stopUuid: string;
  seatsTotal: number | null;
  seatsReserved: number;
  seatsAvailable: number | null;
}

export interface WSTransportParticipantBoarded {
  stopUuid: string;
  participantUuid: string;
  boardingStatus: BoardingStatus;
  direction: BoardDirection;
  at: string;                      // ISO 8601
  by: BoardedByInfo;
}

export interface WSTransportOutreachSent {
  stopUuid: string;
  participantUuid: string;
  channel: OutreachChannel;
  template: OutreachTemplate | null;
  at: string;
  byUser: BoardedByInfo;
}

/** Emitted to user:{userId} room, NOT event:{eventUuid}. */
export interface WSTransportSeatReleased {
  eventUuid: string;
  stopUuid: string;
  reason: "admin_closed" | "admin_reduced" | "stop_deleted" | "mode_none";
}
