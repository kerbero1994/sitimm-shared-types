/**
 * Engagement subsystem — barrel re-export.
 *
 * Bounded context decoupled from any single feature. Blog posts,
 * magazines, events, galleries, single photos, consultations and
 * bulletins each register a
 * `subject_type` on the backend via `subject_registry` and call
 * `make_engagement_router(subject_type, base_prefix)` to mount the full
 * comments + reactions + bookmarks + views + shares surface under their
 * own URL space.
 *
 * Backend: `app/engagement/presentation/schemas/*` +
 * `app/engagement/presentation/routes/*` + `app/engagement/domain/*`.
 *
 * Consumers can import from the main package or from this deep entry
 * point:
 *
 * ```ts
 * import { EngagementComment, ENGAGEMENT_BLOG_ENDPOINTS } from "@kerbero1994/shared-types";
 * // or
 * import * as Engagement from "@kerbero1994/shared-types/engagement";
 * ```
 */

export * from "./types";
export * from "./endpoints";
