/**
 * Program V2 types.
 *
 * Backend: app/presentation/schemas/programs_v2.py + app/application/services/program_v2_service.py
 *
 * Programs are simple content cards with nested SubPrograms — used by the
 * SITIMM marketing site and member dashboard. The V2 surface is a clean
 * port of the legacy Node.js endpoints with a polished surface:
 *
 * - Routing by `uuid` instead of integer `id`.
 * - Soft-delete on both Program and SubProgram (cascades from parent).
 * - Pagination + ILIKE search on list endpoints.
 * - Optimistic locking via `if_match_updated_at` on PATCH/DELETE.
 * - SubProgram reorder via `position` column.
 * - Image upload helper backed by MinIO.
 *
 * No audience targeting, fan-out, or notifications — programs are static
 * content the union edits centrally.
 */

// ─────────────────────────────────────────────────────────────────────
// Records
// ─────────────────────────────────────────────────────────────────────

/**
 * Single responsive image variant. v0.50.0+.
 *
 * The migration pipeline emits 6 variants per Program / SubProgram main
 * image (320 / 800 / max-width × WebP + AVIF) and 4 variants per
 * ImgList carousel item (320 / 800 × WebP + AVIF). FE assembles
 * `<picture>` markup from the array.
 */
export interface ImageVariant {
  /** Public absolute URL. */
  url: string;
  /** Pixel width of this variant (downscaled from source). */
  width: number;
  /** File extension / encoder used: `webp` or `avif`. */
  format: "webp" | "avif";
  /** MIME type — handy for `<source type="...">`. */
  content_type: "image/webp" | "image/avif";
}

/**
 * Responsive image bundle attached to Program / SubProgram /
 * ImgList items. v0.50.0+.
 *
 * Suggested FE pattern::
 *
 *   const avif = variants.filter(v => v.format === 'avif');
 *   const webp = variants.filter(v => v.format === 'webp');
 *   <picture>
 *     <source type="image/avif" srcSet={avif.map(v => `${v.url} ${v.width}w`).join(', ')} />
 *     <source type="image/webp" srcSet={webp.map(v => `${v.url} ${v.width}w`).join(', ')} />
 *     <img src={default} alt={title} />
 *   </picture>
 */
export interface ImageVariants {
  /** Master URL — largest WebP. Backward-compat fallback for clients that
   * don't read variants. Mirrors the legacy `img` column. */
  default: string;
  /** All sizes × formats. Sorted ascending by width. */
  variants: ImageVariant[];
  /**
   * BlurHash placeholder — ~25-35 char string the FE can render as a
   * blurred backdrop while the real image streams in. v0.51.0+.
   * Decoder libraries: `blurhash` (vanilla JS), `react-native-blurhash`,
   * `flutter-blurhash`. `null` when the optional `blurhash` Python
   * package was not installed at migration time.
   */
  blurhash?: string | null;
}

/**
 * Per-field applied locale on a Program response. v0.48.0+.
 *
 * Backend writes this whenever the caller opted into the multilingual
 * surface (`?lang=` resolved to a non-empty string). Each field carries
 * the lang the renderer actually used:
 * - the requested lang when a `ProgramTranslation` row exists for that
 *   `(program, lang)` AND the matching column is non-null;
 * - the source default `es` otherwise (silent fallback).
 *
 * FE can branch on each entry to flag fall-back content with a UX hint
 * (e.g. "translation pending, showing Spanish").
 */
export interface ProgramCurrentLang {
  title: ProgramLang;
  description: ProgramLang;
}

/**
 * Per-field applied locale on a SubProgram response. v0.49.0+ keys both
 * `title` and `description` (was `title`-only in v0.48.0).
 */
export interface SubProgramCurrentLang {
  title: ProgramLang;
  description: ProgramLang;
}

/**
 * SubProgram record — child node of a Program.
 * Backend: programs_v2.py :: SubProgramV2Response
 */
export interface SubProgramV2 {
  /** SubProgram UUID — primary identifier. */
  uuid: string;
  /** Title text. Null in legacy rows that predate the field. */
  title: string | null;
  /** Long-form description. v0.49.0+. Source `es` may be NULL when legacy data has no description. */
  description?: string | null;
  /** Per-field applied locale. v0.48.0+, gains `description` key in v0.49.0. */
  currentLang?: SubProgramCurrentLang | null;
  /** Responsive variants of `img`. v0.50.0+. */
  img_variants?: ImageVariants | null;
  /** Image URL (relative or absolute). */
  img: string | null;
  /** Free-form JSONB content blob (rich text body, blocks, etc.). */
  content: unknown | null;
  /** URL slug. */
  url: string | null;
  /**
   * Display order within the parent Program. NULL means "append after
   * positioned rows" (see INV-SUB-ORDER). Stamped by the reorder
   * endpoint.
   */
  position: number | null;
  /** Parent Program UUID. Null only on detached/legacy rows. */
  program_uuid: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
  /** ISO-8601 soft-delete timestamp. Null when active. */
  deletedAt: string | null;
}

