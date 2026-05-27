/**
 * NotificationsContent types — manual admin announcement broadcast.
 *
 * Backend: `app/presentation/schemas/notifications_content.py` +
 * `app/presentation/api/v1/notifications_content.py` (mini-back).
 *
 * Surface is V1-only (`POST /api/v1/notifications/content`). There is no
 * V2 router today.
 *
 * **Why a dedicated module on top of `notifications`?**
 *
 * The `notifications` module mixes two surfaces:
 *
 * - `POST /api/v1/notifications/content` — manual announcement broadcast
 *   (this module).
 * - `POST /api/v1/fcm/topics/broadcast` — generic FCM topic broadcast.
 *
 * `docs/v2/NotificationsContent/` tracks only the first one. This module
 * exposes the same shape under cleaner names so the docs and the
 * consumer code stay aligned — the dashboard's CMS Notifications
 * composer should import from `@kerbero1994/shared-types/notificationsContent`,
 * not from the broader `notifications` module.
 *
 * **Locked-down scope.** Earlier ports carried nine extra `type` values
 * (`event`, `blog`, `bulletin`, `magazine`, `program`, `benefit`, `faq`,
 * `consultation`, `sport_event`). Each one shadowed a CMS endpoint's
 * internal FCM dispatcher — see
 * `docs/v2/NotificationsContent/spec.md § 4 Cross-feature FCM dispatcher map`
 * for the canonical table. To prevent re-introducing the duplication
 * risk, the schema and this module accept only `"announcement"`.
 */

// ─────────────────────────────────────────────────────────────────────
// Discriminator
// ─────────────────────────────────────────────────────────────────────

/**
 * Single allowed `type` value on the request body. Locked to
 * `"announcement"` by audit 2026-04-28.
 * Backend: `ContentType` literal in `notifications_content.py`.
 */
export const NOTIFICATIONS_CONTENT_TYPES = ["announcement"] as const;
export type NotificationsContentType =
  (typeof NOTIFICATIONS_CONTENT_TYPES)[number];

// ─────────────────────────────────────────────────────────────────────
// Request / response
// ─────────────────────────────────────────────────────────────────────

/**
 * `POST /api/v1/notifications/content` request body.
 * Backend: `AnnouncementNotification`.
 *
 * Lands on the mobile Home screen via `data.screen = "Home"` in the FCM
 * data payload (server-managed, not exposed on the request).
 */
export interface NotificationsContentAnnouncement {
  /** Discriminator. Must equal `"announcement"`. */
  type: NotificationsContentType;
  /** 1..200 chars. */
  title: string;
  /** 1..1000 chars. */
  body: string;
  /** Pydantic `HttpUrl | None`. Optional rich-image URL. */
  imageUrl?: string | null;
  /** 1..100 chars. FCM topic. Defaults to `"global"`. */
  topic?: string;
}

/**
 * Request alias kept for symmetry with the backend type. Frontends should
 * type request payloads as `NotificationsContentRequest` so future
 * variants (if any) flow through a single name.
 */
export type NotificationsContentRequest = NotificationsContentAnnouncement;

/**
 * `POST /api/v1/notifications/content` success body.
 * Backend: `ContentNotificationResponse`.
 *
 * Returned with HTTP 200 once FCM accepts the broadcast. On dispatch
 * failure the endpoint returns 502 with `{ detail }`.
 */
export interface NotificationsContentResponse {
  success: boolean;
  contentType: NotificationsContentType;
  topic: string;
  title: string;
  body: string;
  imageUrl: string | null;
}
