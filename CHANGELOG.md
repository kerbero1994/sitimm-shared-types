# Changelog

All notable changes to `@kerbero1994/shared-types` are documented here.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

