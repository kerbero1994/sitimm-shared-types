/**
 * Event types — V2 events system.
 *
 * Backend: app/presentation/schemas/event_v2.py
 *
 * Covers: events CRUD, participant registration, event type catalog.
 */

import type { EventCampusV2, CreateEventCampusV2Request } from "../campuses";

// ── Shared Unions ──

/**
 * Attendance modality.
 * Backend: ParticipantRegisterV2.modality — validated with regex `^(presencial|virtual|mixto)$`.
 */
export type EventModality = "presencial" | "virtual" | "mixto";

/**
 * Participant status in an event.
 * - `"registered"` — Signed up, awaiting confirmation.
 * - `"confirmed"` — Attendance confirmed (or checked in).
 * - `"cancelled"` — Registration cancelled.
 * - `"waitlisted"` — On the waitlist; auto-promoted when capacity frees up.
 */
export type EventParticipantStatus =
  | "registered"
  | "confirmed"
  | "cancelled"
  | "waitlisted";

/**
 * Event media role.
 * - `"cover"` — Hero/cover image (max 1 per event).
 * - `"gallery"` — Additional gallery images (max 20 per event).
 */
export type EventMediaType = "cover" | "gallery";

/**
 * Streaming lifecycle state for an event.
 * - `"idle"` — No stream configured.
 * - `"scheduled"` — Stream set up but not yet live.
 * - `"live"` — Stream is currently broadcasting.
 * - `"ended"` — Stream has finished (VOD may still be available at streamingUrl).
 */
export type EventStreamingStatus = "idle" | "scheduled" | "live" | "ended";

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
  /** ISO-8601 end datetime of the event. Null = single-moment event ending at eventDate. */
  endDate?: string | null;
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
  /** EventType.name denormalized for list views. */
  eventTypeName: string | null;
  /** True if `virtualUrl` is set. Computed field. */
  hasVirtualUrl: boolean;
  /** Total number of registered participants. Default: 0. */
  participantCount: number;
  /** Maximum number of participants. Null = unlimited. */
  capacity: number | null;
  /** Whether waitlist is enabled once capacity is reached. Default: false. */
  waitlistEnabled: boolean;
  /** Number of participants currently waitlisted. Default: 0. */
  waitlistCount: number;
  /** Remaining seats (`max(0, capacity - participantCount)`). Null if capacity is null. */
  seatsRemaining: number | null;
  /** Venue latitude (WGS84). Null if not set. */
  latitude: number | null;
  /** Venue longitude (WGS84). Null if not set. */
  longitude: number | null;
  /** Structured address JSON blob (street, city, state, zip, country, etc.). */
  addressStructured: Record<string, unknown> | null;
  /** Accessibility metadata (wheelchair access, sign-language, captions, etc.). */
  accessibility: Record<string, unknown> | null;
  /** RFC 5545 RRULE for recurring events. Null for one-off events. */
  recurrenceRule: string | null;
  /** Parent event UUID when this is a recurrence instance. Null for parents/one-offs. */
  parentEventUuid: string | null;
  /** Streaming playback URL. Null if no stream configured. */
  streamingUrl: string | null;
  /** Streaming provider tag (e.g., "youtube", "cloudflare"). Null if no stream. */
  streamingProvider: string | null;
  /** Streaming lifecycle state. */
  streamingStatus: EventStreamingStatus | null;
  /** Public share URL for social/web sharing. Null if not computable. */
  shareUrl: string | null;
  /** App deep-link URL. Null if not computable. */
  deepLink: string | null;
  /** Days until event (floor of `eventDate - now` in days). Negative if in the past, null if eventDate is null. */
  daysUntilEvent: number | null;
  /** True if the caller can currently register (event.register=true, enabled, future, not cancelled). */
  canRegister: boolean;
  /** Caller's registration status on this event, or null if not registered. */
  myStatus: EventParticipantStatus | null;
  /** Caller's participant UUID on this event, or null. */
  myParticipantUuid: string | null;
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
  /** True if the caller has an active (non-cancelled) registration. */
  isRegistered: boolean;
  /** Participant stats breakdown (ADVISOR+ only; null for regular users). */
  participantStats: EventParticipantStats | null;
  /** Venue slots linked to this event. Empty array when none configured. */
  venues?: EventCampusV2[];
}