/**
 * Program record with embedded active SubPrograms.
 * Backend: programs_v2.py :: ProgramV2Response
 */
export interface ProgramV2 {
  /** Program UUID — primary identifier. */
  uuid: string;
  /** Title text. */
  title: string | null;
  /** Long-form description (max 100k chars). */
  description: string | null;
  /** Hero image URL — largest WebP. */
  img: string | null;
  /** Responsive variants of `img`. v0.50.0+. */
  img_variants?: ImageVariants | null;
  /** Free-form JSONB content blob (max 100 KB serialized). */
  content: unknown | null;
  /**
   * URL slug. Server auto-derives `/<title-with-dashes>` when omitted on
   * create/update. Unique across active rows (see INV-PROG-SLUG).
   */
  url: string | null;
  /**
   * Active SubPrograms ordered by `(position NULLS LAST, createdAt ASC)`.
   * `null` only when the caller passed `?include_subs=false` (server skipped
   * eager-load); `[]` when loaded but the program has no children.
   */
  sub_programs: SubProgramV2[] | null;
  /**
   * Per-field applied locale. Keys: `title`, `description`. Each value is
   * the actual lang the field was rendered in — requested lang when a
   * translation row + non-null column exist, source `es` otherwise.
   * `null` when the caller did not request a translation (server passed
   * no requested_lang downstream). v0.48.0+.
   */
  currentLang?: ProgramCurrentLang | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /**
   * ISO-8601 last-update timestamp. Use this value as
   * `if_match_updated_at` on subsequent PATCH/DELETE to enable optimistic
   * locking (INV-PROG-LOCK).
   */
  updatedAt: string;
  /** ISO-8601 soft-delete timestamp. Null when active. */
  deletedAt: string | null;
}

/**
 * Trimmed Program payload returned by the public endpoint.
 * Backend: programs_v2.py :: ProgramV2PublicResponse
 *
 * Internal timestamps are stripped so the marketing site never displays
 * createdAt/updatedAt/deletedAt by accident.
 */
export interface ProgramV2Public {
  uuid: string;
  title: string | null;
  description: string | null;
  img: string | null;
  /** Responsive variants of `img`. v0.50.0+. */
  img_variants?: ImageVariants | null;
  content: unknown | null;
  url: string | null;
  /**
   * Active SubPrograms. `null` when the caller passed `?include_subs=false`.
   */
  sub_programs: SubProgramV2[] | null;
  /** Per-field applied locale. v0.48.0+. See {@link ProgramV2.currentLang}. */
  currentLang?: ProgramCurrentLang | null;
}

// ─────────────────────────────────────────────────────────────────────
// Request bodies
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for POST /api/v2/programs/{program_uuid}/subprograms or inside a
 * `CreateProgramV2Body.sub_programs` array.
 * Backend: programs_v2.py :: SubProgramV2Create
 */
export interface CreateSubProgramV2Body {
  /** Required title (1-500 chars). */
  title: string;
  /** Optional long-form description (max 100k chars). v0.49.0+. */
  description?: string | null;
  /** Optional image URL. */
  img?: string | null;
  /** Optional free-form JSONB content (max 100 KB serialized). */
  content?: unknown | null;
  /** Optional URL slug. */
  url?: string | null;
}

/**
 * Body for POST /api/v2/programs.
 * Backend: programs_v2.py :: ProgramV2Create
 */
export interface CreateProgramV2Body {
  /** Required title (1-500 chars). */
  title: string;
  /** Optional description (max 100k chars). */
  description?: string | null;
  /** Optional image URL. */
  img?: string | null;
  /** Optional free-form JSONB content (max 100 KB serialized). */
  content?: unknown | null;
  /** Optional URL slug — server derives one from `title` if omitted. */
  url?: string | null;
  /** Optional inline subprograms; each is created in the same transaction. */
  sub_programs?: CreateSubProgramV2Body[];
}

/**
 * Body for PATCH /api/v2/programs/{program_uuid}.
 * Backend: programs_v2.py :: ProgramV2Update
 *
 * Partial update — every field is optional. SubPrograms are managed via
 * their own endpoints (see CreateSubProgramV2Body / UpdateSubProgramV2Body).
 */
export type UpdateProgramV2Body = Partial<
  Pick<CreateProgramV2Body, "title" | "description" | "img" | "content" | "url">
> & {
  /**
   * Optimistic lock — pass the `updatedAt` value the client last
   * observed. Server returns `409 stale_write` on mismatch.
   */
  if_match_updated_at?: string | null;
};

