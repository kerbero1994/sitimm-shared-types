/**
 * Collections V2 types — DAM Fase 2a (collections of galleries).
 *
 * Backend schemas: app/presentation/schemas/collection.py (mini-back —
 *                  lands with the SITIMM-219 backend implementation; this
 *                  module is the CONTRACT it must serialize, published
 *                  types-first exactly like the F1 `media` module was)
 * Backend routes:  app/presentation/api/v2/ collections surface (prefix
 *                  `/api/v2`, gated by `require_permission("galleries", …)`
 *                  — F2a reuses the galleries permission, same as F1)
 * Design doc: docs/superpowers/specs/2026-07-09-dam-fase1-media-design.md
 *             (mini-back repo — §13 "Fuera de alcance" pins
 *             `Collection`/`collection_galleries` as Fase 2)
 * Jira: Epic SITIMM-203 · Story SITIMM-219
 *
 * DAM Fase 2a adds the TOP layer of the Digital Asset Manager hierarchy:
 * **Collection → Gallery → Media**. A Collection groups galleries the same
 * way a gallery groups media in F1 — through an M:N join
 * (`collection_galleries`, mirroring `gallery_media`) so the SAME gallery
 * can appear in many collections, each membership carrying its own
 * `sortOrder`.
 *
 * ── Semantics every consumer needs to know ───────────────────────────────
 *
 * - **Detach ≠ delete.** `DELETE
 *   /collections/{collection_uuid}/galleries/{gallery_uuid}` soft-deletes
 *   the `collection_galleries` JOIN row only — the gallery (and its media)
 *   survives untouched. `DELETE /collections/{uuid}` soft-deletes the
 *   COLLECTION itself; its member galleries are never cascaded (same
 *   refcount philosophy as `gallery_media` in F1, design §5.2).
 * - **No double-attach.** A gallery cannot be attached twice to the same
 *   collection — a partial unique index on active
 *   `(CollectionId, GalleryId)` join rows rejects duplicates (mirror of
 *   `uq_gallery_media_unique`, design §5.2).
 * - **Reorder speaks GALLERY UUIDs.** {@link ReorderCollectionGalleriesV2Body}
 *   carries the gallery UUIDs (NOT the join-row UUIDs) in the desired
 *   order — same convention as `ReorderGalleryMediaV2Body.mediaUuids`.
 * - **`visibility` mirrors the galleries vocabulary.** Same two-value gate
 *   as `GalleryVisibility` (`galleries` module): `"public"` is
 *   world-readable, `"restricted"` (the default) requires auth. F2a defines
 *   NO per-collection `audience` spec — a restricted collection means "any
 *   authenticated user"; fine-grained gating stays on the member galleries.
 *   Collection visibility does NOT override gallery visibility: a
 *   restricted gallery inside a public collection stays gated (consumers
 *   must expect member listings to be filtered per-caller).
 * - **Update semantics.** {@link UpdateCollectionV2Body} follows the
 *   only-supplied-fields-apply convention of the galleries/media
 *   `*Update*` shapes (mirrors Pydantic `model_fields_set`): an OMITTED
 *   key leaves the column unchanged, an EXPLICIT `null` clears a NULLABLE
 *   column. `name`/`visibility` back NOT NULL columns — an explicit `null`
 *   on either is rejected with 422 `invalid_null`. Callers must literally
 *   serialize `"field": null` in the JSON body to clear — a JS property
 *   left `undefined` is indistinguishable from an omitted key.
 * - **Pagination is camelCase.** {@link CollectionListV2Response} uses the
 *   `{items, total, page, pageSize}` envelope family of the F1 media
 *   module (`MediaSearchV2Response`) — NOT the snake_case `page_size` of
 *   the legacy galleries lists.
 */

// ─────────────────────────────────────────────────────────────────────
// Enums / literal unions
// ─────────────────────────────────────────────────────────────────────

/**
 * Collection visibility gate — same vocabulary as `GalleryVisibility`
 * (`galleries` module), duplicated here so the collections wire contract
 * stands alone.
 * - `"public"` — world-readable via the anonymous surface.
 * - `"restricted"` (default) — any authenticated user; F2a has no
 *   per-collection audience spec (fine-grained gating stays on the member
 *   galleries).
 * Backend: `Collection.visibility` String(20), NOT NULL, server_default
 * `'restricted'`, CHECK `IN ('public','restricted')`.
 */
