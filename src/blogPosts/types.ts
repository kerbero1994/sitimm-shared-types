/**
 * Blogs V2 types — public reader, engagement, admin CMS, search, FCM push.
 *
 * Backend: `app/presentation/schemas/v2/blog/*` and
 * `app/infrastructure/database/models/blog_v2.py` (mini-back).
 *
 * Surface overview:
 * - Public reader: list, detail by slug, categories/tags catalog, search,
 *   suggest, related, sitemap, view/share increments.
 * - Authenticated engagement: reactions toggle, bookmark toggle, bookmark
 *   listing, comment create/list/delete (max 5/user/post).
 * - Admin CMS: posts CRUD (status `active`/`archived`/`deleted`), per-locale
 *   translation editing (human override flag), categories/tags admin,
 *   profanity wordlist admin, comment moderation, analytics, search-gaps.
 *
 * Localization: 8 locales (`es, en, fr, de, hi, ko, ja, zh`). On request
 * the server falls back to `es` and sets `X-Blog-Locale-Fallback: es` when
 * the target translation is missing.
 *
 * Time fields: every `*_at` / `*At` is an ISO 8601 UTC string. Nullable on
 * the wire is mirrored to TS via `| null`. The wire shape follows Pydantic
 * snake_case (no automatic camelCase conversion).
 */

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

/**
 * Supported locale codes for blog posts and translations.
 * Backend: `LOCALES` in `app/infrastructure/database/models/blog_v2.py`.
 */
export const BLOG_LOCALES = [
  "es", "en", "fr", "de", "hi", "ko", "ja", "zh",
] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

/**
 * Post lifecycle statuses persisted on `blog_posts.status` — exactly two
 * values. `active` is public-visible. `archived` is hidden from public
 * reader but still in admin list.
 *
 * `deleted` is **not** a status enum value. Soft deletion is the
 * orthogonal `deleted_at IS NOT NULL` flag — filtered out of every
 * public read regardless of `status`. To list deleted rows on the
 * admin list endpoint, pass the `BLOG_POST_LIST_FILTERS` value
 * `"deleted"` (or `"all"`).
 *
 * Backend: `POST_STATUSES` in
 * `app/infrastructure/database/models/blog_v2.py`.
 */
export const BLOG_POST_STATUSES = ["active", "archived"] as const;
export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

/**
 * Admin list-filter values accepted by
 * `GET /api/v2/blog/admin/posts?status=...`. Not the persisted enum
 * (use `BLOG_POST_STATUSES` for that). The extra values surface
 * soft-deleted rows or skip the filter entirely:
 *
 * - `"active"` / `"archived"` — match the `status` column directly.
 * - `"deleted"` — rows with `deleted_at IS NOT NULL`, any status.
 * - `"all"` — no filter (admin gets every row including
 *   soft-deleted).
 */
export const BLOG_POST_LIST_FILTERS = [
  "active",
  "archived",
  "deleted",
  "all",
] as const;
export type BlogPostListFilter = (typeof BLOG_POST_LIST_FILTERS)[number];

/**
 * Reaction values. `neutral` deletes the user's reaction row.
 * Backend persisted values: `useful` | `not_useful` (REACTION_KINDS).
 * `neutral` is request-only sugar that removes any existing row.
 */
export const BLOG_REACTION_KINDS = ["useful", "not_useful", "neutral"] as const;
export type BlogReactionKind = (typeof BLOG_REACTION_KINDS)[number];

/**
 * Profanity-list severity. `blocker` rejects comment submission; `warn`
 * passes through but flags for moderation queue.
 * Backend: `PROFANITY_SEVERITIES`.
 */
export const BLOG_PROFANITY_SEVERITIES = ["blocker", "warn"] as const;
export type BlogProfanitySeverity = (typeof BLOG_PROFANITY_SEVERITIES)[number];

/**
 * Every block discriminator value the server validates in
 * `BlogPostBody.blocks[*].type`. Mirrors the union in
 * `app/presentation/schemas/v2/blog/blocks.py`.
 *
 * 14 reused from FAQ + 8 new (raw_html, code_block, embed_youtube,
 * embed_vimeo, embed_spotify, audio_player, gallery_embed,
 * table_of_contents).
 */
export const BLOG_BLOCK_VARIANTS = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "callout",
  "image",
  "video",
  "pdf_card",
  "table",
  "glossary_term",
  "related_cta",
  "consultation_cta",
  "legal_disclaimer",
  "divider",
  "raw_html",
  "code_block",
  "embed_youtube",
  "embed_vimeo",
  "embed_spotify",
  "audio_player",
  "gallery_embed",
  "table_of_contents",
] as const;
export type BlogBlockVariant = (typeof BLOG_BLOCK_VARIANTS)[number];

/**
 * Maximum comments per user per post. INV-BP-5.
 * Backend constant: `COMMENT_LIMIT_PER_USER_PER_POST` in
 * `app/application/services/blog_comment_service.py` (line 28).
 * Exceeding triggers `429 BLOG_COMMENT_LIMIT_REACHED`.
 */
