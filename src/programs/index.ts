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
 * SubProgram record — child node of a Program.
 * Backend: programs_v2.py :: SubProgramV2Response
 */
export interface SubProgramV2 {
  /** SubProgram UUID — primary identifier. */
  uuid: string;
  /** Title text. Null in legacy rows that predate the field. */
  title: string | null;
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
  /** Hero image URL. */
  img: string | null;
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
   * Locale applied to `title` / `description`. `null` when the caller did
   * not request a translation (source `es` returned). v0.47.0+.
   */
  currentLang?: string | null;
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
  content: unknown | null;
  url: string | null;
  /**
   * Active SubPrograms. `null` when the caller passed `?include_subs=false`.
   */
  sub_programs: SubProgramV2[] | null;
  /** Locale applied. v0.47.0+. */
  currentLang?: string | null;
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
 * Body for PUT /api/v2/subprograms/{sub_uuid}/translations/{lang}. Only
 * `title` is accepted — SubProgram has no translatable description.
 */
export interface SubProgramTranslationUpsertBody {
  title?: string | null;
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
