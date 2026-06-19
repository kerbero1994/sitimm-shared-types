/**
 * Agenda module — Events V2 session/track/speaker types.
 *
 * Backend: app/presentation/schemas/event_agenda.py
 * Migration: i7j8k9l0m1n2_events_agenda_tables
 *
 * Covers: tracks, speakers, sessions, RSVP, staff check-in.
 *
 * @kerbero1994/shared-types@0.25.0
 */

// ── Unions ────────────────────────────────────────────────────────────

/** Session access mode. */
export type SessionMode = "open" | "rsvp" | "seated";

/** Participation status on a session. */
export type SessionRsvpStatus = "registered" | "checked_in" | "cancelled";

// ── Read models ───────────────────────────────────────────────────────

/**
 * Parallel-stream label that groups sessions visually.
 * Backend: EventTrackResponse
 */
export interface EventTrack {
  uuid: string;
  name: string;
  color: string | null;
  sortOrder: number;
}

/**
 * Descriptive speaker record (not a system User).
 * Backend: EventSpeakerResponse
 */
export interface EventSpeaker {
  uuid: string;
  name: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  externalUrl: string | null;
  sortOrder: number;
}

/**
 * Speaker as embedded inside a session — adds `role`.
 * Backend: EventSpeakerResponse (reused with role context in EventSessionResponse.speakers)
 */
export interface EventSessionSpeaker extends EventSpeaker {
  role: string | null;
}

/**
 * Single agenda session.
 * Backend: EventSessionResponse
 */
export interface EventSession {
  uuid: string;
  title: string;
  description: string | null;
  roomLabel: string | null;
  trackUuid: string | null;
  /** ISO 8601 UTC datetime. */
  startAt: string;
  /** ISO 8601 UTC datetime. */
  endAt: string;
  sessionMode: SessionMode;
  capacity: number | null;
  /** Count of active (registered + checked_in) participants. */
  reserved: number;
  /** null when capacity is null (uncapped). */
  available: number | null;
  sortOrder: number;
  /** ISO 8601 calendar date (YYYY-MM-DD) grouping this session under an agenda day. Null = ungrouped. */
  dayDate: string | null;
  speakers: EventSessionSpeaker[];
}

/**
 * Full agenda embedded on event detail (`?include=agenda`).
 * Backend: AgendaSummary
 */
export interface AgendaSummary {
  hasAgenda: boolean;
  totalSessions: number;
  tracks: EventTrack[];
  sessions: EventSession[];
  speakers: EventSpeaker[];
  /** Per-day grouping of the agenda (authored headers + days derived from sessions). */
  days: EventDayResponse[];
}

/**
 * A day entry in the agenda grouping (header-or-derived).
 * `uuid`/`title`/`description` are null for a derived-only day (sessions exist
 * on a date with no authored header). `dayNumber` is display-only (unstable).
 * Backend: EventDayResponse
 */
export interface EventDayResponse {
  /** Day-header UUID. Null for a derived-only day (no authored header). */
  uuid: string | null;
  /** ISO 8601 calendar date (YYYY-MM-DD). */
  date: string;
  /** Display-only 1-based rank within the agenda. Unstable — do not persist. */
  dayNumber: number;
  title: string | null;
  description: string | null;
}

/**
 * Single day-header row (POST/PATCH response). No `dayNumber` — that rank is an
 * agenda-view concern exposed only in AgendaSummary.days.
 * Backend: EventDayHeaderResponse
 */
export interface EventDayHeaderResponse {
  id: number;
  uuid: string;
  eventId: number;
  /** ISO 8601 calendar date (YYYY-MM-DD). */
  date: string;
  title: string | null;
  description: string | null;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string;
}

/**
 * Create a per-day header for an event agenda.
 * Backend: EventDayHeaderCreate
 */
export interface EventDayHeaderCreateRequest {
  /** ISO 8601 calendar date (YYYY-MM-DD). */
  date: string;
  /** Max 128 chars. */
  title?: string | null;
  description?: string | null;
}

