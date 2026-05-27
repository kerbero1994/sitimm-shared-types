/**
 * NotificationsContent endpoint paths.
 *
 * Backend: `app/presentation/api/v1/notifications_content.py` (mini-back).
 *
 * Single V1 endpoint — there is no V2 router today. Auth: public.
 * Optional `x-sitimm-key` header for service-to-service traffic; the
 * endpoint applies the same Ask rate-limit buckets so a noisy CMS can
 * not exhaust the chatbot's capacity.
 */

export const NOTIFICATIONS_CONTENT_ENDPOINTS = {
  /** POST → Body: NotificationsContentRequest. Returns NotificationsContentResponse. Status 200. */
  CONTENT: "/api/v1/notifications/content",
} as const;

export type NotificationsContentEndpointKey =
  keyof typeof NOTIFICATIONS_CONTENT_ENDPOINTS;
export type NotificationsContentEndpoint =
  (typeof NOTIFICATIONS_CONTENT_ENDPOINTS)[NotificationsContentEndpointKey];
