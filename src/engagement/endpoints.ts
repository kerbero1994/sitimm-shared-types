/**
 * Engagement V2 endpoint paths.
 *
 * Backend:
 * - `app/engagement/presentation/routes/attach_factory.py` (per-subject
 *   user + admin routes — 14 per attached subject_type).
 * - `app/engagement/presentation/routes/me.py` (caller's cross-subject
 *   surface: bookmarks, comments, notifications, notification prefs).
 * - `app/engagement/presentation/routes/admin_global.py` (cross-subject
 *   admin: moderation, profanity, policy, DLQ, analytics, webhooks,
 *   registered-subjects, subjects CSV export).
 *
 * Per-subject routes are mounted by each feature adapter calling
 * `make_engagement_router(subject_type, base_prefix)`. The blog adapter
 * lives at `/api/v2/blog/posts`; magazine/event/consultation/bulletin
 * adapters will mount under their own prefixes as they come online.
 *
 * `ENGAGEMENT_SUBJECT_ENDPOINTS` is a builder that takes the feature's
 * `base_prefix` and returns the full set of paths for that subject type.
 * `ENGAGEMENT_BLOG_ENDPOINTS` is a pre-baked snapshot for the only
 * subject_type live on QA today (`blog_post` @ `/api/v2/blog/posts`).
 *
 * Status codes (201 / 202 / 204) match the FastAPI route definitions;
 * see `docs/v2/Engagement/endpoints.md` for the full per-endpoint matrix.
 */

// ─────────────────────────────────────────────────────────────────────
// Per-subject endpoint builder (mounted by each feature adapter)
// ─────────────────────────────────────────────────────────────────────

/**
 * Build the per-subject engagement endpoints under a feature's
 * `base_prefix`. Each entry returns a string with `{subject_uuid}` /
 * `{comment_uuid}` placeholders matching the FastAPI route — use the
 * shared `endpoint()` helper from `@kerbero1994/shared-types/endpoints`
 * to expand them, or substitute in-line.
 *
 * Example:
 * ```ts
 * const ENGAGEMENT_BLOG = engagementSubjectEndpoints("/api/v2/blog/posts");
 * ENGAGEMENT_BLOG.COMMENTS_CREATE;
 * // "/api/v2/blog/posts/{subject_uuid}/comments"
 * ```
 */
export function engagementSubjectEndpoints(basePrefix: string) {
  const prefix = basePrefix.replace(/\/$/, "");
  return {
    // ── User: comments ───────────────────────────────────────
    /** POST → Body: EngagementCommentCreateRequest. Returns EngagementComment. Status 201. Auth required. Rate-limited 3/min per (user, subject). */
    COMMENTS_CREATE: `${prefix}/{subject_uuid}/comments`,
    /** GET → EngagementCommentListResponse. Public read (anonymous OK). Query: limit, offset. */
    COMMENTS_LIST: `${prefix}/{subject_uuid}/comments`,
    /** DELETE → 204. Soft-delete the caller's own comment. Auth required (owner only). */
    COMMENT_DELETE_OWN: `${prefix}/comments/{comment_uuid}`,

    // ── User: reactions ──────────────────────────────────────
    /** POST → Body: EngagementReactionRequest. Returns EngagementReactionResponse. Auth required. Rate-limited 60/min per user. */
    REACTIONS_TOGGLE: `${prefix}/{subject_uuid}/reactions`,

    // ── User: bookmarks ──────────────────────────────────────
    /** POST → EngagementBookmarkResponse. Status 201. Idempotent. Auth required. Rate-limited 30/min per user. */
    BOOKMARK_ADD: `${prefix}/{subject_uuid}/bookmark`,
    /** DELETE → 204. Idempotent. Auth required. */
    BOOKMARK_REMOVE: `${prefix}/{subject_uuid}/bookmark`,

    // ── User: view + share ───────────────────────────────────
    /** POST → EngagementViewResponse. Status 202. Anonymous OK. Headers: X-Device-Id (optional). */
    VIEW: `${prefix}/{subject_uuid}/view`,
    /** POST → Body: EngagementShareRequest (optional). Returns EngagementShareResponse. Status 202. Anonymous OK. */
    SHARE: `${prefix}/{subject_uuid}/share`,

    // ── Admin: pause/resume + settings (per subject) ─────────
    /** POST → Body: EngagementSuspensionPauseRequest. Returns EngagementSettings. Requires engagement:suspend. */
    ADMIN_COMMENTS_PAUSE: `${prefix}/{subject_uuid}/admin/comments/pause`,
    /** POST → EngagementSettings. Requires engagement:suspend. */
    ADMIN_COMMENTS_RESUME: `${prefix}/{subject_uuid}/admin/comments/resume`,
    /** POST → Body: EngagementSuspensionPauseRequest. Returns EngagementSettings. Requires engagement:suspend. */
    ADMIN_REACTIONS_PAUSE: `${prefix}/{subject_uuid}/admin/reactions/pause`,
    /** POST → EngagementSettings. Requires engagement:suspend. */
    ADMIN_REACTIONS_RESUME: `${prefix}/{subject_uuid}/admin/reactions/resume`,
    /** GET → EngagementSettings. No state mutation. Requires engagement:suspend. */
    ADMIN_SETTINGS_GET: `${prefix}/{subject_uuid}/admin/settings`,
    /** PATCH → Body: EngagementSubjectSettingsPatch. Returns EngagementSettings. Requires engagement:suspend. */
    ADMIN_SETTINGS_PATCH: `${prefix}/{subject_uuid}/admin/settings`,
    /** GET → EngagementSuspensionLogListResponse. Query: limit, offset. Requires engagement:suspend. */
    ADMIN_SUSPENSION_LOG: `${prefix}/{subject_uuid}/admin/suspension-log`,
  } as const;
}

