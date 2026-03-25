/**
 * Consultation V2 types — state machine, messaging, bilateral close.
 *
 * Backend equivalents:
 * - ConsultationV2         -> app/presentation/schemas/consultation_v2.py :: ConsultationV2Response
 * - ConsultationMessageV2  -> consultation_v2.py :: MessageV2Response
 * - CloseProposalInfo      -> consultation_v2.py :: CloseProposalInfoV2
 * - CoAdvisorInfoV2        -> consultation_v2.py :: CoAdvisorInfoV2
 * - ConsultationTypeV2     -> consultation_v2.py :: ConsultationTypeV2Response
 * - ReportV2Response       -> consultation_report_v2.py :: ReportV2Response
 *
 * States: 1=Pending, 2=Resolving, 3=Closed, 4=CloseProposed, 5=Reopened
 *
 * Constants:
 * - MAX_MESSAGES          -> consultation_messages_v2.py :: MAX_MESSAGES
 * - MAX_REOPENS           -> consultation_helpers.py :: MAX_REOPENS
 * - CLOSE_PROPOSAL_TTL_HOURS -> consultation_helpers.py :: CLOSE_PROPOSAL_TTL_HOURS
 */

// -- Close Proposal --

/**
 * Active bilateral close proposal embedded in ConsultationV2.
 * Backend: consultation_v2.py :: CloseProposalInfoV2
 */
export interface CloseProposalInfo {
  /** ISO-8601 datetime when the advisor proposed closing. */
  proposed_at: string;
  /** ISO-8601 datetime when the proposal auto-expires (proposed_at + 72h). */
  expires_at: string;
  /** Proposed solution text written by the advisor. Max 4000 chars. */
  solution: string;
  /** How many times this consultation has been reopened so far. */
  reopen_count: number;
  /** Maximum allowed reopens (currently 3). */
  max_reopens: number;
}

// -- Co-Advisor Info --

/**
 * Co-advisor assigned to a consultation.
 * Backend: consultation_v2.py :: CoAdvisorInfoV2
 */
export interface CoAdvisorInfoV2 {
  /** Co-advisor user UUID. */
  uuid: string;
  /** Co-advisor full name. */
  name: string;
  /** ISO-8601 datetime when added. Null if unknown. */
  added_at: string | null;
}

// -- State Machine Constants --

/**
 * Numeric state IDs matching mini-back IntEnum.
 * Backend: consultation_messages_v2.py :: STATE_NEW / STATE_RESOLVIENDO / etc.
 *
 * Flow: PENDING(1) → RESOLVING(2) → CLOSE_PROPOSED(4) → CLOSED(3)
 *                                  ↑                    ↓ (rejected)
 *                                  └── REOPENED(5) ←────┘
 */
export const CONSULTATION_STATES = {
  /** 1 — Sin resolver. Initial state, no advisor assigned yet. */
  PENDING: 1,
  /** 2 — Resolviendo. Advisor took the consultation; chat is active. */
  RESOLVING: 2,
  /** 3 — Cerrada. Resolved (either confirmed by employee or auto-expired). */
  CLOSED: 3,
  /** 4 — Propuesta de cierre. Advisor proposed a solution; awaiting employee confirmation. */
  CLOSE_PROPOSED: 4,
  /** 5 — Reabierta. Employee rejected the close proposal; chat resumes. */
  REOPENED: 5,
} as const;

/**
 * Consultation limits — match mini-back constants.
 * Backend: consultation_helpers.py, consultation_messages_v2.py
 */
export const CONSULTATION_LIMITS = {
  /** Max messages per consultation thread. Backend: MAX_MESSAGES = 50. */
  MAX_MESSAGES: 50,
  /** Max times a consultation can be reopened after close proposal. Backend: MAX_REOPENS = 3. */
  MAX_REOPENS: 3,
  /** Hours before a close proposal auto-expires. Backend: CLOSE_PROPOSAL_TTL_HOURS = 72. */
  CLOSE_PROPOSAL_TTL_HOURS: 72,
} as const;

export type ConsultationStateId =
  (typeof CONSULTATION_STATES)[keyof typeof CONSULTATION_STATES];

// -- Consultation --

/**
 * Full consultation response from GET /api/v2/consultations/{uuid}.
 * Backend: consultation_v2.py :: ConsultationV2Response
 *
 * @example
 * ```json
 * {
 *   "uuid": "a1b2c3d4-...",
 *   "type_name": "Consulta General",
 *   "state_id": 2,
 *   "priority": "normal",
 *   "description": "Necesito información sobre...",
 *   "affiliate_name": "Juan Pérez",
 *   "advisor_name": "María López",
 *   "message_count": 5,
 *   "close_proposal": null,
 *   "reopen_count": 0
 * }
 * ```
 */
