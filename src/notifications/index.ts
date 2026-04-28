/**
 * Notifications V2 types.
 *
 * Backend: app/presentation/schemas/notifications_content.py +
 *          app/presentation/schemas/fcm.py
 *
 * Two endpoints share these contracts:
 *   POST /api/v1/notifications/content      → AnnouncementNotification (this file)
 *   POST /api/v1/fcm/topics/broadcast       → TopicBroadcastRequest (this file)
 *
 * The single-variant `AnnouncementNotification` is intentional: every other
 * push-notification class is dispatched internally by mini-back's matching
 * domain service (event_service, magazine_tasks, send_bulletin_push,
 * consultation_notifier, …). Adding more variants here would let frontends
 * accidentally double-fire those internal dispatchers — see the canonical
 * map at `mini-back/docs/v2/NotificationsContent/SOURCE_OF_TRUTH.md`.
 */

// ============================================================================
// /api/v1/notifications/content
// ============================================================================

/** Discriminator for the content endpoint. Locked to "announcement" — adding
 *  variants here re-introduces the duplication risk the audit removed. */
export type ContentNotificationType = "announcement";

/**
 * Manual admin announcement broadcast. Free-form title/body push that lands
 * on the mobile Home screen via `data.screen = "Home"`. Not tied to any
 * specific CMS entity (events, magazines, etc. are dispatched internally).
 *
 * Backend: notifications_content.py :: AnnouncementNotification
 */
export interface AnnouncementNotification {
  /** Discriminator literal — must equal "announcement". */
  type: ContentNotificationType;
  /** Notification title. 1..200 characters. */
  title: string;
  /** Notification body. 1..1000 characters. */
  body: string;
  /** Optional rich-image URL. Validated as HttpUrl backend-side. */
  imageUrl?: string;
  /** FCM topic to broadcast to. 1..100 characters. Defaults to `"global"`. */
  topic?: string;
}

/**
 * Response from /api/v1/notifications/content on success.
 *
 * Backend: notifications_content.py :: ContentNotificationResponse
 */
export interface ContentNotificationResponse {
  success: boolean;
  contentType: ContentNotificationType;
  topic: string;
  title: string;
  body: string;
  imageUrl: string | null;
}

// ============================================================================
// /api/v1/fcm/topics/broadcast
// ============================================================================

/**
 * Request body for the FCM topic broadcast endpoint. Used by the dashboard's
 * Notifications composer for both "broadcast to global" and "broadcast to a
 * specific topic" modes.
 *
 * Backend: fcm.py :: TopicBroadcastRequest
 */
export interface TopicBroadcastRequest {
  /** FCM topic to broadcast to. 1..255 characters. */
  topic: string;
  /** Notification title. 1..255 characters. */
  title: string;
  /** Notification body. */
  body: string;
  /** Additional FCM data payload. Values must be strings (FCM constraint). */
  data?: Record<string, string>;
  /** Optional image URL. */
  imageUrl?: string;
}

/**
 * Response from /api/v1/fcm/topics/broadcast on accepted dispatch.
 * The endpoint returns 202 — delivery to subscribers happens asynchronously.
 */
export interface FcmBroadcastResponse {
  success: boolean;
  topic: string;
  message: string;
}

// ============================================================================
// FCM data conventions (consumer-facing)
// ============================================================================

/**
 * Deep-link conventions accepted by sitimmApp's Notifications/router.ts.
 *
 * The dashboard's announcement endpoint always emits `data.screen = "Home"`.
 * Internal CMS dispatchers (events, magazines, etc.) emit `data.screenType`
 * with their own enum values — those stay private to the backend domain
 * services and do not appear in this package.
 */
export const NOTIFICATION_DATA_KEYS = {
  /** Deep-link screen identifier for the proxy-style data shape. */
  SCREEN: "screen",
  /** Stringified JSON payload describing screen params. */
  PARAMS: "params",
  /** Deep-link screen identifier for the events approval flow. */
  SCREEN_TYPE: "screenType",
} as const;