/**
 * Body for PATCH /api/v2/subprograms/{sub_uuid}.
 * Backend: programs_v2.py :: SubProgramV2Update
 */
export type UpdateSubProgramV2Body = Partial<CreateSubProgramV2Body> & {
  /** Optimistic lock — see {@link UpdateProgramV2Body}. */
  if_match_updated_at?: string | null;
};

/**
 * Body accepted (optional) on DELETE /api/v2/programs/{uuid} or
 * /api/v2/subprograms/{uuid} so callers can carry the optimistic lock.
 * Backend: programs_v2.py :: ProgramV2Delete
 */
export interface DeleteProgramV2Body {
  if_match_updated_at?: string | null;
}

/**
 * Body for PATCH /api/v2/programs/{program_uuid}/subprograms/reorder.
 * Backend: programs_v2.py :: ReorderSubProgramsRequest
 *
 * The server stamps `position = idx` on each SubProgram in request order.
 * UUIDs not listed keep their current `position` (commonly NULL — they
 * sort after positioned rows). Unknown UUIDs raise `subprogram_not_found`.
 */
export interface ReorderSubProgramsBody {
  /** 1-200 SubProgram UUIDs in the desired order. */
  ordered_uuids: string[];
}

/**
 * Optional request shape for POST /api/v2/programs/upload-image. The
 * actual transport is multipart/form-data — clients send a `file` field;
 * this interface documents what the FE forms must collect.
 * Backend: programs_v2.py :: ImageUploadRequest
 */
export interface ImageUploadRequest {
  filename: string;
  /**
   * MIME type. Server enforces the allowed set
   * { png, jpeg, jpg, webp, gif, svg+xml }; anything else raises
   * `unsupported_media_type`.
   */
  content_type: string;
}

// ─────────────────────────────────────────────────────────────────────
// Responses
// ─────────────────────────────────────────────────────────────────────

/**
 * Response from POST /api/v2/programs/upload-image.
 * Backend: programs_v2.py :: ImageUploadResponse
 *
 * `upload_url` is currently identical to `object_url` — the field exists
 * so a future presigned-PUT migration won't be a breaking change.
 */
export interface ImageUploadResponse {
  upload_url: string;
  object_url: string;
  /** Seconds until `upload_url` expires. 0 means "no expiry" (current behaviour). */
  expires_in: number;
}

/**
 * Response from PATCH /api/v2/programs/{program_uuid}/subprograms/reorder.
 * Backend: programs_v2.py :: reorder_subprograms()
 */
export interface ReorderSubProgramsResponse {
  ordered_uuids: string[];
  count: number;
}

/**
 * Supported translation languages. v0.47.0+.
 *
 * `es` is the source — never accepted by translation upsert/delete
 * endpoints (would return `400 unsupported_lang`).
 */
export type ProgramLang = "es" | "en" | "fr" | "de" | "ja" | "ko" | "zh" | "hi";

/**
 * Query params for GET /api/v2/programs.
 * Backend: programs_v2.py :: list_programs()
 */
export interface ListProgramsV2Request {
  /** 1-based page (default 1). */
  page?: number;
  /** Page size, 1-200 (default 50). */
  page_size?: number;
  /** Case-insensitive ILIKE on `title` + `description` (max 200 chars). */
  q?: string;
  /**
   * Admin audit flag: when true, soft-deleted rows surface in the
   * response. Public endpoint NEVER honours this (INV-PUB-1).
   */
  include_deleted?: boolean;
  /**
   * When `false`, server skips the SubProgram eager-load and the
   * `sub_programs` field on each Program is `null`. Default `true`. v0.47.0+.
   */
  include_subs?: boolean;
  /**
   * Locale to apply to `title` / `description`. `?lang` > `Accept-Language`
   * > source `es`. v0.47.0+.
   */
  lang?: ProgramLang;
}

/**
 * Query params for GET /api/v2/programs/public.
 * Backend: programs_v2.py :: list_programs_public()
 */
export type ListProgramsV2PublicRequest = Pick<
  ListProgramsV2Request,
  "page" | "page_size" | "q" | "include_subs" | "lang"
>;

/**
 * Response from GET /api/v2/programs.
 * Backend: programs_v2.py :: ProgramV2ListResponse
 */
