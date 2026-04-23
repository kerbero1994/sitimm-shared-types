/**
 * Events V2 — extras that arrived in mini-back v2.9.x (invitations, certificates,
 * ticket revocation audit, feedback list/moderation/reports, advanced analytics,
 * cross-event history).
 *
 * Backend versions:
 * - v2.9.7 / v2.9.12 — ticket revocation (Redis + SQL audit)
 * - v2.9.10 / v2.9.12 / v2.9.14 / v2.9.16 — feedback list, visibility, reports
 * - v2.9.11 — advanced analytics on /stats (includeAnalytics=true)
 * - v2.9.12 / v2.9.17 — email invitations + all-in-one redeem
 * - v2.9.13 — attendance certificates (PDF + JWT verify)
 * - v2.9.15 — cross-event attendance history
 */

import type {
  EventParticipantStatus,
  EventModality,
  EventFeedbackV2,
} from "./index";

// ============================================================
// Invitations (v2.9.12 + v2.9.17)
// ============================================================

/** Lifecycle status of an email invitation. */
export type InvitationStatus = "pending" | "used" | "revoked" | "expired";

/**
 * Email invitation issued by staff for a private / gated event.
 * Backend: `EventInvitation` ORM (app/infrastructure/database/models/additional_models.py)
 *          `event_invitations_v2.py` router.
 */
