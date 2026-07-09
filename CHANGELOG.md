# Changelog

All notable changes to `@kerbero1994/shared-types` are documented here.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.94.0] - 2026-07-09

Events contract sync contra mini-back (SITIMM-213). Aditivo.

**Added:**

- `events`: `CreateEventV2Request.timeZone` y `UpdateEventV2Request.timeZone`
  (IANA, max 64 chars, 422 `invalid_timezone` si es inválida);
  `UpdateEventV2Request.transportMode` (update-only,
  `"none" | "manual" | "capped" | "scheduled" | "live"`) y
  `UpdateEventV2Request.propagateToChildren` (update-only, default false —
  cascada de campos content-safe a los hijos draft de una recurrencia).
  Matches mini-back `event_v2.py :: EventCreateV2 / EventUpdateV2`.
- `events`: `EVENT_REGISTRATION_ERROR_CODES` gana 4 códigos (15 → 19):
  `transport_venue_mismatch` (409 — la parada de transporte no sirve a la sede
  elegida, L26), `cancel_window_closed` (409 — auto-cancelación dentro de las
  24h previas al evento; admins exentos), `registration_conflict` (409 —
  carrera de re-registro concurrente; reintentable) y
  `transport_stop_not_in_whitelist` (422 — parada fuera del whitelist en el
  PATCH de participante; grafía distinta del `transport_stop_not_whitelisted`
  409 del endpoint dedicado — NO deduplicar).

**Migración new_dashboard (rompe typecheck por diseño):**

- `src/views/cms/events/errors.ts` construye un
  `Record<EventErrorCode, string>` exhaustivo: al subir a 0.94.0 hay que añadir
  mapeos `CODE_TO_I18N` + entradas de locale (es/en) para
  `registration_conflict` y `transport_stop_not_in_whitelist`. Los extras
  locales `transport_venue_mismatch` / `cancel_window_closed` de
  `ExtraEventErrorCode` quedan redundantes (ya vienen en la union canónica) y
  pueden borrarse; los comentarios "15 canonical codes" quedan stale (ahora
  19).
- Nuevo módulo `audience-templates`: `AudienceTemplateV2`,
  `AudienceTemplateListV2Response`, `CreateAudienceTemplateRequest`,
  `UpdateAudienceTemplateRequest` — biblioteca reutilizable de `AudienceSpec`
  (mini-back `audience_template_v2.py` + router `audience_templates_v2.py`).
  Reemplaza los tipos locales del dashboard
  (`src/services/api/cms/events/audienceTemplates.api.ts`); ojo: `spec` en
  create/update ahora es `AudienceSpec` tipado (antes
  `Record<string, unknown>` local).
- `endpoints`: `AUDIENCE_TEMPLATES`, `AUDIENCE_TEMPLATES_CREATE`,
  `AUDIENCE_TEMPLATE`, `AUDIENCE_TEMPLATE_UPDATE`, `AUDIENCE_TEMPLATE_DELETE`
  (`/audience-templates`; todo el surface — lecturas incluidas — requiere
  `events:update`, delete `events:delete`).

## [0.93.0] - 2026-07-07

Auth contract resync against mini-back main post-cutover `9e3a4255` (SITIMM-190).

**BREAKING (0.x minor por convención del paquete):**

- `auth`: `LoginV2Request.password` → `pass` — el nombre viejo nunca coincidió
  con el alias Pydantic real de mini-back (`schemas/auth_legacy.py`). El path
  real es `POST /api/v2/users/login`, no `/api/v2/auth/login`.
- `endpoints`: `V2_ENDPOINTS.AUTH_SOCIAL_VERIFY` eliminado — el endpoint
  responde 410 GONE desde el login redesign (2026-06-22).

**Added:**

- `auth`: `TOKEN_TTL` (access 30 min / refresh 7 días — el BE ya no devuelve
  `expiresIn`), `LoginPhoneV2Request`, `LoginV2SuccessData` (con
  `effective_user_type` / `active_employment`), `LoginV2SetupData`,
  `RefreshV2Request/Response`, `LogoutV2Request`, `SetupInitV2Request`,
  `SetupVerifyV2Request/Response`; `SocialLoginResponse.isFirstLogin` +
  `googlePhotoUrl`.
- `endpoints`: `AUTH_LOGIN`, `AUTH_LOGIN_PHONE`, `AUTH_REFRESH`, `AUTH_LOGOUT`,
  `AUTH_SETUP`, `AUTH_SETUP_VERIFY`, `AUTH_FORGOT_PASSWORD`,
  `AUTH_VERIFY_RESET`, `AUTH_RESET_PASSWORD`; social re-documentados como V2.
- `users`: `UserBasicV2.accountStatus` / `purgeAfter` (GDPR self-deletion).