/**
 * Pre-baked engagement endpoints for the `blog_post` subject_type —
 * mounted at `/api/v2/blog/posts` by `blog_engagement_adapter.py`. Use
 * this directly when working with blog posts; for other subject types
 * call `engagementSubjectEndpoints(basePrefix)` with that feature's
 * prefix.
 */
export const ENGAGEMENT_BLOG_ENDPOINTS = engagementSubjectEndpoints(
  "/api/v2/blog/posts"
);

// ─────────────────────────────────────────────────────────────────────
// Caller's cross-subject "/me" surface
// ─────────────────────────────────────────────────────────────────────

export const ENGAGEMENT_ME_ENDPOINTS = {
  /** GET → EngagementBookmarkListResponse. Auth required. Query: limit, offset. */
  ME_BOOKMARKS: "/api/v2/me/engagement/bookmarks",
  /** GET → EngagementMyCommentListResponse. Auth required. Query: limit, offset. */
  ME_COMMENTS: "/api/v2/me/engagement/comments",
  /** GET → EngagementNotificationListResponse. Auth required. Query: limit, offset, since (ISO datetime). */
  ME_NOTIFICATIONS: "/api/v2/me/engagement/notifications",
  /** GET → EngagementUserNotificationPref. Auth required. No lazy row creation. */
  ME_NOTIFICATION_PREFS: "/api/v2/me/engagement/notification-preferences",
  /** PATCH → Body: EngagementUserNotificationPrefPatch. Returns EngagementUserNotificationPref. Auth required. Lazy-creates row on first call. */
  ME_NOTIFICATION_PREFS_PATCH: "/api/v2/me/engagement/notification-preferences",
} as const;

// ─────────────────────────────────────────────────────────────────────
// Cross-subject admin surface
// ─────────────────────────────────────────────────────────────────────