export const BLOG_COMMENT_LIMIT_PER_USER_PER_POST = 5 as const;

/**
 * Real-view counter dedupe grain. Enforced by the migration UNIQUE
 * constraint `blog_post_view_log_dedupe_uq` on
 * `(post_id, identity_key, viewed_date)` — one increment per identity
 * per calendar day, not a rolling 24h window. There is no Python-side
 * hours constant. INV-BP-8.
 *
 * Backend:
 * `alembic/versions/blogs_v2_20260514_create_schema.py` (UNIQUE
 * constraint definition).
 */
export const BLOG_VIEW_DEDUPE_BY = "calendar_day" as const;
export type BlogViewDedupeBy = typeof BLOG_VIEW_DEDUPE_BY;

/**
 * Response header set by the server when the requested locale lacks a
 * translation and the response falls back to Spanish.
 */
export const BLOG_LOCALE_FALLBACK_HEADER = "X-Blog-Locale-Fallback";

/**
 * Header the FE sends with anonymous `POST /posts/{uuid}/view` and search
 * calls to enable per-device dedupe without a JWT. Authenticated calls
 * may omit it (identity is the user id).
 */
export const BLOG_DEVICE_ID_HEADER = "X-Device-Id";

// ─────────────────────────────────────────────────────────────────────
// Block discriminated union
// ─────────────────────────────────────────────────────────────────────

/** Variant for callout boxes. */
export type BlogCalloutVariant = "info" | "warning" | "tip" | "legal" | "success";
/** Image alignment hint for the renderer. */
export type BlogImageAlign = "left" | "center" | "right" | "full";
/** Consultation CTA channel mapping to V2 consultation types. */
export type BlogConsultationType =
  | "IMSS"
  | "INFONAVIT"
  | "AFORE"
  | "FONACOT"
  | "GENERAL";
/** Spotify embed kind. */
export type BlogSpotifyKind = "track" | "episode" | "show" | "playlist";
/** Audio block MIME whitelist. */
export type BlogAudioMime = "audio/mpeg" | "audio/ogg" | "audio/wav";

export interface BlogBlockParagraph {
  type: "paragraph";
  /** Markdown text. Max 4000 chars. */
  text_md: string;
}

export interface BlogBlockHeading {
  type: "heading";
  /** Heading level — only h2/h3 allowed inside article body. */
  level: 2 | 3;
  /** Plain heading text. Max 200 chars. */
  text: string;
}

export interface BlogBlockList {
  type: "list";
  /** True for ordered (numbered) list, false for bulleted. */
  ordered: boolean;
  /** 1–50 items, each max 500 chars. */
  items: string[];
}

export interface BlogBlockQuote {
  type: "quote";
  /** Quote text. Max 600 chars. */
  text: string;
  /** Optional attribution. Max 200 chars. */
  source: string | null;
  /** Optional source URL (validated as HttpUrl on BE). */
  source_url: string | null;
}

export interface BlogBlockCallout {
  type: "callout";
  variant: BlogCalloutVariant;
  /** Markdown text. Max 1500 chars. */
  text_md: string;
  /** Optional title. Max 120 chars. */
  title: string | null;
}

export interface BlogBlockVideo {
  type: "video";
  /**
   * Resource UUID — enriched by the server with provider metadata.
   * Deprecated for new Blogs V2 content; prefer `embed_youtube` /
   * `embed_vimeo` blocks. Retained for FAQ-block parity.
   */
  resource_uuid: string;
  autoplay: boolean;
  caption: string | null;
}

export interface BlogBlockImage {
  type: "image";
  resource_uuid: string;
  /** Required alt text. Max 300 chars. */
  alt: string;
  caption: string | null;
  align: BlogImageAlign;
}

export interface BlogBlockPdfCard {
  type: "pdf_card";
  resource_uuid: string;
  /** Whether the renderer should show the inline first-page preview. */
  show_preview: boolean;
}

export interface BlogBlockTable {
  type: "table";
  /** 1–10 column headers. */
  headers: string[];
  /** 1–50 rows; each row length must equal `headers.length`. */
  rows: string[][];
  caption: string | null;
}

export interface BlogGlossaryTermResolved {
  uuid: string;
  display_term: string;
  /** Markdown definition. */
  definition_md: string;
  related_article_uuids: string[];
}

export interface BlogBlockGlossaryTerm {
  type: "glossary_term";
  /** Term key. Max 80 chars. */
  term: string;
  /** Server-resolved data — null when the term has been removed. */
  resolved: BlogGlossaryTermResolved | null;
}

/** Lightweight post ref embedded in related-CTA resolution. */
export interface BlogPostSummaryRef {
  uuid: string;
  slug: string;
  title: string;
  summary: string | null;
}

export interface BlogRelatedCtaResolved {
  target: BlogPostSummaryRef;
}

export interface BlogBlockRelatedCTA {
  type: "related_cta";
  target_blog_uuid: string;
  /** Optional CTA label override. Max 120 chars. */
  label: string | null;
  /** Server-injected — null when the target was unpublished/deleted. */
  resolved: BlogRelatedCtaResolved | null;
}

