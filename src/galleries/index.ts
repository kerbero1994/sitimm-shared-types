/**
 * Galleries V2 types — shared photo collections + polymorphic assignments.
 *
 * Backend schemas: app/presentation/schemas/galleries_v2.py
 * Backend routes:
 * - app/presentation/api/v2/galleries_v2.py    (authed CRUD + admin i18n)
 * - app/presentation/api/v2/galleries_public.py (anonymous reads)
 * Design doc: docs/superpowers/specs/2026-06-27-galleries-visibility-anchoring-design.md (v3.1)
 *
 * Galleries V2 is a shared photo-collection feature with polymorphic
 * assignment to entity types: event, program, subprogram, bonus, magazine,
 * faq, blog_post, company. A Gallery owns a list of GalleryItem records, and a
 * GalleryAssignment row attaches a gallery to an entity (m:n — the same
 * gallery can be attached to multiple entities).
 *
 * Sport tournaments are intentionally NOT a GalleryV2 target: `SportEvent`
 * has no `uuid`/`deletedAt` column (legacy id-based table), so sport
 * galleries keep using the dedicated legacy `SportEventGallery` /
 * `SportEventGalleryElement` system.
 *
 * `GalleryV2` / `GalleryItemV2` used to live only inside the `programs`
 * module (a narrow embed for the Programs use-case). This module is now
 * the canonical home — `programs/index.ts` re-exports these names for
 * back-compat (deprecated there; import from `galleries` instead).
 *
 * ── Semantics every consumer needs to know (SITIMM-40) ──────────────────
 *
 * - **Public detail resolution** (`GET /galleries/public/{uuid_or_slug}`):
 *   the server tries a UUID parse + lookup FIRST; only on a parse failure
 *   OR a UUID lookup miss does it fall back to a slug lookup. A
 *   UUID-shaped slug therefore still resolves correctly via the fallback.
 *   404 if neither resolves, or the gallery isn't `visibility: "public"`.
 * - **`?lang=` precedence**: `?lang=` query param > `Accept-Language`
 *   header > default (`"es"`). Unknown/unsupported codes silently fall
 *   back to the default rather than erroring.
 * - **Keep-native-ES fallback**: a missing translation for the resolved
 *   lang does NOT cross-fall-back to another locale — the native `es`
 *   text is kept as-is, and `translationSource` reports `"fallback"`.
 * - **Tags are lowercase**: the server lower-cases + dedupes `tags` on
 *   every write (gallery and item). The public list's `?tag=` filter is a
 *   JSONB containment match against those lower-cased values, so clients
 *   MUST send lowercase tag filters or they will silently never match.
 * - **`visibility: "public"` auto-clears `audience`**: on `PATCH
 *   /galleries/{uuid}`, if the resulting visibility (payload or existing
 *   row) is `"public"`, any stored `audience` is cleared server-side
 *   (public = ungated). Sending a non-null `audience` together with a
 *   resulting `"public"` visibility — in either `POST` create or `PATCH`
 *   update, same-payload or merged-state — is rejected with 422
 *   `public_audience_conflict`.
 * - **Explicit-null-clears semantics on `*UpdateInput` shapes**: `PATCH`
 *   bodies use "only-supplied-fields-apply" semantics (mirrors Pydantic's
 *   `model_fields_set`) — an OMITTED key leaves the column unchanged, an
 *   EXPLICIT `null` clears a NULLABLE column. Fields backing a NOT
 *   NULL-backed column (`name`, `visibility` on the gallery; `url`,
 *   `sortOrder` on an item) reject an explicit `null` with 422
 *   `invalid_null` BEFORE anything is persisted. TypeScript's structural
 *   typing cannot distinguish "key omitted" from "key present with
 *   `undefined`" — callers MUST literally include `"field": null` in the
 *   serialized JSON body to trigger the clear, not merely leave a JS
 *   property `undefined`.
 * - **Translation upsert bodies reject "empty"**: `PUT
 *   .../translations/{lang}` 400s with `empty_translation` when the body
 *   is `{}` or every supplied field is explicitly `null` — a translation
 *   PUT must carry at least one non-null field.
 *
 * ── Phase B — member contributions + moderation (SITIMM-45/46) ──────────
 *
 * Backend: `app/presentation/api/v2/galleries_contribute.py` +
 * `GalleryContribute*`/`GalleryModeration*`/`GalleryMyContributions*`
 * schemas in `galleries_v2.py`. Design doc §8.2-§8.4.
 *
 * - **`url` sentinel values — NEVER render as `<img src>`.** A normal
 *   {@link GalleryItemV2.url} / {@link GalleryContributionItem.url} is a
 *   real fetchable CDN URL for an `"approved"` item. But a `"pending"`
 *   item's `url` is the INERT placeholder `` `quarantine://${storageKey}` ``
 *   (bytes sit in a private quarantine prefix — this string is never a
 *   working link), and a `"rejected"` item's `url` is the INERT
 *   placeholder `` `rejected://${uuid}` `` (tombstone — bytes purged,
 *   row kept for audit). Both schemes are structurally `string`
 *   (`url` never changes TS type across states) — a client MUST branch on
 *   `moderationStatus` and render pending/rejected as explicit UI states,
 *   never blindly pass `url` to an `<img>`/`<video>` tag. To actually
 *   preview a still-quarantined item's bytes (as its contributor, or as a
 *   moderator), call `GET .../preview-url` — see
 *   {@link GalleryContributionPreviewUrlResponse}.
 * - **Upload leg — `fileId`, not a raw URL.** A member contribution is a
 *   TWO-step flow: (1) `POST /api/v1/files/upload?category=gallery` to
 *   stage the bytes and obtain a `fileId` (a `File.uuid` string, NOT the
 *   `GalleryItemV2` numeric-looking id), THEN (2) `POST
 *   /galleries/{uuid}/contribute` with that `fileId` in the body (see
 *   {@link GalleryContributeRequest}). There is no `/imgs` upload path for
 *   this flow, and the generic `POST /api/v1/files/{id}/confirm` endpoint
 *   is structurally BLOCKED for a `category=gallery` staged file when the
 *   caller is not a gallery manager — 409 `use_gallery_contribution` (see
 *   {@link GalleryV2ErrorCode}) — the contribute endpoint is the only
 *   legitimate confirm path for a non-manager's gallery upload.
 * - **`allowsContributions` gate.** `POST .../contribute` 409s
 *   `contributions_disabled` unless the target gallery has
 *   {@link GalleryV2.allowsContributions} `=== true`. Every pre-existing
 *   and newly-created gallery defaults to `false` (admin-curated-only)
 *   until an ADMIN_COMMUNICATION+ caller explicitly opts it in via
 *   `PATCH /galleries/{uuid}`.
 * - **`GalleryItemV2` (the normal authed item shape) intentionally does
 *   NOT carry `scanStatus` / `contributedBy` / `reviewedBy` / `reviewedAt`
 *   / `reviewNote`.** Those 5 fields exist ONLY on
 *   {@link GalleryContributionItem} — the dedicated shape returned by the
 *   contribute response, the moderation queue, and `/me/contributions`.
 *   The normal item list/detail response (`GalleryItemV2Response` on the
 *   backend) was NOT extended with them — verified against
 *   `_to_item_response`/`GalleryItemV2Response` in `galleries_v2.py`,
 *   which gained no new fields in the SITIMM-45 diff.
 */