export type CollectionVisibility = "public" | "restricted";

// ─────────────────────────────────────────────────────────────────────
// Collection — core shapes
// ─────────────────────────────────────────────────────────────────────

/**
 * A collection of galleries — the top layer of the DAM hierarchy
 * (Collection → Gallery → Media). Backend: `CollectionResponse`
 * (`app/presentation/schemas/collection.py`), row model `Collection`.
 */
export interface CollectionV2 {
  /** Collection UUID — primary public identifier. Backend:
   * `Collection.uuid` PgUUID, unique, server-generated
   * (`gen_random_uuid()`). */
  uuid: string;
  /** Display name, 1-255 chars. Backend: `Collection.name` String(255),
   * NOT NULL. */
  name: string;
  /** URL-friendly identifier, unique among ACTIVE collections (a
   * colliding write -> 409 `slug_conflict`, same convention as
   * galleries). Max 255 chars. Backend: `Collection.slug` String(255),
   * nullable, partial unique index on active rows. */
  slug?: string | null;
  /** Backend: `Collection.description` Text, nullable. */
  description?: string | null;
  /** Cover image URL. When the backend serializes a collection without an
   * explicit cover it MAY fall back to the first member gallery's cover
   * (mirror of the gallery→first-item fallback) — consumers must still
   * handle `null`. Max 2048 chars. Backend: `Collection.coverUrl` Text,
   * nullable. */
  coverUrl?: string | null;
  /** See {@link CollectionVisibility}. Default `"restricted"`. */
  visibility: CollectionVisibility;
  /** Count of ACTIVE `collection_galleries` join rows — computed by the
   * serializer, not a stored column. List/summary surfaces may omit it;
   * treat absence as "not computed here", not as `0`. */
  galleryCount?: number;
  /** ISO-8601 datetime. Backend: `Collection.createdAt` DateTime(tz),
   * NOT NULL, server_default `now()`. */
  createdAt: string;
  /** ISO-8601 datetime. Backend: `Collection.updatedAt` DateTime(tz),
   * NOT NULL, onupdate `now()`. */
  updatedAt: string;
}

/**
 * Body for `POST /api/v2/collections` — create a collection (201).
 * Backend: `CollectionCreate` (`app/presentation/schemas/collection.py`).
 */
export interface CreateCollectionV2Body {
  /** Required. 1-255 chars. */
  name: string;
  /** Max 255 chars. Must be unique among active collections — collision
   * -> 409 `slug_conflict`. Omit to leave the collection slug-less. */
  slug?: string | null;
  description?: string | null;
  /** Max 2048 chars. */
  coverUrl?: string | null;
  /** Default `"restricted"`. */
  visibility?: CollectionVisibility;
}

/**
 * Body for `PATCH /api/v2/collections/{uuid}` — edit collection metadata.
 * Backend: `CollectionUpdate` (`app/presentation/schemas/collection.py`).
 *
 * Only-supplied-fields-apply semantics — see the module-level "Update
 * semantics" note. `name`/`visibility` back NOT NULL columns (explicit
 * `null` -> 422 `invalid_null`); every other field is nullable and an
 * explicit `null` clears the stored value.
 */
export interface UpdateCollectionV2Body {
  /** 1-255 chars. NOT NULL-backed — explicit `null` -> 422 `invalid_null`. */
  name?: string | null;
  /** Max 255 chars. Collision with another active collection -> 409
   * `slug_conflict`. Explicit `null` clears the slug. */
  slug?: string | null;
  description?: string | null;
  /** Max 2048 chars. */
  coverUrl?: string | null;
  /** NOT NULL-backed — explicit `null` -> 422 `invalid_null`. */
  visibility?: CollectionVisibility | null;
}

/**
 * Response from `GET /api/v2/collections` — paginated collections page.
 * Backend: `CollectionListResponse`
 * (`app/presentation/schemas/collection.py`). Same camelCase
 * `{items, total, page, pageSize}` envelope family as the F1 media module
 * (`MediaSearchV2Response`) — NOT the snake_case `page_size` of the legacy
 * galleries lists. Query: `page?` (1-based, default `1`), `pageSize?`
 * (default `20`, server-enforced max `100`, mirroring
 * `PAGINATION_DEFAULTS` in `common`).
 */