export interface BlogBlockConsultationCTA {
  type: "consultation_cta";
  consultation_type: BlogConsultationType;
  /** Max 120 chars. */
  label: string | null;
}

export interface BlogBlockLegalDisclaimer {
  type: "legal_disclaimer";
  /** Markdown disclaimer. Max 800 chars. */
  text_md: string;
  severity: "info" | "warning";
}

export interface BlogBlockDivider {
  type: "divider";
}

export interface BlogBlockRawHtml {
  type: "raw_html";
  /** Author-provided HTML (server sanitizes via nh3). Max 50,000 chars. */
  html_input: string;
  /** Server-sanitized HTML, safe to render verbatim. */
  html_sanitized: string | null;
}

export interface BlogBlockCodeBlock {
  type: "code_block";
  /** Language hint (highlight.js / shiki). Max 32 chars. */
  language: string;
  /** Source code. Max 10,000 chars. */
  code: string;
  /** Max 200 chars. */
  caption: string | null;
}

/** Server-attached oEmbed payload for video/audio embed blocks. */
export interface BlogEmbedResolved {
  title: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  provider_name: string | null;
}

export interface BlogBlockEmbedYoutube {
  type: "embed_youtube";
  /** YouTube video id (`^[A-Za-z0-9_-]+$`). Max 16 chars. */
  video_id: string;
  /** Optional start offset in seconds. */
  start_seconds: number | null;
  /** Max 200 chars. */
  caption: string | null;
  resolved: BlogEmbedResolved | null;
}

export interface BlogBlockEmbedVimeo {
  type: "embed_vimeo";
  /** Vimeo numeric video id. Max 16 chars. */
  video_id: string;
  /** Max 200 chars. */
  caption: string | null;
  resolved: BlogEmbedResolved | null;
}

export interface BlogBlockEmbedSpotify {
  type: "embed_spotify";
  kind: BlogSpotifyKind;
  /** Spotify id (alphanumeric). Max 32 chars. */
  spotify_id: string;
  /** Max 200 chars. */
  caption: string | null;
}

export interface BlogBlockAudioPlayer {
  type: "audio_player";
  /** Direct audio URL (HttpUrl on BE). */
  audio_url: string;
  mime: BlogAudioMime;
  /** Max 200 chars. */
  caption: string | null;
  /** Optional, ≥ 0. */
  duration_seconds: number | null;
}

export interface BlogGalleryEmbedResolved {
  gallery_uuid: string;
  name: string | null;
  /** Resolved gallery items; shape provided by the galleries module. */
  items: Array<Record<string, unknown>>;
}

export interface BlogBlockGalleryEmbed {
  type: "gallery_embed";
  gallery_uuid: string;
  /** Max 200 chars. */
  caption: string | null;
  resolved: BlogGalleryEmbedResolved | null;
}

export interface BlogTableOfContentsItem {
  level: number;
  text: string;
  anchor_slug: string;
}

export interface BlogBlockTableOfContents {
  type: "table_of_contents";
  items: BlogTableOfContentsItem[];
}

/**
 * Discriminated union over every block variant accepted by the server in
 * `BlogPostTranslation.body_blocks`. Variants are checked by Pydantic via
 * the `type` literal; unknown variants raise `BLOG_BODY_BLOCKS_INVALID`.
 */
export type BlogBlock =
  | BlogBlockParagraph
  | BlogBlockHeading
  | BlogBlockList
  | BlogBlockQuote
  | BlogBlockCallout
  | BlogBlockImage
  | BlogBlockVideo
  | BlogBlockPdfCard
  | BlogBlockTable
  | BlogBlockGlossaryTerm
  | BlogBlockRelatedCTA
  | BlogBlockConsultationCTA
  | BlogBlockLegalDisclaimer
  | BlogBlockDivider
  | BlogBlockRawHtml
  | BlogBlockCodeBlock
  | BlogBlockEmbedYoutube
  | BlogBlockEmbedVimeo
  | BlogBlockEmbedSpotify
  | BlogBlockAudioPlayer
  | BlogBlockGalleryEmbed
  | BlogBlockTableOfContents;

// ─────────────────────────────────────────────────────────────────────
// Shared sub-types (public reader)
// ─────────────────────────────────────────────────────────────────────

/**
 * Author projection on list and detail responses.
 * Backend: `blog/public.py :: BlogAuthorV2`.
 */
export interface BlogAuthorV2 {
  user_id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  /** True only for sort_order = 0 (the primary author). */
  is_primary: boolean;
}

/**
 * Compact category ref embedded in post/search responses.
 * Backend: `blog/public.py :: BlogCategoryV2`.
 */
export interface BlogCategoryV2 {
  id: number;
  slug: string;
  name: string;
  /** Denormalized live count of posts using this category. */
  usage_count: number | null;
}

/**
 * Compact tag ref.
 * Backend: `blog/public.py :: BlogTagV2`.
 */