export interface ConsultationV2 {
  /** Consultation UUID. Primary identifier for all operations. */
  uuid: string;
  /** UUID of the ConsultationType (e.g., "Consulta General", "Reclamo"). */
  type_uuid: string;
  /** Human-readable type name. Comes from ConsultationType.content. */
  type_name: string;
  /** UUID of the current ConsultationState row. */
  state_uuid: string;
  /** Human-readable state name. Comes from ConsultationState.content. */
  state_name: string;
  /** Numeric state ID (1–5). Use CONSULTATION_STATES constants to compare. */
  state_id: number;
  /** Initial problem description written by the affiliate. 1–10,000 chars. */
  description: string;
  /** @deprecated Use escalation_level instead. Only "normal" or "high". */
  priority: "normal" | "high";
  /** Escalation level: 0=normal, 1=escalado, 2=urgente. Default: 0. */
  escalation_level: number;
  /** ISO-8601 datetime when escalated. Null if not escalated. */
  escalated_at: string | null;
  /** Name of the admin who escalated. Null if not escalated. */
  escalated_by_name: string | null;
  /** UUID of the employee/affiliate who created the consultation. */
  affiliate_uuid: string;
  /** Full name of the affiliate (name + lastNames). */
  affiliate_name: string;
  /** Affiliate phone number, or null if not provided. */
  affiliate_phone: string | null;
  /** Affiliate email address, or null if not provided. */
  affiliate_email: string | null;
  /** UUID of the assigned advisor, or null if still in PENDING state. */
  advisor_uuid: string | null;
  /** Full name of the assigned advisor, or null if unassigned. */
  advisor_name: string | null;
  /** Co-advisors assigned to this consultation. Null if none. */
  co_advisors: CoAdvisorInfoV2[] | null;
  /** UUID of the company associated with this consultation. */
  company_uuid: string | null;
  /** Name of the company associated with this consultation. */
  company_name: string | null;
  /** Solution text, set when the advisor solves or proposes close. Null until resolved. */
  solution: string | null;
  /** Employee rating 1–5. Null until rated. Validated: ge=1, le=5. */
  score: number | null;
  /** Employee feedback text accompanying the score. Max 2000 chars. */
  feedback: string | null;
  /** ISO-8601 datetime when the advisor took the consultation. Null if untaken. */
  taken_at: string | null;
  /** ISO-8601 datetime when the consultation was solved/closed. Null if open. */
  solved_at: string | null;
  /** ISO-8601 datetime when the consultation was created. */
  created_at: string;
  /** ISO-8601 datetime of the last update to this consultation. */
  updated_at: string;
  /** Total number of messages in the thread. Default: 0. */
  message_count: number;
  /** Preview of the last message body (truncated). Null if no messages. */
  last_message_preview: string | null;
  /** ISO-8601 datetime of the most recent message. Null if no messages. */
  last_message_at: string | null;
  /** Active close proposal, or null if no proposal is pending. */
  close_proposal: CloseProposalInfo | null;
  /** How many times this consultation has been reopened. Default: 0. Max: 3. */
  reopen_count: number;
  /** Whether this consultation has an active report/complaint. Default: false. */
  has_report: boolean;
}

// -- List --

/**
 * Request body for POST /api/v2/consultations (server-side filtered list).
 * Backend: consultation_v2.py :: ListConsultationsV2Request
 */
export interface ListConsultationsV2Request {
  /** Caller's role — determines which consultations are visible. */
  role: "advisor" | "affiliate" | "admin";
  /** Filter by state UUIDs. Omit or empty to return all states. */
  states?: string[];
  /** Filter by type UUIDs. Omit or empty to return all types. */
  types?: string[];
  /** @deprecated Use escalation_level instead. Only "high" supported; omit for all priorities. */
  priority?: "high";
  /** Filter by escalation level (0=normal, 1=escalado, 2=urgente). */
  escalation_level?: number;
  /** ISO-8601 date string. Only return consultations created after this date. */
  date_from?: string;
  /** ISO-8601 date string. Only return consultations created before this date. */
  date_to?: string;
  /** Filter by company UUID. Admin role only. */
  company_uuid?: string;
  /** Filter by advisor UUID. Admin role only. */
  advisor_uuid?: string;
  /** If true, only return unassigned consultations. Admin role only. */
  unassigned?: boolean;
  /** If true, only return consultations with active reports. Admin role only. */
  has_reports?: boolean;
  /** Page number (1-based). Default: 1. */
  page?: number;
  /** Items per page. Default: 20. Max: 100 (enforced by PAGINATION_DEFAULTS). */
  per_page?: number;
}

