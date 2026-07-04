/**
 * Magazine V2 types — CRUD, engagement (likes/views/shares), pagination,
 * admin analytics, bulk operations.
 *
 * Backend equivalents (mini-back):
 * - app/presentation/schemas/magazine_v2.py
 * - app/presentation/api/v2/magazines_v2.py
 *
 * Response fields: camelCase aliases matching JSON output for the
 * magazine CRUD/list/detail/translation shapes. EXCEPTION: the engagement
 * surface (like/share/download/report/stats — `MagazineLikeResponse`,
 * `MagazineShareResponse`, `MagazineDownloadResponse`,
 * `MagazineReportResponseV2`, `MagazineItemStatsV2Response`) is served by
 * the generic engagement subsystem and is snake_case — those names are now
 * aliases of the generic `Engagement*` shapes from `../engagement`.
 * Request fields: snake_case matching Pydantic field names.
 */

import type { LocaleCode } from "../locales/index.js";
import type {
  EngagementCounters,
  EngagementDownloadResponse,
  EngagementLikeResponse,
  EngagementReportAck,
  EngagementShareResponse,
} from "../engagement/index.js";

// ── Category / Sort ─────────────────────────────────────────────────

/**
 * Magazine category enum. Matches backend MagazineCategory.
 */
export type MagazineCategory =
  | "general"
  | "especial"
  | "anual"
  | "boletin"
  | "semestral"
  | "semanal";

/**
 * Sort option for magazine list queries.
 * `most_liked` / `most_viewed` / `most_downloaded` added 2026-04-20.
 */
export type MagazineSortOption =
  | "newest"
  | "oldest"
  | "title"
  | "most_liked"
  | "most_viewed"
  | "most_downloaded"
  | "most_shared";

// ── Table of Contents ───────────────────────────────────────────────

/**
 * Typed TOC entry. Backend: schemas.magazine_v2.TableOfContentsEntry.
 */
export interface TableOfContentsEntry {
  title: string;
  page: number;
  anchor?: string | null;
}

// ── Author entry ────────────────────────────────────────────────────

/**
 * Author surfaced in magazine responses. Backend:
 * `schemas.magazine_v2.MagazineAuthorV2Response`. A registered staff/member
 * author carries `userUuid`; a guest author has it `null` and the `name`
 * (+ optional `photoUrl`/`bio`) is taken from the guest fields supplied at
 * create/update time.
 */
export interface MagazineAuthorV2 {
  /** UUID of the linked user; `null` for guest authors. */
  userUuid: string | null;
  /** Display name (resolved from the user profile or guest fields). */
  name: string;
  /** Role/position shown next to the name (e.g. "Editor en jefe"). */
  position: string;
  /** Presigned URL for the author photo; `null` when none. */
  photoUrl: string | null;
  /** Short author bio; `null` when none. */
  bio: string | null;
  /** Display order within the magazine's author list (0-based). */
  sortOrder: number;
}

// ── Magazine Response (list view) ───────────────────────────────────

export interface MagazineV2 {
  uuid: string;
  title: string;
  subtitle: string | null;
  description: string | null;

  coverUrl: string | null;
  /**
   * Small (~150px) cover render produced by the `files.generate_thumbnails`
   * Celery task. Lets the FE skip the full-res cover for grid cards.
   * `null` on rows whose covers predate the thumbnail pipeline.
   */
  coverThumbUrl: string | null;
  /**
   * Medium (~600px) cover render produced by the `files.generate_thumbnails`
   * Celery task. `null` on rows whose covers predate the thumbnail pipeline.
   */
  coverMediumUrl: string | null;
  /**
   * Responsive cover variants — same shape as
   * `programs.ImageVariants`. v0.51.0+. Null on legacy rows whose covers
   * predate the responsive pipeline.
   */
  coverVariants?: import("../programs").ImageVariants | null;
  pdfUrl: string | null;
  bannerUrl: string | null;

  dominantColor: string | null;
  secondaryColor: string | null;
  isFeatured: boolean;
  badgeText: string | null;

  pageCount: number | null;
  readingTimeMin: number | null;

  editionNumber: number | null;
  editionYear: number | null;
  editionMonth: number | null;
  category: MagazineCategory;
  tags: string[];