import type { AudienceSpec } from "../events/eligibility";

// Re-export so consumers don't have to reach into events/eligibility
// directly for the audience-targeting vocabulary galleries reuse verbatim.
import type { EngagementCountersPublic } from "../engagement";

export type {
  AudienceSpec,
  AudienceMode,
  AudienceRule,
  Combinator,
  GuestPolicy,
  RuleField,
  RuleOp,
} from "../events/eligibility";

// ─────────────────────────────────────────────────────────────────────
// Enums / literal unions
// ─────────────────────────────────────────────────────────────────────

/**
 * Polymorphic target entity types a gallery may be attached to.
 * Backend: `EntityType` literal + `ENTITY_TYPES` tuple (`gallery_v2.py`).
 *
 * `"company"` added DAM F6 (SITIMM-258) — requires mini-back >= the
 * SITIMM-258 deploy; older servers 422 an assignment with this value.
 */
export type GalleryEntityType =
  | "event"
  | "program"
  | "subprogram"
  | "bonus"
  | "magazine"
  | "faq"
  | "blog_post"
  | "company";

/**
 * Gallery visibility gate.
 * - `"public"` — world-readable via the anonymous `/galleries/public*`
 *   routes. Cannot carry an `audience` (422 `public_audience_conflict`).
 * - `"restricted"` (default) — gated by `audience`. A `null` `audience`
 *   on a restricted gallery means "any authenticated user".
 */
export type GalleryVisibility = "public" | "restricted";

/**
 * Audience specification reused verbatim from the Events eligibility
 * engine. Only meaningful when `visibility === "restricted"`.
 */
export type GalleryAudience = AudienceSpec;

/**
 * Per-item moderation state (design §8.1). Read-only on every wire shape
 * that carries it — it only mutates via the (future) moderation service,
 * never via `GalleryItemV2CreateInput` / `GalleryItemV2UpdateInput`. Only
 * `"approved"` items are ever served on the public surface or to a
 * non-manager authed caller.
 */
export type GalleryModerationStatus = "approved" | "pending" | "rejected";

/**
 * Fail-closed antivirus scan outcome for a member-contributed item's
 * stripped bytes (design §8.3, Phase B/SITIMM-45). Backend:
 * `GalleryScanStatus` literal (`galleries_v2.py`).
 *
 * - `"clean"` — a real ClamAV daemon scanned the bytes and found nothing.
 * - `"unscanned"` — AV was disabled or the scan errored; NEVER treated as
 *   clean.
 * - `"infected"` — a real threat was found; the item is auto-rejected
 *   immediately (`moderationStatus` -> `"rejected"`, `reviewedBy: null`).
 *
 * `GalleryModerationService.approve` REFUSES (409 `scan_not_clean`) any
 * item whose `scanStatus !== "clean"` — human moderation is the CONTENT
 * backstop here, never the malware backstop. Only ever present on
 * {@link GalleryContributionItem} (the moderator/contributor-facing shape)
 * — never on the normal {@link GalleryItemV2} response.
 */
export type GalleryScanStatus = "clean" | "unscanned" | "infected";

/**
 * Supported translation languages for the gallery i18n sidecar overlay
 * (design §7). Backend: `GalleryLang` StrEnum (`galleries_v2.py`). `"es"`
 * is the source language — never a valid translation upsert target.
 */
export type GalleryLang = "es" | "en" | "fr" | "de" | "ja" | "ko" | "zh" | "hi";

/**
 * Translation row provenance.
 * Backend: `GalleryTranslationSource` StrEnum (`galleries_v2.py`).
 */
export type GalleryTranslationSource = "machine" | "human" | "fallback";