/**
 * Response from POST /api/v2/consultations.
 * Backend: consultation_v2.py :: ListConsultationsV2Response
 */
export interface ListConsultationsV2Response {
  /** Array of consultations matching the filters. */
  consultations: ConsultationV2[];
  /** Total count of matching consultations (for pagination). */
  total: number;
  /** Current page number. */
  page: number;
  /** Items per page used in this response. */
  per_page: number;
}

// -- Create --

/**
 * Request body for POST /api/v2/consultations/create.
 * Backend: consultation_v2.py :: CreateConsultationV2Request
 */
export interface CreateConsultationV2Request {
  /** UUID of the consultation type (from GET /consultations/types). Required. */
  type_uuid: string;
  /** Problem description. Min 1, max 10,000 chars. */
  description: string;
  /** Alternative creator name (for guest/non-registered users). */
  guest_name?: string;
  /** Alternative creator phone. */
  guest_phone?: string;
  /** Alternative creator email. */
  guest_email?: string;
  /** Company UUID to associate with. Optional for advisor-created consultations. */
  company_uuid?: string;
}

// -- Update (take / solve / rate) --

/**
 * Request body for PATCH /api/v2/consultations/{uuid}.
 * Backend: consultation_v2.py :: UpdateConsultationV2Request
 *
 * The `action` field determines which fields are required:
 * - `"take"` — No additional fields. Assigns the advisor.
 * - `"solve"` — `solution` required.
 * - `"rate"` — `score` required (1–5), `feedback` optional.
 */
export interface UpdateConsultationV2Request {
  /** Action to perform. Determines required fields. */
  action: "take" | "solve" | "rate";
  /** Solution text. Required when action="solve". */
  solution?: string;
  /** Rating score 1–5. Required when action="rate". Validated: ge=1, le=5. */
  score?: number;
  /** Optional feedback text. Max 2000 chars. Used with action="rate". */
  feedback?: string;
}

// -- Messages --

/**
 * Chat message types in the consultation thread.
 * - `"text"` — Regular user message (employee or advisor).
 * - `"system"` — Auto-generated system message (state change notifications).
 * - `"proposal"` — Close proposal message (created by propose-close action).
 * - `"confirmation"` — Close confirmation message (created by confirm-close).
 * - `"rejection"` — Close rejection message (created by reject-close).
 */
export type MessageType =
  | "text"
  | "system"
  | "proposal"
  | "confirmation"
  | "rejection";

/**
 * Single message in a consultation thread.
 * Backend: consultation_v2.py :: MessageV2Response
 */
export interface ConsultationMessageV2 {
  /** Message UUID. */
  uuid: string;
  /** Parent consultation UUID. */
  consultation_uuid: string;
  /** UUID of the message author. */
  author_uuid: string;
  /** Full name of the author. */
  author_name: string;
  /** Role of the author. "system" for auto-generated messages. */
  author_role: "employee" | "advisor" | "system";
  /** Message body text. */
  body: string;
  /** Message type — determines how the message is rendered in the UI. */
  message_type: MessageType;
  /** Internal note flag. If true, only advisors can see this message. Default: false. */
  is_internal: boolean;
  /** ISO-8601 datetime when the message was created. */
  created_at: string;
}

/**
 * Request params for GET /api/v2/consultations/{uuid}/messages.
 * Backend: query params on the GET endpoint.
 */
export interface ListMessagesV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Max number of messages to return. Default: 50. */
  limit?: number;
  /** Skip this many messages (for pagination). Default: 0. */
  offset?: number;
  /** Include internal (advisor-only) messages. Default: false. */
  include_internal?: boolean;
}

/**
 * Response from GET /api/v2/consultations/{uuid}/messages.
 * Backend: consultation_v2.py :: ListMessagesV2Response
 */
export interface ListMessagesV2Response {
  /** Array of messages, ordered by created_at ascending. */
  messages: ConsultationMessageV2[];
  /** Total number of messages in the thread. */
  total: number;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/send-message.
 * Backend: consultation_v2.py :: SendMessageV2Request
 */
export interface SendMessageV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Message text. Min 1, max 2,000 chars. */
  body: string;
  /** If true, only advisors can see this message. Default: false. */
  is_internal?: boolean;
}

