/**
 * Magazine V2 types — CRUD, engagement (likes/views), pagination.
 *
 * Backend equivalents:
 * - MagazineV2          -> app/presentation/schemas/magazine_v2.py :: MagazineV2Response
 * - MagazineDetailV2    -> magazine_v2.py :: MagazineDetailV2Response
 * - MagazineListV2Response -> magazine_v2.py :: MagazineListV2Response
 * - MagazineLikeResponse -> magazine_v2.py :: MagazineLikeResponse
 *
 * Note: Response fields use camelCase aliases matching JSON output.
 * Request fields use snake_case matching Pydantic field names.
 */

// ── Category ────────────────────────────────────────────────────────

/**
 * Magazine category. Validated with regex `^(general|especial|anual|boletin)$`.
 * Backend: magazine_v2.py :: MagazineCreateV2.category
 */
export type MagazineCategory = "general" | "especial" | "anual" | "boletin";

/**
 * Sort option for magazine list queries.
 * Backend: magazine_v2.py :: MagazineListParams.sort
 */
export type MagazineSortOption = "newest" | "oldest" | "title";

// ── Magazine Response (list view) ───────────────────────────────────

/**
 * Magazine response for list and detail views.
 * Backend: magazine_v2.py :: MagazineV2Response
 *
 * Uses camelCase aliases from Pydantic `alias=` configuration.
 */
export interface MagazineV2 {
  /** Magazine UUID — primary identifier. */
  uuid: string;
  /** Title. Max 500 chars. */
  title: string;
  /** Subtitle. Max 500 chars. */
  subtitle: string | null;
  /** Description. Max 2000 chars. */
  description: string | null;

  // Files (presigned URLs)
  /** Cover image presigned URL. */
  coverUrl: string | null;
  /** PDF file presigned URL. */
  pdfUrl: string | null;
  /** Banner image presigned URL. Fase 2. */
  bannerUrl: string | null;

  // Visual
  /** Dominant color extracted from cover (hex). */
  dominantColor: string | null;
  /** Secondary color extracted from cover (hex). */
  secondaryColor: string | null;
  /** Whether this magazine is featured/highlighted. Default: false. */
  isFeatured: boolean;
  /** Short badge text overlay (e.g., "Nuevo", "Especial"). Max 50 chars. */
  badgeText: string | null;

  // Reading
  /** Number of pages in the PDF. Auto-computed on upload. */
  pageCount: number | null;
  /** Estimated reading time in minutes. Auto-computed from page count. */
  readingTimeMin: number | null;

  // Organization
  /** Edition number (e.g., 42). */
  editionNumber: number | null;
  /** Edition year (e.g., 2026). */
  editionYear: number | null;
  /** Edition month (1–12). Validated: ge=1, le=12. */
  editionMonth: number | null;
  /** Category. Default: "general". */
  category: MagazineCategory;
  /** Tags for filtering/search. Fase 2. */
  tags: string[];

  // Stats
  /** Total view count. Default: 0. */
  viewCount: number;
  /** Total download count. Default: 0. */
  downloadCount: number;
  /** Total like count. Fase 3. Default: 0. */
  likeCount: number;
  /** Whether the current user has liked this magazine. Fase 3. */
  isLiked: boolean;