// ─────────────────────────────────────────────────────────────────────
// GalleryItem — authed shapes
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /api/v2/galleries/{gallery_uuid}/items`.
 * Backend: `GalleryItemV2Create` (`galleries_v2.py`).
 */
export interface GalleryItemV2CreateInput {
  /** Required. Max 2048 chars. */
  url: string;
  /** Opaque JSONB blob — no fixed sub-schema on the backend (raw
   * `dict[str, Any]`), unlike e.g. Blog's `BlogCoverVariantsV2`. Admins
   * POST this verbatim; the server does not derive it. */
  url_variants?: Record<string, unknown> | null;
  /** Max 2048 chars. */
  storageKey?: string | null;
  /** External URL served when the internal MinIO object is unavailable. Max 2048 chars. */
  fallbackUrl?: string | null;
  /** Max 255 chars. */
  title?: string | null;
  /** Max 500 chars. */
  caption?: string | null;
  /** Max 500 chars. */
  altText?: string | null;
  /** Default `0`. Must be `>= 0`. */
  sortOrder?: number;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  /** Max 100 chars. */
  mimeType?: string | null;
  /** ISO-8601 datetime. */
  takenAt?: string | null;
  /** Max 255 chars. */
  photographer?: string | null;
  /** Lower-cased + deduped server-side on write — send any case, the
   * server normalizes. */
  tags?: string[] | null;
}

/**
 * Body for `PATCH /api/v2/gallery-items/{item_uuid}`.
 * Backend: `GalleryItemV2Update` (`galleries_v2.py`).
 *
 * Every field is optional (omit = unchanged). `url` / `sortOrder` back
 * NOT NULL columns — an explicit `null` on either is rejected with 422
 * `invalid_null`. Every other field is nullable and an explicit `null`
 * clears the stored value.
 */
export interface GalleryItemV2UpdateInput {
  /** NOT NULL-backed — explicit `null` -> 422 `invalid_null`. */
  url?: string | null;
  url_variants?: Record<string, unknown> | null;
  storageKey?: string | null;
  fallbackUrl?: string | null;
  title?: string | null;
  caption?: string | null;
  altText?: string | null;
  /** NOT NULL-backed — explicit `null` -> 422 `invalid_null`. */
  sortOrder?: number | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
  takenAt?: string | null;
  photographer?: string | null;
  tags?: string[] | null;
}

/**
 * Authed gallery item — full internal shape, incl. `storageKey` and
 * `moderationStatus`.
 * Backend: `GalleryItemV2Response` (`galleries_v2.py`).
 *
 * NOTE (resolved contract ambiguity): the dict builder
 * (`_to_item_response` in `galleries_v2.py`) also computes a `"type"`
 * (derived-from-mimeType) and `"text"` (alias of `caption`) key for
 * legacy FE compat, but `GalleryItemV2Response`/`GalleryItemV2Base`
 * declare no such fields and carry no `extra="allow"` config — Pydantic's
 * default `extra="ignore"` silently drops both keys during
 * `model_validate(...).model_dump()`, so they never actually reach the
 * wire on this endpoint. Do NOT add `type`/`text` here; use `mimeType`
 * (derive the coarse kind client-side, mirroring `mediaType` on the
 * public DTO below) and `caption` instead.
 */
export interface GalleryItemV2 {
  uuid: string;
  url: string;
  url_variants: Record<string, unknown> | null;
  storageKey: string | null;
  fallbackUrl: string | null;
  title: string | null;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  /** ISO-8601 datetime. */
  takenAt: string | null;
  photographer: string | null;
  tags: string[] | null;
  /** Read-only — mutated only via the moderation service, never via
   * create/update. */
  moderationStatus: GalleryModerationStatus | null;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
  /** ISO-8601 datetime. `null` when active. */
  deletedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Gallery — authed shapes
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /api/v2/galleries`.
 * Backend: `GalleryV2Create` (`galleries_v2.py`).
 */
export interface GalleryV2CreateInput {
  /** Required. 1-255 chars. */
  name: string;
  /** Max 255 chars. */
  slug?: string | null;
  description?: string | null;
  /** Max 2048 chars. */
  cover_url?: string | null;
  /** Opaque JSONB blob — see {@link GalleryItemV2CreateInput.url_variants}. */
  cover_url_variants?: Record<string, unknown> | null;
  tags?: string[] | null;
  /** ISO-8601 datetime. */
  taken_at?: string | null;
  /** Max 255 chars. */
  location?: string | null;
  /** Default `"restricted"`. */
  visibility?: GalleryVisibility;
  /** Only meaningful when the resulting `visibility` is `"restricted"`.
   * A non-null `audience` combined with `visibility: "public"` -> 422
   * `public_audience_conflict`. */
  audience?: GalleryAudience | null;
  /** Phase B (SITIMM-45/46, design §8.1/§8.4) — opt-in: only albums with
   * this set may accept member uploads via `POST .../contribute`. Default
   * `false` — every new album stays admin-curated-only unless explicitly
   * flipped. */
  allowsContributions?: boolean;
  /** Optional inline items created in the same transaction. Default `[]`. */
  items?: GalleryItemV2CreateInput[];
}

/**
 * Body for `PATCH /api/v2/galleries/{gallery_uuid}`.
 * Backend: `GalleryV2Update` (`galleries_v2.py`).
 *
 * Only-supplied-fields-apply semantics — see the module-level "Explicit
 * null" note. `name` / `visibility` back NOT NULL columns (explicit
 * `null` -> 422 `invalid_null`); every other field is nullable.
 */
