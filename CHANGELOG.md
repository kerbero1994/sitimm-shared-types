# Changelog

All notable changes to `@kerbero1994/shared-types` are documented here.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

