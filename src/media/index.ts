/**
 * Media V2 types — DAM Fase 1 (reusable media assets + tags + search).
 *
 * Backend schemas: app/presentation/schemas/media.py (mini-back)
 * Backend routes:  app/presentation/api/v2/ media surface (prefix `/api/v2`,
 *                  gated by `require_permission("galleries", …)` — F1 reuses
 *                  the galleries permission, no new permission is created)
 * Design doc: docs/superpowers/specs/2026-07-09-dam-fase1-media-design.md
 *             (mini-back repo — binding spec for this module)
 * Jira: Epic SITIMM-203 · Story SITIMM-204
 *
 * DAM Fase 1 turns the gallery model (albums with an image bound to ONE
 * gallery via `GalleryV2Item`) into the first layer of a Digital Asset
 * Manager: an independent, reusable **Media** asset (image | video) that can
 * appear in many galleries through the `gallery_media` join (with per-gallery
 * overrides), carries normalized **tags** (`Tag` / `media_tags`), and is
 * searchable transversally (Postgres tsvector + joins). `GalleryV2Item` stays
 * INTACT — the live `sitimm.org` reads keep working during coexistence.
 *
 * ── Semantics every consumer needs to know (design §5.2, §7, §11) ────────
 *
 * - **Public-safe vs admin shape.** {@link MediaV2} is the scrubbed wire
 *   shape: it deliberately EXCLUDES the internal columns `storageKey`,
 *   `checksum`, `scanStatus` and `posterStorageKey` (design §7: "serializers
 *   públicos scrubbean internos… igual que hoy (`variant_scrub`)"). Those
 *   internals only ever travel on {@link MediaAdminV2}, the admin-surface
 *   superset.
 * - **Dedupe on create.** `POST /media` with a `checksum` matching an
 *   existing ACTIVE Media returns the existing asset with HTTP **200**
 *   instead of creating (201). Without `checksum` the server always creates
 *   (design §7, §11).
 * - **Unlink ≠ delete.** `DELETE /galleries/{gallery_uuid}/media/{media_uuid}`
 *   soft-deletes the `gallery_media` JOIN row only — the asset survives. A
 *   Media left with zero active joins is an **orphan** ("[sin asignar]" /
 *   logical trash bin, recoverable) and is listed via
 *   `GET /media/search?orphan=true`. `DELETE /media/{uuid}` soft-deletes the
 *   ASSET itself, which removes it from every gallery at read time (gallery
 *   reads filter `Media.deletedAt IS NULL`) — design §5.2 refcount note.
 * - **Video in F1 is client-described.** No server-side transcode/ffmpeg:
 *   the client uploads the bytes through the generic File surface, provides
 *   the poster frame itself, and reports `durationMs` / `width` / `height`
 *   from the `<video>` element metadata (design §6). A video without a
 *   poster is accepted (`posterUrl` stays null) — the FE falls back to a
 *   generic poster.
 * - **Tags are normalized rows, not JSONB.** `Media.tags` on the wire is the
 *   flattened `Tag.slug`-joined list; the backend stores `Tag` /
 *   `media_tags` rows (design §5.3). Tag slugs are lowercase, unaccented and
 *   unique — send lowercase slugs when filtering search by `tag` or the
 *   filter will silently never match (same gotcha as gallery tags).
 * - **`GET /media/{uuid}` embeds memberships.** The detail endpoint returns
 *   the Media "con tags, y en qué galerías está" (design §7). The gallery
 *   membership embed's exact serializer shape lands with the backend
 *   implementation — model it in a follow-up minor once
 *   `app/presentation/schemas/media.py` is final.
 * - **Naming: camelCase on the wire.** The design doc lists the ORM column
 *   `url_variants`; this module standardizes the media wire contract on
 *   camelCase (`urlVariants`) — the `media.py` Pydantic schemas must alias
 *   the column accordingly (unlike the legacy galleries module, which leaks
 *   snake_case `url_variants`).
 */

import type { GalleryEntityType } from "../galleries";

// ─────────────────────────────────────────────────────────────────────
// Enums / literal unions
// ─────────────────────────────────────────────────────────────────────

/**
 * Coarse asset kind. Backend: `Media.type` String(10),
 * CHECK `IN ('image','video')` (design §5.1). Anything that is not a video
 * (e.g. a legacy `file` mime) is backfilled as `"image"`.
 */
