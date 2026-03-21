/**
 * Feature flag keys used across the SITIMM ecosystem.
 *
 * ConfigCat flags (sitimmApp uses ConfigCat SDK):
 * - Keys must match exactly what's configured in the ConfigCat dashboard
 *
 * Internal flags (new_dashboard uses its own system):
 * - Listed here for cross-repo awareness
 */

// -- ConfigCat flag keys (used by sitimmApp, potentially others) --

export const CONFIGCAT_FLAGS = {
  /** Silent migration to API V2 (mini-back) */
  API_V2: "api_v2",
  /** Route FAQ questions to real-time chat system */
  QAS_USE_CHAT: "qas_use_chat",
  /** Enable chatbot content moderation via proxy */
  CHATBOT_MODERATION: "chatbot_moderation",
  /** Bonus feature V2 toggle */
  BONUS_V2: "bonus_v2",
  /** Blog feature V2 toggle */
  BLOG_V2: "blog_v2",
} as const;

export type ConfigCatFlagKey = (typeof CONFIGCAT_FLAGS)[keyof typeof CONFIGCAT_FLAGS];
