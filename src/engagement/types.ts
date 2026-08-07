/**
 * Engagement subsystem types — comments, reactions, bookmarks, views,
 * shares, suspensions, profanity wordlist, webhooks, notification
 * preferences, and admin analytics.
 *
 * Backend: `app/engagement/presentation/schemas/*` and
 * `app/engagement/domain/models.py` (mini-back).
 *
 * The engagement subsystem is a bounded context decoupled from any single
 * feature: blog posts, magazines, events, consultations, and bulletins
 * register a `subject_type` via `subject_registry` and call
 * `make_engagement_router(subject_type, base_prefix)` to mount the full
 * surface under their own URL space (see `ENGAGEMENT_ENDPOINTS` for the
 * generic placeholders + the per-feature concrete paths).
 *
 * Wire conventions:
 * - Pydantic schemas use snake_case — TS interfaces mirror that exactly
 *   (no automatic camelCase conversion).
 * - Nullable fields are mapped to `T | null` (not optional `?`) when the
 *   backend `Field` is `T | None` without a default; optional fields with
 *   defaults use `?`.
 * - `*_at` / `*At` timestamp fields are ISO 8601 UTC strings.
 * - UUIDs are strings (UUID v4).
 * - All response envelopes set `extra="forbid"` so unknown wire fields
 *   surface as 422s in dev.
 */

// ─────────────────────────────────────────────────────────────────────
// Enums + constants
// ─────────────────────────────────────────────────────────────────────

/**
 * Subject types currently registered with the engagement subsystem.
 * Backend: `SUBJECT_TYPES` in `app/engagement/domain/enums.py`.
 *
 * Live (a router is mounted): `blog_post`, `magazine`, `event`,
 * `gallery`, `media`. Reserved (declared, no router yet):
 * `consultation`, `bulletin`. Frontends should treat the union as open
 * and fall back to "unknown subject type" gracefully.
 *
 * `gallery` and `media` are deliberately separate: a gallery and a
 * single photo are commented on independently (SITIMM-575).
 */
export const ENGAGEMENT_SUBJECT_TYPES = [
  "blog_post",
  "magazine",
  "event",
  "consultation",
  "bulletin",
  "gallery",
  "media",
] as const;
export type EngagementSubjectType = (typeof ENGAGEMENT_SUBJECT_TYPES)[number];

/**
 * Reaction kinds. `neutral` is request-only sugar that deletes any prior
 * reaction row; the wire never returns `neutral` as `user_reaction`.
 * Backend: `REACTION_KINDS` in `app/engagement/domain/enums.py`.
 */
export const ENGAGEMENT_REACTION_KINDS = [
  "useful",
  "not_useful",
  "neutral",
] as const;
export type EngagementReactionKind = (typeof ENGAGEMENT_REACTION_KINDS)[number];

/**
 * Stored reaction kinds (the subset returned as `user_reaction`).
 * `neutral` is not persisted — it removes the row.
 */
export const ENGAGEMENT_PERSISTED_REACTION_KINDS = [
  "useful",
  "not_useful",
] as const;
export type EngagementPersistedReactionKind =
  (typeof ENGAGEMENT_PERSISTED_REACTION_KINDS)[number];

/**
 * Share channels accepted by `POST /{subject}/share`.
 * Backend: `EngagementShareRequestV2.channel` literal in
 * `schemas/common.py`.
 */
export const ENGAGEMENT_SHARE_CHANNELS = [
  "external",
  "whatsapp",
  "facebook",
  "twitter",
  "linkedin",
  "email",
  "telegram",
  "copy_link",
  "native_share",
] as const;
export type EngagementShareChannel = (typeof ENGAGEMENT_SHARE_CHANNELS)[number];

/**
 * Profanity-list languages accepted by `POST /admin/profanity-terms`.
 * Backend: `EngagementProfanityTermCreateV2.language` literal in
 * `schemas/moderation.py`.
 */