export type MediaType = "image" | "video";

/**
 * Asset processing state. Backend: `Media.status` String(20), NOT NULL,
 * server_default `'ready'`, CHECK `IN ('ready','processing','failed')`
 * (design §5.1). F1 has no server-side transcode pipeline, so assets are
 * created `"ready"`; `"processing"`/`"failed"` are forward-compat for the
 * Fase 3 `MediaRendition` pipeline.
 */
export type MediaStatus = "ready" | "processing" | "failed";

/**
 * Fail-closed antivirus scan outcome for the asset bytes. Backend:
 * `Media.scanStatus` String(20), NOT NULL, server_default `'clean'`,
 * CHECK `IN ('clean','unscanned','infected')` (design §5.1). Same
 * vocabulary as the galleries Phase B `GalleryScanStatus` —
 * `"unscanned"` is NEVER treated as clean. Admin-surface only (scrubbed
 * from {@link MediaV2}).
 */
export type MediaScanStatus = "clean" | "unscanned" | "infected";

// ─────────────────────────────────────────────────────────────────────
// Media — asset shapes
// ─────────────────────────────────────────────────────────────────────

/**
 * Reusable media asset — the PUBLIC-SAFE wire shape.
 * Backend: `MediaResponse` (`app/presentation/schemas/media.py`), row model
 * `Media` (design §5.1).
 *
 * Deliberately EXCLUDES the internal/storage columns `storageKey`,
 * `checksum`, `scanStatus` and `posterStorageKey` — those are scrubbed from
 * every non-admin serializer exactly like the existing gallery
 * `variant_scrub` (design §7). Consumers that need them must use
 * {@link MediaAdminV2} and hold the galleries admin permission.
 */
export interface MediaV2 {
  /** Asset UUID — primary public identifier. Backend: `Media.uuid` PgUUID,
   * unique, server-generated (`gen_random_uuid()`). */
  uuid: string;
  /** Coarse asset kind — see {@link MediaType}. */
  type: MediaType;
  /** Service URL of the original bytes (public URL, or the base URL a
   * presign is derived from). Backend: `Media.url` Text, NOT NULL. */
  url: string;
  /** Responsive variants (images only). Opaque JSONB blob — no fixed
   * sub-schema on the backend (raw `dict[str, Any]`), same convention as
   * gallery items. ORM column: `url_variants` — the media Pydantic schema
   * aliases it to camelCase on the wire (see module doc). */
  urlVariants?: Record<string, unknown> | null;
  /** Video only: URL of the poster frame (client-captured in F1 — design
   * §6). `null`/absent for images, and for a video uploaded without a
   * poster (FE falls back to a generic poster). Backend:
   * `Media.posterUrl` Text, nullable. */
  posterUrl?: string | null;
  /** MIME type of the original bytes, e.g. `"image/webp"`, `"video/mp4"`.
   * Max 100 chars. Backend: `Media.mimeType` String(100), nullable. */
  mimeType?: string | null;
  /** Pixel width (image or video). Backend: `Media.width` Integer, nullable. */
  width?: number | null;
  /** Pixel height (image or video). Backend: `Media.height` Integer, nullable. */
  height?: number | null;
  /** Video only: duration in MILLISECONDS (client-reported from `<video>`
   * metadata in F1 — design §6). Backend: `Media.durationMs` Integer,
   * nullable. */
  durationMs?: number | null;
  /** Size of the original bytes. Backend: `Media.sizeBytes` BigInteger,
   * nullable. */
  sizeBytes?: number | null;
  /** Max 255 chars. Backend: `Media.title` String(255), nullable.
   * tsvector weight A in search (design §5.5). */
  title?: string | null;
  /** Default caption of the asset — overridable per gallery via
   * {@link GalleryMediaV2.captionOverride}. Backend: `Media.caption` Text,
   * nullable. tsvector weight B in search (design §5.5). */
  caption?: string | null;
  /** Backend: `Media.altText` Text, nullable. tsvector weight C in search
   * (design §5.5). */
  altText?: string | null;
  /** Max 255 chars. Backend: `Media.photographer` String(255), nullable.
   * tsvector weight C in search (design §5.5). */
  photographer?: string | null;
  /** ISO-8601 datetime — capture date (drives the `year` search filter:
   * `extract(year from coalesce(takenAt, createdAt))`, design §5.5).
   * Backend: `Media.takenAt` DateTime(tz), nullable. */
  takenAt?: string | null;
  /** Normalized tag slugs (lowercase, unaccented) flattened from the
   * `Tag`/`media_tags` join rows — NOT a JSONB column on `Media` (design
   * §5.3). Empty array when untagged. */
  tags: string[];
  /** ISO-8601 datetime. Backend: `Media.createdAt` DateTime(tz), NOT NULL,
   * server_default `now()`. */
  createdAt: string;
}