  /**
   * Public vanity counters — append-only, every public engagement request
   * bumps these. Designed to grow with the slightest user intent (the
   * social-proof surface). Never decrement, even on unlike. See
   * `magazines_engagement_vanity_only` memory in Sitimm-web.
   */
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  /** Total shares. Added 2026-04-20. */
  shareCount: number;
  /**
   * Real (deduped-per-user) engagement counters — ADMIN-ONLY. The backend
   * populates these only for content staff; for non-staff callers they are
   * always `0`. Use for analytics / admin dashboards, NOT for the
   * social-proof surface. Wire aliases:
   * `viewCountInternal` / `downloadCountInternal` / `likeCountInternal` /
   * `shareCountInternal` (backend `MagazineV2Response`). Renamed from the
   * former `*Real?` optionals to match the schema aliases (0.68.0).
   */
  viewCountInternal: number;
  downloadCountInternal: number;
  likeCountInternal: number;
  shareCountInternal: number;
  isLiked: boolean;

  isPublished: boolean;
  publishedAt: string | null;
  authorName: string | null;
  /**
   * Ordered author list (0..N). Staff picks + guest profiles. Empty array
   * when the magazine has no authors attached. Backend:
   * `MagazineV2Response.authors`.
   */
  authors: MagazineAuthorV2[];
  createdAt: string;
  updatedAt: string;
}

// ── Magazine Detail Response ────────────────────────────────────────

export interface MagazineDetailV2 extends MagazineV2 {
  coverFileUuid: string | null;
  pdfFileUuid: string | null;
  bannerFileUuid: string | null;
  excerpt: string | null;
  tableOfContents: TableOfContentsEntry[] | null;
  previewPages: number[] | null;
  related: MagazineV2[];
}

// ── List Response ───────────────────────────────────────────────────