export interface GalleryV2UpdateInput {
  /** NOT NULL-backed — explicit `null` -> 422 `invalid_null`. */
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  cover_url?: string | null;
  cover_url_variants?: Record<string, unknown> | null;
  tags?: string[] | null;
  taken_at?: string | null;
  location?: string | null;
  /** NOT NULL-backed — explicit `null` -> 422 `invalid_null`. Setting (or
   * already being) `"public"` auto-clears any stored `audience`
   * server-side, regardless of what this payload sends for `audience`
   * (unless the payload ALSO supplies a non-null `audience`, which is
   * rejected — see below). */
  visibility?: GalleryVisibility | null;
  /** A non-null `audience` combined with a resulting `visibility` of
   * `"public"` (from this payload OR the existing row) -> 422
   * `public_audience_conflict`. Explicit `null` clears a stored audience. */
  audience?: GalleryAudience | null;
  /** Phase B (SITIMM-45/46) — see {@link GalleryV2CreateInput.allowsContributions}. */
  allowsContributions?: boolean | null;
  /** Optimistic lock — pass the `updatedAt` value last observed by the
   * client. Mismatch -> 409 `stale_write`. */
  if_match_updated_at?: string | null;
}

/**
 * Authed gallery — full internal shape, incl. `created_by` and
 * `audience`.
 * Backend: `GalleryV2Response` (`galleries_v2.py`).
 */
export interface GalleryV2 {
  uuid: string;
  name: string;
  slug: string | null;
  description: string | null;
  cover_url: string | null;
  cover_url_variants: Record<string, unknown> | null;
  tags: string[] | null;
  /** ISO-8601 datetime. */
  taken_at: string | null;
  location: string | null;
  visibility: GalleryVisibility;
  audience: GalleryAudience | null;
  created_by: number | null;
  /** Phase B (SITIMM-45/46, design §8.1/§8.4) — opt-in gate for member
   * uploads via `POST .../contribute`. `false` on every pre-existing
   * album (server-default) until an ADMIN_COMMUNICATION+ caller opts it
   * in. See the module-level "Phase B" semantics note above. */
  allowsContributions: boolean;
  items: GalleryItemV2[];
  /** Number of items the caller may see, independent of whether `items` was
   * serialized (SITIMM-468). `GET /api/v2/galleries` (the paginated list)
   * omits the array for payload reasons but still reports the count, so this
   * cannot be derived from `items.length` — on the list that is always `0`.
   * The detail route sends both and they agree.
   *
   * Moderation-scoped: a gallery manager's count includes pending/rejected
   * contributions, a regular member's counts only approved items — so the
   * number always matches what that caller can actually open. */
  item_count: number;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
  /** ISO-8601 datetime. `null` when active. */
  deletedAt: string | null;
  /**
   * `?lang=` overlay metadata (design §7). Populated ONLY by the authed
   * detail endpoint `GET /galleries/{gallery_uuid}` when a non-default
   * lang was resolved. Every other call site (create/update responses,
   * entity-embeds, and each item nested inside
   * {@link GalleryV2ListResponse}) OMITS these 3 keys entirely — treat
   * their absence as "not applicable here", not as `null`.
   */
  currentLang?: GalleryLang | null;
  availableLangs?: GalleryLang[] | null;
  translationSource?: GalleryTranslationSource | null;
}

/**
 * Response from `GET /api/v2/galleries`.
 * Backend: `GalleryV2ListResponse` (`galleries_v2.py`).
 */
export interface GalleryV2ListResponse {
  galleries: GalleryV2[];
  total: number;
  page: number;
  page_size: number;
  /** Always populated by the authed list endpoint (mirrors the public
   * list's `currentLang`). Per-item galleries do NOT carry it. */
  currentLang: GalleryLang;
}