export const ENGAGEMENT_PROFANITY_LANGUAGES = [
  "es",
  "en",
  "fr",
  "de",
  "ja",
  "ko",
  "zh",
  "hi",
] as const;
export type EngagementProfanityLanguage =
  (typeof ENGAGEMENT_PROFANITY_LANGUAGES)[number];

/**
 * Analytics bucket granularity.
 * Backend: `EngagementAnalyticsResponseV2.bucket` literal.
 */
export const ENGAGEMENT_ANALYTICS_BUCKETS = ["day", "week", "month"] as const;
export type EngagementAnalyticsBucket =
  (typeof ENGAGEMENT_ANALYTICS_BUCKETS)[number];

/**
 * Webhook event names accepted by `POST /admin/webhooks`.
 * Backend: `ALLOWED_EVENT_TYPES` in
 * `app/engagement/application/webhook_service.py`.
 */
export const ENGAGEMENT_WEBHOOK_EVENT_TYPES = [
  "engagement.comment.created",
  "engagement.comment.flagged",
  "engagement.comment.admin_deleted",
  "engagement.reaction.toggled",
  "engagement.bookmark.added",
  "engagement.subject.paused",
  "engagement.subject.resumed",
  "engagement.subject.settings_changed",
] as const;
export type EngagementWebhookEventType =
  (typeof ENGAGEMENT_WEBHOOK_EVENT_TYPES)[number];

/**
 * Suspension-log `target` values — which surface (comments / reactions /
 * bookmarks / settings / policy) the audit row was recorded against.
 * Backend: `EngagementSuspensionLog.target`.
 */
export const ENGAGEMENT_SUSPENSION_TARGETS = [
  "comments",
  "reactions",
  "bookmarks",
  "settings",
  "policy",
] as const;
export type EngagementSuspensionTarget =
  (typeof ENGAGEMENT_SUSPENSION_TARGETS)[number];

/**
 * Suspension-log `action` values — the verb captured in the audit row.
 * Backend: `EngagementSuspensionLog.action`.
 */
export const ENGAGEMENT_SUSPENSION_ACTIONS = [
  "pause",
  "resume",
  "patch",
  "policy_patch",
] as const;
export type EngagementSuspensionAction =
  (typeof ENGAGEMENT_SUSPENSION_ACTIONS)[number];

/**
 * Notification event-types emitted on the caller's notification feed.
 * Today only `comment_created` is wired; the constant stays open-ended so
 * adding `reaction_added` / `bookmark_added` later is a non-breaking
 * schema bump.
 */
export const ENGAGEMENT_NOTIFICATION_EVENT_TYPES = ["comment_created"] as const;
export type EngagementNotificationEventType =
  (typeof ENGAGEMENT_NOTIFICATION_EVENT_TYPES)[number];

// ─────────────────────────────────────────────────────────────────────
// Per-subject (user surface)
// ─────────────────────────────────────────────────────────────────────

/**
 * Effective subject-level toggle state — subject + policy resolved.
 * Backend: `EngagementSettingsV2` in `schemas/common.py`.
 */
export interface EngagementSettings {
  comments_enabled: boolean;
  /** ISO 8601 — null when comments are not paused. */
  comments_paused_until: string | null;
  comments_paused_reason: string | null;
  reactions_enabled: boolean;
  /** ISO 8601 — null when reactions are not paused. */
  reactions_paused_until: string | null;
  reactions_paused_reason: string | null;
  bookmarks_enabled: boolean;
}

/**
 * Counters snapshot returned alongside any subject hydration. Feature
 * detail endpoints (e.g. blog post detail) embed this verbatim — the
 * canonical shape lives here.
 * Backend: `EngagementCountersV2` in `schemas/common.py`.
 */
export interface EngagementCounters {
  view_count_real: number;
  view_count_vanity: number;
  useful_count: number;
  not_useful_count: number;
  share_count: number;
  bookmark_count: number;
  comment_count: number;
  /** Caller's reaction — `null` for anonymous or no reaction. */
  user_reaction?: EngagementPersistedReactionKind | null;
  /** Caller's bookmark state. Defaults to `false` for anonymous. */
  user_bookmarked?: boolean;
  settings: EngagementSettings;
}