// -- Bilateral Close --

/**
 * Request body for POST /api/v2/consultations/{uuid}/propose-close.
 * Advisor-only. Sets state to CLOSE_PROPOSED (4).
 * Backend: consultation_v2.py :: ProposeCloseV2Request
 */
export interface ProposeCloseV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Proposed solution text. Min 1, max 4,000 chars. */
  solution: string;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/confirm-close.
 * Employee-only. Confirms the close proposal → state = CLOSED (3).
 * Backend: consultation_v2.py :: ConfirmCloseV2Request
 */
export interface ConfirmCloseV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Optional rating 1–5. Validated: ge=1, le=5. */
  score?: number;
  /** Optional feedback text. Max 2,000 chars. */
  feedback?: string;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/reject-close.
 * Employee-only. Rejects the proposal → state = REOPENED (5).
 * Backend: consultation_v2.py :: RejectCloseV2Request
 */
export interface RejectCloseV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Optional rejection reason. Max 2,000 chars. */
  reason?: string;
}

// -- Rating --

/**
 * Request body for POST /api/v2/consultations/{uuid}/rate.
 * Employee-only. Available only in CLOSED (3) state when score is null.
 * Backend: consultation_v2.py :: RateV2Request
 */
export interface RateConsultationV2Request {
  /** Consultation UUID (path param). */
  consultation_uuid: string;
  /** Rating score. Required. Validated: ge=1, le=5. */
  score: number;
  /** Optional feedback text. Max 2,000 chars. */
  feedback?: string;
}

// -- Consultation Types --

/**
 * Consultation type catalog entry (e.g., "Consulta General", "Reclamo").
 * Backend: consultation_v2.py :: ConsultationTypeV2Response
 */
export interface ConsultationTypeV2 {
  /** Type UUID — use this when creating consultations. */
  uuid: string;
  /** Numeric type ID (legacy). */
  id: number;
  /** Type name/label (e.g., "Consulta General"). */
  content: string;
}

// -- Socket.IO Client State --

/**
 * Client-side connection status for the Socket.IO transport.
 * Used by socketService to track lifecycle.
 *
 * - `"disconnected"` — Not connected.
 * - `"connecting"` — Connection attempt in progress.
 * - `"connected"` — Active connection, ready to send/receive.
 * - `"reconnecting"` — Lost connection, auto-reconnect in progress.
 * - `"auth_failed"` — JWT rejected by server; requires re-login.
 */
export type SocketConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "auth_failed";

// -- Socket.IO Event Payloads (Server → Client) --
// Typed payloads for each server event. See socket-events for event names.

/**
 * Payload for SERVER_EVENTS.NEW_MESSAGE.
 * Broadcast when a message is sent or replayed on join_consultation.
 * Backend: socketio_app.py → emit("new_message", {...})
 *
 * @example
 * ```json
 * {
 *   "uuid": "msg-uuid-123",
 *   "consultation_uuid": "cons-uuid-456",
 *   "body": "Hola, necesito ayuda con...",
 *   "author_uuid": "user-uuid-789",
 *   "author_name": "Juan Pérez",
 *   "author_role": "employee",
 *   "message_type": "text",
 *   "is_internal": false,
 *   "created_at": "2026-03-24T10:30:00Z"
 * }
 * ```
 */