**Deprecated:** `DualAuthPayload` / `AuthPayload` / `V2TokenData` /
`AuthEvent` / `AuthEventType` (modelo micro-frontend sin consumidores),
`VerifyIdentityRequest/Response` (endpoint 410 GONE). Se eliminan en 1.0.0.

## [0.92.0] - 2026-07-04

Events transport: per-stop waitlist override (S6, SITIMM-90). `EventBusStopV2`
gains `waitlistEnabled: boolean | null` (`null` inherits the event-level flag);
`CreateEventBusStopRequest` / `UpdateEventBusStopRequest` accept optional
`waitlistEnabled`. Matches mini-back `EventBusStop.waitlistEnabled` + the
`EventBusStopCreate/Update/Response` schemas. Additive.

## [0.91.0] - 2026-07-04

`EVENT_REGISTRATION_ERROR_CODES` gains `venue_full` (409) — the per-sede capacity
gate that mini-back's `_resolve_venue` / `_assert_sede_has_room` already raises
(§S2 L22, shipped in the SITIMM-82 events remediation). Additive only; existing
codes unchanged. Frontends that previously matched the raw `venue_full` string
now get it in the typed union.

## [0.90.0] - 2026-07-03

Events attendance-confirmation contract (SITIMM-89). `EventV2` / `EventDetailV2`
gain `requiresConfirmation` + `confirmationOpensAt` + `confirmationDeadline`;
`CreateEventV2Request` / `UpdateEventV2Request` accept them (optional).
`EVENT_REGISTRATION_ERROR_CODES` gains `invalid_state`, `confirmation_not_open`,
`confirmation_window_closed`. Additive (retroactive changelog entry).

## [0.89.0] - 2026-07-02

`galleries` module gains the Phase B member-contribution + moderation
contract (SITIMM-46), matching the shipped SITIMM-45 backend
(`app/presentation/api/v2/galleries_contribute.py`, mini-back branch
`SITIMM-45-member-contribute`) field-by-field. Minor bump: additive only —
no existing exported type shape changed.

### Added
- `galleries` module: `GalleryScanStatus` (`"clean" | "unscanned" |
  "infected"`); `GalleryContributeRequest`, `GalleryContributionItem`,
  `GalleryModerationPendingListResponse`, `GalleryMyContributionsResponse`,
  `GalleryModerationActionBody`, `GalleryContributionPreviewUrlResponse`,
  `GalleryContributionMetadataUpdateInput`.