export interface CollectionListV2Response {
  /** Result page, newest-first. */
  items: CollectionV2[];
  /** Total matches across all pages. */
  total: number;
  /** Current page (1-based). */
  page: number;
  /** Page size actually applied by the server. */
  pageSize: number;
}

// ─────────────────────────────────────────────────────────────────────
// collection_galleries — M:N join (Collection ↔ Gallery)
// ─────────────────────────────────────────────────────────────────────

/**
 * Compact gallery summary embedded in a {@link CollectionGalleryV2} join
 * row — deliberately NOT the full `GalleryV2` shape (no items/audience/
 * audit fields; membership listings must stay cheap). Backend: the
 * gallery-summary sub-serializer inside `CollectionGalleryResponse`
 * (`app/presentation/schemas/collection.py`), sourced from the joined
 * `GalleryV2` row.
 */
export interface CollectionGallerySummaryV2 {
  /** The gallery's own UUID (`GalleryV2.uuid`) — use it against the
   * `galleries` module surface for the full detail. */
  uuid: string;
  /** Gallery display name. Max 255 chars. */
  name: string;
  /** Gallery slug. Max 255 chars. Backend: `GalleryV2.slug`, nullable. */
  slug?: string | null;
  /** Gallery cover URL (the gallery's own `cover_url`, with the backend's
   * first-item fallback already applied where available). Max 2048 chars. */
  coverUrl?: string | null;
}

/**
 * One row of the `collection_galleries` M:N join, as returned by
 * `GET /api/v2/collections/{collection_uuid}/galleries` (ordered by
 * `sortOrder`) and by the attach response. Backend:
 * `CollectionGalleryResponse` (`app/presentation/schemas/collection.py`),
 * row model `collection_galleries` — the structural mirror of F1's
 * `gallery_media` join one level up.
 *
 * Semantics: "this gallery appears in this collection, at this position".
 * Soft-deleting the row DETACHES the gallery from the collection without
 * touching the gallery or its media.
 */
export interface CollectionGalleryV2 {
  /** Join-row UUID (`collection_galleries.uuid`) — NOT the gallery's
   * UUID. Identifies the membership itself. */
  joinUuid: string;
  /** The member gallery, embedded as a compact summary — see
   * {@link CollectionGallerySummaryV2}. */
  gallery: CollectionGallerySummaryV2;
  /** Position within the collection. Backend:
   * `collection_galleries.sortOrder` Integer, NOT NULL, server_default
   * `0`. */
  sortOrder: number;
}

/**
 * Response from `GET /api/v2/collections/{collection_uuid}/galleries` —
 * the collection's member galleries via the `collection_galleries` join,
 * ordered by `sortOrder`. Backend: `CollectionGalleryListResponse`
 * (`app/presentation/schemas/collection.py`). Restricted member galleries
 * are filtered per-caller — an anonymous read of a public collection only
 * sees its public galleries.
 */
export interface CollectionGalleryListV2Response {
  items: CollectionGalleryV2[];
}

/**
 * Body for `POST /api/v2/collections/{collection_uuid}/galleries` —
 * attach an EXISTING gallery to a collection (creates a
 * `collection_galleries` row, 201). Backend: `CollectionGalleryAttach`
 * (`app/presentation/schemas/collection.py`).
 *
 * A gallery cannot be attached twice to the same collection — the partial
 * unique index on active `(CollectionId, GalleryId)` rows rejects
 * duplicates (mirror of `uq_gallery_media_unique` in F1).
 */
export interface AttachCollectionGalleryV2Body {
  /** Required. UUID of an existing, non-deleted `GalleryV2`. */
  galleryUuid: string;
  /** Position within the collection. Default `0`. Must be `>= 0`. */
  sortOrder?: number;
}

/**
 * Body for `PATCH /api/v2/collections/{collection_uuid}/galleries/reorder`
 * — reorder the collection's member galleries. Backend:
 * `CollectionGalleryReorder` (`app/presentation/schemas/collection.py`).
 */
export interface ReorderCollectionGalleriesV2Body {
  /** GALLERY UUIDs (not join-row UUIDs) in the desired display order.
   * Each must be actively attached to the collection. */
  galleryUuids: string[];
}