export interface BlogTagV2 {
  id: number;
  slug: string;
  name: string;
  usage_count: number | null;
}

/**
 * Admin view of a category — superset of {@link BlogCategoryV2} adding
 * `uuid` + `description`. Returned by `POST /api/v2/blog/admin/categories`
 * and `PATCH /api/v2/blog/admin/categories/{id}`.
 * Backend: `blog/admin.py :: BlogCategoryAdminResponse`.
 */
export interface BlogCategoryAdminV2 {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  description: string | null;
  usage_count: number | null;
}

/**
 * Admin view of a tag — superset of {@link BlogTagV2} adding `uuid`.
 * Returned by `POST /api/v2/blog/admin/tags` and
 * `PATCH /api/v2/blog/admin/tags/{id}`.
 * Backend: `blog/admin.py :: BlogTagAdminResponse`.
 */
export interface BlogTagAdminV2 {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  usage_count: number | null;
}

/**
 * Profanity wordlist row returned by
 * `POST /api/v2/blog/admin/profanity-terms`.
 * Backend: `blog/admin.py :: BlogProfanityTermResponse`.
 *
 * `created_at` is ISO-8601 (Pydantic `datetime` serialized as JSON);
 * the backend currently emits `null` when the column is unset, which
 * in practice never happens after insert.
 */
export interface BlogProfanityTermResponseV2 {
  id: number;
  term: string;
  language: BlogLocale;
  /** `"blocker"` or `"warn"` — see `PROFANITY_SEVERITY` in `admin.py`. */
  severity: "blocker" | "warn";
  notes: string | null;
  created_at: string | null;
}

/**
 * SEO metadata block embedded in post detail / admin response.
 * Backend: `blog/public.py :: BlogSeoV2`.
 */
export interface BlogSeoV2 {
  title: string | null;
  description: string | null;
  og_image_url: string | null;
}

/**
 * Engagement counters + per-caller flags. Authenticated callers receive
 * `user_reaction` / `user_bookmarked`; anonymous callers receive
 * `user_reaction = null` and `user_bookmarked = false`.
 * Backend: `blog/public.py :: BlogEngagementV2`.
 */