/**
 * Participant-count breakdown returned on event detail for staff.
 * Backend: computed field on EventDetailV2Response.participantStats.
 */
export interface EventParticipantStats {
  total: number;
  registered: number;
  confirmed: number;
  cancelled: number;
  waitlisted: number;
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
  /** ISO-8601 end datetime. Must be strictly after eventDate when provided. */
  endDate?: string | null;
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
  /** Maximum number of participants. Omit or null for unlimited. */
  capacity?: number | null;
  /** Enable waitlist when capacity is reached. Default: false. */
  waitlistEnabled?: boolean;
  /** Venue latitude (WGS84, -90..90). */
  latitude?: number;
  /** Venue longitude (WGS84, -180..180). */
  longitude?: number;
  /** Structured address JSON blob. */
  addressStructured?: Record<string, unknown>;
  /** Accessibility metadata blob. */
  accessibility?: Record<string, unknown>;
  /** RFC 5545 RRULE string for recurring events. */
  recurrenceRule?: string;
  /** Streaming playback URL. */
  streamingUrl?: string;
  /** Streaming provider tag. */
  streamingProvider?: string;
  /** Venue slots to create alongside the event. */
  venues?: CreateEventCampusV2Request[] | null;
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
  /** ISO-8601 end datetime. Must be strictly after eventDate when provided. */
  endDate?: string | null;
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
  /** Maximum number of participants. Null = unlimited. */
  capacity?: number | null;
  /** Enable waitlist when capacity is reached. */
  waitlistEnabled?: boolean;
  /** Venue latitude (WGS84). */
  latitude?: number;
  /** Venue longitude (WGS84). */
  longitude?: number;
  /** Structured address JSON blob. */
  addressStructured?: Record<string, unknown>;
  /** Accessibility metadata blob. */
  accessibility?: Record<string, unknown>;
  /** RFC 5545 RRULE string for recurring events. */
  recurrenceRule?: string;
  /** Streaming playback URL. */
  streamingUrl?: string;
  /** Streaming provider tag. */
  streamingProvider?: string;
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
  /** Human-readable status label (es-MX). E.g. "Confirmado", "Registrado", "Cancelado". */
  statusLabel: string | null;
  /** Whether this is an alternative (non-system-user) registration. Default: false. */
  isAlternative: boolean;
  /** Whether the participant needs transportation. Default: false. */
  needTransport: boolean;
  /** Campus catalog ID (for transport routing). */
  campusId: number | null;
  /** Bus stop catalog ID (for transport routing). */
  busStopId: number | null;
  /** Campus display name, denormalized. */
  campusName: string | null;
  /** Bus stop display name, denormalized. */
  busStopName: string | null;
  /** Company ID the participant belongs to. */
  companyId: number | null;
  /** Company display name, denormalized. */
  companyName: string | null;
  /** Full user name from UserProfile (null for alternatives). */
  userFullName: string | null;
  /** Profile picture URL. */
  avatarUrl: string | null;
  /** ISO-8601 datetime when attendance was confirmed. */
  confirmationDate: string | null;
  /** ISO-8601 datetime when the participant was checked in via QR ticket. */
  checkedInAt: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * A registration + embedded event data for the /my-events endpoint.
 * Backend: event_v2.py :: MyEventItemV2Response
 */
export interface MyEventItemV2 {
  // Participant fields
  uuid: string;
  status: EventParticipantStatus;
  statusLabel: string | null;
  modality: EventModality;
  isAlternative: boolean;
  needTransport: boolean;
  campusId: number | null;
  busStopId: number | null;
  campusName: string | null;
  busStopName: string | null;
  confirmationDate: string | null;
  registeredAt: string;