/**
 * Admin-surface media asset — superset of {@link MediaV2} exposing the
 * internal storage/integrity columns that the public-safe shape scrubs.
 * Backend: `MediaAdminResponse` (`app/presentation/schemas/media.py`), row
 * model `Media` (design §5.1). Only served to galleries-permission holders.
 */
export interface MediaAdminV2 extends MediaV2 {
  /** Full object key in S3-compatible storage. `null` for URL-only
   * migrated/legacy assets. Max effectively unbounded (Text). Backend:
   * `Media.storageKey` Text, nullable. NEVER exposed publicly. */
  storageKey?: string | null;
  /** sha256 hex digest (64 chars) of the original bytes — dedupe key.
   * `null` on backfilled assets (bytes not recomputed in F1 — design §8).
   * Backend: `Media.checksum` String(64), nullable, non-unique index. */
  checksum?: string | null;
  /** Processing state — see {@link MediaStatus}. NOT NULL,
   * server_default `'ready'`. */
  status: MediaStatus;
  /** Antivirus scan outcome — see {@link MediaScanStatus}. NOT NULL,
   * server_default `'clean'`. NEVER exposed publicly. */
  scanStatus: MediaScanStatus;
  /** Provenance: original URL of a `GalleryV2Item` migrated by the backfill
   * (design §8). `null` on natively-created assets. Backend:
   * `Media.legacyUrl` Text, nullable. */
  legacyUrl?: string | null;
}

/**
 * Body for `POST /api/v2/media` — create a Media asset (admin-curated).
 * Backend: `MediaCreate` (`app/presentation/schemas/media.py`), design §7.
 *
 * **Dedupe:** if `checksum` matches an existing ACTIVE Media, the server
 * returns that existing asset with HTTP 200 instead of creating (201).
 * Omitting `checksum` always creates.
 *
 * **Video (design §6):** the bytes go up FIRST through the generic
 * `/api/v1/file` staging surface; this body then references the resulting
 * storage key. `posterUrl`/`posterStorageKey` point at a client-provided
 * poster frame (no server-side extraction in F1). Videos above the
 * `MEDIA_VIDEO_MAX_BYTES` cap (default ~200 MB) are rejected with 413.
 */
export interface CreateMediaV2Body {
  /** Required. See {@link MediaType}. */
  type: MediaType;
  /** Required. Service URL of the original bytes. */
  url: string;
  /** Full storage key of the uploaded object (from the File surface).
   * Omit for URL-only assets. */
  storageKey?: string | null;
  /** Responsive variants (images only) — opaque JSONB blob, posted
   * verbatim. See {@link MediaV2.urlVariants} for the naming note. */
  urlVariants?: Record<string, unknown> | null;
  /** Video only: URL of the client-provided poster frame. */
  posterUrl?: string | null;
  /** Video only: storage key of the poster object. Admin-internal — never
   * echoed back on {@link MediaV2}. */
  posterStorageKey?: string | null;
  /** Max 100 chars. */
  mimeType?: string | null;
  /** Pixel width. */
  width?: number | null;
  /** Pixel height. */
  height?: number | null;
  /** Video only: duration in milliseconds (client-reported). */
  durationMs?: number | null;
  sizeBytes?: number | null;
  /** sha256 hex (64 chars) of the bytes — enables the create-dedupe path. */
  checksum?: string | null;
  /** Max 255 chars. */
  title?: string | null;
  caption?: string | null;
  altText?: string | null;
  /** Max 255 chars. */
  photographer?: string | null;
  /** ISO-8601 datetime — capture date. */
  takenAt?: string | null;
  /** Tag names/slugs to attach — normalized server-side to `Tag` rows
   * (lowercase, unaccented slug; created idempotently by slug). */
  tags?: string[] | null;
}

