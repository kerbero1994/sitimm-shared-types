/**
 * Magazine V2 types — CRUD, engagement (likes/views/shares), pagination,
 * admin analytics, bulk operations.
 *
 * Backend equivalents (mini-back):
 * - app/presentation/schemas/magazine_v2.py
 * - app/presentation/api/v2/magazines_v2.py
 *
 * Response fields: camelCase aliases matching JSON output.
 * Request fields: snake_case matching Pydantic field names.
 */

// ── Category / Sort ─────────────────────────────────────────────────

/**
 * Magazine category enum. Matches backend MagazineCategory.
 */
export type MagazineCategory = "general" | "especial" | "anual" | "boletin";

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
  | "most_downloaded";

// ── Table of Contents ───────────────────────────────────────────────

/**
 * Typed TOC entry. Backend: schemas.magazine_v2.TableOfContentsEntry.
 */
export interface TableOfContentsEntry {
  title: string;
  page: number;
  anchor?: string | null;
}

// ── Magazine Response (list view) ───────────────────────────────────

export interface MagazineV2 {
  uuid: string;
  title: string;
  subtitle: string | null;
  description: string | null;

  coverUrl: string | null;
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

  viewCount: number;
  downloadCount: number;
  likeCount: number;
  /** Total shares. Added 2026-04-20. */
  shareCount: number;
  isLiked: boolean;

  isPublished: boolean;
  publishedAt: string | null;
  authorName: string | null;
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
}

// ── Like Response ───────────────────────────────────────────────────

export interface MagazineLikeResponse {
  liked: boolean;
  likeCount: number;
}

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
 * Per-magazine engagement snapshot (GET /{uuid}/stats).
 */
export interface MagazineItemStatsV2Response {
  uuid: string;
  title: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  shareCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

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

// ── Share response (POST /{uuid}/share) ─────────────────────────────

export interface MagazineShareResponse {
  shareCount: number;
}

// ── Download response (POST /{uuid}/download) ───────────────────────

export interface MagazineDownloadResponse {
  pdfUrl: string;
  downloadCount: number;
}

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
