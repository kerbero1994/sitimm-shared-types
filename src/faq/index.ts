/**
 * FAQ V2 types — knowledge base articles, categories, glossary, search,
 * bookmarks, subscriptions, feedback.
 *
 * Backend: `app/presentation/api/v2/faq_v2.py` and
 * `app/presentation/schemas/v2/faq/*` (mini-back).
 *
 * Surface overview:
 * - Public reader: categories tree, paginated article list, article detail
 *   by slug, related articles, view counter, full-text search + suggest,
 *   glossary listing, single glossary term, PDF export per article.
 * - Authenticated user-scoped (`/api/v2/me/*`): bookmarks (list/add/remove),
 *   category subscriptions (list/add/remove), helpful/not-helpful feedback.
 * - Admin CRUD lives under `/api/v2/faq/admin/*` — not modelled here yet;
 *   add when the dashboard implements editor UIs.
 *
 * All list endpoints honor `locale` query param. When the requested locale
 * lacks a translation, the server falls back to Spanish (`es`) and sets
 * the `X-FAQ-Locale-Fallback: es` response header.
 */

// ─────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────

/**
 * Compact parent reference embedded in a category response.
 * Backend: `faq/categories.py :: FAQCategoryParent`
 */
export interface FAQCategoryParent {
  /** Parent category UUID. */
  uuid: string;
  /** URL slug, e.g. `"imss"`. */
  slug: string;
  /** Display name in the active locale. */
  name: string;
}

/**
 * Lightweight category reference embedded in article/search responses.
 * Backend: `faq/categories.py :: FAQCategoryRefV2`
 */
export interface FAQCategoryRefV2 {
  /** Category UUID. */
  uuid: string;
  /** URL slug. */
  slug: string;
  /** Display name. */
  name: string;
  /** Parent category ref (null for root-level categories). */
  parent: FAQCategoryParent | null;
}

/**
 * Full category entry used in the tree response.
 * Backend: `faq/categories.py :: FAQCategoryV2Response`
 *
 * Recursive: `children` carries direct descendants (2-level max enforced
 * by `FAQ_CATEGORY_DEPTH_EXCEEDED`).
 */
export interface FAQCategoryV2 {
  /** Category UUID. */
  uuid: string;
  /** URL slug. */
  slug: string;
  /** Display name. */
  name: string;
  /** Parent ref, null when root. */
  parent: FAQCategoryParent | null;
  /** Optional icon name (lib-agnostic key resolved on FE). */
  icon: string | null;
  /** Hex color override for category branding. */
  color_hex: string | null;
  /** Optional legal disclaimer surfaced on category landing. */
  disclaimer_text: string | null;
  /** Sort order, ascending. */
  sort_order: number;
  /** Live article count for badge/UI hints. */
  article_count: number;
  /** Direct child categories. */
  children: FAQCategoryV2[];
}

/**
 * GET `/api/v2/faq/categories` response payload (under `V2Response.data`).
 */
