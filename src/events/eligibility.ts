/**
 * Events V2 — Eligibility & Approval types.
 *
 * Backend: app/presentation/schemas/event_eligibility.py
 *
 * Covers: audience spec, guest policy, approval flow requests/responses,
 * Socket.IO event payloads for the approval lifecycle.
 */

// ── Audience configuration ──

/** Audience access mode for an event. */
export type AudienceMode =
  | "public"
  | "union_members"
  | "advisors_only"
  | "staff_only"
  | "custom";

/** Guest (alternative participant) registration policy when eligibility fails. */
export type GuestPolicy = "forbidden" | "require_approval" | "auto_accept";

/** How multiple AudienceRules are evaluated together. */
export type Combinator = "all" | "any";

/** Supported rule fields for audience targeting. */
export type RuleField =
  | "sex"
  | "companyId"
  | "userType"
  | "headquarterId"
  | "ageYears"
  | "affiliationYears";

/** Comparison operators for AudienceRule. */
export type RuleOp = "eq" | "neq" | "in" | "nin" | "gte" | "lte";

/** A single eligibility predicate. */
export interface AudienceRule {
  /** Field to evaluate on the requesting user. */
  field: RuleField;
  /** Comparison operator. List ops (`in`, `nin`) require an array value. */
  op: RuleOp;
  /** Scalar or list value to compare against. */
  value: string | number | Array<string | number>;
}

/** Full audience specification stored on Event.audience (JSONB). */
export interface AudienceSpec {
  /** Access mode. Default: `"public"`. */
  mode: AudienceMode;
  /** Rule combinator when mode is `"custom"`. Default: `"all"`. */
  combinator: Combinator;
  /** Rules — required (and non-empty) when mode is `"custom"`. */
  rules: AudienceRule[];
  /** Guest registration policy when the user fails eligibility. */
  guestPolicy: GuestPolicy;
  /** Custom denial message shown to ineligible users. Max 280 chars. Null = default message. */
  denialMessage: string | null;
}

// ── Approval flow — extended participant status ──

/**
 * Full participant status union including approval states.
 *
 * Use this in place of `EventParticipantStatus` when working with
 * events that have `guestPolicy = "require_approval"`.
 */
export type ParticipantStatusWithApproval =
  | "registered"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "declined"
  | "transport_waitlist"
  | "pending_approval"
  | "rejected";

// ── Approval flow — request / response bodies ──

/**
 * Body for POST .../approvals/{participantUuid}/approve
 * and POST .../approvals/{participantUuid}/reject.
 *
 * Backend: ApprovalAction (event_eligibility.py)
 */
export interface ApprovalActionRequest {
  /** Optional reviewer note. Max 280 chars. */
  note?: string | null;
}

/**
 * Single item in the pending approvals list.
 * Backend: GET /api/v2/events/{eventUuid}/approvals
 */
export interface PendingApprovalItem {
  /** Participant UUID. */
  participantUuid: string;
  /** User.id of the registrant. Null for alternative (non-system-user) registrations. */
  userId: number | null;
  /** Whether this is an alternative (guest) registration. */
  isAlternative: boolean;
  /** Participant display name. */
  name: string | null;
  /** Participant email. */
  email: string | null;
  /** ISO-8601 datetime when the registration was submitted. */
  createdAt: string | null;
}

/** Response from GET /api/v2/events/{eventUuid}/approvals. */
export interface PendingApprovalListResponse {
  pending: PendingApprovalItem[];
}

/** Response from POST .../approve or POST .../reject. */
export interface ApprovalActionResponse {
  /** Participant UUID affected. */
  participantUuid: string;
  /** New status after the decision (`"confirmed"` or `"rejected"`). */
  status: ParticipantStatusWithApproval;
}

// ── Socket.IO payloads ──

/**
 * Emitted on `event:approval_requested` to the event room
 * (`event:{eventUuid}`) when a guest registers and enters
 * `pending_approval` state.
 *
 * Recipients: admin / advisor clients watching the event room.
 */
export interface WSEventApprovalRequested {
  /** Event UUID — matches the room. */
  eventUuid: string;
  /** Participant UUID awaiting review. */
  participantUuid: string;
  /** User.id of the registrant. */
  userId: number | null;
  /** Event title for notification display. */
  eventTitle: string | null;
}

/**
 * Emitted on `event:approval_resolved` to the event room
 * (`event:{eventUuid}`) once a reviewer approves or rejects.
 *
 * Recipients: participant's client + admin dashboards.
 */
export interface WSEventApprovalResolved {
  /** Event UUID — matches the room. */
  eventUuid: string;
  /** Participant UUID whose status was changed. */
  participantUuid: string;
  /** Decision outcome. */
  outcome: "approved" | "rejected";
  /** User.id of the reviewer who made the decision. */
  reviewerId: number;
}