// ─────────────────────────────────────────────────────────────────────
// GalleryAssignment
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /api/v2/galleries/{gallery_uuid}/attach`.
 * Backend: `GalleryAssignmentV2Create` (`galleries_v2.py`).
 */
export interface GalleryAssignmentV2CreateInput {
  entity_type: GalleryEntityType;
  entity_uuid: string;
  /** Default `0`. */
  sortOrder?: number;
  /** Default `false`. Setting `true` clears any previous primary
   * assignment for the same `(entity_type, entity_uuid)` target. */
  isPrimary?: boolean;
}

/**
 * Response from `POST /api/v2/galleries/{gallery_uuid}/attach`.
 * Backend: `GalleryAssignmentV2Response` (`galleries_v2.py`) — field
 * names below are the Pydantic ALIASES (`entityType`/`entityUuid`), which
 * is what actually serializes on the wire.
 */
export interface GalleryAssignmentV2 {
  uuid: string;
  gallery_uuid: string;
  entityType: GalleryEntityType;
  entityUuid: string;
  sortOrder: number;
  isPrimary: boolean;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. `null` when active. */
  deletedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Entity-scoped gallery lookups
// ─────────────────────────────────────────────────────────────────────

/**
 * Response from `GET /api/v2/{entity_type}/{entity_uuid}/galleries`.
 * Backend: `EntityGalleriesV2Response` (`galleries_v2.py`).
 */
export interface EntityGalleriesV2Response {
  entity_type: GalleryEntityType;
  entity_uuid: string;
  galleries: GalleryV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Reorder + generic action responses
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `PATCH /api/v2/galleries/{gallery_uuid}/items/reorder`.
 * Backend: `ReorderGalleryItemsRequest` (`galleries_v2.py`).
 */
export interface ReorderGalleryItemsRequest {
  /** 1-500 item UUIDs in the desired display order. Any UUID not
   * belonging to the gallery -> 404 `gallery_item_not_found`. */
  ordered_uuids: string[];
}

/**
 * Response from `PATCH /api/v2/galleries/{gallery_uuid}/items/reorder`.
 * Backend: raw dict returned by `reorder_items()` (`galleries_v2.py`) —
 * not a declared Pydantic schema, but documented here for completeness.
 */
export interface ReorderGalleryItemsResponse {
  ordered_uuids: string[];
  count: number;
}

/**
 * Response shape shared by the soft-delete / detach action endpoints
 * (`DELETE /galleries/{uuid}`, `DELETE /gallery-items/{uuid}`, `DELETE
 * /galleries/{uuid}/attach/{entity_type}/{entity_uuid}`) AND `DELETE
 * /gallery-items/{uuid}/withdraw` (Phase B, SITIMM-45/46 — same raw
 * `{"message": "ok", "uuid": ...}` shape, no dedicated schema). Backend:
 * raw dict — not a declared Pydantic schema.
 */
export interface GalleryV2ActionResponse {
  message: string;
  uuid: string;
}

// ─────────────────────────────────────────────────────────────────────
// Member contributions + moderation (Phase B, SITIMM-45/46)
// ─────────────────────────────────────────────────────────────────────
//
// Backend: app/presentation/api/v2/galleries_contribute.py (8 routes) +
// the `GalleryContribute*`/`GalleryModeration*`/`GalleryMyContributions*`
// schemas appended to galleries_v2.py. Design doc §8.2-§8.4. See the
// module-level "Phase B" doc block above for the `url` sentinel + upload-leg
// + `allowsContributions` gate semantics every consumer of these types
// needs to know before rendering a contributed item.

/**
 * Body for `POST /api/v2/galleries/{gallery_uuid}/contribute`.
 * Backend: `GalleryContributeRequest` (`galleries_v2.py`, `extra="forbid"`).
 */
export interface GalleryContributeRequest {
  /**
   * The `File.uuid` (a UUID STRING, NOT a numeric id) of an already
   * `POST /api/v1/files/upload?category=gallery`-staged, owner-bound,
   * not-yet-confirmed image. 1-36 chars. Structurally the ONLY accepted
   * media source — this schema has no `url`/`storageKey` field, so an
   * arbitrary external URL can never be submitted here.
   */
  fileId: string;
  /** Max 255 chars. */
  title?: string | null;
  /** Max 500 chars. */
  caption?: string | null;
  /** Max 500 chars. */
  altText?: string | null;
}

/**
 * A member-contributed item — the shape returned by the contribute
 * response, the moderation queue (`GET /galleries/moderation/pending`),
 * and the contributor's own view (`GET /galleries/me/contributions`).
 * Backend: `GalleryContributionItemResponse` (`galleries_v2.py`) — ONE
 * schema backs all three surfaces (verified against
 * `_to_contribution_response`/`_contribution_body` in
 * `galleries_contribute.py`).
 *
 * Safe to expose `moderationStatus` / `scanStatus` / `reviewNote` /
 * `contributedBy` / `reviewedBy` / `reviewedAt` here — never on the
 * normal {@link GalleryItemV2} response (every call site returning this
 * shape is either the contributor's own item or a moderator's queue
 * view). `gallery_uuid` is the ONLY gallery reference carried — there is
 * no nested gallery/contributor object (`contributedBy`/`reviewedBy` are
 * raw `User.id` integers, not expanded profiles).
 */
export interface GalleryContributionItem {
  uuid: string;
  gallery_uuid: string;
  /**
   * See the module-level "Phase B" doc block: a real CDN URL when
   * `moderationStatus === "approved"`; an INERT `quarantine://<key>`
   * placeholder while `"pending"`; an INERT `rejected://<uuid>`
   * placeholder while `"rejected"`. Branch on `moderationStatus` before
   * rendering — never assume `url` is fetchable.
   */
  url: string;
  title: string | null;
  caption: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  moderationStatus: GalleryModerationStatus;
  scanStatus: GalleryScanStatus;
  /** `User.id` of the contributor. Always non-null on a contributed row
   * (this whole surface only ever returns `contributedBy != null` rows). */
  contributedBy: number | null;
  /** `User.id` of the moderator who approved/rejected. `null` while
   * `"pending"`, and stays `null` on a SYSTEM auto-reject (infected scan
   * result) even once `moderationStatus === "rejected"`. */
  reviewedBy: number | null;
  /** ISO-8601 datetime. `null` until a moderation decision is made. */
  reviewedAt: string | null;
  /** Moderator-supplied note (max 280 chars), or the fixed system string
   * `"Auto-rejected: malware detected by antivirus scan"` on an infected
   * auto-reject. */
  reviewNote: string | null;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
  /**
   * Album name, resolved server-side for the moderation queue (SITIMM-583).
   *
   * Batched with the page — two queries for the whole queue, never one per
   * row. `null` when the gallery row is gone; the uuid is always present, so
   * the row still deep-links.
   */
  gallery_name?: string | null;
  /**
   * Contributor's display name, same batch as `gallery_name`. `null` when the
   * user has no profile.
   */
  contributor_name?: string | null;
}

/**
 * Response from `GET /api/v2/galleries/moderation/pending`.
 * Backend: `GalleryModerationPendingListResponse` (`galleries_v2.py`).
 * Optional `gallery_uuid` query param scopes to one gallery; otherwise
 * every pending item across all galleries is returned.
 */