/**
 * Body for `PATCH /api/v2/media/{uuid}` — edit asset metadata/tags
 * (design §7: "editar metadata/tags del asset"; the bytes/URL are immutable
 * through this endpoint). Backend: `MediaUpdate`
 * (`app/presentation/schemas/media.py`).
 *
 * Only-supplied-fields-apply semantics (mirrors Pydantic
 * `model_fields_set`, same convention as the galleries `*UpdateInput`
 * shapes): an OMITTED key leaves the column unchanged, an EXPLICIT `null`
 * clears the nullable column. Callers must literally serialize
 * `"field": null` in the JSON body to clear — a JS property left
 * `undefined` is indistinguishable from an omitted key.
 */
export interface UpdateMediaV2Body {
  /** Max 255 chars. */
  title?: string | null;
  caption?: string | null;
  altText?: string | null;
  /** Max 255 chars. */
  photographer?: string | null;
  /** ISO-8601 datetime. */
  takenAt?: string | null;
  /** Full replacement of the asset's tag set (normalized server-side).
   * `[]` or explicit `null` clears all tags. */
  tags?: string[] | null;
}

// ─────────────────────────────────────────────────────────────────────
// gallery_media — M:N join with per-gallery overrides
// ─────────────────────────────────────────────────────────────────────

/**
 * One row of the `gallery_media` M:N join, as returned by
 * `GET /api/v2/galleries/{gallery_uuid}/media` (ordered by `sortOrder`) and
 * by the attach response. Backend: `GalleryMediaResponse`
 * (`app/presentation/schemas/media.py`), row model `gallery_media`
 * (design §5.2).
 *
 * Semantics: "this Media appears in this gallery, at this position, with
 * these overrides". Soft-deleting the row UNLINKS the media from the
 * gallery without touching the asset (design §5.2 refcount note).
 */
export interface GalleryMediaV2 {
  /** Join-row UUID (`gallery_media.uuid`) — NOT the media's UUID. */
  uuid: string;
  /** UUID of the linked Media asset — convenience mirror of `media.uuid`. */
  mediaUuid: string;
  /** The linked asset, embedded in its public-safe shape (internals
   * scrubbed — see {@link MediaV2}). */
  media: MediaV2;
  /** Position within the gallery. Backend: `gallery_media.sortOrder`
   * Integer, NOT NULL, server_default `0`. */
  sortOrder: number;
  /** Per-gallery caption override. When `null`, consumers must fall back
   * to {@link MediaV2.caption} (design §5.2). Backend:
   * `gallery_media.captionOverride` Text, nullable. */
  captionOverride?: string | null;
  /** Highlighted within this gallery. Backend: `gallery_media.featured`
   * Boolean, NOT NULL, server_default `false`. */
  featured?: boolean;
  /** ISO-8601 datetime. Backend: `gallery_media.createdAt` DateTime(tz),
   * NOT NULL, server_default `now()`. */
  createdAt?: string;
}

/**
 * Response from `GET /api/v2/galleries/{gallery_uuid}/media` — the
 * gallery's media, via the `gallery_media` join, ordered by `sortOrder`,
 * with per-gallery overrides applied per-row (design §7). Backend:
 * `GalleryMediaListResponse` (`app/presentation/schemas/media.py`).
 */
export interface GalleryMediaListV2Response {
  items: GalleryMediaV2[];
}

/**
 * Body for `POST /api/v2/galleries/{gallery_uuid}/media` — attach an
 * EXISTING Media asset to a gallery (creates a `gallery_media` row, 201).
 * Backend: `GalleryMediaAttach` (`app/presentation/schemas/media.py`),
 * design §7.
 *
 * A Media cannot be attached twice to the same gallery — the partial
 * unique index `uq_gallery_media_unique` on active
 * `(GalleryId, MediaId)` rows rejects duplicates (design §5.2).
 */
export interface AttachGalleryMediaV2Body {
  /** Required. UUID of an existing, non-deleted Media asset. */
  mediaUuid: string;
  /** Position within the gallery. Default `0`. Must be `>= 0`. */
  sortOrder?: number;
  /** Per-gallery caption override — `null`/omitted falls back to
   * {@link MediaV2.caption}. */
  captionOverride?: string | null;
  /** Default `false`. */
  featured?: boolean;
}

/**
 * Body for `PATCH /api/v2/galleries/{gallery_uuid}/media/reorder` —
 * reorder the gallery's media (design §7). Backend:
 * `GalleryMediaReorder` (`app/presentation/schemas/media.py`).
 */
