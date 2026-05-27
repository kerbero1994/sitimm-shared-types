# Changelog

All notable changes to `@kerbero1994/shared-types` are documented here.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