export interface WsNewMessagePayload {
  /** Message UUID. Null for replayed messages that haven't been persisted. */
  uuid: string | null;
  /** Consultation this message belongs to. */
  consultation_uuid: string;
  /** Message text content. */
  body: string;
  /** UUID of the message author. */
  author_uuid: string;
  /** Full name of the author. */
  author_name: string;
  /** Author role. "system" for auto-generated state-change messages. */
  author_role: "employee" | "advisor" | "system";
  /** Message type — determines rendering (see MessageType). */
  message_type: MessageType;
  /** If true, only advisors can see this message. */
  is_internal: boolean;
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

/**
 * Payload for SERVER_EVENTS.CONSULTATION_TAKEN.
 * Broadcast when an advisor takes a consultation (state 1→2).
 * Backend: consultation_messages_v2.py → emit("consultation_taken", {...})
 */
export interface WsConsultationTakenPayload {
  /** Consultation that was taken. */
  consultation_uuid: string;
  /** UUID of the advisor who took it. */
  advisor_uuid: string;
  /** Full name of the advisor. */
  advisor_name: string;
  /** ISO-8601 datetime when taken. */
  taken_at: string | null;
}

/**
 * Payload for SERVER_EVENTS.CLOSE_PROPOSED.
 * Broadcast when advisor proposes closing (state 2→4 or 5→4).
 * Backend: consultation_messages_v2.py → emit("close_proposed", {...})
 */
export interface WsCloseProposedPayload {
  /** Consultation UUID. */
  consultation_uuid: string;
  /** Solution text proposed by the advisor. Max 4000 chars. */
  proposed_solution: string;
  /** ISO-8601 datetime when proposed. */
  proposed_at: string | null;
}

/**
 * Payload for SERVER_EVENTS.CLOSE_CONFIRMED.
 * Broadcast when employee confirms closure (state 4→3).
 * Backend: consultation_messages_v2.py → emit("close_confirmed", {...})
 */
export interface WsCloseConfirmedPayload {
  /** Consultation UUID. */
  consultation_uuid: string;
  /** ISO-8601 datetime when closed. */
  closed_at: string | null;
  /** Optional score given by the employee (1–5). */
  score: number | null;
  /** Optional feedback text. */
  feedback: string | null;
}

/**
 * Payload for SERVER_EVENTS.CLOSE_REJECTED.
 * Broadcast when employee rejects close proposal (state 4→5).
 * Backend: consultation_messages_v2.py → emit("close_rejected", {...})
 */
export interface WsCloseRejectedPayload {
  /** Consultation UUID. */
  consultation_uuid: string;
  /** Employee's rejection reason. */
  reason: string;
  /** Updated reopen count after this rejection. */
  reopen_count: number;
}

/**
 * Payload for SERVER_EVENTS.CONSULTATION_RATED.
 * Broadcast when employee rates a closed consultation.
 * Backend: consultation_messages_v2.py → emit("consultation_rated", {...})
 */
export interface WsConsultationRatedPayload {
  /** Consultation UUID. */
  consultation_uuid: string;
  /** Rating score 1–5. */
  score: number;
  /** Optional feedback text. */
  feedback: string | null;
}

/**
 * Payload for SERVER_EVENTS.AUTO_EXPIRED.
 * Broadcast by Celery task when a close proposal expires after 72h.
 * Backend: consultation_tasks.py → external_emitter.emit("auto_expired", {...})
 */
export interface WsAutoExpiredPayload {
  /** Consultation UUID. */
  consultation_uuid: string;
  /** Always "auto_expired" — used to distinguish from normal closure. */
  closed_reason: "auto_expired";
}

/**
 * Payload for SERVER_EVENTS.PRESENCE.
 * Sent when a user joins or leaves a consultation room.
 * Backend: socketio_app.py → emit("presence", {user_id, status})
 *
 * Note: Uses user_id (number), NOT user_uuid (string).
 */
export interface WsPresencePayload {
  /** Numeric user ID from the User table (NOT uuid). */
  user_id: number;
  /** "online" when joining, "offline" when leaving. */
  status: "online" | "offline";
}

/**
 * Payload for SERVER_EVENTS.TYPING_START and TYPING_STOP.
 * Backend: socketio_app.py → emit("typing_start"/"typing_stop", {user_id, consultation_uuid})
 *
 * Note: Server uses skip_sid to avoid echoing back to the sender.
 */
export interface WsTypingPayload {
  /** Numeric user ID of the person typing (NOT uuid). */
  user_id: number;
  /** Consultation where the typing is happening. */
  consultation_uuid: string;
}

/**
 * Payload for SERVER_EVENTS.ACK.
 * Read receipt relay — broadcast when a user acknowledges a message.
 * Backend: socketio_app.py → emit("ack", {user_id, message_uuid, consultation_uuid})
 */
export interface WsAckPayload {
  /** Numeric user ID who read the message. */
  user_id: number;
  /** UUID of the acknowledged message. */
  message_uuid: string;
  /** Consultation the message belongs to. */
  consultation_uuid: string;
}

/**
 * Payload for SERVER_EVENTS.ERROR.
 * Sent when the server encounters an error processing a client event.
 * Backend: socketio_app.py → emit("error", {"message": "..."})
 *
 * Known error messages:
 * - "Authentication failed" — JWT invalid or expired.
 * - "Token revoked" — User was logged out server-side.
 * - "Not in consultation room" — Tried to send without joining first.
 */
export interface WsErrorPayload {
  /** Human-readable error description. Check for "Authentication failed" or "Token revoked" to detect auth errors. */
  message: string;
}

// -- Admin Actions --

/**
 * Request body for POST /api/v2/consultations/{uuid}/assign.
 * Admin-only. Assigns an advisor to a consultation.
 * Backend: consultation_v2.py :: AssignConsultationV2Request
 */
export interface AssignConsultationV2Request {
  /** UUID of the advisor to assign. */
  advisor_uuid: string;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/escalate.
 * Admin-only. Escalates a consultation's priority level.
 * Backend: consultation_v2.py :: EscalateConsultationV2Request
 */
export interface EscalateConsultationV2Request {
  /** Escalation level: 1=escalado, 2=urgente. */
  level: 1 | 2;
  /** Optional reason for escalation. Max 2000 chars. */
  reason?: string;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/transfer.
 * Admin-only. Transfers a consultation to another advisor.
 * Backend: consultation_v2.py :: TransferConsultationV2Request
 */
export interface TransferConsultationV2Request {
  /** UUID of the new advisor. */
  advisor_uuid: string;
  /** If true, previous advisor stays as co-advisor. Default: true. */
  keep_previous?: boolean;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/add-advisor.
 * Admin-only. Adds a co-advisor to a consultation.
 * Backend: consultation_v2.py :: AddCoAdvisorV2Request
 */
export interface AddCoAdvisorV2Request {
  /** UUID of the advisor to add as co-advisor. */
  advisor_uuid: string;
}

// -- Consultation Reports --

/** Report status. Backend: consultation_report_v2.py */
export type ReportStatus = "open" | "reviewed" | "resolved" | "dismissed";

/** Report type. Backend: consultation_report_v2.py */
export type ReportType = "report_advisor" | "report_employee";

/**
 * Consultation report response.
 * Backend: consultation_report_v2.py :: ReportV2Response
 */
export interface ReportV2Response {
  /** Report UUID. */
  uuid: string;
  /** UUID of the consultation being reported. */
  consultation_uuid: string;
  /** UUID of the user who filed the report. */
  reporter_uuid: string;
  /** Full name of the reporter. */
  reporter_name: string;
  /** UUID of the reported user. */
  reported_uuid: string;
  /** Full name of the reported user. */
  reported_name: string;
  /** Type of report. */
  report_type: ReportType;
  /** Report reason/description. 10–2000 chars. */
  reason: string;
  /** Current status of the report. */
  status: ReportStatus;
  /** Name of the admin who reviewed. Null if not yet reviewed. */
  reviewed_by_name: string | null;
  /** ISO-8601 datetime when reviewed. Null if not yet reviewed. */
  reviewed_at: string | null;
  /** Admin's resolution notes. Null if not resolved. Max 2000 chars. */
  resolution_notes: string | null;
  /** ISO-8601 datetime when the report was filed. */
  created_at: string;
}

/**
 * Request body for POST /api/v2/consultations/{uuid}/report.
 * Backend: consultation_report_v2.py :: CreateReportRequest
 */
export interface CreateReportRequest {
  /** Report reason. Min 10, max 2000 chars. */
  reason: string;
}

/**
 * Request params for GET /api/v2/consultations/reports.
 * Backend: consultation_report_v2.py :: ListReportsV2Request
 */
export interface ListReportsV2Request {
  /** Filter by report status. */
  status?: ReportStatus;
  /** Filter by report type. */
  report_type?: ReportType;
  /** Filter by company UUID. */
  company_uuid?: string;
  /** ISO-8601 date string. Reports created after this date. */
  date_from?: string;
  /** ISO-8601 date string. Reports created before this date. */
  date_to?: string;
  /** Page number (1-based). Default: 1. */
  page?: number;
  /** Items per page. Default: 20. Max: 100. */
  per_page?: number;
}

/**
 * Response from GET /api/v2/consultations/reports.
 * Backend: consultation_report_v2.py :: ListReportsV2Response
 */
export interface ListReportsV2Response {
  /** Array of reports matching filters. */
  reports: ReportV2Response[];
  /** Total count of matching reports. */
  total: number;
  /** Current page number. */
  page: number;
  /** Items per page. */
  per_page: number;
}

/**
 * Request body for PATCH /api/v2/consultations/reports/{uuid}.
 * Admin-only. Resolves or dismisses a report.
 * Backend: consultation_report_v2.py :: ResolveReportRequest
 */
export interface ResolveReportRequest {
  /** New status for the report. */
  status: "reviewed" | "resolved" | "dismissed";
  /** Optional resolution notes. Max 2000 chars. */
  resolution_notes?: string;
}