  // Publication
  /** Whether the magazine is published/visible. Default: true. */
  isPublished: boolean;
  /** ISO-8601 datetime when published. Null for drafts. */
  publishedAt: string | null;
  /** Name of the author/uploader. */
  authorName: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

// ── Magazine Detail Response ────────────────────────────────────────

/**
 * Magazine detail response — extends MagazineV2 with file UUIDs and rich content.
 * Backend: magazine_v2.py :: MagazineDetailV2Response
 *
 * Used for the edit/detail view where admin needs file references and TOC.
 */
export interface MagazineDetailV2 extends MagazineV2 {
  /** Cover file UUID for re-upload reference. */
  coverFileUuid: string | null;
  /** PDF file UUID for re-upload reference. */
  pdfFileUuid: string | null;
  /** Banner file UUID. Fase 2. */
  bannerFileUuid: string | null;
  /** Excerpt text for search/preview. Max 2000 chars. Fase 2. */
  excerpt: string | null;
  /** Table of contents (JSON array of chapter objects). Fase 2. */
  tableOfContents: Array<Record<string, unknown>> | null;
  /** Preview page numbers (for non-subscribers). Fase 2. */
  previewPages: number[] | null;
  /** Related magazines list. Fase 3. */
  related: MagazineV2[];
}

// ── List Response ───────────────────────────────────────────────────

/**
 * Paginated magazine list response.
 * Backend: magazine_v2.py :: MagazineListV2Response
 */
export interface MagazineListV2Response {
  /** Array of magazines for the current page. */
  items: MagazineV2[];
  /** Total number of magazines matching filters. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. Default: 20. Max: 100. */
  pageSize: number;
  /** Whether there are more pages. */
  hasNext: boolean;
}

// ── Like Response ───────────────────────────────────────────────────

/**
 * Response for like/unlike actions.
 * Backend: magazine_v2.py :: MagazineLikeResponse
 */
export interface MagazineLikeResponse {
  /** Whether the current user now likes this magazine. */
  liked: boolean;
  /** Updated total like count. */
  likeCount: number;
}

// ── Create Request ──────────────────────────────────────────────────

/**
 * Request body for POST /api/v2/magazines.
 * Backend: magazine_v2.py :: MagazineCreateV2
 */
export interface MagazineCreateV2Request {
  /** Title. Required. Min 1, max 500 chars. */
  title: string;
  /** Description. Max 2000 chars. */
  description?: string;
  /** UUID of the uploaded PDF file. Required. */
  pdf_file_uuid: string;
  /** UUID of the uploaded cover image. */
  cover_file_uuid?: string;
  /** ISO-8601 publish date. Null = draft. */
  published_at?: string;
  /** Published flag. Default: true. */
  is_published?: boolean;
  /** Subtitle. Max 500 chars. */
  subtitle?: string;
  /** Featured flag. Default: false. */
  is_featured?: boolean;
  /** Badge text overlay. Max 50 chars. */
  badge_text?: string;
  /** Banner file UUID. Fase 2. */
  banner_file_uuid?: string;
  /** Edition number. */
  edition_number?: number;
  /** Edition year. */
  edition_year?: number;
  /** Edition month (1–12). Validated: ge=1, le=12. */
  edition_month?: number;
  /** Category. Default: "general". */
  category?: MagazineCategory;
  /** Tags array. Fase 2. */
  tags?: string[];
  /** Table of contents (JSON). Fase 2. */
  table_of_contents?: Array<Record<string, unknown>>;
  /** Preview page numbers. Fase 2. */
  preview_pages?: number[];
  /** Excerpt text. Max 2000 chars. Fase 2. */
  excerpt?: string;
  /** Related magazine UUIDs. Fase 3. */
  related_magazine_ids?: string[];
}

/**
 * Request body for PATCH /api/v2/magazines/{uuid}. All fields optional.
 * Backend: magazine_v2.py :: MagazineUpdateV2
 */
export interface MagazineUpdateV2Request {
  /** Title. Min 1, max 500 chars. */
  title?: string;
  /** Description. Max 2000 chars. */
  description?: string;
  /** Cover file UUID. */
  cover_file_uuid?: string;
  /** PDF file UUID. */
  pdf_file_uuid?: string;
  /** ISO-8601 publish date. */
  published_at?: string;
  /** Published flag. */
  is_published?: boolean;
  /** Subtitle. Max 500 chars. */
  subtitle?: string;
  /** Featured flag. */
  is_featured?: boolean;
  /** Badge text. Max 50 chars. */
  badge_text?: string;
  /** Banner file UUID. Fase 2. */
  banner_file_uuid?: string;
  /** Edition number. */
  edition_number?: number;
  /** Edition year. */
  edition_year?: number;
  /** Edition month (1–12). */
  edition_month?: number;
  /** Category. */
  category?: MagazineCategory;
  /** Tags array. Fase 2. */
  tags?: string[];
  /** Table of contents (JSON). Fase 2. */
  table_of_contents?: Array<Record<string, unknown>>;
  /** Preview page numbers. Fase 2. */
  preview_pages?: number[];
  /** Excerpt text. Max 2000 chars. Fase 2. */
  excerpt?: string;
  /** Related magazine UUIDs. Fase 3. */
  related_magazine_ids?: string[];
}