export interface FAQCategoryTreeResponse {
  /** Root categories, each carrying descendant `children`. */
  categories: FAQCategoryV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Article blocks (discriminated by `type`)
// ─────────────────────────────────────────────────────────────────────

/** Variant for callout boxes. */
export type FAQCalloutVariant = "info" | "warning" | "tip" | "legal" | "success";
/** Image alignment hint for the renderer. */
export type FAQImageAlign = "left" | "center" | "right" | "full";
/** Consultation CTA channel mapping to V2 consultation types. */
export type FAQConsultationType =
  | "IMSS"
  | "INFONAVIT"
  | "AFORE"
  | "FONACOT"
  | "GENERAL";

export interface FAQParagraphBlock {
  type: "paragraph";
  /** Markdown text, max 4000 chars. */
  text_md: string;
}

export interface FAQHeadingBlock {
  type: "heading";
  /** Heading level — only h2/h3 allowed inside article body. */
  level: 2 | 3;
  /** Plain heading text, max 200 chars. */
  text: string;
}

export interface FAQListBlock {
  type: "list";
  /** True for ordered (numbered) list, false for bulleted. */
  ordered: boolean;
  /** 1–50 items, each max 500 chars. */
  items: string[];
}

export interface FAQQuoteBlock {
  type: "quote";
  /** Quote text, max 600 chars. */
  text: string;
  /** Optional attribution. */
  source: string | null;
  /** Optional source URL. */
  source_url: string | null;
}

export interface FAQCalloutBlock {
  type: "callout";
  variant: FAQCalloutVariant;
  /** Markdown text, max 1500 chars. */
  text_md: string;
  /** Optional title, max 120 chars. */
  title: string | null;
}

export interface FAQVideoBlock {
  type: "video";
  /** Resource UUID — enriched on the server with provider metadata. */
  resource_uuid: string;
  autoplay: boolean;
  caption: string | null;
}

export interface FAQImageBlock {
  type: "image";
  resource_uuid: string;
  /** Required alt text, max 300 chars. */
  alt: string;
  caption: string | null;
  align: FAQImageAlign;
}

export interface FAQPdfCardBlock {
  type: "pdf_card";
  resource_uuid: string;
  /** Whether the renderer should show the inline first-page preview. */
  show_preview: boolean;
}

export interface FAQTableBlock {
  type: "table";
  /** 1–10 column headers. */
  headers: string[];
  /** 1–50 rows; each row length must equal `headers.length`. */
  rows: string[][];
  caption: string | null;
}

/**
 * Server-injected glossary metadata for inline term tooltips.
 * Absent when no glossary match exists for `term`.
 */
export interface FAQGlossaryTermResolved {
  uuid: string;
  display_term: string;
  /** Markdown definition. */
  definition_md: string;
  related_article_uuids: string[];
}

export interface FAQGlossaryTermBlock {
  type: "glossary_term";
  /** Term key, max 80 chars. */
  term: string;
  /** Server-resolved data — null when the term has been removed. */
  resolved: FAQGlossaryTermResolved | null;
}

/** Lightweight article ref used in related CTA blocks. */
export interface FAQArticleSummaryRef {
  uuid: string;
  slug: string;
  title: string;
  summary: string;
}

export interface FAQRelatedCtaResolved {
  target: FAQArticleSummaryRef;
}

export interface FAQRelatedCtaBlock {
  type: "related_cta";
  target_faq_uuid: string;
  label: string | null;
  /** Server-injected — null when the target was unpublished/deleted. */
  resolved: FAQRelatedCtaResolved | null;
}

export interface FAQConsultationCtaBlock {
  type: "consultation_cta";
  consultation_type: FAQConsultationType;
  label: string | null;
}

export interface FAQLegalDisclaimerBlock {
  type: "legal_disclaimer";
  /** Markdown disclaimer, max 800 chars. */
  text_md: string;
  severity: "info" | "warning";
}

export interface FAQDividerBlock {
  type: "divider";
}

/**
 * Discriminated union of every body block type stored in
 * `FAQArticleV2.body_blocks`. The server validates the literal `type` field
 * and rejects unknown variants with `FAQ_BLOCK_VALIDATION_FAILED`.
 */
export type FAQBlock =
  | FAQParagraphBlock
  | FAQHeadingBlock
  | FAQListBlock
  | FAQQuoteBlock
  | FAQCalloutBlock
  | FAQVideoBlock
  | FAQImageBlock
  | FAQPdfCardBlock
  | FAQTableBlock
  | FAQGlossaryTermBlock
  | FAQRelatedCtaBlock
  | FAQConsultationCtaBlock
  | FAQLegalDisclaimerBlock
  | FAQDividerBlock;

// ─────────────────────────────────────────────────────────────────────
// Articles
// ─────────────────────────────────────────────────────────────────────

/**
 * Citation entry attached to an article.
 * Backend: `faq/articles.py :: FAQCitationV2`
 */
export interface FAQCitationV2 {
  /** Citation display name. */
  name: string;
  /** Source URL. */
  url: string;
  /** ISO-8601 datetime the source was last accessed. */
  accessed_at: string;
  /** Optional Diario Oficial de la Federación publication reference. */
  dof_publication: string | null;
}

/**
 * Enriched resource (video/image/pdf/etc.) referenced by article body blocks.
 * Backend: `faq/resources.py :: FAQResourceV2Response`
 */
export interface FAQResourceV2 {
  /** Resource UUID. */
  uuid: string;
  /** Parent article UUID. */
  article_uuid: string;
  /** Resource kind, e.g. `"video"`, `"image"`, `"pdf"`. */
  kind: string;
  /** Resolved URL (may be presigned). */
  url: string;
  /** External provider identifier (YouTube id, etc.). */
  provider_id: string | null;
  /** Resolved thumbnail URL. */
  thumbnail_url: string | null;
  /** Video duration in seconds when applicable. */
  duration_seconds: number | null;
  title: string | null;
  caption: string | null;
  sort_order: number;
  /** Provider-specific metadata (oEmbed payload, etc.). */
  metadata: Record<string, unknown>;
  /** Enrichment pipeline status, e.g. `"pending"`, `"ok"`, `"failed"`. */
  enrichment_status: string;
  enrichment_error: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Compact article shape returned by list/search endpoints.
 * Backend: `faq/articles.py :: FAQArticleSummaryV2Response`
 */
export interface FAQArticleSummaryV2 {
  uuid: string;
  slug: string;
  title: string;
  summary: string;
  category: FAQCategoryRefV2;
  tags: string[];
  is_pinned: boolean;
  /** ISO-8601 publish datetime. */
  publishedAt: string;
  locale: string;
  /** True when the row was served from the Spanish fallback. */
  is_translation_fallback: boolean;
}

/**
 * Full article detail.
 * Backend: `faq/articles.py :: FAQArticleV2Response`
 */
export interface FAQArticleV2 {
  uuid: string;
  slug: string;
  category: FAQCategoryRefV2;
  title: string;
  summary: string;
  /** Ordered list of body blocks; renderer dispatches on `type`. */
  body_blocks: FAQBlock[];
  tags: string[];
  related_uuids: string[];
  citations: FAQCitationV2[];
  legal_notice: string | null;
  /** Source authority for the content (e.g. `"SAT"`, `"IMSS"`). */
  source_authority: string;
  is_pinned: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  resources: FAQResourceV2[];
  last_reviewed_at: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  locale: string;
  is_translation_fallback: boolean;
}

/**
 * Query params for GET `/api/v2/faq/articles`.
 */
export interface ListFAQArticlesV2Request {
  /** Filter to a specific category UUID. */
  categoryId?: string;
  /** Filter to a parent category UUID (includes descendants). */
  parentCategoryId?: string;
  /** Filter by tag. */
  tag?: string;
  /** ISO 639-1 locale; defaults to `"es"`. */
  locale?: string;
  /** When set, restricts to pinned/unpinned rows. */
  pinned?: boolean;
  /** Page number (1-based). */
  page?: number;
  /** Page size, 1–50. Defaults to 20. */
  limit?: number;
}

/**
 * GET `/api/v2/faq/articles` response payload.
 */
export interface ListFAQArticlesV2Response {
  items: FAQArticleSummaryV2[];
  page: number;
  limit: number;
  total: number;
}

/** GET `/api/v2/faq/articles/{uuid}/related` response payload. */
export interface FAQRelatedArticlesResponse {
  items: FAQArticleSummaryV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────────────────────────────

/** POST `/api/v2/faq/articles/{uuid}/feedback` body. */
export interface FAQArticleFeedbackRequest {
  /** True = helpful, false = not helpful. */
  helpful: boolean;
  /** Optional comment, max 1000 chars. */
  comment?: string | null;
}

/** POST `/api/v2/faq/articles/{uuid}/feedback` response payload. */
export interface FAQArticleFeedbackResponse {
  feedback_id: number;
  helpful_count: number;
  not_helpful_count: number;
}

// ─────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────

/** A single hit returned by the search endpoint. */
export interface FAQSearchHitV2 {
  uuid: string;
  slug: string;
  title: string;
  summary: string;
  /** ts_headline output with `<mark>` markers around matched tokens. */
  snippet: string;
  category: FAQCategoryRefV2;
  /** ts_rank or pg_trgm similarity score. */
  rank: number;
  /** Which path produced the hit. */
  matched_via: "tsvector" | "trigram_fallback";
}

/** GET `/api/v2/faq/search` query params. */
export interface FAQSearchV2Request {
  /** Query string, 2–200 chars. */
  q: string;
  /** Locale, defaults to `"es"`. */
  locale?: string;
  /** Optional category UUID filter. */
  categoryId?: string;
  /** Result cap, 1–50. Defaults to 20. */
  limit?: number;
}

/** GET `/api/v2/faq/search` response payload. */
export interface FAQSearchV2Response {
  query: string;
  locale: string;
  results: FAQSearchHitV2[];
  total: number;
}

/** GET `/api/v2/faq/search/suggest` typeahead row. */
export interface FAQSearchSuggestItemV2 {
  slug: string;
  title: string;
}

/** GET `/api/v2/faq/search/suggest` query params. */
export interface FAQSearchSuggestV2Request {
  /** Query string, 2–80 chars. */
  q: string;
  /** Locale, defaults to `"es"`. */
  locale?: string;
  /** 1–8. Defaults to 8. */
  limit?: number;
}

/** GET `/api/v2/faq/search/suggest` response payload. */
export interface FAQSearchSuggestV2Response {
  items: FAQSearchSuggestItemV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Glossary
// ─────────────────────────────────────────────────────────────────────

/**
 * Full glossary term entry.
 * Backend: `faq/glossary.py :: FAQGlossaryTermV2Response`
 */
export interface FAQGlossaryTermV2 {
  uuid: string;
  /** Canonical lookup key (lowercase). */
  term: string;
  /** Display capitalization. */
  display_term: string;
  /** Alternate spellings / aliases also recognized by glossary block. */
  aliases: string[];
  /** Markdown definition. */
  definition_md: string;
  related_article_uuids: string[];
  category: FAQCategoryRefV2 | null;
  locale: string;
  is_translation_fallback: boolean;
}

/** GET `/api/v2/faq/glossary` query params. */
export interface ListFAQGlossaryV2Request {
  /** Locale, defaults to `"es"`. */
  locale?: string;
  /** Page number (1-based). */
  page?: number;
  /** Page size, 1–100. Defaults to 50. */
  limit?: number;
}

/** GET `/api/v2/faq/glossary` response payload. */
export interface FAQGlossaryListV2Response {
  items: FAQGlossaryTermV2[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────
// Me — bookmarks
// ─────────────────────────────────────────────────────────────────────

/** Row in GET `/api/v2/me/faq-bookmarks`. */
export interface FAQBookmarkItem {
  article_uuid: string;
  article_slug: string;
  article_title: string;
  /** ISO-8601 datetime the bookmark was created. */
  bookmarked_at: string;
}

/** GET `/api/v2/me/faq-bookmarks` response payload. */
export interface FAQBookmarkListResponse {
  items: FAQBookmarkItem[];
  total: number;
}

/** POST `/api/v2/me/faq-bookmarks/{article_uuid}` response payload. */
export interface FAQBookmarkAddResponse {
  article_uuid: string;
  bookmarked_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Me — subscriptions
// ─────────────────────────────────────────────────────────────────────

/** Row in GET `/api/v2/me/faq-subscriptions`. */
export interface FAQSubscriptionItem {
  category_uuid: string;
  category_name: string;
  /** ISO-8601 datetime the subscription was created. */
  subscribed_at: string;
}

/** GET `/api/v2/me/faq-subscriptions` response payload. */
export interface FAQSubscriptionListResponse {
  items: FAQSubscriptionItem[];
  total: number;
}

/** POST `/api/v2/me/faq-subscriptions/{category_uuid}` response payload. */
export interface FAQSubscriptionAddResponse {
  category_uuid: string;
  category_name: string;
  subscribed_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────

/**
 * Stable error codes returned in the `code` field of a V2 error envelope.
 * Mirrors `app/presentation/schemas/v2/faq/errors.py`.
 */
export type FAQErrorCode =
  | "FAQ_BLOCK_VALIDATION_FAILED"
  | "FAQ_BODY_TOO_LONG"
  | "FAQ_BOOKMARK_NOT_FOUND"
  | "FAQ_CATEGORY_DEPTH_EXCEEDED"
  | "FAQ_CATEGORY_HAS_ARTICLES"
  | "FAQ_CATEGORY_NOT_FOUND"
  | "FAQ_FEEDBACK_DUPLICATE"
  | "FAQ_LEGAL_DISCLAIMER_REQUIRED"
  | "FAQ_NOT_FOUND"
  | "FAQ_RELATED_TARGET_INVALID"
  | "FAQ_RESOURCE_ENRICHMENT_FAILED"
  | "FAQ_RESOURCE_REF_INVALID"
  | "FAQ_RESOURCE_TOO_LARGE"
  | "FAQ_RESOURCE_UNREACHABLE"
  | "FAQ_RESOURCE_UNSUPPORTED_URL"
  | "FAQ_SEARCH_LOCALE_INVALID"
  | "FAQ_SEARCH_QUERY_TOO_LONG"
  | "FAQ_SEARCH_QUERY_TOO_SHORT"
  | "FAQ_SLUG_TAKEN"
  | "FAQ_SUBSCRIPTION_CATEGORY_INVALID"
  | "FAQ_SUBSCRIPTION_NOT_FOUND"
  | "FAQ_TABLE_SHAPE_INVALID"
  | "FAQ_TRANSLATION_NOT_FOUND"
  | "FAQ_VIEW_RATE_LIMITED";

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

/**
 * Header set by the server when an article/glossary row falls back to the
 * Spanish translation because the requested locale lacks coverage. Clients
 * can surface a small "ES" badge or trigger a re-translation request.
 */
export const FAQ_LOCALE_FALLBACK_HEADER = "X-FAQ-Locale-Fallback";

/**
 * Header the FE must send with anonymous `POST /faq/articles/{uuid}/view`
 * calls to enable 24h dedupe without a JWT. Authenticated calls use the
 * user id and may omit it.
 */
export const FAQ_DEVICE_ID_HEADER = "X-Device-Id";

/** Article body / search constraints mirroring backend validators. */
export const FAQ_LIMITS = {
  /** Body block count cap (min 1). */
  BODY_BLOCKS_MAX: 200,
  /** Paragraph block `text_md` cap. */
  PARAGRAPH_TEXT_MAX: 4000,
  /** Heading `text` cap. */
  HEADING_TEXT_MAX: 200,
  /** List items min/max. */
  LIST_ITEMS_MIN: 1,
  LIST_ITEMS_MAX: 50,
  /** Per-list-item text cap. */
  LIST_ITEM_TEXT_MAX: 500,
  /** Quote `text` cap. */
  QUOTE_TEXT_MAX: 600,
  /** Callout `text_md` cap. */
  CALLOUT_TEXT_MAX: 1500,
  /** Callout title cap. */
  CALLOUT_TITLE_MAX: 120,
  /** Table headers min/max. */
  TABLE_HEADERS_MIN: 1,
  TABLE_HEADERS_MAX: 10,
  /** Table rows min/max. */
  TABLE_ROWS_MIN: 1,
  TABLE_ROWS_MAX: 50,
  /** Glossary term key cap. */
  GLOSSARY_TERM_MAX: 80,
  /** Legal disclaimer text cap. */
  LEGAL_DISCLAIMER_MAX: 800,
  /** Feedback comment cap. */
  FEEDBACK_COMMENT_MAX: 1000,
  /** Search query min/max. */
  SEARCH_QUERY_MIN: 2,
  SEARCH_QUERY_MAX: 200,
  /** Suggest query min/max. */
  SUGGEST_QUERY_MIN: 2,
  SUGGEST_QUERY_MAX: 80,
  /** Suggest result cap. */
  SUGGEST_LIMIT_MAX: 8,
  /** Article list page size cap. */
  ARTICLES_PAGE_LIMIT_MAX: 50,
  /** Glossary list page size cap. */
  GLOSSARY_PAGE_LIMIT_MAX: 100,
} as const;
