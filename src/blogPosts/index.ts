/**
 * Blogs V2 — barrel re-export.
 *
 * Backend: `app/presentation/schemas/v2/blog/*` and
 * `app/presentation/api/v2/blog_*.py` (mini-back).
 *
 * Consumers can either import the entire module or pick the deep entry
 * point:
 *
 * ```ts
 * import { BlogPostDetailV2, BLOG_V2_ENDPOINTS } from "@kerbero1994/shared-types";
 * // or
 * import * as Blog from "@kerbero1994/shared-types/blogPosts";
 * ```
 */

export * from "./types";
export * from "./endpoints";
export * from "./fcmTopics";
