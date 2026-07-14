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
  /**
   * UNIFIED V1→V2 launch switch, shared with sitimm-web (its
   * `FeatureFlags.LAUNCH_V2`). Dark-launched (default false): clients stay on
   * V1 until this single flag is flipped on launch day — no redeploy. Web and
   * app read the SAME key so they flip together. Supersedes {@link API_V2}.
   */
  LAUNCH_V2: "launch_v2",
  /**
   * Public galleries surface (`/galerias` on web, the Galerías drawer entry on
   * the app). Dark-launched (default false).
   *
   * Deliberately a SECOND gate on top of {@link LAUNCH_V2}, not a replacement:
   * consumers must require BOTH (`LAUNCH_V2 && LAUNCH_GALERIAS`). `launch_v2`
   * is already on, but galleries stay dark until this one is flipped, so the
   * galleries surface can ship without riding the V2 launch. Once galleries go
   * live for good, drop this flag rather than leave a permanent second gate.
   */
  LAUNCH_GALERIAS: "launch_galerias",
  /**
   * @deprecated Prefer {@link LAUNCH_V2} — the unified switch shared with
   * sitimm-web. Kept for back-compat until all consumers migrate.
   * Silent migration to API V2 (mini-back). When true, app uses V2 endpoints.
   */
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