/**
 * Response for `POST /{subject}/view`.
 * Backend: `EngagementViewResponseV2`.
 *
 * The `view_count_real_incremented` field was dropped in M19 — clients
 * derive "is this my first view today" from the counter delta.
 */
export interface EngagementViewResponse {
  view_count_vanity: number;
  view_count_real: number;
  /** ISO 8601 — when the server recorded the view. */
  recorded_at: string;
}

/**
 * Request body for `POST /{subject}/share`. Body is optional on the wire;
 * channel defaults to `"external"` when omitted.
 * Backend: `EngagementShareRequestV2`.
 */
export interface EngagementShareRequest {
  channel?: EngagementShareChannel;
}

/**
 * Response for `POST /{subject}/share`.
 * Backend: `EngagementShareResponseV2`.
 */
export interface EngagementShareResponse {
  share_count: number;
  channel: string;
  /** ISO 8601 — when the share was recorded. */
  recorded_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Extended interactions (like / download / report) — opt-in per subject
// ─────────────────────────────────────────────────────────────────────
//
// These routes are mounted only for subjects that declare the interaction
// in `SubjectDescriptor.enabled_interactions` (e.g. magazine ships
// like/download/report/stats; blog uses reactions instead of like and
// mounts none of these). Backend:
// `app/engagement/presentation/routes/extended_routes.py` +
// `app/engagement/presentation/schemas/extended.py`.

/**
 * Response for the authenticated `POST/DELETE /{subject}/like` toggle.
 * Backend: `EngagementLikeResponseV2`.
 *
 * Carries both the real (deduped-per-user) and vanity (append-only,
 * social-proof) counters. `user_liked` is `null` only on the rare path
 * where the service can't resolve the caller's state.
 */
export interface EngagementLikeResponse {
  /** Caller's like state after the toggle — `null` when unresolved. */
  user_liked?: boolean | null;
  /** Real deduped-per-user like counter. Defaults to `0`. */
  like_count_real: number;
  /** Vanity append-only like counter (social-proof). Defaults to `0`. */
  like_count_vanity: number;
}

/**
 * Response for the anonymous `POST /{subject}/like/public` vanity bump.
 * Backend: `EngagementLikePublicResponseV2`.
 *
 * Anonymous callers only ever see the vanity counter — the real counter
 * is deduped per user id and is meaningless without a caller identity.
 */
export interface EngagementLikePublicResponse {
  /** Vanity append-only like counter. Defaults to `0`. */
  like_count_vanity: number;
}

/**
 * Response for `POST /{subject}/download`.
 * Backend: `EngagementDownloadResponseV2`.
 *
 * Append-only vanity + deduped real download counters. NOTE: the
 * download route returns ONLY the counters — the asset URL (e.g. a
 * magazine `pdfUrl`) is NOT part of this shape (legacy magazine clients
 * expected a `pdfUrl`; the engagement download route never emits one).
 */
export interface EngagementDownloadResponse {
  /** Real deduped download counter. Defaults to `0`. */
  download_count_real: number;
  /** Vanity append-only download counter. Defaults to `0`. */
  download_count_vanity: number;
}

/**
 * Request body for `POST /{subject}/report`. `reason` must be in the
 * backend allow-list (`ALLOWED_REASONS` in `report_service.py`);
 * `comment` is optional free text.
 * Backend: `EngagementReportRequestV2`.
 */
export interface EngagementReportRequest {
  /** Allow-listed reason key. Max 64 chars. */
  reason: string;
  /** Optional free-text context. Max 2000 chars. */
  comment?: string | null;
}

/**
 * Acknowledgement for `POST /{subject}/report`. Status 201.
 * Backend: `EngagementReportAckV2`.
 *
 * The report row's lifecycle status (e.g. `"open"`) — the only field the
 * route surfaces to the reporter; full report rows live behind the admin
 * moderation surface.
 */
export interface EngagementReportAck {
  status: string;
}

// ─────────────────────────────────────────────────────────────────────
// Comments
// ─────────────────────────────────────────────────────────────────────

/**
 * Comment author reference. `name` and `avatar_url` are nullable because
 * author hydration is handled by a downstream service that isn't always
 * wired (moderation feed returns raw rows). FE falls back to
 * "Anonymous" / initials when either is absent.
 * Backend: `EngagementCommentAuthorV2`.
 */
export interface EngagementCommentAuthor {
  user_id: number;
  name?: string | null;
  avatar_url?: string | null;
}

/**
 * A single comment row hydrated for FE rendering.
 * Backend: `EngagementCommentV2`.
 */
export interface EngagementComment {
  id: number;
  /** UUID v4. */
  uuid: string;
  parent_id: number | null;
  body_md: string;
  body_html_sanitized: string;
  author: EngagementCommentAuthor;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601 — null when not deleted. */
  deleted_at: string | null;
  is_author_self?: boolean;
}

/**
 * Body for `POST /{subject}/comments`. The server strips whitespace and
 * rejects an empty body with 422.
 * Backend: `EngagementCommentCreateRequestV2`.
 */
export interface EngagementCommentCreateRequest {
  /** Markdown body. 1..5000 chars after strip. */
  body_md: string;
  /** Numeric id of the parent comment (one-level threading). */
  parent_id?: number | null;
}

/**
 * Paged comment list envelope.
 * Backend: `EngagementCommentListResponseV2`.
 */
export interface EngagementCommentListResponse {
  items: EngagementComment[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * One row in the caller's cross-subject comment list. Carries the
 * `subject_type` + `subject_uuid` anchor so the FE can deep-link back to
 * the originating feature.
 * Backend: `EngagementMyCommentItemV2`.
 */
export interface EngagementMyCommentItem {
  id: number;
  /** UUID v4. */
  uuid: string;
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  body_md: string;
  body_html_sanitized: string;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601 — null when not deleted. */
  deleted_at: string | null;
}

/**
 * Paged response envelope for `GET /me/engagement/comments`.
 * Backend: `EngagementMyCommentListResponseV2`.
 */
export interface EngagementMyCommentListResponse {
  items: EngagementMyCommentItem[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────────────────────────────────────────────────────────────
// Reactions
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /{subject}/reactions`. `neutral` clears any prior
 * reaction.
 * Backend: `EngagementReactionRequestV2`.
 */
export interface EngagementReactionRequest {
  reaction: EngagementReactionKind;
}

/**
 * Post-toggle reaction state + refreshed aggregate counters.
 * Backend: `EngagementReactionResponseV2`.
 */
export interface EngagementReactionResponse {
  user_reaction: EngagementPersistedReactionKind | null;
  useful_count: number;
  not_useful_count: number;
}

// ─────────────────────────────────────────────────────────────────────
// Bookmarks
// ─────────────────────────────────────────────────────────────────────

/**
 * Response for `POST/DELETE /{subject}/bookmark`.
 * Backend: `EngagementBookmarkResponseV2`.
 */
export interface EngagementBookmarkResponse {
  user_bookmarked: boolean;
}

/**
 * One bookmark row in the `/me/engagement/bookmarks` list.
 * Backend: `EngagementBookmarkItemV2`.
 */
export interface EngagementBookmarkItem {
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  /** ISO 8601. */
  bookmarked_at: string;
}

/**
 * Paged bookmark list envelope.
 * Backend: `EngagementBookmarkListResponseV2`.
 *
 * `total` is `null` when the service skipped the count for hot paths;
 * `null` means "unknown", not "zero".
 */
export interface EngagementBookmarkListResponse {
  items: EngagementBookmarkItem[];
  limit: number;
  offset: number;
  total?: number | null;
}

// ─────────────────────────────────────────────────────────────────────
// Notifications (per-caller authored-subject feed + preferences)
// ─────────────────────────────────────────────────────────────────────

/**
 * One row in the caller's authored-subject notification feed.
 * Backend: `EngagementNotificationItemV2`.
 *
 * `excerpt` is a hard-trimmed slice of `body_md` (first 80 chars +
 * ellipsis when truncated).
 */
export interface EngagementNotificationItem {
  event_type: EngagementNotificationEventType;
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  comment_id: number;
  /** UUID v4. */
  comment_uuid: string;
  commenter_name: string;
  excerpt: string;
  /** ISO 8601. */
  created_at: string;
}

/**
 * Paged response envelope for `GET /me/engagement/notifications`.
 * Backend: `EngagementNotificationListResponseV2`.
 */
export interface EngagementNotificationListResponse {
  items: EngagementNotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Wire shape returned by GET/PATCH
 * `/me/engagement/notification-preferences`.
 * Backend: `EngagementUserNotificationPrefV2`.
 *
 * Defaults match the migration's `server_default` set so the FE can
 * treat "no row yet" and "row with defaults" identically. `created_at`
 * and `updated_at` are nullable to support the lazy-row case where the
 * user has never PATCHed.
 *
 * `quiet_hours_*` use `HH:MM:SS` UTC time strings (Pydantic `time`).
 */
export interface EngagementUserNotificationPref {
  user_id: number;
  notify_on_comment_on_authored: boolean;
  notify_on_reply_to_own_comment: boolean;
  notify_on_reaction_on_authored: boolean;
  fcm_enabled: boolean;
  email_enabled: boolean;
  /** `HH:MM:SS` UTC — null when no quiet-hours window is set. */
  quiet_hours_start: string | null;
  /** `HH:MM:SS` UTC — null when no quiet-hours window is set. */
  quiet_hours_end: string | null;
  /** ISO 8601 — null on lazy default-shaped responses. */
  created_at: string | null;
  /** ISO 8601 — null on lazy default-shaped responses. */
  updated_at: string | null;
}

/**
 * PATCH body for `/me/engagement/notification-preferences`. Only fields
 * present in the body are written; explicit `null` clears `quiet_hours_*`.
 * Backend: `EngagementUserNotificationPrefPatchV2`.
 */
export interface EngagementUserNotificationPrefPatch {
  notify_on_comment_on_authored?: boolean | null;
  notify_on_reply_to_own_comment?: boolean | null;
  notify_on_reaction_on_authored?: boolean | null;
  fcm_enabled?: boolean | null;
  email_enabled?: boolean | null;
  /** `HH:MM:SS` UTC — send `null` to clear. */
  quiet_hours_start?: string | null;
  /** `HH:MM:SS` UTC — send `null` to clear. */
  quiet_hours_end?: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Suspension + policy (per-subject + cross-subject admin)
// ─────────────────────────────────────────────────────────────────────

/**
 * Pause comments/reactions on a single subject. `paused_until = null`
 * means indefinite.
 * Backend: `EngagementSuspensionPauseRequestV2`.
 */
export interface EngagementSuspensionPauseRequest {
  /** ISO 8601 — null means indefinite. */
  paused_until?: string | null;
  /** Max 500 chars. */
  reason?: string | null;
}

/**
 * Toggle comments/reactions/bookmarks on a single subject (partial PATCH).
 * Backend: `EngagementSubjectSettingsPatchV2`.
 */
export interface EngagementSubjectSettingsPatch {
  comments_enabled?: boolean | null;
  reactions_enabled?: boolean | null;
  bookmarks_enabled?: boolean | null;
}

/**
 * Cross-subject-type policy snapshot (one row per subject_type).
 * Backend: `EngagementPolicyV2`.
 */
export interface EngagementPolicy {
  subject_type: string;
  comments_globally_enabled: boolean;
  /** ISO 8601 — null when not paused. */
  comments_globally_paused_until: string | null;
  comments_globally_paused_reason: string | null;
  reactions_globally_enabled: boolean;
  /** ISO 8601 — null when not paused. */
  reactions_globally_paused_until: string | null;
  reactions_globally_paused_reason: string | null;
  bookmarks_globally_enabled: boolean;
  /** ISO 8601. */
  updated_at: string;
}

/**
 * Partial PATCH body for a per-subject-type policy.
 * Backend: `EngagementPolicyPatchV2`.
 */
export interface EngagementPolicyPatch {
  comments_globally_enabled?: boolean | null;
  /** ISO 8601 — null clears any active pause. */
  comments_globally_paused_until?: string | null;
  comments_globally_paused_reason?: string | null;
  reactions_globally_enabled?: boolean | null;
  /** ISO 8601 — null clears any active pause. */
  reactions_globally_paused_until?: string | null;
  reactions_globally_paused_reason?: string | null;
  bookmarks_globally_enabled?: boolean | null;
}

/**
 * One audit-log row for pause/resume/policy mutations.
 * Backend: `EngagementSuspensionLogEntryV2`.
 *
 * `subject_uuid` is `null` for policy-level events (no specific subject).
 */
export interface EngagementSuspensionLogEntry {
  id: number;
  subject_type: string;
  /** UUID v4 — null for policy-level events. */
  subject_uuid: string | null;
  target: string;
  action: string;
  /** ISO 8601 — null on non-pause actions. */
  paused_until: string | null;
  reason: string | null;
  actor_user_id: number | null;
  /** ISO 8601. */
  created_at: string;
}

/**
 * Suspension-log list envelope.
 * Backend: `EngagementSuspensionLogListResponseV2`.
 */
export interface EngagementSuspensionLogListResponse {
  items: EngagementSuspensionLogEntry[];
}

// ─────────────────────────────────────────────────────────────────────
// Moderation (cross-subject admin)
// ─────────────────────────────────────────────────────────────────────

/**
 * One row in the cross-subject moderation feed.
 * Backend: `EngagementCommentModerationItemV2`.
 */
export interface EngagementCommentModerationItem {
  id: number;
  /** UUID v4. */
  uuid: string;
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  user_id: number;
  parent_id: number | null;
  body_md: string;
  /** Profanity hits, when any — null on clean comments. */
  flagged_terms: Array<Record<string, unknown>> | null;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601 — null when not deleted. */
  deleted_at: string | null;
}

/**
 * Paged response envelope for moderation feed.
 * Backend: `EngagementCommentModerationListResponseV2`.
 */
export interface EngagementCommentModerationListResponse {
  items: EngagementCommentModerationItem[];
  limit: number;
  offset: number;
  has_more: boolean;
  total?: number | null;
}

/**
 * A single profanity wordlist row.
 * Backend: `EngagementProfanityTermV2`.
 */
export interface EngagementProfanityTerm {
  id: number;
  term: string;
  language: string;
  /** 1..3. */
  severity: number;
  notes: string | null;
  /** ISO 8601. */
  created_at: string;
}

/**
 * List envelope for profanity wordlist.
 * Backend: `EngagementProfanityTermListResponseV2`.
 */
export interface EngagementProfanityTermListResponse {
  items: EngagementProfanityTerm[];
}

/**
 * POST body for `/admin/profanity-terms`.
 * Backend: `EngagementProfanityTermCreateV2`.
 */
export interface EngagementProfanityTermCreate {
  /** 1..120 chars, matches `[\w\s'.\-]+`. */
  term: string;
  language: EngagementProfanityLanguage;
  /** 1..3 — defaults to 1 server-side when omitted. */
  severity?: number;
  /** Max 500 chars. */
  notes?: string | null;
}

/**
 * One DLQ message envelope. Shape is queue-specific — `extra="allow"` on
 * the backend so payload fields pass through unchanged.
 * Backend: `EngagementDlqMessageV2`.
 */
export type EngagementDlqMessage = Record<string, unknown>;

/**
 * Inspect-DLQ envelope.
 * Backend: `EngagementDlqListResponseV2`.
 */
export interface EngagementDlqListResponse {
  items: EngagementDlqMessage[];
}

/**
 * Body for `POST /admin/dlq/{queue}/replay`. Single-message replay matches
 * the smoke-script + admin-tool contract.
 * Backend: `EngagementDlqReplayRequestV2`.
 */
export interface EngagementDlqReplayRequest {
  message_id: string;
  /** Defaults to `true` server-side when omitted. */
  delete_from_dlq?: boolean;
}

/**
 * Replay-DLQ envelope.
 * Backend: `EngagementDlqReplayResponseV2`.
 */
export interface EngagementDlqReplayResponse {
  replayed: number;
}

// ─────────────────────────────────────────────────────────────────────
// Registered subjects (admin introspection)
// ─────────────────────────────────────────────────────────────────────

/**
 * One registered subject descriptor returned by
 * `GET /admin/registered-subjects`.
 *
 * Mirrors the read-only shape projected from `SubjectDescriptor` —
 * permission gate + comment quota + depth cap, sorted by `subject_type`
 * for stable output.
 */
export interface EngagementRegisteredSubject {
  subject_type: string;
  permission_read: string;
  max_comments_per_user_per_subject: number;
  comment_depth_cap: number;
}

/**
 * Response envelope for `GET /admin/registered-subjects`.
 */
export interface EngagementRegisteredSubjectsResponse {
  items: EngagementRegisteredSubject[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────
// Analytics (cross-subject admin)
// ─────────────────────────────────────────────────────────────────────

/**
 * Aggregated counters for one `subject_type` (or the global roll-up
 * keyed as `"__all__"`).
 * Backend: `EngagementAnalyticsSubjectStatsV2`.
 */
export interface EngagementAnalyticsSubjectStats {
  subject_type: string;
  total_subjects: number;
  subjects_with_engagement: number;
  total_comments: number;
  total_reactions: number;
  total_bookmarks: number;
  total_shares: number;
  total_views_real: number;
  total_views_vanity: number;
}

/**
 * One row in the "top 20 hottest subjects" leaderboard.
 * Backend: `EngagementAnalyticsHotSubjectV2`.
 */
export interface EngagementAnalyticsHotSubject {
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  score: number;
  view_count_real: number;
  comment_count: number;
  useful_count: number;
  bookmark_count: number;
}

/**
 * One bucket of the events timeline. Empty buckets are omitted (the UI
 * shows them as gaps).
 * Backend: `EngagementAnalyticsTimeBucketV2`.
 */
export interface EngagementAnalyticsTimeBucket {
  /** ISO 8601 — inclusive lower-bound of the bucket. */
  bucket_start: string;
  new_comments: number;
  new_reactions: number;
  new_bookmarks: number;
  new_shares: number;
}

/**
 * Top-level response envelope for `GET /admin/analytics`. `totals` is the
 * cross-subject roll-up keyed `"__all__"`.
 * Backend: `EngagementAnalyticsResponseV2`.
 */
export interface EngagementAnalyticsResponse {
  /** ISO 8601 — lower-bound of the analytics window. */
  since: string;
  bucket: EngagementAnalyticsBucket;
  by_subject_type: EngagementAnalyticsSubjectStats[];
  hot_subjects: EngagementAnalyticsHotSubject[];
  timeline: EngagementAnalyticsTimeBucket[];
  totals: EngagementAnalyticsSubjectStats;
}

// ─────────────────────────────────────────────────────────────────────
// Webhooks (admin-managed HTTPS subscriptions)
// ─────────────────────────────────────────────────────────────────────

/**
 * Read shape for an engagement webhook subscription. `secret` is only
 * populated on create / test responses — list / get paths scrub it.
 * Backend: `EngagementWebhookV2`.
 */
export interface EngagementWebhook {
  /** UUID v4. */
  uuid: string;
  name: string;
  url: string;
  /** 64-char hex HMAC-SHA256 key — only set on create + test responses. */
  secret?: string | null;
  event_types: string[];
  subject_type_filter: string | null;
  active: boolean;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

/**
 * Paged response envelope for webhook list.
 * Backend: `EngagementWebhookListResponseV2`.
 */
export interface EngagementWebhookListResponse {
  items: EngagementWebhook[];
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

/**
 * POST body for `/admin/webhooks`. All event_types must be in
 * `ENGAGEMENT_WEBHOOK_EVENT_TYPES`; URL must be `https://`.
 * Backend: `EngagementWebhookCreateRequestV2`.
 */
export interface EngagementWebhookCreateRequest {
  /** 1..120 chars. */
  name: string;
  /** 1..2048 chars. Must start with `https://`. */
  url: string;
  /** At least one event type required. */
  event_types: string[];
  /** Max 32 chars — null subscribes to events from every subject type. */
  subject_type_filter?: string | null;
  /** Defaults to `true` server-side when omitted. */
  active?: boolean;
}

/**
 * PATCH body for `/admin/webhooks/{uuid}`. Secret rotation is not exposed
 * here.
 * Backend: `EngagementWebhookPatchV2`.
 */
export interface EngagementWebhookPatch {
  /** 1..120 chars. */
  name?: string | null;
  /** 1..2048 chars. Must start with `https://`. */
  url?: string | null;
  event_types?: string[] | null;
  subject_type_filter?: string | null;
  active?: boolean | null;
}

/**
 * POST body for `/admin/webhooks/{uuid}/test`. Picks one event to fire
 * against this specific webhook (skips the normal fan-out).
 * Backend: `EngagementWebhookTestRequestV2`.
 */
export interface EngagementWebhookTestRequest {
  /** 1..64 chars; must be in `ENGAGEMENT_WEBHOOK_EVENT_TYPES`. */
  event_type: string;
  /** 1..32 chars — defaults to `"blog_post"` server-side. */
  subject_type?: string;
  data?: Record<string, unknown>;
}

/**
 * Result envelope from `POST /admin/webhooks/{uuid}/test`.
 * Backend: `EngagementWebhookTestResponseV2`.
 */
export interface EngagementWebhookTestResponse {
  /** Count of dispatch tasks enqueued — 0 or 1. */
  enqueued: number;
}

/**
 * One delivery audit row for the admin inspection view.
 * Backend: `EngagementWebhookDeliveryV2`.
 */
export interface EngagementWebhookDelivery {
  id: number;
  event_type: string;
  /** HTTP status from the receiver — null on transport-level failure. */
  response_status: number | null;
  /** First 2KB of the receiver's body — null on transport-level failure. */
  response_body_excerpt: string | null;
  /** Transport-level error message — null on a non-transport response. */
  error_message: string | null;
  /** Attempt counter (1..N). */
  attempt: number;
  /** ISO 8601 — set only on a 2xx response. */
  delivered_at: string | null;
  /** ISO 8601. */
  created_at: string;
}

/**
 * Paged response envelope for webhook deliveries.
 * Backend: `EngagementWebhookDeliveryListResponseV2`.
 */
export interface EngagementWebhookDeliveryListResponse {
  items: EngagementWebhookDelivery[];
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Domain row helpers (admin BI / introspection)
// ─────────────────────────────────────────────────────────────────────

/**
 * Polymorphic engagement target keyed by `(subject_type, subject_uuid)`.
 * Mirrors the `engagement_subjects` ORM row — surfaced by the
 * `GET /admin/subjects/export.csv` admin export as one CSV row per
 * subject.
 *
 * Not returned from a JSON endpoint today; consumer apps that ingest the
 * CSV export should validate row shape against this interface.
 *
 * Backend: `EngagementSubject` ORM model in `domain/models.py`.
 */
export interface EngagementSubject {
  subject_type: string;
  /** UUID v4. */
  subject_uuid: string;
  view_count_real: number;
  view_count_vanity: number;
  useful_count: number;
  not_useful_count: number;
  share_count: number;
  bookmark_count: number;
  comment_count: number;
  comments_enabled: boolean;
  reactions_enabled: boolean;
  bookmarks_enabled: boolean;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}