export interface ListProgramsV2Response {
  programs: ProgramV2[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Response from GET /api/v2/programs/public.
 * Backend: programs_v2.py :: ProgramV2PublicListResponse
 */
export interface ListProgramsV2PublicResponse {
  programs: ProgramV2Public[];
  total: number;
  page: number;
  page_size: number;
}

// ─────────────────────────────────────────────────────────────────────
// Error catalogue
// ─────────────────────────────────────────────────────────────────────

/**
 * Machine-readable error codes returned by the V2 Programs surface.
 * Mirrors the catalogue documented in `docs/v2/Programs/errors.md`.
 *
 * Frontends should branch on this value (carried as `detail.code`) and
 * NEVER on the human-readable `detail.message`, which is allowed to
 * change between versions.
 */
export type ProgramsV2ErrorCode =
  | "program_not_found"
  | "subprogram_not_found"
  | "no_fields"
  | "slug_conflict"
  | "stale_write"
  | "content_too_large"
  | "unsupported_media_type"
  | "image_too_large"
  | "empty_file"
  | "rate_limited"
  | "create_failed"
  | "update_failed"
  | "unsupported_lang"
  | "translation_not_found";

// ─────────────────────────────────────────────────────────────────────
// Translations (v0.47.0+)
// ─────────────────────────────────────────────────────────────────────

/**
 * Translation row source — how the row was produced. UI may want to
 * surface "machine" rows for review.
 */
export type ProgramTranslationSource = "machine" | "human" | "fallback";

/**
 * Per-language metadata cache row for a Program.
 * Backend: programs_v2.py :: TranslationResponse (Program flavor).
 */
export interface ProgramTranslationV2 {
  lang: ProgramLang;
  title: string | null;
  description: string | null;
  source: ProgramTranslationSource;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

/**
 * Per-language metadata cache row for a SubProgram.
 * Same shape as {@link ProgramTranslationV2} but `description` is always
 * `null` (SubProgram only stores `title`).
 */
export type SubProgramTranslationV2 = ProgramTranslationV2;

/**
 * Body for PUT /api/v2/programs/{program_uuid}/translations/{lang}.
 * At least one of `title` / `description` must be set, otherwise the
 * server returns `400 no_fields`.
 */
export interface ProgramTranslationUpsertBody {
  title?: string | null;
  description?: string | null;
  /** Default `human`. */
  source?: ProgramTranslationSource;
}

/**
 * Body for PUT /api/v2/subprograms/{sub_uuid}/translations/{lang}.
 * v0.49.0+ accepts `description` too (the source SubProgram schema
 * gained a `description` column to mirror the parent shape).
 */
export interface SubProgramTranslationUpsertBody {
  title?: string | null;
  description?: string | null;
  source?: ProgramTranslationSource;
}

/**
 * Response from
 * `GET /api/v2/programs/{uuid}/translations`
 * `GET /api/v2/subprograms/{uuid}/translations`.
 *
 * The caller can branch on each row's `source` to decide whether to
 * mark it for human review.
 */
export interface ListProgramTranslationsV2Response {
  translations: ProgramTranslationV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Bulk translation upsert (v0.48.0+)
// ─────────────────────────────────────────────────────────────────────

/**
 * Single item inside a {@link ProgramTranslationBulkUpsertBody.translations}
 * array. Server validates each item independently; one bad item rolls
 * back the whole transaction.
 */
export interface ProgramTranslationBulkItem {
  /** Target lang. Must be in {@link ProgramLang} and non-source. */
  lang: ProgramLang;
  /** Translated title (1-500 chars). Optional but at least one of `title`/`description` per item. */
  title?: string | null;
  /** Translated description (max 100 KB). */
  description?: string | null;
  /** Defaults to `human` when omitted. */
  source?: ProgramTranslationSource;
}

/**
 * Body for `PUT /api/v2/programs/{program_uuid}/translations` (no
 * `{lang}` segment — that's the bulk variant). Atomic upsert across all
 * langs in one transaction.
 *
 * Use this to seed the full multilingual surface for a program in a
 * single round-trip. Single-lang upserts via
 * `PUT .../translations/{lang}` remain available for incremental edits.
 */
export interface ProgramTranslationBulkUpsertBody {
  /** 1-8 entries, one per lang. */
  translations: ProgramTranslationBulkItem[];
}

/**
 * Same shape as {@link ProgramTranslationBulkItem} — v0.49.0+ also
 * carries `description` (the SubProgram source schema added the column).
 */
export interface SubProgramTranslationBulkItem {
  lang: ProgramLang;
  title?: string | null;
  description?: string | null;
  source?: ProgramTranslationSource;
}

/**
 * Body for `PUT /api/v2/subprograms/{sub_uuid}/translations`.
 */
export interface SubProgramTranslationBulkUpsertBody {
  translations: SubProgramTranslationBulkItem[];
}

/**
 * Response from the bulk upsert endpoints. Lists the rows that were
 * inserted or updated by the call. ``upserted`` is a redundancy that
 * lets clients skip array-length math.
 */
export interface BulkTranslationsV2Response {
  translations: ProgramTranslationV2[];
  upserted: number;
}