  // Event fields (enriched)
  eventUuid: string;
  eventTitle: string;
  eventDate: string | null;
  eventEndDate?: string | null;
  eventImg: string | null;
  eventDescription: string | null;
  eventPlace: string | null;
  eventEnabled: boolean | null;
  eventRegister: boolean | null;
  eventHasVirtualUrl: boolean;
  eventOffersMobility: boolean | null;
  eventTypeName: string | null;
  eventParticipantCount: number;
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
  /** Event campus slot ID (for event-specific venues). */
  eventCampusId?: number | null;
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
  /** Event campus slot ID (for event-specific venues). */
  eventCampusId?: number | null;
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
 * Returns the current user's event registrations, paginated.
 */
export interface MyEventsV2Response {
  /** Array of my-event records with enriched event data. */
  items: MyEventItemV2[];
  /** Total number of registrations. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Whether there are more pages. */
  hasNext: boolean;
}

/**
 * Request body for POST /api/v2/events/{uuid}/clone.
 * Backend: event_v2.py :: EventCloneV2
 */
export interface CloneEventV2Request {
  /** New event date. Optional — falls back to the source event's date if omitted. */
  eventDate?: string;
  /** Override title for the clone. Max 500 chars. */
  title?: string;
}

/**
 * Allowed bulk participant action verbs.
 */
export type BulkParticipantAction = "confirm" | "cancel";

/**
 * Request body for POST /api/v2/events/{uuid}/participants/bulk.
 * Backend: event_v2.py :: BulkParticipantActionV2
 */
export interface BulkParticipantActionV2Request {
  /** Action to perform on all listed participants. */
  action: BulkParticipantAction;
  /** Participant UUIDs to operate on. 1..200 items. */
  participantUuids: string[];
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
  /** Number of events currently using this type (computed). */
  eventCount: number;
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

// ── Media Types (Wave 2) ──

/**
 * Event media record (cover image or gallery item).
 * Backend: EventMedia ORM model + event_media_service.to_response()
 */
export interface EventMediaV2 {
  /** Media UUID. */
  uuid: string;
  /** Presigned or relative URL to the image. */
  url: string;
  /** Role: "cover" (max 1 per event) or "gallery". */
  mediaType: EventMediaType;
  /** Ordering hint within the gallery (max+1 on insert). */
  sortOrder: number;
  /** Image width in pixels (from PIL probe). */
  width: number | null;
  /** Image height in pixels. */
  height: number | null;
  /** File size in bytes. */
  sizeBytes: number | null;
  /** MIME type (image/jpeg, image/png, image/webp). */
  mimeType: string | null;
  /** Screen-reader alt text for accessibility (Wave 3.8). */
  altText: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * GET /api/v2/events/{uuid}/media response.
 */
export interface EventMediaListV2Response {
  /** All non-deleted media for the event, cover first (if any). */
  items: EventMediaV2[];
}

/**
 * Multipart form for POST /api/v2/events/{uuid}/media.
 * File is uploaded as `file` form field; `asCover` is a form bool.
 */
export interface UploadEventMediaV2Request {
  /** Image file — JPEG, PNG, or WebP, max 8 MB. */
  file: File;
  /** If true, promote this media to cover (demotes any existing cover). */
  asCover?: boolean;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}/media/{mediaUuid}.
 */
export interface UpdateEventMediaV2Request {
  /** New ordering hint. */
  sortOrder?: number;
  /** If true, promote this media to cover. */
  setAsCover?: boolean;
}

// ── Feedback Types (Wave 2) ──

/**
 * Post-event rating (1..5) + optional comment.
 * Backend: EventFeedback ORM + event_feedback_v2.py
 */
export interface EventFeedbackV2 {
  /** Feedback UUID. */
  uuid: string;
  /** Event UUID this feedback belongs to. */
  eventUuid: string;
  /** 1–5 star rating. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Free-text comment. Max 2,000 chars. */
  comment: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string | null;
}

/**
 * Request body for POST /api/v2/events/{uuid}/feedback.
 * One feedback per (event, user). Event must be in the past.
 */
export interface CreateFeedbackV2Request {
  /** 1–5 star rating. Required. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Optional free-text comment. Max 2,000 chars. */
  comment?: string;
}

/**
 * Aggregated feedback summary for an event (ADVISOR+ only).
 * Backend: EventFeedbackRepository.get_summary()
 */
export interface EventFeedbackSummaryV2 {
  /** Average rating (0.0 if no feedback yet). */
  average: number;
  /** Total number of feedback submissions. */
  total: number;
  /** Histogram keyed by rating ("1".."5") → count. */
  histogram: Record<"1" | "2" | "3" | "4" | "5", number>;
}

// ── Ticket / Check-in Types (Wave 2) ──

/**
 * Short-lived JWT ticket for event check-in.
 * Backend: event_ticket_service.issue_ticket()
 */
export interface EventTicketV2 {
  /** Signed JWT (HS256) to present at check-in. */
  token: string;
  /** ISO-8601 expiry. Clients should refresh before this. */
  expiresAt: string;
  /** Event UUID this ticket is for. */
  eventUuid: string;
  /** Participant UUID this ticket represents. */
  participantUuid: string;
}

/**
 * Request body for POST /api/v2/events/{uuid}/check-in.
 * Only events:update staff may call this.
 */
export interface CheckInV2Request {
  /** JWT ticket issued via GET /api/v2/events/{uuid}/my-ticket. */
  token: string;
}

// ── Sponsor Types (Wave 3.6) ──

/**
 * Sponsor shown on an event's landing page.
 * Backend: EventSponsor ORM model + event_sponsors_v2.py
 */
export interface EventSponsorV2 {
  /** Sponsor UUID. */
  uuid: string;
  /** Sponsor display name. Max 255 chars. */
  name: string;
  /** Sponsor logo URL. Max 2,048 chars. Null if no logo. */
  logoUrl: string | null;
  /** Sponsor website URL. Max 2,048 chars. Null if no link. */
  websiteUrl: string | null;
  /** Tier label (e.g., "gold", "silver"). Max 50 chars. Null if untiered. */
  tier: string | null;
  /** Ordering hint (0-based, ascending). */
  sortOrder: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string | null;
  /** ISO-8601 last update timestamp. */
  updatedAt: string | null;
}

/**
 * GET /api/v2/events/{uuid}/sponsors response.
 */
export interface EventSponsorListV2Response {
  items: EventSponsorV2[];
}

/**
 * Request body for POST /api/v2/events/{uuid}/sponsors.
 */
export interface CreateEventSponsorV2Request {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier?: string;
  sortOrder?: number;
}

/**
 * Request body for PATCH /api/v2/events/{uuid}/sponsors/{sponsorUuid}.
 */
export interface UpdateEventSponsorV2Request {
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier?: string;
  sortOrder?: number;
}

// ── Recurrence Types (Wave 3.2) ──

/**
 * Response from POST /api/v2/events/{uuid}/expand-recurrence?count=N.
 * Returns the UUIDs of newly created child events.
 */
export interface ExpandRecurrenceV2Response {
  /** Parent event UUID. */
  parentUuid: string;
  /** Number of child events created by this call. */
  createdCount: number;
  /** UUIDs of the newly created child events, in chronological order. */
  createdUuids: string[];
}

// ── Streaming Types (Wave 3.7) ──

/**
 * Webhook payload accepted at POST /api/v2/events/{uuid}/streaming/webhook.
 * Request body is HMAC-SHA256 signed with `STREAMING_WEBHOOK_SECRET` —
 * signature goes in the `X-Signature` header as a hex digest.
 */
export interface StreamingWebhookV2Request {
  /** New streaming lifecycle state. */
  status: EventStreamingStatus;
  /** Updated streaming URL (optional). */
  url?: string;
  /** Updated provider tag (optional). */
  provider?: string;
}