export interface MagazineListV2Response {
  items: MagazineV2[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  /** Active locale resolved by the backend translation layer. Sent only
   *  when translations are active (omitted for admin/raw lookups). */
  currentLang?: string;
}

// ── Like Response ───────────────────────────────────────────────────

/**
 * Response for `POST/DELETE /api/v2/magazines/{uuid}/like`.
 *
 * Magazine engagement is served by the generic engagement subsystem via
 * the magazine subject adapter (`magazine_engagement_adapter.py`), so the
 * wire shape is the generic snake_case `EngagementLikeResponse`
 * (`user_liked` / `like_count_real` / `like_count_vanity`) — NOT the old
 * camelCase `{ liked, likeCount, likeCountReal? }`, which never matched the
 * post-cutover wire. Backend: `EngagementLikeResponseV2`
 * (`app/engagement/presentation/schemas/extended.py`).
 */
export type MagazineLikeResponse = EngagementLikeResponse;

// ── Create / Update Requests ────────────────────────────────────────

export interface MagazineCreateV2Request {
  title: string;
  description?: string;
  pdf_file_uuid: string;
  cover_file_uuid?: string;
  published_at?: string;
  is_published?: boolean;
  subtitle?: string;
  is_featured?: boolean;
  badge_text?: string;
  banner_file_uuid?: string;
  edition_number?: number;
  edition_year?: number;
  edition_month?: number;
  category?: MagazineCategory;
  /** Tags array. Max 50 items, each <=60 chars after lowercase+strip. */
  tags?: string[];
  /** Typed TOC entries. Min 1 char title, page >=1. */
  table_of_contents?: TableOfContentsEntry[];
  /** 1-indexed page numbers; dedup+sort server-side. */
  preview_pages?: number[];
  excerpt?: string;
  /** Must be valid UUID strings. */
  related_magazine_ids?: string[];
}

export interface MagazineUpdateV2Request {
  title?: string;
  description?: string;
  cover_file_uuid?: string;
  pdf_file_uuid?: string;
  published_at?: string;
  is_published?: boolean;
  subtitle?: string;
  is_featured?: boolean;
  badge_text?: string;
  banner_file_uuid?: string;
  edition_number?: number;
  edition_year?: number;
  edition_month?: number;
  category?: MagazineCategory;
  tags?: string[];
  table_of_contents?: TableOfContentsEntry[];
  preview_pages?: number[];
  excerpt?: string;
  related_magazine_ids?: string[];
}

// ── Admin analytics (added 2026-04-20) ──────────────────────────────

/**
 * `{name, count}` per category. Used by /categories filter UI.
 */
export interface MagazineCategoryCountV2 {
  name: string;
  count: number;
}

export interface MagazineCategoryCountsResponse {
  items: MagazineCategoryCountV2[];
}

export interface MagazineTopItemV2 {
  uuid: string;
  title: string;
  value: number;
}

/**
 * Global admin analytics response. Staff-only.
 */
export interface MagazineStatsV2Response {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
  totalShares: number;
  byCategory: MagazineCategoryCountV2[];
  topViewed: MagazineTopItemV2[];
  topLiked: MagazineTopItemV2[];
  topDownloaded: MagazineTopItemV2[];
}

/**
 * Per-magazine engagement snapshot (`GET /api/v2/magazines/{uuid}/stats`).
 *
 * Served by the generic engagement subsystem, so the wire shape is the
 * generic snake_case counters envelope `EngagementCounters`
 * (`view_count_real` / `view_count_vanity` / `useful_count` /
 * `not_useful_count` / `share_count` / `bookmark_count` / `comment_count`
 * + `settings`) — NOT the old camelCase magazine-named row
 * `{ uuid, title, viewCount, downloadCount, likeCount, shareCount,
 * isPublished, isFeatured, publishedAt, createdAt }`, which never matched
 * the post-cutover wire. NOTE: this admin stats payload no longer carries
 * magazine metadata (uuid/title/isPublished/…); read those from
 * `MagazineDetailV2`. Backend: `EngagementCountersV2`
 * (`app/engagement/presentation/schemas/common.py`), returned by the
 * engagement `stats` route in
 * `app/engagement/presentation/routes/extended_routes.py`.
 */
export type MagazineItemStatsV2Response = EngagementCounters;

// ── Bulk actions (added 2026-04-20) ─────────────────────────────────

export type MagazineBulkAction =
  | "publish"
  | "unpublish"
  | "feature"
  | "unfeature"
  | "delete";

export interface MagazineBulkActionRequest {
  uuids: string[];
  action: MagazineBulkAction;
}

export interface MagazineBulkResultV2 {
  action: MagazineBulkAction;
  matched: number;
  modified: number;
  missingUuids: string[];
}

// ── Bulk import (added 2026-04-22) ──────────────────────────────────

export interface MagazineBulkImportRequest {
  /** Up to 100 magazine create payloads. Each row validated server-side. */
  items: MagazineCreateV2Request[];
}

export interface MagazineBulkImportFailure {
  /** Stable zero-based index matching the submitted `items[]` order. */
  index: number;
  title: string | null;
  errorCode: string;
  errorMessage: string;
}

export interface MagazineBulkImportResultV2 {
  total: number;
  created: number;
  failed: MagazineBulkImportFailure[];
  /** UUIDs of magazines successfully created, in the order they ran. */
  createdUuids: string[];
}

// ── Share response (POST /{uuid}/share) ─────────────────────────────

/**
 * Response for `POST /api/v2/magazines/{uuid}/share`.
 *
 * Served by the generic engagement subsystem, so the wire shape is the
 * generic snake_case `EngagementShareResponse`
 * (`share_count` / `channel` / `recorded_at`) — NOT the old camelCase
 * `{ shareCount, shareCountReal?, shareUrl }`. The legacy `shareUrl`
 * deep-link is GONE from this response (the engagement share route does
 * not emit it). Backend: `EngagementShareResponseV2`
 * (`app/engagement/presentation/schemas/common.py`).
 */
export type MagazineShareResponse = EngagementShareResponse;

// ── Download response (POST /{uuid}/download) ───────────────────────

/**
 * Response for `POST /api/v2/magazines/{uuid}/download`.
 *
 * Served by the generic engagement subsystem, so the wire shape is the
 * generic snake_case `EngagementDownloadResponse`
 * (`download_count_real` / `download_count_vanity`) — NOT the old
 * camelCase `{ pdfUrl, downloadCount, downloadCountReal? }`. The legacy
 * `pdfUrl` is GONE from this response (the engagement download route
 * returns only counters; clients read the PDF URL from the magazine
 * detail (`MagazineDetailV2.pdfUrl`) instead). Backend:
 * `EngagementDownloadResponseV2`
 * (`app/engagement/presentation/schemas/extended.py`).
 */
export type MagazineDownloadResponse = EngagementDownloadResponse;

// ── Comments (2026-06-03) ───────────────────────────────────────────
//
// Magazine comments are served by the generic engagement subsystem via the
// magazine subject adapter (`magazine_engagement_adapter.py`,
// base_prefix `/api/v2/magazines`). The types below are the magazine-named
// mirror of the blog comment family (`BlogCommentV2` & co. in
// `src/blogPosts/types.ts`) so app/web can import a feature-scoped name
// instead of duplicating the shapes locally or reaching for the generic
// `EngagementComment*` types.
//
// They are structurally identical to `src/engagement` `EngagementComment*`
// — the magazine subject reuses the engagement comment schemas verbatim:
//   - `MagazineCommentV2`              ≡ EngagementComment / BE EngagementCommentV2
//   - `MagazineCommentCreateRequestV2` ≡ EngagementCommentCreateRequest / BE EngagementCommentCreateRequestV2
//   - `MagazineCommentListResponseV2`  ≡ EngagementCommentListResponse / BE EngagementCommentListResponseV2
//
// IMPORTANT: the author shape is the engagement author
// (`user_id` / `name` / `avatar_url`), NOT `BlogAuthorV2` — magazine comment
// authors carry no `bio` / `is_primary`.
//
// Routes: `V2_ENDPOINTS.MAGAZINE_COMMENTS` (GET list),
// `V2_ENDPOINTS.MAGAZINE_COMMENTS_CREATE` (POST), and
// `V2_ENDPOINTS.MAGAZINE_COMMENT_DELETE` (DELETE own). Equivalent generic
// keys live in `src/engagement` (`engagementSubjectEndpoints("/api/v2/magazines")`
// → COMMENTS_LIST / COMMENTS_CREATE / COMMENT_DELETE_OWN).

/**
 * Comment author reference returned on magazine comments. `name` and
 * `avatar_url` are nullable because author hydration is handled by a
 * downstream service that isn't always wired; the FE falls back to
 * "Anonymous" / initials when either is absent.
 *
 * Backend: `app/engagement/presentation/schemas/comments.py ::
 * EngagementCommentAuthorV2`. Distinct from `BlogAuthorV2` — no
 * `bio` / `is_primary`.
 */
export interface MagazineCommentAuthorV2 {
  user_id: number;
  name: string | null;
  avatar_url: string | null;
}

/**
 * A single magazine comment row, returned by create or list.
 * Backend: `app/engagement/presentation/schemas/comments.py ::
 * EngagementCommentV2`.
 */
export interface MagazineCommentV2 {
  id: number;
  /** UUID v4. */
  uuid: string;
  /**
   * Parent comment id for threaded replies. `null` for top-level comments.
   * Threading depth is enforced server-side (currently 1 level).
   */
  parent_id: number | null;
  body_md: string;
  /** Server-sanitized HTML, safe to render verbatim. */
  body_html_sanitized: string;
  author: MagazineCommentAuthorV2;
  /** ISO 8601 UTC. */
  created_at: string;
  /**
   * ISO 8601 UTC. Non-null when the comment has been soft-deleted (by the
   * owner via `DELETE /magazines/comments/{comment_uuid}` or by an admin).
   * Clients should hide soft-deleted rows or render a "Comment deleted"
   * placeholder.
   */
  deleted_at: string | null;
  /** True when the caller authored the comment (drives delete affordance). */
  is_author_self: boolean;
}

/**
 * POST `/api/v2/magazines/{uuid}/comments` request body.
 * Backend: `app/engagement/presentation/schemas/comments.py ::
 * EngagementCommentCreateRequestV2`.
 */
export interface MagazineCommentCreateRequestV2 {
  /**
   * Markdown body. 1–5000 chars (`min_length=1`, `max_length=5000` enforced
   * server-side). Whitespace-only payloads are rejected with 422.
   */
  body_md: string;
  /**
   * Optional parent comment id for threaded replies. `null` (or omitted) =
   * top-level comment.
   */
  parent_id?: number | null;
}

/** GET `/api/v2/magazines/{uuid}/comments` response payload. */
export interface MagazineCommentListResponseV2 {
  items: MagazineCommentV2[];
  total: number;
  limit: number;
  offset: number;
}

// ── Multi-lang CMS (2026-04-21) ─────────────────────────────────────

export type MagazineTranslationSource = "machine" | "human" | "fallback";

export interface TranslationLangMetadata {
  currentLang: LocaleCode;
  availableLangs?: LocaleCode[];
  translationSource?: MagazineTranslationSource;
}

export interface MagazineTranslationBody {
  title?: string;
  subtitle?: string;
  description?: string;
  excerpt?: string;
  badgeText?: string;
  tableOfContents?: TableOfContentsEntry[];
}

export interface MagazineTranslationResponseV2 {
  lang: LocaleCode;
  source: MagazineTranslationSource;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  excerpt: string | null;
  badgeText: string | null;
  tableOfContents: TableOfContentsEntry[] | null;
  updatedAt: string;
}

export interface MagazinePageTextResponseV2 {
  pageNumber: number;
  lang: LocaleCode;
  source: MagazineTranslationSource;
  text: string | null;
  /**
   * Storage format hint for the page text. `"plain"` (default) → raw
   * `\n\n`-separated paragraphs from pymupdf; `"markdown"` → CommonMark
   * with semantic structure (headings, lists, bold stat spans) from the
   * LLM-aided reformat pass. The FE switches its renderer accordingly.
   * Always emitted by the BE (default `"plain"`). Backend:
   * `MagazinePageTextResponseV2.format`
   * (`app/presentation/schemas/magazine_v2.py`).
   */
  format: "plain" | "markdown";
}

export interface MagazinePagesResponseV2 {
  lang: LocaleCode;
  total: number;
  items: MagazinePageTextResponseV2[];
}

// ── Moderation (2026-04-21) ─────────────────────────────────────────

export type MagazineReportReason =
  | "spam"
  | "inappropriate"
  | "copyright"
  | "outdated"
  | "broken"
  | "other";

export type MagazineReportStatus =
  | "pending"
  | "reviewed"
  | "dismissed"
  | "actioned";

export interface MagazineReportCreateV2Request {
  reason: MagazineReportReason;
  comment?: string;
}

/**
 * Acknowledgement for `POST /api/v2/magazines/{uuid}/report`.
 *
 * Served by the generic engagement subsystem, so the wire shape is the
 * generic snake_case `EngagementReportAck` (`{ status }`) — NOT the old
 * camelCase full row `{ uuid, magazineUuid, reason, status, comment,
 * createdAt }`, which never matched the post-cutover wire (the report
 * route surfaces only the row status to the reporter; full report rows
 * live behind the admin moderation surface). Backend:
 * `EngagementReportAckV2` (`app/engagement/presentation/schemas/extended.py`).
 */
export type MagazineReportResponseV2 = EngagementReportAck;

// ── Structured error detail (2026-04-21) ────────────────────────────

/**
 * All 4xx/5xx responses from /api/v2/magazines/* return this shape:
 * `{ detail: { code, message, ...extra } }`.
 *
 * Known codes:
 * - magazine_not_found, magazine_missing_pdf
 * - file_not_found, file_missing_key, file_not_uploaded
 * - rate_limited, storage_unavailable
 * - preview_pages_out_of_range
 */
export interface MagazineErrorDetail {
  code: string;
  message: string;
  [extra: string]: unknown;
}

// ── Cover presentation specs (2026-04-23) ───────────────────────────

/**
 * Where a magazine cover is rendered across consumer surfaces.
 * Drives crop output sizes, multi-preview UI in the admin dashboard,
 * and srcset generation in web/mobile clients.
 */
export type CoverPresentationKey =
  | "cardThumb"
  | "cardLarge"
  | "fullView"
  | "mobileCard"
  | "mobileFull";

export interface CoverPresentationSpec {
  /** Canonical key used as image variant identifier */
  key: CoverPresentationKey;
  /** Output width in pixels */
  width: number;
  /** Output height in pixels */
  height: number;
  /** Aspect ratio label, always "2:3" for magazine covers */
  ratio: "2:3";
  /** Human-readable context for admin UIs */
  context: string;
}

/**
 * Canonical cover variants every consumer should generate / display.
 * All entries share a 2:3 aspect ratio (matches printed magazine covers).
 *
 * Source-of-truth dimensions for:
 * - Admin dashboard crop output (`new_dashboard`)
 * - Web srcset (`Sitimm-web`)
 * - Mobile image cache sizing (`sitimmApp`)
 */
export const COVER_PRESENTATIONS: Readonly<
  Record<CoverPresentationKey, CoverPresentationSpec>
> = {
  cardThumb: {
    key: "cardThumb",
    width: 320,
    height: 480,
    ratio: "2:3",
    context: "Web — card grid thumbnail",
  },
  cardLarge: {
    key: "cardLarge",
    width: 480,
    height: 720,
    ratio: "2:3",
    context: "Web — featured / hero card",
  },
  fullView: {
    key: "fullView",
    width: 800,
    height: 1200,
    ratio: "2:3",
    context: "Web — magazine detail / full view",
  },
  mobileCard: {
    key: "mobileCard",
    width: 240,
    height: 360,
    ratio: "2:3",
    context: "Mobile app — list item",
  },
  mobileFull: {
    key: "mobileFull",
    width: 600,
    height: 900,
    ratio: "2:3",
    context: "Mobile app — magazine detail",
  },
} as const;

/** Canonical cover aspect ratio (width / height). */
export const COVER_ASPECT_RATIO = 2 / 3;
