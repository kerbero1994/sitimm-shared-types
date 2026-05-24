/**
 * Blogs V2 endpoint paths.
 *
 * Backend: `app/presentation/api/v2/blog_*.py` (mini-back).
 *
 * Parameterized paths use `{param}` placeholders matching the FastAPI
 * route definition. Use the shared `endpoint()` helper from
 * `@kerbero1994/shared-types/endpoints` to expand them.
 *
 * Each entry includes a JSDoc comment documenting:
 * - HTTP method
 * - Body / response types (cross-referenced to `./types.ts`)
 * - Auth / permission requirements
 *
 * Status codes (201 / 202 / 204) are noted in `docs/v2/Blogs/endpoints.md`.
 */

export const BLOG_V2_ENDPOINTS = {
  // ── Public reader ────────────────────────────────────────

  /** GET → V2Response<BlogPostListResponseV2>. Query: locale, category_slug, tag_slug, author_id, q, limit, offset, order_by. Public. */
  BLOG_POSTS: "/api/v2/blog/posts",
  /** GET → V2Response<BlogPostDetailV2>. Query: locale?. Path: slug. Public. */
  BLOG_POST_BY_SLUG: "/api/v2/blog/posts/{slug}",
  /** GET → V2Response<{items: BlogCategoryV2[]}>. Public catalog. */
  BLOG_CATEGORIES: "/api/v2/blog/categories",
  /** GET → V2Response<{items: BlogTagV2[]}>. Public catalog. */
  BLOG_TAGS: "/api/v2/blog/tags",
  /** GET → V2Response<BlogSearchResponseV2>. Query: q (≥2 chars), locale, limit, offset. Public. */
  BLOG_SEARCH: "/api/v2/blog/search",
  /** GET → V2Response<BlogSearchSuggestResponseV2>. Query: q (≥2 chars), locale, limit (≤10, default 6). Public. */
  BLOG_SEARCH_SUGGEST: "/api/v2/blog/search/suggest",
  /** GET → V2Response<BlogRelatedResponseV2>. Path: uuid. Public. */
  BLOG_POST_RELATED: "/api/v2/blog/posts/{uuid}/related",
  /** GET → application/xml. Path: locale. Public, NOT wrapped in V2Response. */
  BLOG_SITEMAP_LOCALE: "/sitemap-blog-{locale}.xml",
  /** GET → application/xml. Public. Index linking the 8 per-locale sitemaps. */
  BLOG_SITEMAP_INDEX: "/sitemap-blog-index.xml",
  /** POST → V2Response<BlogViewResponseV2>. Status 202. Anonymous OK. Headers: X-Device-Id (optional). */
  BLOG_POST_VIEW: "/api/v2/blog/posts/{uuid}/view",
  /** POST → Body: `BlogShareRequestV2` (optional). Returns V2Response<BlogShareResponseV2>. Status 202. Anonymous OK. Unknown channels → 422. */
  BLOG_POST_SHARE: "/api/v2/blog/posts/{uuid}/share",

  // ── Authenticated engagement ─────────────────────────────

  /** POST → Body: BlogReactionRequestV2. Returns V2Response<BlogReactionResponseV2>. Auth required. */
  BLOG_POST_REACTIONS: "/api/v2/blog/posts/{uuid}/reactions",
  /** POST → V2Response<BlogBookmarkResponseV2>. Status 201. Idempotent — re-posting returns 200. Auth required. */
  BLOG_POST_BOOKMARK: "/api/v2/blog/posts/{uuid}/bookmark",
  /** DELETE → 204. Removes the bookmark. Auth required. */
  BLOG_POST_BOOKMARK_DELETE: "/api/v2/blog/posts/{uuid}/bookmark",
  /** GET → V2Response<BlogBookmarkListResponseV2>. Auth required. */
  BLOG_ME_BOOKMARKS: "/api/v2/me/blog/bookmarks",
  /** POST → Body: BlogCommentCreateRequestV2. Returns V2Response<BlogCommentV2>. Status 201. Auth required. INV-BP-5/INV-BP-6 enforced. */
  BLOG_POST_COMMENTS_CREATE: "/api/v2/blog/posts/{uuid}/comments",
  /** GET → V2Response<BlogCommentListResponseV2>. Auth optional (read public). */
  BLOG_POST_COMMENTS: "/api/v2/blog/posts/{uuid}/comments",
  /**
   * DELETE → 204. Path: `comment_uuid` (UUID v4). Auth: owner only.
   *
   * The legacy 0.61.x export `/api/v2/blog/comments/{id}` was wrong — the
   * route is mounted by `app/presentation/api/v2/blog_engagement_adapter.py`
   * at `base_prefix="/api/v2/blog/posts"` and the factory route is
   * `/comments/{comment_uuid}` (see
   * `app/engagement/presentation/routes/attach_factory.py`), so the final
   * path lives under `/posts/` and the path param is a UUID, not a numeric
   * id. Admin moderation deletes (different route) live under
   * `/api/v2/engagement/admin/comments/{uuid}`.
   */
  BLOG_COMMENT_DELETE: "/api/v2/blog/posts/comments/{comment_uuid}",

  // ── Admin posts ──────────────────────────────────────────

  /** POST → Body: BlogPostCreateAdminV2. Returns V2Response<BlogPostAdminResponseV2>. Status 201. Requires blog_posts:create. */
  BLOG_ADMIN_POSTS_CREATE: "/api/v2/blog/admin/posts",
  /** GET → V2Response<BlogPostAdminListResponseV2>. Query: status, include_deleted, q, category_slug, tag_slug, author_id, limit, offset. Requires blog_posts:update. */
  BLOG_ADMIN_POSTS: "/api/v2/blog/admin/posts",
  /** PATCH → Body: BlogPostUpdateAdminV2. Returns V2Response<BlogPostAdminResponseV2>. Requires blog_posts:update. */
  BLOG_ADMIN_POST_UPDATE: "/api/v2/blog/admin/posts/{uuid}",
  /** GET → V2Response<BlogPostAdminResponseV2>. Returns full post with ALL translations. Includes soft-deleted rows (404 only when no row exists). Requires blog_posts:update. */
  BLOG_ADMIN_POST_BY_UUID: "/api/v2/blog/admin/posts/{uuid}",
  /** DELETE → 204. Soft delete. Idempotent. Requires blog_posts:delete. */
  BLOG_ADMIN_POST_DELETE: "/api/v2/blog/admin/posts/{uuid}",
  /** POST → V2Response<BlogPostAdminResponseV2>. Sets status=archived. Requires blog_posts:archive. */
  BLOG_ADMIN_POST_ARCHIVE: "/api/v2/blog/admin/posts/{uuid}/archive",
  /** POST → V2Response<BlogPostAdminResponseV2>. Sets status=active. Requires blog_posts:archive. */
  BLOG_ADMIN_POST_UNARCHIVE: "/api/v2/blog/admin/posts/{uuid}/unarchive",
  /** POST → Status 202. Query: force?. Re-runs Google Translate for {locale}. Requires blog_posts:update. */
  BLOG_ADMIN_POST_TRANSLATE: "/api/v2/blog/admin/posts/{uuid}/translate/{locale}",
  /** PATCH → Body: BlogPostTranslationUpdateAdminV2. Returns V2Response<BlogPostTranslationV2>. Requires blog_posts:update. */
  BLOG_ADMIN_POST_TRANSLATION: "/api/v2/blog/admin/posts/{uuid}/translations/{locale}",
  /** GET → V2Response<BlogPostAnalyticsResponseV2>. Requires blog_posts:update. */
  BLOG_ADMIN_POST_ANALYTICS: "/api/v2/blog/admin/posts/{uuid}/analytics",
  /** GET → V2Response<BlogSearchGapsResponseV2>. Requires blog_posts:update. */
  BLOG_ADMIN_SEARCH_GAPS: "/api/v2/blog/admin/search-gaps",

  // ── Admin categories ─────────────────────────────────────

  /** POST → Body: BlogCategoryCreateAdminV2. Status 201. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_CATEGORIES_CREATE: "/api/v2/blog/admin/categories",
  /** PATCH → Body: BlogCategoryUpdateAdminV2. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_CATEGORY_UPDATE: "/api/v2/blog/admin/categories/{id}",
  /** DELETE → 204. Rejected with 409 BLOG_CATEGORY_IN_USE when usage_count > 0. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_CATEGORY_DELETE: "/api/v2/blog/admin/categories/{id}",

  // ── Admin tags ───────────────────────────────────────────

  /** POST → Body: BlogTagCreateAdminV2. Status 201. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_TAGS_CREATE: "/api/v2/blog/admin/tags",
  /** PATCH → Body: BlogTagUpdateAdminV2. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_TAG_UPDATE: "/api/v2/blog/admin/tags/{id}",
  /** DELETE → 204. Rejected with 409 BLOG_TAG_IN_USE when usage_count > 0. Requires blog_taxonomy:manage. */
  BLOG_ADMIN_TAG_DELETE: "/api/v2/blog/admin/tags/{id}",

  // ── Admin profanity wordlist ─────────────────────────────

  /** POST → Body: BlogProfanityTermCreateV2. Status 201. Requires blog_comments:moderate. */
  BLOG_ADMIN_PROFANITY_CREATE: "/api/v2/blog/admin/profanity-terms",
  /** DELETE → 204. Requires blog_comments:moderate. */
  BLOG_ADMIN_PROFANITY_DELETE: "/api/v2/blog/admin/profanity-terms/{id}",

  // ── Admin comment moderation ─────────────────────────────

  /** GET → V2Response<BlogCommentModerationListResponseV2>. Query: post_uuid, user_id, has_flagged_terms, created_after, limit, offset. Requires blog_comments:moderate. */
  BLOG_ADMIN_COMMENTS: "/api/v2/blog/admin/comments",
  /** DELETE → 204. Admin moderation delete (different from public BLOG_COMMENT_DELETE). Requires blog_comments:moderate. */
  BLOG_ADMIN_COMMENT_DELETE: "/api/v2/blog/admin/comments/{id}",
} as const;

export type BlogV2EndpointKey = keyof typeof BLOG_V2_ENDPOINTS;
export type BlogV2Endpoint = (typeof BLOG_V2_ENDPOINTS)[BlogV2EndpointKey];