export interface ReorderGalleryMediaV2Body {
  /** MEDIA UUIDs (not join-row UUIDs) in the desired display order. Each
   * must be actively attached to the gallery. */
  mediaUuids: string[];
}

// ─────────────────────────────────────────────────────────────────────
// Tags
// ─────────────────────────────────────────────────────────────────────

/**
 * Normalized media tag. Backend: `TagResponse`
 * (`app/presentation/schemas/media.py`), row model `Tag` (design §5.3).
 * Returned by `GET /api/v2/media/tags?q=` (autocomplete/list) and
 * `POST /api/v2/media/tags`.
 */
export interface TagV2 {
  /** Tag UUID. Backend: `Tag.uuid` PgUUID, unique. */
  uuid: string;
  /** Display name. Max 80 chars. Backend: `Tag.name` String(80). */
  name: string;
  /** Normalized identifier — lowercase, unaccented, UNIQUE. Max 80 chars.
   * This is the value carried in {@link MediaV2.tags} and matched by the
   * search `tag` filter. Backend: `Tag.slug` String(80), unique. */
  slug: string;
}

/**
 * Body for `POST /api/v2/media/tags` — create a tag, IDEMPOTENT by `slug`:
 * posting a name that normalizes to an existing slug returns the existing
 * tag instead of erroring (design §7). Backend: `TagCreate`
 * (`app/presentation/schemas/media.py`).
 */
export interface CreateTagV2Body {
  /** Display name, 1-80 chars. The slug is derived server-side
   * (lowercase, unaccented). */
  name: string;
}

/**
 * Response from `GET /api/v2/media/tags?q=` — tag autocomplete/list.
 * Backend: `TagListResponse` (`app/presentation/schemas/media.py`).
 */
export interface MediaTagListV2Response {
  items: TagV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Search (fototeca / videoteca)
// ─────────────────────────────────────────────────────────────────────

/**
 * Query params for `GET /api/v2/media/search` — the transversal
 * photo/video-library search (design §5.5, §7). All filters combine (AND).
 * Backend: query params of the search route
 * (`app/presentation/schemas/media.py`).
 */
export interface MediaSearchQueryV2 {
  /** Free-text query against the weighted `search_tsv` tsvector
   * (title=A, caption=B, altText+photographer=C) via
   * `websearch_to_tsquery('public.spanish_unaccent', q)` with a
   * `pg_trgm` fallback below the rank threshold (design §5.5). */
  q?: string;
  /** Tag SLUG (lowercase, unaccented — see {@link TagV2.slug}). Joined
   * through `media_tags`/`Tag`. A non-normalized value silently matches
   * nothing. */
  tag?: string;
  /** Filter by asset kind. */
  type?: MediaType;
  /** CMS entity filter — resolved through the media's galleries:
   * `gallery_media` → `GalleryV2` → `GalleryV2Assignment` (design §5.5).
   * Pair with `entityUuid`. */
  entityType?: GalleryEntityType;
  /** UUID of the target entity. Pair with `entityType`. */
  entityUuid?: string;
  /** Capture year: `extract(year from coalesce(takenAt, createdAt))`. */
  year?: number;
  /** `true` → ONLY media with zero active `gallery_media` rows (the
   * "[sin asignar]" logical trash bin — design §5.2, §11). */
  orphan?: boolean;
  /** Page number (1-based). Default `1`. */
  page?: number;
  /** Items per page. Default `20`, server-enforced max `100` (mirrors
   * `PAGINATION_DEFAULTS` in `common`). */
  pageSize?: number;
}

/**
 * Response from `GET /api/v2/media/search` — paginated media page.
 * Backend: `MediaSearchResponse` (`app/presentation/schemas/media.py`).
 * Same `{items, total, page, pageSize}` envelope family as the other V2
 * list responses (cf. `PAGINATION_DEFAULTS` in `common`); keys are
 * camelCase, matching this route's `pageSize` query param (design §7).
 */
export interface MediaSearchV2Response {
  /** Result page, ranked by `ts_rank` when `q` was given, newest-first
   * otherwise. Public-safe shapes (internals scrubbed). */
  items: MediaV2[];
  /** Total matches across all pages. */
  total: number;
  /** Current page (1-based). */
  page: number;
  /** Page size actually applied by the server. */
  pageSize: number;
}
