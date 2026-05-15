/**
 * FCM topic names for Blogs V2 push notifications.
 *
 * Backend: emitted by `app/infrastructure/tasks/blog_tasks.py :: dispatch_post_push`
 * one topic per supported locale. The mobile app subscribes/unsubscribes
 * locally (`messaging().subscribeToTopic(BLOG_FCM_TOPICS[i])`); the BE
 * does not currently persist a subscriber list.
 *
 * Payload shape on dispatch: `BlogNewPostFCMPayload` (see `./types.ts`).
 *
 * Per-locale dedupe is keyed on
 * `BlogPost.fcm_dispatched_at_by_locale[locale]`. Re-translate with
 * `?force=true` clears the entry to allow a re-push.
 */

import { BLOG_LOCALES, type BlogLocale } from "./types";

/** Tuple of every FCM topic Blogs V2 may publish to (one per locale). */
export const BLOG_FCM_TOPICS = [
  "blog_new_post_es",
  "blog_new_post_en",
  "blog_new_post_fr",
  "blog_new_post_de",
  "blog_new_post_hi",
  "blog_new_post_ko",
  "blog_new_post_ja",
  "blog_new_post_zh",
] as const;

export type BlogFcmTopic = (typeof BLOG_FCM_TOPICS)[number];

/**
 * Map locale → FCM topic name. Useful for FE subscription toggles in the
 * settings screen.
 *
 * @example
 * ```ts
 * await messaging().subscribeToTopic(BLOG_FCM_TOPIC_BY_LOCALE.es);
 * ```
 */
export const BLOG_FCM_TOPIC_BY_LOCALE: Record<BlogLocale, BlogFcmTopic> = {
  es: "blog_new_post_es",
  en: "blog_new_post_en",
  fr: "blog_new_post_fr",
  de: "blog_new_post_de",
  hi: "blog_new_post_hi",
  ko: "blog_new_post_ko",
  ja: "blog_new_post_ja",
  zh: "blog_new_post_zh",
};

/** Returns the FCM topic name for a given locale. */
export function blogFcmTopicForLocale(locale: BlogLocale): BlogFcmTopic {
  return BLOG_FCM_TOPIC_BY_LOCALE[locale];
}

// Ensure compile-time exhaustiveness — every BLOG_LOCALES entry must map
// to a topic. Keeping this assignment forces a TS error if BLOG_LOCALES
// ever grows without a corresponding topic entry.
const _exhaustivenessCheck: ReadonlyArray<BlogLocale> = BLOG_LOCALES;
void _exhaustivenessCheck;
