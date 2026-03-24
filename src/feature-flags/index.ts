/**
 * Feature flag keys used across the SITIMM ecosystem.
 *
 * ConfigCat flags (sitimmApp uses ConfigCat SDK):
 * - Keys must match exactly what's configured in the ConfigCat dashboard.
 * - Values are the flag key strings passed to `configCat.getValue(key)`.
 *
 * Internal flags (new_dashboard uses its own system via features.config.ts):
 * - Listed here for cross-repo awareness.
 */

// -- ConfigCat flag keys (used by sitimmApp, potentially others) --

export const CONFIGCAT_FLAGS = {
  /** Silent migration to API V2 (mini-back). When true, app uses V2 endpoints. */
  API_V2: "api_v2",
  /** Route FAQ questions to real-time chat system instead of static Q&A. */
  QAS_USE_CHAT: "qas_use_chat",
  /** Enable chatbot content moderation via proxy before sending to AI. */
  CHATBOT_MODERATION: "chatbot_moderation",
  /** Bonus feature V2 toggle (new UI + V2 endpoints). */
  BONUS_V2: "bonus_v2",
  /** Blog feature V2 toggle (new UI + V2 endpoints). */
  BLOG_V2: "blog_v2",
} as const;

export type ConfigCatFlagKey = (typeof CONFIGCAT_FLAGS)[keyof typeof CONFIGCAT_FLAGS];
