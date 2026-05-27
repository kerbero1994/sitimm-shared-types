/**
 * NotificationsContent — barrel re-export.
 *
 * Dedicated module for `POST /api/v1/notifications/content` (manual
 * admin announcement broadcast). The broader `notifications` module
 * additionally covers `POST /api/v1/fcm/topics/broadcast`; this module
 * is the narrower, audit-locked surface that `new_dashboard`'s CMS
 * Notifications composer should consume.
 *
 * ```ts
 * import { NotificationsContentRequest, NOTIFICATIONS_CONTENT_ENDPOINTS }
 *   from "@kerbero1994/shared-types";
 * // or
 * import * as NotificationsContent
 *   from "@kerbero1994/shared-types/notificationsContent";
 * ```
 */

export * from "./types";
export * from "./endpoints";