export interface BlogEngagementV2 {
  view_count_vanity: number;
  useful_count: number;
  not_useful_count: number;
  share_count: number;
  /** `useful`, `not_useful`, `neutral` (request-only) or `null`. */
  user_reaction: "useful" | "not_useful" | "neutral" | null;
  user_bookmarked: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Translation projection (admin view)
// ─────────────────────────────────────────────────────────────────────

/**
 * Per-locale translation row as shown to admins alongside the master post.
 * Backend: `blog/admin.py :: BlogTranslationAdminView`.
 *
 * Public detail responses inline these fields directly on
 * `BlogPostDetailV2` (single translation per request); this shape only
 * surfaces in the admin response when listing all translations of a post.
 */
export interface BlogPostTranslationV2 {
  locale: BlogLocale;
  title: string;
  slug: string;
  summary: string | null;
  /** Pydantic returns the validated blocks as `list[dict]` after enrichment. */
  body_blocks: BlogBlock[];
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  reading_minutes: number | null;
  is_machine_translated: boolean;
  /** ISO 8601 — null until first translation run completes. */
  translated_at: string | null;
  /** Free-text actor label (e.g. `"google-translate"` or admin email). */
  translated_by: string | null;
  updated_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Public reader — list + detail
// ─────────────────────────────────────────────────────────────────────

/**
 * Light card projection used in `GET /api/v2/blog/posts` list responses.
 * Backend: `blog/public.py :: BlogPostListItemV2`.
 */
export interface BlogPostListItemV2 {
  uuid: string;
  slug: string;
  locale: BlogLocale;
  /** True when the server fell back to `es` because the locale was missing. */
  is_translation_fallback: boolean;
  /** True when the active translation is still Google-generated. */
  is_machine_translated: boolean;
  title: string;
  summary: string | null;
  cover_url: string | null;
  /** Variants (`thumb`, `card`, `hero`, `og`, …) emitted by the image pipeline. */
  cover_url_variants: Record<string, unknown> | null;
  authors: BlogAuthorV2[];
  categories: BlogCategoryV2[];
  tags: BlogTagV2[];
  /** ISO 8601 UTC. */
  published_at: string;
  reading_minutes: number | null;
  view_count_vanity: number;
  useful_count: number;
  share_count: number;
}

/**
 * GET `/api/v2/blog/posts` response payload (inside `V2Response.data`).
 * Backend: `blog/public.py :: BlogPostListResponse`.
 */
export interface BlogPostListResponseV2 {
  items: BlogPostListItemV2[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Full post detail returned by `GET /api/v2/blog/posts/{slug}`.
 * Backend: `blog/public.py :: BlogPostDetailV2`.
 */
export interface BlogPostDetailV2 {
  uuid: string;
  slug: string;
  locale: BlogLocale;
  is_translation_fallback: boolean;
  is_machine_translated: boolean;
  title: string;
  summary: string | null;
  /** Ordered list of body blocks; renderer dispatches on `type`. */
  body_blocks: BlogBlock[];
  /** Server-side rendered HTML for SSR/SEO. */
  body_html_sanitized: string | null;
  cover_url: string | null;
  cover_url_variants: Record<string, unknown> | null;
  authors: BlogAuthorV2[];
  categories: BlogCategoryV2[];
  tags: BlogTagV2[];
  /** ISO 8601 UTC. */
  published_at: string;
  /** ISO 8601 UTC — null when never edited after create. */
  updated_at: string | null;
  reading_minutes: number | null;
  seo: BlogSeoV2;
  engagement: BlogEngagementV2;
  comments_enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Search + suggest + related
// ─────────────────────────────────────────────────────────────────────

/**
 * Single hit returned by `GET /api/v2/blog/search`.
 * Backend: `blog/public.py :: BlogSearchHitV2`.
 */
export interface BlogSearchHitV2 {
  uuid: string;
  slug: string;
  /** May contain `<mark>` markers around matched tokens (ts_headline). */
  title: string;
  /** ts_headline snippet, also marked. */
  snippet: string;
  /** ts_rank or pg_trgm similarity score, higher = better. */
  ts_rank: number;
  /** Which postgres path produced the hit. */
  matched_via: "tsvector" | "trigram_fallback";
  category: BlogCategoryV2 | null;
  /** ISO 8601 UTC — may be null for legacy rows. */
  published_at: string | null;
}

/**
 * GET `/api/v2/blog/search` response payload.
 * Backend: `blog/public.py :: BlogSearchResponse`.
 *
 * `matched_via` at the response level is `"mixed"` when results span both
 * paths and `"none"` for empty result sets.
 */
export interface BlogSearchResponseV2 {
  query: string;
  matched_via: "tsvector" | "trigram_fallback" | "mixed" | "none";
  items: BlogSearchHitV2[];
  total: number;
}

/**
 * Single typeahead row returned by `GET /api/v2/blog/search/suggest`.
 * Backend: `blog/public.py :: BlogSearchSuggestionV2`.
 */
export interface BlogSearchSuggestionV2 {
  slug: string;
  title: string;
}

/** GET `/api/v2/blog/search/suggest` response payload. */
export interface BlogSearchSuggestResponseV2 {
  items: BlogSearchSuggestionV2[];
}

/**
 * Single related-post entry. Manual entries omit `similarity_score`;
 * auto-curated entries include it (cosine similarity over taxonomy
 * overlap).
 * Backend: `blog/public.py :: BlogRelatedItemV2`.
 */
export interface BlogRelatedItemV2 {
  uuid: string;
  slug: string;
  title: string;
  cover_url: string | null;
  similarity_score: number | null;
}

/** GET `/api/v2/blog/posts/{uuid}/related` response payload. */
export interface BlogRelatedResponseV2 {
  /** Admin-curated related posts (highest priority for the FE). */
  manual: BlogRelatedItemV2[];
  /** Auto-derived suggestions from taxonomy overlap. */
  auto: BlogRelatedItemV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Engagement — view / share / reactions / bookmarks / comments
// ─────────────────────────────────────────────────────────────────────

/** Reaction request body for `POST /api/v2/blog/posts/{uuid}/reactions`. */
export interface BlogReactionRequestV2 {
  /** `useful` / `not_useful` set the reaction; `neutral` deletes it. */
  reaction: BlogReactionKind;
}

/** Reaction response payload (200 OK on toggle). */
export interface BlogReactionResponseV2 {
  /** `null` when the row was deleted (toggle to `neutral`). */
  user_reaction: "useful" | "not_useful" | null;
  useful_count: number;
  not_useful_count: number;
}

/**
 * Response for `POST/DELETE /api/v2/blog/posts/{uuid}/bookmark`.
 * Backend: `blog/public.py :: BlogBookmarkResponse`.
 */
export interface BlogBookmarkResponseV2 {
  user_bookmarked: boolean;
}

/** Row in `GET /api/v2/me/blog/bookmarks`. */
export interface BlogBookmarkListItemV2 {
  uuid: string;
  slug: string | null;
  title: string | null;
  cover_url: string | null;
  /** ISO 8601 UTC. */
  bookmarked_at: string;
}

/** GET `/api/v2/me/blog/bookmarks` response payload. */
export interface BlogBookmarkListResponseV2 {
  items: BlogBookmarkListItemV2[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * POST `/api/v2/blog/posts/{uuid}/comments` request body.
 * Backend: `blog/public.py :: BlogCommentCreateRequest`.
 */
export interface BlogCommentCreateRequestV2 {
  /** Markdown body. 2–4000 chars. */
  body_md: string;
}

/**
 * Single comment row returned by create or list.
 * Backend: `blog/public.py :: BlogCommentV2`.
 */
export interface BlogCommentV2 {
  id: number;
  uuid: string;
  body_md: string;
  /** Server-sanitized HTML, safe to render verbatim. */
  body_html_sanitized: string;
  author: BlogAuthorV2;
  /** ISO 8601 UTC. */
  created_at: string;
  /** True when the caller authored the comment (drives delete affordance). */
  is_author_self: boolean;
}

/** GET `/api/v2/blog/posts/{uuid}/comments` response payload. */
export interface BlogCommentListResponseV2 {
  items: BlogCommentV2[];
  total: number;
  limit: number;
  offset: number;
}

/** POST `/api/v2/blog/posts/{uuid}/view` response payload. */
export interface BlogViewResponseV2 {
  view_count_vanity: number;
}

/** POST `/api/v2/blog/posts/{uuid}/share` response payload. */
export interface BlogShareResponseV2 {
  share_count: number;
}

// ─────────────────────────────────────────────────────────────────────
// Admin — write payloads
// ─────────────────────────────────────────────────────────────────────

/**
 * Create payload for `POST /api/v2/blog/admin/posts`.
 * Backend: `blog/admin.py :: BlogPostCreateAdmin`.
 *
 * `locale` is implicitly `es` on create; other locales are populated
 * asynchronously by the Celery `translate_post_to_all_locales` task.
 */
export interface BlogPostCreateAdminV2 {
  /** Up to 20 author user ids. First is treated as primary. */
  author_user_ids: number[];
  /** Max 300 chars. */
  title: string;
  /** Max 80 chars; must match `^[a-z0-9-]+$` and ≥ 3 chars. */
  slug: string;
  /** Max 600 chars. */
  summary: string | null;
  /** 1–400 blocks. */
  body_blocks: BlogBlock[];
  /** Max 1000 chars. */
  cover_url: string | null;
  cover_url_variants: Record<string, unknown> | null;
  /** Up to 20 category ids. */
  category_ids: number[];
  /** Up to 40 tag ids. */
  tag_ids: number[];
  comments_enabled: boolean;
  /** Max 255 chars. */
  seo_title: string | null;
  /** Max 600 chars. */
  seo_description: string | null;
  /** Max 1000 chars. */
  og_image_url?: string | null;
  /** Explicit override, 1–240. When null the server auto-computes. */
  reading_minutes_override: number | null;
}

/**
 * Partial update payload for `PATCH /api/v2/blog/admin/posts/{uuid}`.
 * Backend: `blog/admin.py :: BlogPostUpdateAdmin`.
 *
 * Only fields present in the body are updated. Updating `body_blocks` or
 * `title` on the canonical (`es`) row enqueues a re-translation task for
 * non-overridden locales.
 */
export interface BlogPostUpdateAdminV2 {
  author_user_ids?: number[] | null;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  body_blocks?: BlogBlock[] | null;
  cover_url?: string | null;
  cover_url_variants?: Record<string, unknown> | null;
  category_ids?: number[] | null;
  tag_ids?: number[] | null;
  /** Manual related-post curation (admin choice). */
  related_post_ids?: number[] | null;
  comments_enabled?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  reading_minutes_override?: number | null;
}

/**
 * Human override payload for
 * `PATCH /api/v2/blog/admin/posts/{uuid}/translations/{locale}`.
 * Backend: `blog/admin.py :: BlogPostTranslationUpdateAdmin`.
 *
 * Setting any field flips `is_machine_translated = false` for that locale
 * row. Sending it later via `POST /translate/{locale}` requires
 * `?force=true` (otherwise the API returns
 * `422 BLOG_TRANSLATION_LOCKED`).
 */
export interface BlogPostTranslationUpdateAdminV2 {
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  body_blocks?: BlogBlock[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
}

/** Create payload for `POST /api/v2/blog/admin/categories`. */
export interface BlogCategoryCreateAdminV2 {
  /** Max 80 chars, `^[a-z0-9-]+$`, ≥ 3. */
  slug: string;
  /** Max 255 chars. */
  name: string;
  /** Max 4000 chars. */
  description: string | null;
}

/** Partial update payload for `PATCH /api/v2/blog/admin/categories/{id}`. */
export interface BlogCategoryUpdateAdminV2 {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
}

/** Create payload for `POST /api/v2/blog/admin/tags`. */
export interface BlogTagCreateAdminV2 {
  /** Max 80 chars, `^[a-z0-9-]+$`, ≥ 3. */
  slug: string;
  /** Max 120 chars. */
  name: string;
}

/** Partial update payload for `PATCH /api/v2/blog/admin/tags/{id}`. */
export interface BlogTagUpdateAdminV2 {
  slug?: string | null;
  name?: string | null;
}

/** Create payload for `POST /api/v2/blog/admin/profanity-terms`. */
export interface BlogProfanityTermCreateV2 {
  /** 1–120 chars. */
  term: string;
  /** Defaults to `es`. Max 8 chars; must be one of `BLOG_LOCALES`. */
  language: BlogLocale;
  /** Defaults to `blocker`. */
  severity: BlogProfanitySeverity;
  /** Max 600 chars. */
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Admin — read responses
// ─────────────────────────────────────────────────────────────────────

/**
 * Per-locale translation job status, surfaced after `POST /admin/posts`
 * and on the admin detail response.
 */
export interface BlogTranslationJobStatus {
  locale: BlogLocale;
  status: "pending" | "queued" | "skipped" | "done";
}

/**
 * Full admin view including every translation + MT badges.
 * Backend: `blog/admin.py :: BlogPostAdminResponse`.
 */
export interface BlogPostAdminResponseV2 {
  uuid: string;
  status: "active" | "archived";
  /** ISO 8601 UTC — null when not archived. */
  archived_at: string | null;
  /** ISO 8601 UTC — null when not soft-deleted. */
  deleted_at: string | null;
  /** ISO 8601 UTC. Immutable after creation (INV-BP-2). */
  published_at: string;
  /** ISO 8601 UTC. */
  updated_at: string | null;
  cover_url: string | null;
  cover_url_variants: Record<string, unknown> | null;
  comments_enabled: boolean;
  authors: BlogAuthorV2[];
  categories: BlogCategoryV2[];
  tags: BlogTagV2[];
  translations: BlogPostTranslationV2[];
  seo: BlogSeoV2;
  engagement: BlogEngagementV2;
  /** Map locale → ISO 8601 UTC of last FCM dispatch (for dedupe). */
  fcm_dispatched_at_by_locale: Record<string, string>;
  translation_jobs: BlogTranslationJobStatus[];
}

/**
 * Compact admin list row including statuses + locale availability.
 * Backend: `blog/admin.py :: BlogPostAdminListItem`.
 */
export interface BlogPostAdminListItemV2 {
  uuid: string;
  status: "active" | "archived";
  title: string;
  slug: string;
  /** Canonical locale on the list row; defaults to `es`. */
  locale: BlogLocale;
  summary: string | null;
  published_at: string;
  updated_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  authors: BlogAuthorV2[];
  categories: BlogCategoryV2[];
  tags: BlogTagV2[];
  view_count_vanity: number;
  useful_count: number;
  share_count: number;
  /** Locales that have any persisted translation row. */
  locales_available: BlogLocale[];
  /** Subset still flagged `is_machine_translated = true`. */
  locales_machine_translated: BlogLocale[];
}

/** GET `/api/v2/blog/admin/posts` response payload. */
export interface BlogPostAdminListResponseV2 {
  items: BlogPostAdminListItemV2[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Analytics payload for `GET /api/v2/blog/admin/posts/{uuid}/analytics`.
 * Backend: `blog/admin.py :: BlogPostAnalyticsResponse`.
 */
export interface BlogPostAnalyticsResponseV2 {
  view_count_vanity: number;
  view_count_real: number;
  useful_count: number;
  not_useful_count: number;
  share_count: number;
  comment_count: number;
  bookmark_count: number;
  /** Map locale → real-view count (last 30 days window). */
  by_locale_views: Record<string, number>;
}

/**
 * Single row in `GET /api/v2/blog/admin/search-gaps`.
 * Backend: `blog/admin.py :: BlogSearchGapItem`.
 */
export interface BlogSearchGapItemV2 {
  query: string;
  locale: BlogLocale;
  /** Number of times this exact query+locale returned 0 hits. */
  hits_zero: number;
  /** ISO 8601 UTC of the most recent hit. */
  last_seen_at: string | null;
}

/** GET `/api/v2/blog/admin/search-gaps` response payload. */
export interface BlogSearchGapsResponseV2 {
  items: BlogSearchGapItemV2[];
}

/**
 * Single comment surfaced in the admin moderation queue.
 * Backend: `blog/admin.py :: BlogCommentModerationItem`.
 */
export interface BlogCommentModerationItemV2 {
  id: number;
  uuid: string;
  post_id: number;
  user_id: number;
  body_md: string;
  body_html_sanitized: string;
  /** When non-null, lists the matched profanity terms + severity. */
  flagged_terms: Array<Record<string, unknown>> | null;
  created_at: string;
  deleted_at: string | null;
}

/** GET `/api/v2/blog/admin/comments` response payload. */
export interface BlogCommentModerationListResponseV2 {
  items: BlogCommentModerationItemV2[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────────────────────────────────────────────────────────────
// FCM push payload
// ─────────────────────────────────────────────────────────────────────

/**
 * Firebase Cloud Messaging push payload sent to topic
 * `blog_new_post_{locale}` when a translation of a new post is persisted.
 *
 * The OS renders `notification.*` when the app is backgrounded; the
 * `data.*` payload is delivered to the app for in-foreground rendering
 * and deeplink routing.
 */
export interface BlogNewPostFCMPayload {
  notification: {
    /** Post title in target locale. */
    title: string;
    /** Summary truncated to 100 chars. */
    body: string;
    /** Cover URL `card` variant if present. */
    image: string | null;
  };
  data: {
    /** Discriminator for the FE FCM router. */
    type: "blog_new_post";
    /** UUID v4. */
    post_uuid: string;
    /** Locale-localized slug. */
    slug: string;
    locale: BlogLocale;
    /** ISO 8601 UTC. */
    published_at: string;
    cover_url: string | null;
    /** `sitimm://blog/{slug}?locale={locale}`. */
    deeplink: string;
  };
}

// ─────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────

/**
 * Stable error codes returned in the `code` field of typed Blog V2 error
 * envelopes (`{code, message, extra?}`). Mirrors `docs/v2/Blogs/errors.md`.
 *
 * Plain `HTTPException` responses (e.g. 401 `AUTH_REQUIRED` upstream from
 * the JWT dependency) are not part of this union but documented here for
 * cross-reference.
 */
export type BlogErrorCode =
  | "AUTH_REQUIRED"
  | "BLOG_BODY_BLOCKS_INVALID"
  | "BLOG_CATEGORY_IN_USE"
  | "BLOG_CATEGORY_NOT_FOUND"
  | "BLOG_COMMENT_FORBIDDEN"
  | "BLOG_COMMENT_LIMIT_REACHED"
  | "BLOG_COMMENT_NOT_FOUND"
  | "BLOG_COMMENT_PROFANITY"
  | "BLOG_COMMENTS_DISABLED"
  | "BLOG_HTML_SANITIZED_TOO_AGGRESSIVE"
  | "BLOG_INTERNAL"
  | "BLOG_LOCALE_INVALID"
  | "BLOG_PATCH_INVALID"
  | "BLOG_POST_NOT_FOUND"
  | "BLOG_PUBLISHED_AT_IMMUTABLE"
  | "BLOG_RATE_LIMITED"
  | "BLOG_REACTION_INVALID"
  | "BLOG_SLUG_CONFLICT"
  | "BLOG_SLUG_INVALID"
  | "BLOG_TAG_IN_USE"
  | "BLOG_TAG_NOT_FOUND"
  | "BLOG_TRANSLATION_LOCKED"
  | "BLOG_TRANSLATION_PROVIDER_DOWN";

// ─────────────────────────────────────────────────────────────────────
// Field limits (mirrors backend validators)
// ─────────────────────────────────────────────────────────────────────

/**
 * Length and count caps enforced by the backend Pydantic schemas. Surfaced
 * here so the FE can mirror max-length validators without drift.
 */
export const BLOG_LIMITS = {
  /** Slug pattern: `^[a-z0-9-]+$`. */
  SLUG_PATTERN: "^[a-z0-9-]+$",
  SLUG_MIN: 3,
  SLUG_MAX: 80,
  TITLE_MAX: 300,
  SUMMARY_MAX: 600,
  SEO_TITLE_MAX: 255,
  SEO_DESCRIPTION_MAX: 600,
  COVER_URL_MAX: 1000,
  OG_IMAGE_URL_MAX: 1000,
  AUTHORS_MAX: 20,
  CATEGORIES_MAX: 20,
  TAGS_MAX: 40,
  RELATED_POSTS_MAX: 20,
  BODY_BLOCKS_MIN: 1,
  BODY_BLOCKS_MAX: 400,
  PARAGRAPH_TEXT_MAX: 4000,
  HEADING_TEXT_MAX: 200,
  LIST_ITEMS_MIN: 1,
  LIST_ITEMS_MAX: 50,
  LIST_ITEM_TEXT_MAX: 500,
  QUOTE_TEXT_MAX: 600,
  QUOTE_SOURCE_MAX: 200,
  CALLOUT_TEXT_MAX: 1500,
  CALLOUT_TITLE_MAX: 120,
  IMAGE_ALT_MAX: 300,
  IMAGE_CAPTION_MAX: 200,
  TABLE_HEADERS_MIN: 1,
  TABLE_HEADERS_MAX: 10,
  TABLE_ROWS_MIN: 1,
  TABLE_ROWS_MAX: 50,
  GLOSSARY_TERM_MAX: 80,
  RELATED_CTA_LABEL_MAX: 120,
  LEGAL_DISCLAIMER_MAX: 800,
  RAW_HTML_INPUT_MAX: 50_000,
  CODE_BLOCK_CODE_MAX: 10_000,
  CODE_BLOCK_LANGUAGE_MAX: 32,
  CODE_BLOCK_CAPTION_MAX: 200,
  EMBED_VIDEO_ID_MAX: 16,
  EMBED_SPOTIFY_ID_MAX: 32,
  EMBED_CAPTION_MAX: 200,
  AUDIO_CAPTION_MAX: 200,
  COMMENT_BODY_MIN: 2,
  COMMENT_BODY_MAX: 4000,
  PROFANITY_TERM_MAX: 120,
  PROFANITY_NOTES_MAX: 600,
  CATEGORY_NAME_MAX: 255,
  CATEGORY_DESCRIPTION_MAX: 4000,
  TAG_NAME_MAX: 120,
  SEARCH_QUERY_MIN: 2,
  SEARCH_QUERY_MAX: 200,
  SUGGEST_LIMIT_MAX: 10,
  READING_MINUTES_MIN: 1,
  READING_MINUTES_MAX: 240,
} as const;