export interface EventInvitation {
  /** Invitation UUID. */
  uuid: string;
  /** Event UUID this invitation is for. */
  eventUuid: string;
  /** Invitee email address (lowercased server-side). */
  email: string;
  /** Lifecycle status. */
  status: InvitationStatus;
  /**
   * URL-safe random token. Only returned on creation; subsequent list/preview
   * responses return `null` — DB stores only SHA-256 hash.
   */
  token?: string | null;
  /** ISO-8601 expiry timestamp. */
  expiresAt: string;
  /** ISO-8601 redemption timestamp, or null. */
  usedAt: string | null;
  /** UserId that redeemed the invitation, or null. */
  usedByUserId: number | null;
  /** ISO-8601 revoke timestamp, or null. */
  revokedAt: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/**
 * Body for `POST /api/v2/events/{uuid}/invitations`.
 * Backend: batch-issue up to 500 invitations in one request.
 */
export interface CreateInvitationsRequest {
  /** 1..500 emails. */
  emails: string[];
  /** Days until expiry. Default 14, max 90. */
  expiresInDays?: number;
}

/** Response from batch invitation issue. */
export interface CreateInvitationsResponse {
  items: EventInvitation[];
  /** Count actually created (excludes skipped duplicates). */
  created: number;
  /** Count skipped (duplicate email with pending invitation). */
  skipped: number;
}

/** Response from `GET /api/v2/events/{uuid}/invitations`. */
export interface EventInvitationListResponse {
  items: EventInvitation[];
  total: number;
}

/** Body for `POST /api/v2/events/invitations/{token}/redeem`. */
export interface RedeemInvitationRequest {
  modality?: EventModality;
  campusId?: number | null;
  busStopId?: number | null;
  needTransport?: boolean;
}

// ============================================================
// Certificates (v2.9.13)
// ============================================================

/**
 * Response from `GET /api/v2/events/certificates/verify/{code}` — public endpoint.
 * JWT-backed, stateless: no DB row per certificate. Fields echoed from the token
 * payload so cert files can be verified even if the event is later deleted.
 */
export interface CertificateVerifyResponse {
  valid: boolean;
  eventUuid: string;
  participantUuid: string;
  eventTitle: string;
  eventDate: string;
  participantName: string;
  /** ISO-8601 issue timestamp (token `iat`). */
  issuedAt: string;
  /** ISO-8601 expiry timestamp (token `exp`, default 10-year TTL). */
  expiresAt: string;
}

// ============================================================
// Ticket revocation audit (v2.9.7 + v2.9.12)
// ============================================================

/**
 * Row in the revoked-ticket audit log.
 * Backend: `RevokedTicket` table (written alongside Redis blocklist).
 */
export interface RevokedTicketEntry {
  uuid: string;
  /** JWT `jti` claim of the revoked ticket. */
  jti: string;
  /** Event the ticket belongs to. */
  eventUuid: string;
  /** UserId that performed the revocation. */
  revokedBy: number;
  /** Optional reason string. */
  reason: string | null;
  /** True when Redis SETNX succeeded. */
  redisOk: boolean;
  /** True when the audit row was persisted. */
  sqlOk: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/**
 * Body for `POST /api/v2/events/{uuid}/tickets/revoke`.
 * Exactly one of `jti` or `token` is required.
 */
export interface RevokeTicketRequest {
  /** Preferred — the JWT `jti` claim. */
  jti?: string;
  /** Alternative — the full JWT token (decoded server-side to extract jti). */
  token?: string;
  /** Optional reason stored in the audit row. */
  reason?: string;
}

/** Response from a successful ticket revocation. */
export interface RevokeTicketResponse {
  jti: string;
  revoked: true;
  /** Whether Redis blocklist insert succeeded. */
  redisOk?: boolean;
  /** Whether the SQL audit row succeeded. */
  sqlOk?: boolean;
}

/** Response from `GET /api/v2/events/{uuid}/tickets/revoked`. */
export interface RevokedTicketListResponse {
  items: RevokedTicketEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

// ============================================================
// Feedback listing + moderation (v2.9.10 / v2.9.12)
// ============================================================

/**
 * Feedback list row — extends `EventFeedbackV2` with user display fields +
 * moderation flag. Backend: `GET /api/v2/events/{uuid}/feedback`.
 */
export interface FeedbackListItem extends EventFeedbackV2 {
  /** UserId that submitted the feedback (null for deleted user). */
  userId: number | null;
  /** First name denormalized from `UserProfile`. */
  firstName: string | null;
  /** Last names denormalized from `UserProfile`. */
  lastNames: string | null;
  /** Profile picture URL denormalized. */
  profilePicUrl: string | null;
  /** Moderator visibility flag. */
  isVisible: boolean;
}

/** Response from `GET /api/v2/events/{uuid}/feedback`. */
export interface FeedbackListResponse {
  items: FeedbackListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

// ============================================================
// Feedback abuse reports (v2.9.16)
// ============================================================

/** Moderation state of a feedback abuse report. */
export type FeedbackReportStatus = "pending" | "reviewed" | "dismissed";

/**
 * A flagged feedback entry. Backend: `FeedbackReport` table.
 * Partial-unique index blocks the same user from opening multiple pending
 * reports on the same feedback.
 */
export interface FeedbackReport {
  uuid: string;
  /** Feedback UUID that was reported. */
  feedbackUuid: string;
  /** Event UUID (denormalized for query convenience). */
  eventUuid: string;
  /** UserId that filed the report. */
  reportedBy: number;
  /** Free-text reason (4–500 chars). */
  reason: string;
  /** Current moderation state. */
  status: FeedbackReportStatus;
  /** UserId that resolved the report, or null. */
  resolvedBy: number | null;
  /** ISO-8601 resolve timestamp, or null. */
  resolvedAt: string | null;
  /** Optional moderator note attached at resolve time. */
  resolutionNote: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/** Response from `GET /api/v2/events/{uuid}/feedback/reports`. */
export interface FeedbackReportListResponse {
  items: FeedbackReport[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

/**
 * Body for `PATCH /api/v2/events/{uuid}/feedback/reports/{reportUuid}`.
 * Only terminal states (`reviewed`, `dismissed`) are writable — pending is
 * the initial state.
 */
export interface ResolveFeedbackReportRequest {
  status: Exclude<FeedbackReportStatus, "pending">;
  /** Optional moderator note, persisted alongside the resolve action. */
  resolutionNote?: string;
}

/** Body for `POST /api/v2/events/{uuid}/feedback/{feedbackUuid}/report`. */
export interface ReportFeedbackRequest {
  /** Reason text — 4 to 500 chars. */
  reason: string;
}

/** Response from a new abuse report. */
export interface ReportFeedbackResponse {
  reportUuid: string;
}

// ============================================================
// Advanced analytics on /stats (v2.9.11)
// ============================================================

/**
 * Additive analytics block returned on `GET /api/v2/events/{uuid}/stats`
 * when `includeAnalytics=true`. Backward-compatible: fields are optional —
 * when the flag is unset the caller gets the base `EventParticipantStats`.
 */
export interface EventAnalyticsBlock {
  /** Conversion fraction [0..1] — checked-in over eligible. */
  checkInRate?: number;
  /** Raw counters behind `checkInRate`. */
  checkInMetrics?: { checkedIn: number; eligible: number };
  /** Avg hours between `Event.createdAt` and first registration of each participant. */
  avgTimeToRegisterHours?: number | null;
  /** ISO-8601 timestamp of the first non-cancelled registration. */
  firstRegistrationAt?: string | null;
  /** Daily histogram of non-cancelled registrations. Date is ISO-8601 date only. */
  registrationHistogram?: Array<{ date: string; count: number }>;
}

// ============================================================
// Cross-event attendance history (v2.9.15)
// ============================================================

/**
 * One row in a user's historical attendance roll-up.
 * Backend: `GET /api/v2/event-participants/history/{userId}`.
 */
export interface EventHistoryItem {
  eventUuid: string;
  eventTitle: string;
  eventDate: string | null;
  eventPlace: string | null;
  participantUuid: string;
  status: EventParticipantStatus;
  modality: EventModality;
  /** ISO-8601 check-in timestamp, or null. */
  checkedInAt: string | null;
  /** ISO-8601 registration timestamp. */
  registeredAt: string;
  /** True when `checkedInAt != null`. */
  attended: boolean;
}

/** Response from the history endpoint. */
export interface EventHistoryResponse {
  userId: number;
  /** Ordered by `Event.eventDate DESC`, nulls last. Cancelled rows excluded. */
  items: EventHistoryItem[];
  /** Total count of returned items. */
  total: number;
  /** Subset of `total` that have `attended === true`. */
  attendedCount: number;
}