- `GalleryV2ErrorCode` gains 11 Phase B codes: `contributions_disabled`,
  `gallery_contributions_full`, `file_not_found`, `file_not_staged`,
  `file_not_uploaded`, `unexpected_bucket`, `not_an_image`,
  `invalid_image`, `file_too_large`, `scan_not_clean`, `not_pending`,
  `cannot_withdraw_approved`, `use_gallery_contribution` (13 total — see
  the type's JSDoc for the exact list); `rate_limited`'s doc comment
  extended to note it now also covers the authed `.../contribute`
  per-user rate limit, not just anonymous public routes.
- `endpoints` module: `V2_ENDPOINTS_GENERATED.galleries` gains
  `CONTRIBUTE_TO_GALLERY`, `LIST_MODERATION_PENDING`,
  `LIST_MY_CONTRIBUTIONS`; `galleryItems` gains `APPROVE_CONTRIBUTION`,
  `REJECT_CONTRIBUTION`, `GET_CONTRIBUTION_PREVIEW_URL`,
  `WITHDRAW_CONTRIBUTION`, `UPDATE_CONTRIBUTION_METADATA` (8 rows,
  hand-patched ahead of the next `make dump-v2-routes` full regen — the
  source backend branch isn't merged to `main` yet).

### Changed
- `GalleryV2` (authed), `GalleryV2CreateInput`, `GalleryV2UpdateInput` gain
  `allowsContributions: boolean` (Create: optional, default `false`;
  Update: `boolean | null` optional) — the opt-in gate backing
  `contributions_disabled`. Backend added this to `GalleryV2Base` itself
  (shared by Create/Update/Response), so all three input/output shapes
  pick it up, not just the response.
- `GalleryV2ActionResponse`'s JSDoc extended to note `DELETE
  .../withdraw` returns the identical `{message, uuid}` shape — no new
  type needed for that endpoint.
- Module-level doc block gains a "Phase B — member contributions +
  moderation" section documenting the `quarantine://`/`rejected://` `url`
  sentinel states (a client MUST branch on `moderationStatus`, never
  blindly render `url` as `<img src>`) and the two-step upload leg
  (`POST /files/upload?category=gallery` -> `fileId` -> `POST
  .../contribute`; the generic `/files/{id}/confirm` is blocked for a
  non-manager's `category=gallery` file with 409
  `use_gallery_contribution`).

### Resolved contract ambiguities / deviations from the SITIMM-46 task brief
(see PR / session notes for full BE evidence — every field below was
verified against the actual Pydantic schema / router code on mini-back
branch `SITIMM-45-member-contribute`, not assumed from the ticket brief)
- **`fileId` is a `string` (a `File.uuid`, 1-36 chars), NOT a `number`.**
  The brief's sketch (`ContributeBody { fileId: number; ... }`) does not
  match `GalleryContributeRequest.fileId: str` on the backend.
- **The normal authed item shape (`GalleryItemV2`) was NOT extended** with
  `contributedBy` / `reviewedBy` / `reviewedAt` / `reviewNote` /
  `scanStatus`, contrary to the brief's suggestion. Verified against
  `GalleryItemV2Response` in `galleries_v2.py`, which gained zero new
  fields in the SITIMM-45 diff — those 5 fields exist ONLY on the new
  `GalleryContributionItem` (backend: `GalleryContributionItemResponse`),
  the dedicated shape for the contribute/moderation-queue/me-contributions
  surfaces.
- **One schema, not two, backs `MyContributionItem` and
  `ModerationQueueItem`.** The backend's `GalleryContributionItemResponse`
  is reused verbatim across the contribute response, the moderation
  queue, and `/me/contributions` — typed here as the single
  `GalleryContributionItem`, matching this module's existing
  backend-schema-mirroring naming convention rather than inventing two
  parallel shapes for one wire contract.
- **`RejectBody` is shared with approve.** Backend's
  `GalleryModerationActionBody` (`{note?: string}`, max 280 chars) is the
  body for BOTH `POST .../approve` and `POST .../reject` — typed here
  under its backend name rather than a reject-only `RejectBody`.
- **Preview URL response field is `expires_in: number | null` (a TTL in
  seconds), NOT `expiresAt: string` (an ISO timestamp)** as the brief
  sketched. Verified against the raw dict literally returned by
  `get_contribution_preview_url()` — `{"url": ..., "expires_in": 300 |
  None}`.
- **No richer "contributor info" or nested "gallery ref" object** on the
  moderation queue item — `contributedBy`/`reviewedBy` are raw `User.id`
  integers and the only gallery reference is `gallery_uuid`; there is no
  profile-expansion or nested gallery object on the wire.

## [0.88.0] - 2026-07-01

New dedicated `galleries` module (SITIMM-41), matching the SITIMM-40 backend
contract in `app/presentation/schemas/galleries_v2.py` +
`app/presentation/api/v2/galleries_{v2,public}.py` field-by-field. Minor bump:
new module, no existing type shapes changed.

### Added
- `galleries` module (new). Exports: `GalleryEntityType`, `GalleryVisibility`,
  `GalleryAudience` (alias of the re-exported Events `AudienceSpec`),
  `GalleryModerationStatus`, `GalleryLang`, `GalleryTranslationSource`;
  authed shapes `GalleryItemV2CreateInput`, `GalleryItemV2UpdateInput`,
  `GalleryItemV2`, `GalleryV2CreateInput`, `GalleryV2UpdateInput`, `GalleryV2`,
  `GalleryV2ListResponse`, `GalleryAssignmentV2CreateInput`,
  `GalleryAssignmentV2`, `EntityGalleriesV2Response`,
  `ReorderGalleryItemsRequest`, `ReorderGalleryItemsResponse`,
  `GalleryV2ActionResponse`; public (scrubbed) shapes `GalleryItemV2Public`,
  `GalleryV2Public`, `GalleryV2PublicListResponse`, `GalleryV2PublicDetail`,
  `EntityGalleriesV2PublicResponse`; admin i18n `GalleryTranslationBodyV2`,
  `GalleryTranslationResponseV2`, `GalleryTranslationsListResponse`,
  `GalleryItemTranslationBodyV2`, `GalleryItemTranslationResponseV2`,
  `GalleryItemTranslationsListResponse`; error catalogue
  `GalleryV2ErrorCode`.
- `endpoints` module: `V2_ENDPOINTS_GENERATED.galleries` gains
  `LIST_PUBLIC_GALLERIES`, `LIST_PUBLIC_ENTITY_GALLERIES`,
  `GET_PUBLIC_GALLERY`, `LIST_GALLERY_TRANSLATIONS`,
  `UPSERT_GALLERY_TRANSLATION`; `galleryItems` gains
  `LIST_GALLERY_ITEM_TRANSLATIONS`, `UPSERT_GALLERY_ITEM_TRANSLATION`
  (hand-patched ahead of the next `make dump-v2-routes` full regen).

### Changed
- `programs` module: `GalleryItemV2` / `GalleryV2` (the small embedded
  `ProgramServiceFieldsV2.gallery` blob types) gain `@deprecated` JSDoc
  pointing at the new `galleries` module. Their field shape is UNCHANGED —
  they are a genuinely different backend contract
  (`programs_v2.py`'s own local `GalleryItemV2`/`GalleryV2` classes: only
  `url`/`caption`/`img_variants`) from the new module's richer,
  identically-named types, so they were intentionally NOT collapsed into a
  re-export. Do not confuse the two when importing.

### Resolved contract ambiguities (see PR / session notes for full BE evidence)
- `GalleryItemV2` (authed): the backend's `_to_item_response()` dict builder
  computes extra `type`/`text` keys for legacy FE compat, but
  `GalleryItemV2Response` declares no such fields and has no
  `extra="allow"` config, so Pydantic's default `extra="ignore"` silently
  drops them before they reach the wire. Omitted from the TS shape
  accordingly — use `mimeType`/`caption` instead.
- `url_variants` / `cover_url_variants`: typed as `Record<string, unknown> | null`
  (opaque JSONB, no fixed schema), NOT `ImageVariants` as the stale
  pre-SITIMM-40 draft in `docs/v2/Galleries/types.md` speculated.
- `currentLang` / `availableLangs` / `translationSource`: Pydantic types
  them as bare `str`/`list[str]`, but runtime values are always drawn from
  the fixed 8-lang / 3-source sets, so the TS shapes narrow them to
  `GalleryLang` / `GalleryTranslationSource` for stronger DX.

## [0.77.0] - 2026-06-04

FAQ contract drift fixes against the mini-back source of truth. These are
documentation/enum corrections only — no field shapes changed, so it is a minor
bump. Verified against `app/infrastructure/database/models/faq_resource.py`
(`RESOURCE_KIND_VALUES`, `ENRICHMENT_STATUS_VALUES`),
`app/application/services/faq_resource_enrichment.py`,
`app/application/dtos/faq/errors.py`, and the `.pdf` route in
`app/presentation/api/v2/faq_public_v2.py`.

### Added
- `faq` module: `FAQErrorCode` gains `"FAQ_PDF_RENDER_TIMEOUT"` (504). The PDF
  export route `GET /faq/articles/{slug}.pdf` raises it when reportlab rendering
  exceeds its 15s deadline (`faq_public_v2.py:177`); the union previously omitted
  it.

### Changed
- `faq` module: `FAQResourceV2.kind` JSDoc example values were wrong. Aligned to
  the real `RESOURCE_KIND_VALUES`: `"video_youtube"`, `"video_vimeo"`, `"pdf"`,
  `"image"`, `"infographic"`, `"document_drive"`, `"official_link"`,
  `"external_form"` (there is no bare `"video"` kind).
- `faq` module: `FAQArticleSummaryV2.media_kinds` JSDoc example `["video", "pdf"]`
  corrected to `["video_youtube", "pdf"]` — these values are drawn from the same
  `RESOURCE_KIND_VALUES` set.
- `faq` module: `FAQResourceV2.enrichment_status` JSDoc listed `"pending"`, which
  is NOT an allowed value. Aligned to the real `ENRICHMENT_STATUS_VALUES`:
  `"ok"`, `"failed"`, `"manual"`.

## [0.76.0] - 2026-06-04

Bonuses contract drift fixes against the mini-back source of truth
(`app/presentation/api/v2/bonus_serializers.py` and `bonus_admin_routes.py` /
`bonus_catalog_routes.py` — the actual wire shapes, not just the Pydantic
response models). The DTO response models declared fields the serializers never
emit; this release re-points the response types to what the endpoints actually
return.

### Removed
- **(technically breaking, but these fields never existed on the wire — kept
  minor)** `bonuses` module response interfaces:
  - `BonusV2.phone` — `_serialize_bonus` intentionally omits `phone` (PII threat
    model, BA1). `phone` remains on `BonusV2CreateInput` / `BonusV2UpdateInput`
    (request only).
  - `BonusV2.notifyOnPublish` — write-only admin intent flag (fires an FCM on
    publish); never echoed on any response. Kept on the create/update request
    inputs.
  - `BonusV2ListItem.phone` — same PII omission as the detail surface.
  - `BonusV2ListItem.updatedAt` — `_serialize_list_item` does not emit it.

### Changed
- `bonuses` module: tightened over-nullable `city` on both response shapes —
  `BonusV2.city` and `BonusV2ListItem.city` are now `BonusV2CityRef`
  (non-null) instead of `BonusV2CityRef | null`. `CityId` is NOT NULL and
  `_city_dict` always returns an object; only the inner `name` can be null.
- `bonuses` module: corrected the `BONUSES_V2_ENDPOINTS` doc comments for the
  DELETE routes — bonus DELETE returns `{ deleted, uuid }`, catalog DELETEs
  return `{ deleted, id }`, and media/translation DELETEs return `{ deleted }`
  (previously all documented as `{ message }`, which was never the wire shape).

### Added
- `bonuses` module: previously-undocumented response wrappers, matching the
  actual `success_response(...)` payloads:
  - `BonusV2CreateResponse` / `BonusV2UpdateResponse` — aliases of
    `BonusV2DetailResponse` (`{ bonus }`).
  - `BonusV2DeleteResponse` — `{ deleted, uuid }` (bonus cascade soft-delete).
  - `BonusCatalogDeleteResponse` — `{ deleted, id }` (category / subcategory /
    amenity / payment-method delete).
  - `BonusDeletedResponse` — `{ deleted }` (media / translation delete).
  - `BonusCategoryCreateResponse` (`{ category }`),
    `BonusSubcategoryCreateResponse` (`{ subcategory }`),
    `BonusAmenityCreateResponse` (`{ amenity }`),
    `BonusPaymentMethodCreateResponse` (`{ paymentMethod }`) — the catalog
    create/update response shapes.

## [0.75.0] - 2026-06-04

Engagement-cutover contract drift fixes. Several blog + magazine engagement
shapes were stale against the post-cutover wire (the engagement subsystem now
serves like/view/share/download/report/stats/comments for both features via
`make_engagement_router`, returning generic snake_case schemas). This release
re-points those shapes to match the actual wire.

### Added
- `engagement` module (`src/engagement/types.ts`): generic extended-interaction
  response/request types that were missing — `EngagementLikeResponse`
  (`user_liked?` / `like_count_real` / `like_count_vanity`),
  `EngagementLikePublicResponse` (`like_count_vanity`),
  `EngagementDownloadResponse` (`download_count_real` / `download_count_vanity`),
  `EngagementReportRequest` (`reason` / `comment?`), and `EngagementReportAck`
  (`status`). Backend: `app/engagement/presentation/schemas/extended.py`.
- `blogPosts` module (`src/blogPosts/types.ts`): `BlogCommentAuthorV2`
  (`user_id` / `name: string | null` / `avatar_url: string | null`) — the
  engagement comment-author shape (mirror of `EngagementCommentAuthorV2`).

### Changed
- **(breaking vs old camelCase, but the old shapes were WRONG vs the wire — kept
  minor)** `magazines` module: the magazine engagement responses are now aliases
  of the generic snake_case engagement shapes instead of stale camelCase
  magazine-named interfaces:
  - `MagazineLikeResponse` → `EngagementLikeResponse`
    (was `{ liked, likeCount, likeCountReal? }`).
  - `MagazineShareResponse` → `EngagementShareResponse`
    (was `{ shareCount, shareCountReal?, shareUrl }`; `shareUrl` is GONE).
  - `MagazineDownloadResponse` → `EngagementDownloadResponse`
    (was `{ pdfUrl, downloadCount, downloadCountReal? }`; `pdfUrl` is GONE —
    read it from `MagazineDetailV2.pdfUrl`).
  - `MagazineReportResponseV2` → `EngagementReportAck`
    (was the full row `{ uuid, magazineUuid, reason, status, comment, createdAt }`;
    the report route surfaces only `{ status }`).
  - `MagazineItemStatsV2Response` → `EngagementCounters`
    (was `{ uuid, title, viewCount, downloadCount, likeCount, shareCount,
    isPublished, isFeatured, publishedAt, createdAt }`; the engagement stats
    route returns the snake_case counters envelope with no magazine metadata).
- `blogPosts` module: `BlogCommentV2.author` re-pointed from `BlogAuthorV2` to
  `BlogCommentAuthorV2` — blog comments are served by the engagement subsystem,
  which returns the engagement author shape (`user_id` / `name` / `avatar_url`),
  NOT the post-author shape (no `bio` / `is_primary` / `role`).
- `blogPosts` module: `BlogViewResponseV2` gained `view_count_real: number` +
  `recorded_at: string`; `BlogShareResponseV2` gained `channel: string` +
  `recorded_at: string` (backend `EngagementViewResponseV2` /
  `EngagementShareResponseV2`).
- `magazines` module: `MagazinePageTextResponseV2` gained
  `format: "plain" | "markdown"` (always emitted by the BE, default `"plain"`).
- `endpoints` module: `MAGAZINE_DOWNLOAD` JSDoc corrected — the download route
  returns counters only, NOT a `pdfUrl`.

### Removed
- `blogPosts` module: `BlogBookmarkListItemV2` + `BlogBookmarkListResponseV2`
  (types) and `BLOG_ME_BOOKMARKS` (`/api/v2/me/blog/bookmarks`, endpoints) —
  the route no longer exists in mini-back. The caller's cross-subject bookmark
  list moved to the generic engagement subsystem at
  `/api/v2/me/engagement/bookmarks` (`ENGAGEMENT_ENDPOINTS.ME_BOOKMARKS` →
  `EngagementBookmarkListResponse`). `BlogBookmarkResponseV2` (per-post toggle)
  is unaffected. Nothing else in the package referenced the removed symbols.

### FE-impact / migration
- **Magazine field renames that can break FE consumers** (camelCase → snake_case,
  plus dropped fields):
  - `/like`, `/like` DELETE, `/like/public`: `{ liked, likeCount, likeCountReal? }`
    → `{ user_liked?, like_count_real, like_count_vanity }`.
  - `/share`: `{ shareCount, shareCountReal?, shareUrl }`
    → `{ share_count, channel, recorded_at }`. **`shareUrl` removed** — any FE
    handing the share deep-link to an OS share sheet must build it client-side
    (or read a canonical magazine URL) instead.
  - `/download`: `{ pdfUrl, downloadCount, downloadCountReal? }`
    → `{ download_count_real, download_count_vanity }`. **`pdfUrl` removed** —
    FE must read the PDF URL from `MagazineDetailV2.pdfUrl`, not the download
    response.
  - `/report`: full row → `{ status }`.
  - `/{uuid}/stats`: magazine-metadata row → snake_case `EngagementCounters`
    envelope (`view_count_real`/`view_count_vanity`/`useful_count`/
    `not_useful_count`/`share_count`/`bookmark_count`/`comment_count` +
    `settings`); `uuid`/`title`/`isPublished`/`isFeatured`/`publishedAt`/
    `createdAt` are gone — read them from `MagazineDetailV2`.
- These are technically breaking for any FE still reading the old camelCase
  magazine fields, but kept as a **minor** bump because the old shapes were
  already wrong vs the post-cutover wire (any FE relying on them was already
  broken at runtime — this fixes the contract to match reality).
- Blog FE: `BlogCommentV2.author` no longer types `bio`/`is_primary`/`role` (it
  never carried them on the wire); reading those was always `undefined`.

## [0.74.0] - 2026-06-04

### Added
- `blogPosts` module (`src/blogPosts/types.ts`): new exported interface
  `BlogBlockResourceResolved` (`url` required; `url_variants`, `width`,
  `height`, `mime_type`, `size_bytes`, `caption`, `alt_text` all nullable).
- `resolved: BlogBlockResourceResolved | null` field added to
  `BlogBlockImage`, `BlogBlockPdfCard`, and `BlogBlockVideo`.

### Why
- The mini-back blog enricher now attaches an inline `resolved` payload to
  `image` / `pdf_card` / `video` body blocks, resolved from the
  `GalleryV2Item` referenced by the block's `resource_uuid` (null when the
  item is missing or soft-deleted). This mirrors how `embed_youtube`
  (`BlogEmbedResolved`) and `gallery_embed` (`BlogGalleryEmbedResolved`)
  already carry an inline `resolved` field — NOT a top-level `resources[]`
  array like FAQ. Additive minor bump; `BlogBlockResourceResolved` is
  re-exported through the package index via the `blogPosts` barrel.

## [0.71.0] - 2026-06-03

### Added
- `magazines` module: magazine-named comment contract mirroring the
  blog comment family (`src/blogPosts/types.ts`) so app/web can import a
  feature-scoped name instead of duplicating shapes or reaching for the
  generic `EngagementComment*` types:
  - `MagazineCommentV2`, `MagazineCommentCreateRequestV2`,
    `MagazineCommentListResponseV2`, `MagazineCommentAuthorV2`.
  - The author shape is the engagement author
    (`user_id` / `name` / `avatar_url`), **not** `BlogAuthorV2`
    (no `bio` / `is_primary`).
- `endpoints` module (`V2_ENDPOINTS`): `MAGAZINE_COMMENTS`,
  `MAGAZINE_COMMENTS_CREATE` (`/magazines/{uuid}/comments`) and
  `MAGAZINE_COMMENT_DELETE` (`/magazines/comments/{comment_uuid}`),
  mirroring `BLOG_V2_ENDPOINTS.BLOG_POST_COMMENTS*` naming.

### Why
- Magazine comments are served by the generic engagement subsystem via the
  magazine subject adapter (`magazine_engagement_adapter.py`,
  base_prefix `/api/v2/magazines`; routes in
  `app/engagement/presentation/routes/attach_factory.py`). The new types are
  structurally identical to the backend
  `app/engagement/presentation/schemas/comments.py` schemas
  (`EngagementCommentV2` / `EngagementCommentCreateRequestV2` /
  `EngagementCommentListResponseV2`) and to the existing `src/engagement`
  `EngagementComment*` types — this just exposes a magazine-scoped alias.

## [0.66.0] - 2026-05-27

### Changed
- Regenerated `V2_ENDPOINTS_GENERATED` from mini-back HEAD
  (chore/audit-remediation-20260527 post-Wave-10).
- Source sha updated from `ae3ea707` to `abee96b7`.
- Route count unchanged at 412 across 27 feature groups (source sha
  refresh, no route signature changes).

### Why
- Pass 2 audit PASS2-TYPE-01: generated endpoints were pinned to a stale
  commit. W2-A2 (mypy fixes), W6-A2 (deprecated flags), W9-A1 (bootstrap
  split) all may have shifted route signatures — verified no actual
  route changes, but sha pin refreshed so downstream FE repos see a
  current source of truth.

## [0.65.0] - 2026-05-27

### Added
- `ask` module: `AskRequest`, `AskResponse`, `AskLegacyChatRequest`,
  `AskLegacyChatMessage`, SSE event types (`AskStreamChunkEvent`,
  `AskStreamDoneEvent`, `AskStreamEvent`), and `ASK_ENDPOINTS` constants
  for the V1 chatbot RAG surface
  (`POST /api/v1/ask`, `/api/v1/ask/stream`, `/api/chat`). Const enums:
  `ASK_SUPPORTED_LANGUAGES`, `ASK_USER_TYPES`, `ASK_SOURCES`,
  `ASK_LEGACY_CHAT_ROLES`. V1-only (no V2 router).
- `censusStats` module: full coverage of both the V1 stored-stats
  endpoints (`/api/v1/census-stats/...`) and the V2 on-demand statistics
  / municipalities / map endpoints
  (`/api/v2/censuses/{uuid}/{statistics|municipalities|map}`). Includes
  `CensusStatsStatisticsResponse`, `CensusStatsMunicipalitiesResponse`,
  `CensusStatsMapResponse`, every section sub-shape (composition,
  demographics, employment, tenure, compensation, geography, data
  quality, intersectional, hiring trend), the V1
  `CensusStatsV1ListResponse` envelope, and the V2 `CensusStatsV2Envelope`
  success wrapper. Const enums: `CENSUS_STATS_PRESETS`,
  `CENSUS_STATS_SECTIONS`, `CENSUS_STATS_EXPORT_LAYOUTS`. Endpoint
  constants split into `CENSUS_STATS_V1_ENDPOINTS` (JSON + XLSX export)
  and `CENSUS_STATS_V2_ENDPOINTS`.
- `emailCensusIngestion` module: full coverage of the API-key gated
  `/api/v1/automation/...` surface that powers the IMAP → census
  pipeline, sender-trust tiering, transformation-rule editor, cron
  schedule editor, pending-files approval queue, and processing-log
  explorer. Includes `EmailCensusPendingFile`,
  `EmailCensusDetectedCandidate`, `EmailCensusProcessingLog`,
  `EmailCensusSenderTrust`, `EmailCensusAuthorizedEmail`,
  `EmailCensusEmailAccount`, `EmailCensusTransformationRule`,
  `EmailCensusEmailProcessingSummary`, and ~40 supporting types.
  Const enums: `EMAIL_CENSUS_PENDING_FILE_STATUSES`,
  `EMAIL_CENSUS_PROCESSING_LOG_STATUSES`, `EMAIL_CENSUS_SOURCE_TYPES`,
  `EMAIL_CENSUS_EMAIL_ROLES`, `EMAIL_CENSUS_JOB_STATUSES`,
  `EMAIL_CENSUS_RULE_TYPES`, `EMAIL_CENSUS_DETECTION_SOURCES`,
  `EMAIL_CENSUS_TRUST_ACTIONS`. V1-only (no V2 router).
- `notificationsContent` module: dedicated narrower surface for the
  audit-locked `POST /api/v1/notifications/content` endpoint —
  `NotificationsContentRequest`, `NotificationsContentResponse`,
  `NotificationsContentAnnouncement`, `NotificationsContentType` const
  union (locked to `["announcement"]`), and
  `NOTIFICATIONS_CONTENT_ENDPOINTS`. The broader `notifications` module
  also covers FCM topic broadcast — this module is the alias that the
  CMS Notifications composer in `new_dashboard` should consume.
- Package subpath exports: `@kerbero1994/shared-types/ask`,
  `/censusStats`, `/emailCensusIngestion`, `/notificationsContent`.

### Why
- Closes mini-back `AUDIT_20260527.md` TYPE-02: five features had
  `docs/v2/` directories but no `@kerbero1994/shared-types` module.
  Engagement closed in v0.63.0; this release covers the remaining four
  (Ask, CensusStats, EmailCensusIngestion, NotificationsContent) so
  every V2 feature with a docs surface now has a canonical type
  module.

### Notes
- All field names mirror the Pydantic wire shape exactly (snake_case),
  except for `userType` on the Ask request body which keeps the
  original sitimm-api-proxy camelCase contract.
- Nullable fields use `T | null` when the backend schema is `T | None`
  without a default; optional fields with defaults use `?`.
- Timestamp fields are ISO 8601 UTC strings (commented inline).
- UUIDs are strings (UUID v4, commented inline).
- `Decimal` fields on `CensusStats` map / municipality employees
  serialise as JSON strings (not floats) because mini-back's V2
  envelope uses `model_dump(by_alias=True, mode="json")`.

## [0.64.0] - 2026-05-27

### Added
- `V2_ENDPOINTS_GENERATED` — auto-generated TS constants module
  (`src/endpoints/v2_endpoints_generated.ts`) covering **every** V2
  route exported by mini-back (412 method-rows across 27 feature
  groups in this release).
- `scripts/import-v2-endpoints.sh` + `scripts/import-v2-endpoints.mjs`
  — helper to convert the JSON dump produced by mini-back's
  `make dump-v2-routes` into the generated TS module.
- Path params (`{uuid}`, `{id}`, `{slug}`, etc.) are emitted as typed
  arrow-function builders, e.g.
  `events.GET_EVENT(uuid)` → `"/api/v2/events/${uuid}"`.

### Notes
- The hand-maintained `V2_ENDPOINTS` constant is preserved for
  backward compatibility — existing FE code keeps working.
- New code should prefer `V2_ENDPOINTS_GENERATED` when it needs
  guaranteed coverage of every backend route.
- Closes TYPE-03 (shared-types side) from AUDIT_20260527.md.

## [0.63.0] - 2026-05-27

### Added
- `engagement` module: `EngagementComment`, `EngagementReaction*`,
  `EngagementBookmark*`, `EngagementCounters`, `EngagementSettings`,
  `EngagementSubject`, `EngagementPolicy*`, `EngagementWebhook*`,
  `EngagementWebhookDelivery*`, `EngagementUserNotificationPref*`,
  `EngagementAnalytics*`, `EngagementSuspensionLog*`,
  `EngagementCommentModeration*`, `EngagementProfanityTerm*`,
  `EngagementDlq*`, `EngagementRegisteredSubject*`,
  `EngagementShare*`, `EngagementView*` types — full coverage of the
  mini-back `app/engagement/presentation/schemas/*` surface.
- `ENGAGEMENT_ENDPOINTS` constants for all 30+ engagement routes,
  split into three groups:
  - `engagementSubjectEndpoints(basePrefix)` — per-subject route
    builder (14 routes per attached subject_type).
  - `ENGAGEMENT_BLOG_ENDPOINTS` — pre-baked snapshot for `blog_post`
    @ `/api/v2/blog/posts`.
  - `ENGAGEMENT_ME_ENDPOINTS` — caller's `/me/engagement/*` surface
    (bookmarks, comments, notifications, preferences).
  - `ENGAGEMENT_ADMIN_ENDPOINTS` — cross-subject admin surface
    (moderation, profanity, policy, DLQ, analytics, webhooks,
    registered-subjects, CSV export).
- Const enums covering every engagement string union:
  `ENGAGEMENT_SUBJECT_TYPES`, `ENGAGEMENT_REACTION_KINDS`,
  `ENGAGEMENT_PERSISTED_REACTION_KINDS`,
  `ENGAGEMENT_SHARE_CHANNELS`, `ENGAGEMENT_PROFANITY_LANGUAGES`,
  `ENGAGEMENT_ANALYTICS_BUCKETS`,
  `ENGAGEMENT_WEBHOOK_EVENT_TYPES`,
  `ENGAGEMENT_SUSPENSION_TARGETS`,
  `ENGAGEMENT_SUSPENSION_ACTIONS`,
  `ENGAGEMENT_NOTIFICATION_EVENT_TYPES`.
- Package subpath export `@kerbero1994/shared-types/engagement` for
  deep imports.

### Why
- Closes mini-back `AUDIT_20260527.md` TYPE-01: the engagement
  subsystem has been live on QA for 5 days with three frontends
  (`sitimmApp`, `Sitimm-web`, `new_dashboard`) consuming engagement
  routes via local TypeScript types. Without a shared module the
  schemas drift quickly — this publish is the canonical source for
  every engagement contract.

### Notes
- All field names mirror the Pydantic wire shape exactly (snake_case);
  no automatic camelCase conversion.
- Nullable fields use `T | null` (not optional `?`) when the backend
  schema is `T | None` without a default.
- Timestamp fields are ISO 8601 UTC strings (commented inline).
- UUIDs are strings (UUID v4, commented inline).