/**
 * Partial update for a day header (PATCH). All fields optional; `title`/
 * `description` set explicitly to null CLEAR the stored value.
 * Backend: EventDayHeaderUpdate
 */
export interface EventDayHeaderUpdateRequest {
  /** ISO 8601 calendar date (YYYY-MM-DD). */
  date?: string;
  /** Max 128 chars. */
  title?: string | null;
  description?: string | null;
}

// ── Requests ─────────────────────────────────────────────────────────

/** POST /events/{uuid}/agenda/tracks */
export interface EventTrackCreateRequest {
  name: string;
  color?: string | null;
  sortOrder?: number;
}

/** PATCH /events/{uuid}/agenda/tracks/{trackUuid} */
export interface EventTrackUpdateRequest {
  name?: string | null;
  color?: string | null;
  sortOrder?: number | null;
}

/** POST /events/{uuid}/agenda/speakers */
export interface EventSpeakerCreateRequest {
  name: string;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  externalUrl?: string | null;
  sortOrder?: number;
}

/** PATCH /events/{uuid}/agenda/speakers/{speakerUuid} */
export interface EventSpeakerUpdateRequest {
  name?: string | null;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  externalUrl?: string | null;
  sortOrder?: number | null;
}

/** Speaker reference embedded in session create/update requests. */
export interface SessionSpeakerRef {
  speakerUuid: string;
  role?: string | null;
  sortOrder?: number;
}

/** POST /events/{uuid}/agenda/sessions */
export interface EventSessionCreateRequest {
  title: string;
  description?: string | null;
  roomLabel?: string | null;
  trackUuid?: string | null;
  /** ISO 8601 UTC datetime. */
  startAt: string;
  /** ISO 8601 UTC datetime. Must be strictly after startAt. */
  endAt: string;
  sessionMode: SessionMode;
  /** Required when sessionMode is "rsvp" or "seated". */
  capacity?: number | null;
  sortOrder?: number;
  speakers?: SessionSpeakerRef[];
}

/** PATCH /events/{uuid}/agenda/sessions/{sessionUuid} */
export interface EventSessionUpdateRequest {
  title?: string | null;
  description?: string | null;
  roomLabel?: string | null;
  trackUuid?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  sessionMode?: SessionMode | null;
  capacity?: number | null;
  sortOrder?: number | null;
  speakers?: SessionSpeakerRef[] | null;
}

// ── Staff check-in ────────────────────────────────────────────────────

/**
 * POST /events/{uuid}/agenda/sessions/{sessionUuid}/check-in
 *
 * Provide exactly one of: `participantUuid` (direct staff lookup) or
 * `participantId` (legacy numeric ID).
 * Ticket-based check-in (JWT) returns HTTP 501 — not yet implemented.
 */
export interface SessionCheckInRequest {
  participantUuid?: string;
  participantId?: number;
}

/** Response from check-in endpoint. */
export interface SessionCheckInResponse {
  sessionUuid: string;
  participantUuid: string;
  /** ISO 8601 timestamp of check-in, null if not yet recorded. */
  checkedInAt: string | null;
  checkedInBy: number;
  /** True when open-mode auto-created the RSVP row during check-in. */
  wasAutoRegistered: boolean;
}

// ── RSVP ──────────────────────────────────────────────────────────────

/**
 * Response from POST/DELETE /events/{uuid}/agenda/sessions/{sessionUuid}/rsvp.
 */
export interface SessionRsvpResponse {
  sessionUuid: string;
  rsvpStatus: SessionRsvpStatus;
}

// ── Error codes ───────────────────────────────────────────────────────

/**
 * Agenda-specific error codes returned in `{"code": "<value>"}` detail objects.
 */
export type AgendaErrorCode =
  | "session_not_found"
  | "session_outside_event_window"
  | "session_at_capacity"
  | "session_not_registered_for_event"
  | "session_rsvp_required"
  | "track_not_in_event"
  | "speaker_not_in_event"
  | "capacity_required_for_mode"
  | "participant_not_found"
  | "ticket_decode_not_implemented"
  | "event_not_found";
