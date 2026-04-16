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