export interface GalleryModerationPendingListResponse {
  items: GalleryContributionItem[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Response from `GET /api/v2/galleries/me/contributions`.
 * Backend: `GalleryMyContributionsResponse` (`galleries_v2.py`). Self-scoped
 * (`contributedBy === caller.id`) — returns items of ANY
 * `moderationStatus` (approved/pending/rejected), unlike every other
 * item-list surface in this module, which is approved-only.
 */
export interface GalleryMyContributionsResponse {
  items: GalleryContributionItem[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Optional moderator note body for BOTH `POST
 * /api/v2/gallery-items/{item_uuid}/approve` AND `POST
 * /api/v2/gallery-items/{item_uuid}/reject` — the backend uses the exact
 * same schema for both actions (not a separate approve/reject body pair).
 * Backend: `GalleryModerationActionBody` (`galleries_v2.py`).
 */
export interface GalleryModerationActionBody {
  /** Max 280 chars. */
  note?: string | null;
}

/**
 * Response from a short-TTL presigned preview of a still-quarantined
 * (`"pending"`/`"rejected"`) contributed item's bytes:
 * `GET /api/v2/gallery-items/{item_uuid}/preview-url`. Backend: raw dict
 * returned by `get_contribution_preview_url()` (`galleries_contribute.py`)
 * — not a declared Pydantic schema.
 *
 * Gated to the item's own contributor OR a `galleries:moderate` holder —
 * 404 (not 403) for anyone else, so the endpoint cannot be used as an
 * existence oracle. A `"rejected"` item, or a `"pending"` item whose
 * `scanStatus === "infected"`, is NEVER previewable here (404) even for
 * the owner/moderator.
 */
export interface GalleryContributionPreviewUrlResponse {
  /** For an `"approved"` item, this just echoes the durable public
   * `url` (no TTL). For a still-`"pending"` item, a fresh MinIO
   * presigned URL into the private quarantine prefix. */
  url: string;
  /** Seconds until the URL expires — NOT an ISO-8601 timestamp. `null`
   * when `url` is the durable public URL of an already-`"approved"`
   * item (no expiry). `300` (5 min) for a quarantine preview — see
   * `_QUARANTINE_PREVIEW_TTL_SECONDS` (`galleries_contribute.py`). */
  expires_in: number | null;
}

/**
 * Body for `PATCH /api/v2/gallery-items/{item_uuid}/contribution`.
 * Backend: `GalleryContributionMetadataUpdate` (`galleries_v2.py`,
 * `extra="forbid"`). Title/caption/altText ONLY — never the bytes, and
 * only while the item is still `"pending"` (409 `not_pending` once
 * approved or rejected). Omitted fields are unchanged; supplying zero
 * fields -> 400 `no_fields`. Unlike the other `*UpdateInput` shapes in
 * this module, an explicit `null` here simply clears the field (none of
 * the 3 fields back a NOT NULL column) — no `invalid_null` case applies.
 */
export interface GalleryContributionMetadataUpdateInput {
  /** Max 255 chars. */
  title?: string | null;
  /** Max 500 chars. */
  caption?: string | null;
  /** Max 500 chars. */
  altText?: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Public (anonymous) DTOs — scrubbed
// ─────────────────────────────────────────────────────────────────────
//
// Served by galleries_public.py. These OMIT every internal/moderation
// field the authed serializers expose: item `storageKey` /
// `moderationStatus` / `deletedAt` / `sizeBytes` / `createdAt` /
// `updatedAt`; gallery `created_by` / `deletedAt` / `audience` (design
// §2.2 "public DTO scrub").

/**
 * Public gallery item.
 * Backend: `GalleryItemV2PublicResponse` (`galleries_v2.py`). Scrubs
 * `storageKey` / `moderationStatus` / `deletedAt` / `sizeBytes` / audit
 * timestamps relative to {@link GalleryItemV2}.
 */
export interface GalleryItemV2Public {
  uuid: string;
  url: string;
  url_variants: Record<string, unknown> | null;
  fallbackUrl: string | null;
  title: string | null;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  /** ISO-8601 datetime. */
  takenAt: string | null;
  photographer: string | null;
  tags: string[] | null;
  /** Coarse media kind derived server-side from `mimeType`. */
  mediaType: "image" | "video" | "file";
  /**
   * Poster/thumbnail frame URL for a video asset (DAM Fase 5, SITIMM-253).
   *
   * A non-`null` string only when {@link GalleryItemV2Public.mediaType} is
   * `"video"` AND the video was uploaded with a client-captured poster frame.
   * For images, files, and posterless videos the backend emits this key as
   * `null` (**present with a `null` value, NOT omitted**) — exactly like every
   * other nullable field on this DTO (`title`, `width`, …): the response model
   * declares `posterUrl: str | None` and the public serializer runs NO
   * `exclude_none`. The FE must fall back to
   * {@link GalleryItemV2Public.fallbackUrl} (or a generic video placeholder)
   * when this is `null`/absent.
   *
   * Optional & nullable — treat a `null` (or missing) value as "no poster".
   * Marked optional too so a future BE that DOES omit the key stays type-safe.
   *
   * Backend: `GalleryItemV2PublicResponse.posterUrl`
   * (`app/presentation/schemas/galleries_v2.py`).
   */
  posterUrl?: string | null;
  /**
   * Video duration in **milliseconds** (DAM Fase 5, SITIMM-253).
   *
   * A non-`null` number only when {@link GalleryItemV2Public.mediaType} is
   * `"video"` and the backend has resolved the media duration. For images,
   * files, and videos whose duration is unknown the backend emits this key as
   * `null` (**present with a `null` value, NOT omitted**) — `durationMs:
   * int | None` serialized without `exclude_none`, mirroring the other
   * nullable fields on this DTO.
   *
   * Optional & nullable. Units are milliseconds (not seconds): a 30-second
   * clip is `30000`.
   *
   * Backend: `GalleryItemV2PublicResponse.durationMs`
   * (`app/presentation/schemas/galleries_v2.py`).
   */
  durationMs?: number | null;
  /**
   * Engagement counters for THIS photo (SITIMM-575).
   *
   * `null` means NOT LOADED — a surface that never asks for the overlay (a
   * gallery embedded in a program response), or a lookup that failed;
   * counters are best-effort and never break a read. A photo with no
   * engagement yet is an all-zeros object, so do NOT use `null` to mean
   * "no comments".
   *
   * Batched once per response, never per item.
   */
  engagement?: EngagementCountersPublic | null;
}

/**
 * Public gallery.
 * Backend: `GalleryV2PublicResponse` (`galleries_v2.py`). Scrubs
 * `created_by` / `deletedAt` / `audience` relative to {@link GalleryV2}.
 * `cover_url` falls back to the first approved+active item's media (and
 * its variants) when the gallery has no explicit cover (design §2.8).
 */
export interface GalleryV2Public {
  uuid: string;
  name: string;
  slug: string | null;
  description: string | null;
  cover_url: string | null;
  cover_url_variants: Record<string, unknown> | null;
  tags: string[] | null;
  /** ISO-8601 datetime. */
  taken_at: string | null;
  location: string | null;
  /** Always `"public"` on these endpoints (kept for a stable FE contract
   * — the field exists so a future mixed public+restricted public route
   * wouldn't be a breaking shape change). */
  visibility: "public";
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
  /** Approved + active items only, ordered `(sortOrder, createdAt)`. */
  items: GalleryItemV2Public[];
  item_count: number;
  /**
   * Whether this album accepts member contributions (SITIMM-583).
   *
   * Lived only on the authed {@link GalleryV2} until now, which made the
   * contribute button impossible to render: apps paint galleries from THIS
   * payload — it is where `items[].uuid` comes from, the identity both the
   * engagement and contribution routes resolve.
   *
   * Safe on the anonymous surface: it says who ACCEPTS photos, not who
   * uploaded any. Contributing still requires auth, the
   * `galleries:contribute` permission, and passing the visibility gate.
   *
   * Optional for wire tolerance with older backends; absent means `false`,
   * i.e. do not offer to upload.
   */
  allowsContributions?: boolean;
  /**
   * Engagement counters for THIS gallery (SITIMM-575).
   *
   * `null` means NOT LOADED — a surface that never asks for the overlay (a
   * gallery embedded in a program response), or a lookup that failed;
   * counters are best-effort and never break a read. A gallery with no
   * engagement yet is an all-zeros object, so do NOT use `null` to mean
   * "no comments".
   *
   * Batched once per response, never per item.
   */
  engagement?: EngagementCountersPublic | null;
}

/**
 * Response from `GET /api/v2/galleries/public`.
 * Backend: `GalleryV2PublicListResponse` (`galleries_v2.py`). Same keys
 * as the authed list (design §2.2).
 */
export interface GalleryV2PublicListResponse {
  galleries: GalleryV2Public[];
  total: number;
  page: number;
  page_size: number;
  /** Always populated (unlike the optional {@link GalleryV2.currentLang}). */
  currentLang: GalleryLang;
}

/**
 * Response from `GET /api/v2/galleries/public/{uuid_or_slug}`.
 * Backend: `GalleryV2PublicDetailResponse(GalleryV2PublicResponse)`
 * (`galleries_v2.py`). Always carries locale metadata (design §7),
 * mirroring the magazine public detail endpoint — unlike the authed
 * detail endpoint, which only populates these 3 fields on a non-default
 * `?lang=`.
 */
export interface GalleryV2PublicDetail extends GalleryV2Public {
  currentLang: GalleryLang;
  availableLangs: GalleryLang[];
  translationSource: GalleryTranslationSource;
}

/**
 * Response from `GET /api/v2/galleries/public/entity/{entity_type}/{entity_uuid}`.
 * Backend: `EntityGalleriesV2PublicResponse` (`galleries_v2.py`).
 *
 * NOTE: this route is registered with an explicit `/entity/` path
 * segment — `/public/entity/{entity_type}/{entity_uuid}` — NOT
 * `/public/{entity_type}/{entity_uuid}`. The latter would be ambiguous
 * with the detail route `/public/{uuid_or_slug}` (FastAPI can't reliably
 * tell a slug from an entity type in a two-segment path), so the backend
 * deliberately diverged from the original spec sketch here.
 */
export interface EntityGalleriesV2PublicResponse {
  entity_type: GalleryEntityType;
  entity_uuid: string;
  galleries: GalleryV2Public[];
  /** List semantics (like {@link GalleryV2PublicListResponse}) — only a
   * single `currentLang`, no per-gallery `availableLangs`. */
  currentLang: GalleryLang;
}

// ─────────────────────────────────────────────────────────────────────
// Translations (admin) — design §7
// ─────────────────────────────────────────────────────────────────────
//
// Mechanical mirror of the magazine i18n admin surface. Field names match
// the ORM column names directly (no snake<->camel alias remapping, unlike
// magazine's badge_text/badgeText).

/**
 * Body for `PUT /api/v2/galleries/{gallery_uuid}/translations/{lang}`.
 * Backend: `GalleryTranslationBodyV2` (`galleries_v2.py`, `extra="forbid"`
 * — unknown keys are REJECTED, not silently dropped). Omitted fields keep
 * the current stored value; at least one non-null field is required or
 * the server 400s with `empty_translation`.
 */
export interface GalleryTranslationBodyV2 {
  /** 1-255 chars when supplied. */
  name?: string | null;
  /** Max 2000 chars. */
  description?: string | null;
}

/**
 * Single-language gallery translation payload (admin view).
 * Backend: `GalleryTranslationResponseV2` (`galleries_v2.py`).
 */
export interface GalleryTranslationResponseV2 {
  lang: GalleryLang;
  source: GalleryTranslationSource;
  name: string | null;
  description: string | null;
  /** ISO-8601 datetime. */
  updatedAt: string;
}

/**
 * Response from `GET /api/v2/galleries/{gallery_uuid}/translations`.
 * Backend: raw `{"items": [...]}` dict (`galleries_v2.py`
 * `list_gallery_translations`) — not a declared Pydantic schema.
 */
export interface GalleryTranslationsListResponse {
  items: GalleryTranslationResponseV2[];
}

/**
 * Body for `PUT /api/v2/gallery-items/{item_uuid}/translations/{lang}`.
 * Backend: `GalleryItemTranslationBodyV2` (`galleries_v2.py`,
 * `extra="forbid"`). Same empty-body/all-null-fields rejection as
 * {@link GalleryTranslationBodyV2} (400 `empty_translation`).
 */
export interface GalleryItemTranslationBodyV2 {
  /** Max 255 chars. */
  title?: string | null;
  /** Max 500 chars. */
  caption?: string | null;
  /** Max 500 chars. */
  altText?: string | null;
}

/**
 * Single-language gallery-item translation payload (admin view).
 * Backend: `GalleryItemTranslationResponseV2` (`galleries_v2.py`).
 */
export interface GalleryItemTranslationResponseV2 {
  lang: GalleryLang;
  source: GalleryTranslationSource;
  title: string | null;
  caption: string | null;
  altText: string | null;
  /** ISO-8601 datetime. */
  updatedAt: string;
}

/**
 * Response from `GET /api/v2/gallery-items/{item_uuid}/translations`.
 * Backend: raw `{"items": [...]}` dict (`galleries_v2.py`
 * `list_gallery_item_translations`) — not a declared Pydantic schema.
 */
export interface GalleryItemTranslationsListResponse {
  items: GalleryItemTranslationResponseV2[];
}

// ─────────────────────────────────────────────────────────────────────
// Error catalogue
// ─────────────────────────────────────────────────────────────────────

/**
 * Machine-readable error codes returned by the V2 Galleries surface
 * (authed + public). Frontends should branch on this value (carried as
 * `detail.code`) and NEVER on the human-readable `detail.message`.
 */
export type GalleryV2ErrorCode =
  /** 404 — gallery not found, soft-deleted, or not visible to the caller. */
  | "gallery_not_found"
  /** 404 — item not found, or its parent gallery is soft-deleted. */
  | "gallery_item_not_found"
  /** 400 — `PATCH` body supplied zero fields. */
  | "no_fields"
  /** 409 — `slug` collides with another active gallery. */
  | "slug_conflict"
  /** 409 — `if_match_updated_at` didn't match the row's current `updatedAt`. */
  | "stale_write"
  /** 422 — `visibility: "public"` combined with a non-null `audience`. */
  | "public_audience_conflict"
  /** 422 — explicit `null` sent for a NOT NULL-backed field (`name`,
   * `visibility`, item `url`, item `sortOrder`). */
  | "invalid_null"
  /** 400 — translation `PUT` body was empty or every field was explicitly `null`. */
  | "empty_translation"
  /** 400 (attach) / 422 (public entity route) — `entity_type` not in
   * {@link GalleryEntityType}. */
  | "unsupported_entity_type"
  /** 404 — `attach` target entity does not exist / is not active. */
  | "entity_not_found"
  /** 409 — gallery is already attached to this entity. */
  | "assignment_conflict"
  /** 404 — `detach` found no active assignment for this
   * `(gallery, entity_type, entity_uuid)`. */
  | "assignment_not_found"
  /** 403 — caller lacks the target entity's own write permission for attach/detach. */
  | "forbidden"
  /** 429 — anonymous public-route rate limit exceeded, OR (Phase B,
   * SITIMM-45/46) an authed caller exceeded `POST .../contribute`'s
   * per-user rate limit. */
  | "rate_limited"
  // ── Phase B — member contributions + moderation (SITIMM-45/46) ────────
  /** 409 — `POST .../contribute` on a gallery whose
   * {@link GalleryV2.allowsContributions} is `false`. */
  | "contributions_disabled"
  /** 409 — the target gallery already holds the max of 200 active
   * (pending+approved) member-contributed items. */
  | "gallery_contributions_full"
  /** 404 — `fileId` does not resolve to an existing, owner-bound `File` row. */
  | "file_not_found"
  /** 409 — `fileId` is not a fresh staged upload (already confirmed/used
   * elsewhere, or claimed by a concurrent request). */
  | "file_not_staged"
  /** 409 — the staged `File` row exists but its object is missing in storage. */
  | "file_not_uploaded"
  /** 400 — `fileId` was not uploaded under the `gallery` category/bucket. */
  | "unexpected_bucket"
  /** 400 — `fileId`'s declared MIME type is not jpeg/png/webp/gif. */
  | "not_an_image"
  /** 400 — uploaded bytes failed the magic-byte image-format check, or
   * failed the mandatory EXIF-strip/decode-safety pass. */
  | "invalid_image"
  /** 413 — staged file exceeds the per-category gallery upload size cap. */
  | "file_too_large"
  /** 409 — `POST .../approve` refused: `scanStatus !== "clean"`. */
  | "scan_not_clean"
  /** 409 — `POST .../approve` / `POST .../reject` / `PATCH .../contribution`
   * targeted an item that is no longer `"pending"` (already
   * approved/rejected, or withdrawn by a racing/earlier call). */
  | "not_pending"
  /** 403 — `DELETE .../withdraw` targeted an already-`"approved"` item
   * (live wherever the gallery is visible; withdrawing it is out of this
   * endpoint's scope). */
  | "cannot_withdraw_approved"
  /** 409 — a non-gallery-manager called the generic
   * `POST /api/v1/files/{id}/confirm` on a `category=gallery` staged
   * file; must use `POST /galleries/{uuid}/contribute` instead. */
  | "use_gallery_contribution";
