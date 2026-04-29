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

import type { LocaleCode } from "../locales/index.js";

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
  /** Active locale resolved by the backend translation layer. Sent only
   *  when translations are active (omitted for admin/raw lookups). */
  currentLang?: string;
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

export interface MagazineShareResponse {
  shareCount: number;
  /** Canonical deep-link FE can hand to OS share sheet. Added 2026-04-21. */
  shareUrl: string;
}

// ── Download response (POST /{uuid}/download) ───────────────────────

export interface MagazineDownloadResponse {
  pdfUrl: string;
  downloadCount: number;
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

export interface MagazineReportResponseV2 {
  uuid: string;
  magazineUuid: string;
  reason: MagazineReportReason;
  status: MagazineReportStatus;
  comment: string | null;
  createdAt: string;
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