export const ENGAGEMENT_ADMIN_ENDPOINTS = {
  // ── Cross-subject comment moderation ────────────────────
  /** GET → EngagementCommentModerationListResponse. Query: subject_type, user_id, has_flagged_terms, created_after, limit, offset. Requires engagement:moderate. */
  ADMIN_COMMENTS_LIST: "/api/v2/engagement/admin/comments",
  /** DELETE → 204. Admin soft-delete of any comment. Requires engagement:moderate. */
  ADMIN_COMMENT_DELETE: "/api/v2/engagement/admin/comments/{comment_uuid}",

  // ── Profanity wordlist ──────────────────────────────────
  /** GET → EngagementProfanityTermListResponse. Query: language. Requires engagement:moderate. */
  ADMIN_PROFANITY_LIST: "/api/v2/engagement/admin/profanity-terms",
  /** POST → Body: EngagementProfanityTermCreate. Returns EngagementProfanityTerm. Status 201. Requires engagement:moderate. */
  ADMIN_PROFANITY_CREATE: "/api/v2/engagement/admin/profanity-terms",
  /** DELETE → 204. Requires engagement:moderate. */
  ADMIN_PROFANITY_DELETE: "/api/v2/engagement/admin/profanity-terms/{term_id}",

  // ── Cross-subject-type policy ───────────────────────────
  /** GET → EngagementPolicy. 404s when no policy seeded for that subject_type. Requires engagement:policy:manage. */
  ADMIN_POLICY_GET: "/api/v2/engagement/admin/policy/{subject_type}",
  /** PATCH → Body: EngagementPolicyPatch. Returns EngagementPolicy. Requires engagement:policy:manage. */
  ADMIN_POLICY_PATCH: "/api/v2/engagement/admin/policy/{subject_type}",

  // ── DLQ (Celery dead-letter inspection + replay) ────────
  /** GET → EngagementDlqListResponse. Query: limit, offset. Requires engagement:moderate. */
  ADMIN_DLQ_LIST: "/api/v2/engagement/admin/dlq/{queue}",
  /** POST → Body: EngagementDlqReplayRequest. Returns EngagementDlqReplayResponse. Status 202. Requires engagement:moderate. */
  ADMIN_DLQ_REPLAY: "/api/v2/engagement/admin/dlq/{queue}/replay",

  // ── Registered subjects introspection ───────────────────
  /** GET → EngagementRegisteredSubjectsResponse. Lists every subject_type currently wired. Requires engagement:moderate. */
  ADMIN_REGISTERED_SUBJECTS: "/api/v2/engagement/admin/registered-subjects",

  // ── Subjects CSV export (admin BI) ──────────────────────
  /** GET → text/csv stream. Query: subject_type. One row per engagement_subjects row. Requires engagement:moderate. */
  ADMIN_SUBJECTS_EXPORT_CSV: "/api/v2/engagement/admin/subjects/export.csv",

  // ── Cross-subject analytics ─────────────────────────────
  /** GET → EngagementAnalyticsResponse. Query: subject_type, since, bucket (day|week|month). Requires engagement:moderate. */
  ADMIN_ANALYTICS: "/api/v2/engagement/admin/analytics",

  // ── Webhook subscriptions (Z3) ──────────────────────────
  /** GET → EngagementWebhookListResponse. Query: active_only, limit, offset. Requires engagement:policy:manage. */
  ADMIN_WEBHOOKS_LIST: "/api/v2/engagement/admin/webhooks",
  /** POST → Body: EngagementWebhookCreateRequest. Returns EngagementWebhook (secret populated ONCE). Status 201. Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_CREATE: "/api/v2/engagement/admin/webhooks",
  /** GET → EngagementWebhook (secret scrubbed). Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_GET: "/api/v2/engagement/admin/webhooks/{webhook_uuid}",
  /** PATCH → Body: EngagementWebhookPatch. Returns EngagementWebhook (secret scrubbed). Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_PATCH: "/api/v2/engagement/admin/webhooks/{webhook_uuid}",
  /** DELETE → 204. Soft-delete (active=false + deleted_at set). Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_DELETE: "/api/v2/engagement/admin/webhooks/{webhook_uuid}",
  /** GET → EngagementWebhookDeliveryListResponse. Query: limit, offset. Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_DELIVERIES:
    "/api/v2/engagement/admin/webhooks/{webhook_uuid}/deliveries",
  /** POST → Body: EngagementWebhookTestRequest. Returns EngagementWebhookTestResponse. Status 202. Requires engagement:policy:manage. */
  ADMIN_WEBHOOK_TEST: "/api/v2/engagement/admin/webhooks/{webhook_uuid}/test",
} as const;

// ─────────────────────────────────────────────────────────────────────
// Combined map for typed access by key
// ─────────────────────────────────────────────────────────────────────

/**
 * Every engagement endpoint that doesn't depend on a feature's
 * `base_prefix` — `/me/...` + `/admin/...`. For per-subject routes, use
 * `engagementSubjectEndpoints(basePrefix)` or
 * `ENGAGEMENT_BLOG_ENDPOINTS`.
 */
export const ENGAGEMENT_ENDPOINTS = {
  ...ENGAGEMENT_ME_ENDPOINTS,
  ...ENGAGEMENT_ADMIN_ENDPOINTS,
} as const;

export type EngagementMeEndpointKey = keyof typeof ENGAGEMENT_ME_ENDPOINTS;
export type EngagementAdminEndpointKey =
  keyof typeof ENGAGEMENT_ADMIN_ENDPOINTS;
export type EngagementEndpointKey = keyof typeof ENGAGEMENT_ENDPOINTS;
export type EngagementEndpoint =
  (typeof ENGAGEMENT_ENDPOINTS)[EngagementEndpointKey];

export type EngagementSubjectEndpointKey = keyof ReturnType<
  typeof engagementSubjectEndpoints
>;
