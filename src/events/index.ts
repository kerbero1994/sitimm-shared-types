/**
 * Event types — V2 events system.
 *
 * Backend: app/presentation/schemas/event_v2.py
 *
 * Covers: events CRUD, participant registration, event type catalog.
 */

// ── Shared Unions ──

/**
 * Attendance modality.
 * Backend: ParticipantRegisterV2.modality — validated with regex `^(presencial|virtual|mixto)$`.
 */
export type EventModality = "presencial" | "virtual" | "mixto";

/**
 * Participant status in an event.
 * - `"registered"` — Signed up, awaiting confirmation.
 * - `"confirmed"` — Attendance confirmed.
 * - `"cancelled"` — Registration cancelled.
 */
export type EventParticipantStatus = "registered" | "confirmed" | "cancelled";

// ── Event Types ──

/**
 * Event list-view response.
 * Backend: event_v2.py :: EventV2Response
 */
export interface EventV2 {
  /** Event UUID — primary identifier. */
  uuid: string;
  /** Event title. Max 500 chars. */
  title: string;
  /** ISO-8601 datetime of the event. Null if date not set. */
  eventDate: string | null;
  /** Short description. Max 2,000 chars. */
  description: string | null;
  /** Image URL (presigned S3 or relative path). Max 2,048 chars. */
  img: string | null;
  /** Physical location/venue. Max 500 chars. */
  place: string | null;
  /** Whether participant registration is enabled. Default: false. */
  register: boolean | null;
  /** Whether this is a private event (restricted audience). Default: false. */
  isPrivate: boolean | null;
  /** Whether transportation is offered. Default: false. */
  offersMobility: boolean | null;
  /** Whether the event is active/visible. Default: true. */
  enabled: boolean | null;
  /** Foreign key to EventType catalog. */
  EventTypeId: number | null;
  /** Total number of registered participants. Default: 0. */
  participantCount: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Event detail response — extends EventV2 with full content fields.
 * Backend: event_v2.py :: EventDetailV2Response
 */
export interface EventDetailV2 extends EventV2 {
  /** Rich HTML content. Max 100,000 chars. */
  content: string | null;
  /** Attached files (JSON blob). */
  files: unknown | null;
  /** Days before event to send announcement notification. */
  daysBeforeAnouncment: number | null;
  /** Virtual meeting URL (Zoom, Teams, etc.). */
  virtualUrl: unknown | null;
  /** Target audience configuration (JSON). */
  audience: unknown | null;
  /** Audience job titles filter (JSON). */
  audienceTitles: unknown | null;
}

/**
 * Paginated event list response.
 * Backend: event_v2.py :: EventListV2Response
 */
export interface EventListV2Response {
  /** Array of events for the current page. */
  items: EventV2[];
  /** Total number of events matching filters. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. Default: 20. Max: 100. */
  pageSize: number;
  /** Whether there are more pages after this one. */
  hasNext: boolean;
}

/**
 * Request body for POST /api/v2/events.
 * Backend: event_v2.py :: EventCreateV2
 */
export interface CreateEventV2Request {
  /** Event title. Required. Min 1, max 500 chars. */
  title: string;
  /** ISO-8601 event date. Required. */
  eventDate: string;
  /** Event type catalog ID. Required. */
  EventTypeId: number;
  /** Rich HTML content. Max 100,000 chars. */
  content?: string;
  /** Short description. Max 2,000 chars. */
  description?: string;
  /** Image URL. Max 2,048 chars. */
  img?: string;
  /** Venue/location. Max 500 chars. */
  place?: string;
  /** Attached files (JSON). */
  files?: unknown;
  /** Enable participant registration. Default: false. */
  register?: boolean;
  /** Private event flag. Default: false. */
  isPrivate?: boolean;
  /** Transport offered. Default: false. */
  offersMobility?: boolean;
  /** Active/visible flag. Default: true. */
  enabled?: boolean;
  /** Days before event for announcement. */
  daysBeforeAnouncment?: number;
  /** Virtual meeting URL. */
  virtualUrl?: unknown;
  /** Audience configuration (JSON). */
  audience?: unknown;
  /** Audience title filters (JSON). */
  audienceTitles?: unknown;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}. All fields optional (partial update).
 * Backend: event_v2.py :: EventUpdateV2
 */
export interface UpdateEventV2Request {
  /** Event title. Min 1, max 500 chars. */
  title?: string;
  /** ISO-8601 event date. */
  eventDate?: string;
  /** Event type catalog ID. */
  EventTypeId?: number;
  /** Rich HTML content. Max 100,000 chars. */
  content?: string;
  /** Short description. Max 2,000 chars. */
  description?: string;
  /** Image URL. Max 2,048 chars. */
  img?: string;
  /** Venue/location. Max 500 chars. */
  place?: string;
  /** Attached files (JSON). */
  files?: unknown;
  /** Enable participant registration. */
  register?: boolean;
  /** Private event flag. */
  isPrivate?: boolean;
  /** Transport offered. */
  offersMobility?: boolean;
  /** Active/visible flag. */
  enabled?: boolean;
  /** Days before event for announcement. */
  daysBeforeAnouncment?: number;
  /** Virtual meeting URL. */
  virtualUrl?: unknown;
  /** Audience configuration (JSON). */
  audience?: unknown;
  /** Audience title filters (JSON). */
  audienceTitles?: unknown;
}

// ── Participant Types ──

/**
 * Event participant record.
 * Backend: event_v2.py :: ParticipantV2Response
 */
export interface EventParticipantV2 {
  /** Participant UUID — primary identifier. */
  uuid: string;
  /** Event UUID this registration belongs to. */
  eventUuid: string;
  /** User UUID. Null for alternative (non-system-user) registrations. */
  userUuid: string | null;
  /** Participant name (from profile, or manually entered for alternatives). */
  name: string | null;
  /** Participant email. */
  email: string | null;
  /** Participant phone. */
  phone: string | null;
  /** Attendance modality: "presencial", "virtual", or "mixto". */
  modality: EventModality;
  /** Registration status: "registered", "confirmed", or "cancelled". */
  status: EventParticipantStatus;
  /** Whether this is an alternative (non-system-user) registration. Default: false. */
  isAlternative: boolean;
  /** Whether the participant needs transportation. Default: false. */
  needTransport: boolean;
  /** Campus catalog ID (for transport routing). */
  campusId: number | null;
  /** Bus stop catalog ID (for transport routing). */
  busStopId: number | null;
  /** Company ID the participant belongs to. */
  companyId: number | null;
  /** ISO-8601 datetime when attendance was confirmed. */
  confirmationDate: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Request body for POST /api/v2/event-participants?event_uuid={uuid}.
 * Backend: event_v2.py :: ParticipantRegisterV2
 */
export interface CreateParticipantV2Request {
  /** Attendance modality. Default: "presencial". Validated: "presencial"|"virtual"|"mixto". */
  modality?: EventModality;
  /** Campus catalog ID (for transport). */
  campusId?: number;
  /** Bus stop catalog ID (for transport). */
  busStopId?: number;
  /** Whether participant needs transportation. Default: false. */
  needTransport?: boolean;
  /** Alternative registration flag. Default: false. If true, name/email/phone are used. */
  isAlternative?: boolean;
  /** Name for alternative registration. */
  name?: string;
  /** Email for alternative registration. */
  email?: string;
  /** Phone for alternative registration. */
  phone?: string;
}

/**
 * Request body for PATCH /api/v2/event-participants/{uuid}.
 * Backend: event_v2.py :: ParticipantUpdateV2
 */
export interface UpdateParticipantV2Request {
  /** Attendance modality. */
  modality?: EventModality;
  /** Campus catalog ID. */
  campusId?: number;
  /** Bus stop catalog ID. */
  busStopId?: number;
  /** Transport need flag. */
  needTransport?: boolean;
}

/**
 * Request for DELETE /api/v2/event-participants/{uuid}.
 */
export interface DeleteParticipantV2Request {
  /** Participant UUID (path param). */
  uuid: string;
}

/**
 * Request for POST /api/v2/event-participants/{uuid}/confirm.
 */
export interface ConfirmParticipantV2Request {
  /** Participant UUID (path param). */
  uuid: string;
}

/**
 * Paginated participant list response.
 * Backend: event_v2.py :: ParticipantListV2Response
 */
export interface ParticipantListV2Response {
  /** Array of participants for the current page. */
  items: EventParticipantV2[];
  /** Total number of participants. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Whether there are more pages. */
  hasNext: boolean;
}

/**
 * Response from GET /api/v2/events/my-events.
 * Returns the current user's event registrations.
 */
export interface MyEventsV2Response {
  /** Array of participant records (user's registrations). */
  items: EventParticipantV2[];
  /** Total number of registrations. */
  total: number;
}

// ── Event Type Types ──

/**
 * Event type catalog entry.
 * Backend: event_v2.py :: EventTypeV2Response
 */
export interface EventTypeV2 {
  /** Numeric type ID. */
  id: number;
  /** Type name. Max 255 chars. */
  name: string | null;
  /** Background color or image URL. Max 500 chars. */
  background: string | null;
  /** Brief description. Max 500 chars. */
  brief: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Request body for POST /api/v2/event-types.
 * Backend: event_v2.py :: EventTypeCreateV2
 */
export interface CreateEventTypeV2Request {
  /** Type name. Required. Min 1, max 255 chars. */
  name: string;
  /** Background color/image. Required. Max 500 chars. */
  background: string;
  /** Brief description. Required. Max 500 chars. */
  brief: string;
}

/**
 * Request body for PATCH /api/v2/event-types/{id}.
 * Backend: event_v2.py :: EventTypeUpdateV2
 */
export interface UpdateEventTypeV2Request {
  /** Type name. Max 255 chars. */
  name?: string;
  /** Background color/image. Max 500 chars. */
  background?: string;
  /** Brief description. Max 500 chars. */
  brief?: string;
}
