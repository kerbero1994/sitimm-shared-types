/**
 * Bulletin V2 types.
 *
 * Backend: app/presentation/schemas/bulletin_v2.py
 *
 * Bulletins are short SITIMM announcements. v1.0.0 supported two scopes:
 * company-specific or general (union-wide). v1.1.0 (2026-04-29) adds
 * AudienceSpec-driven targeting plus per-user materialized delivery
 * state — see the Bulletins V2 changelog and `docs/v2/Bulletins/spec.md`
 * in the backend repo for the full invariant catalogue.
 */

import type { AudienceSpec } from "../events/eligibility";

// Re-export AudienceSpec from the bulletins module so consumers don't
// have to reach across two import paths.
export type { AudienceSpec, AudienceRule, RuleField, RuleOp } from "../events/eligibility";

/**
 * Lifecycle of a bulletin's fan-out work, mirroring the
 * `bulletin_delivery_status_valid` CHECK constraint on the backend.
 *
 * - `legacy`      — pre-v1.1.0 row published before the new fan-out path existed.
 * - `draft`       — reserved (not yet emitted by any endpoint).
 * - `queued`      — created; Celery task `bulletins.fanout` not yet started.
 * - `fanning_out` — task in progress (materializing BulletinDelivery + sending FCM).
 * - `delivered`   — task finished successfully; `audience_snapshot_at` populated.
 * - `failed`      — task exhausted retries; manual intervention required.
 */
export type BulletinDeliveryStatus =
  | "legacy"
  | "draft"
  | "queued"
  | "fanning_out"
  | "delivered"
  | "failed";

/**
 * Bulletin record.
 * Backend: bulletin_v2.py :: BulletinV2Response
 */
export interface BulletinV2 {
  /** Bulletin UUID — primary identifier. */
  uuid: string;
  /** Bulletin title. */
  title: string;
  /** Bulletin description/body text. */
  description: string;
  /** Image URL (presigned S3 or relative path). Null if no image attached. */
  image_url: string | null;
  /**
   * Responsive variants of `image_url` — same shape as
   * `programs.ImageVariants`. v0.51.0+. Null on legacy rows whose images
   * predate the responsive pipeline.
   */
  image_variants?: import("../programs").ImageVariants | null;
  /** Document URL (PDF or other file). Null if no document attached. */
  document_url: string | null;
  /** Company UUID this bulletin belongs to. Null for general / audience-driven bulletins. */
  company_uuid: string | null;
  /** Whether this is a general (union-wide) bulletin vs. company-specific. */
  is_general: boolean;
  /**
   * Audience targeting spec. Null for v1.0.0 legacy rows that predate
   * the targeting feature; current bulletins always carry an AudienceSpec
   * (synthesised from is_general/company_uuid when the caller sent legacy flags).
   */
  audience: AudienceSpec | null;
  /** Fan-out lifecycle status — see `BulletinDeliveryStatus`. */
  delivery_status: BulletinDeliveryStatus;
  /** Number of users matched at publish time. Null until fan-out finishes. */
  audience_size: number | null;
  /** ISO-8601 datetime when the audience was evaluated and frozen. Null until fan-out finishes. */
  audience_snapshot_at: string | null;
  /** ISO-8601 datetime when the bulletin was published. */
  published_at: string;
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

/**
 * Request params for GET /api/v2/bulletins.
 */
export interface ListBulletinsV2Request {
  /** Filter by company UUID. Omit to return all bulletins. */
  company_uuid?: string;
  /** Filter by scope: true=only general, false=only company, omit=both. */
  is_general?: boolean;
  /** Page number (1-based). */
  page?: number;
  /** Page size (1-100). Default 20. */
  page_size?: number;
}

/**
 * Response from GET /api/v2/bulletins.
 */
export interface ListBulletinsV2Response {
  /** Array of bulletin records. */
  bulletins: BulletinV2[];
  /** Total number of bulletins matching the filter. */
  total: number;
}

/**
 * Body for POST /api/v2/bulletins.
 * Backend: bulletin_v2.py :: BulletinV2Create
 *
 * Two valid shapes:
 *
 * **A. Legacy scope (v1.0.0)** — set `is_general` + optionally `company_uuid`,
 *    leave `audience` unset. The server translates these into an implicit
 *    `AudienceSpec` for fan-out so even legacy bulletins materialize through
 *    the new BulletinDelivery path.
 *
 * **B. Targeted (v1.1.0+)** — supply `audience: AudienceSpec`, leave
 *    `is_general` and `company_uuid` unset.
 *
 * Mixing the two raises `audience_contract_violation` from Pydantic.
 *
 * Scope (`audience` / `company_uuid` / `is_general`) is set at creation
 * time and is **immutable** — there is no way to flip it via PATCH.
 */
export interface CreateBulletinV2Body {
  /** Bulletin title (1-255 chars). */
  title: string;
  /** Bulletin description/body text (max 20000 chars). */
  description: string;
  /** Optional image URL (presigned S3 or relative path). */
  image_url?: string | null;
  /** Optional document URL (PDF or other file). */
  document_url?: string | null;
  /** Company UUID for company-specific bulletins. Omit/null for general. Forbidden when `audience` is supplied. */
  company_uuid?: string | null;
  /** True for a general (union-wide) bulletin. Forbidden when `audience` is supplied. */
  is_general?: boolean;
  /** Optional publish timestamp (ISO-8601). Defaults to now() on the server. */
  published_at?: string;
  /** Audience targeting spec. Forbidden when `is_general`/`company_uuid` are supplied. */
  audience?: AudienceSpec | null;
}

/**
 * Body for PATCH /api/v2/bulletins/{uuid}.
 * Backend: bulletin_v2.py :: BulletinV2Update
 *
 * `company_uuid`, `is_general`, and `audience` are NOT accepted — scope
 * is immutable.
 */
export type UpdateBulletinV2Body = Partial<
  Pick<
    CreateBulletinV2Body,
    "title" | "description" | "image_url" | "document_url" | "published_at"
  >
>;

// ─────────────────────────────────────────────────────────────────────
// Audience preview gate (POST /preview-audience)
// ─────────────────────────────────────────────────────────────────────

/**
 * One row of the coverage gate report.
 * Backend: bulletin_v2.py :: BulletinFieldCoverageEntry
 *
 * Mirrors `app.shared.config.audience_coverage.FieldCoverage` so frontends
 * can render exactly what the gate saw at evaluation time.
 */
export interface BulletinFieldCoverageEntry {
  /** Field name (e.g., `"sex"`, `"companyId"`, `"headquarterId"`). */
  name: string;
  /** Population coverage in [0.0, 1.0] from the externally measured baseline. */
  coverage: number;
  /** Minimum coverage required for this field to pass the gate. */
  threshold: number;
  /** Whether the field is allowed at all (false = field is bug or unbackfilled). */
  usable: boolean;
  /** True if the field is reserved for staff-only audiences (e.g., `headquarterId`). */
  staffOnly: boolean;
  /** True iff `usable && coverage >= threshold` AND staff-only check passes for the caller. */
  passes: boolean;
}

/**
 * Body for POST /api/v2/bulletins/preview-audience.
 * Backend: bulletin_v2.py :: PreviewAudienceRequest
 */
export interface PreviewAudienceRequest {
  /** Audience spec to evaluate. */
  audience: AudienceSpec;
}

/**
 * Response from POST /api/v2/bulletins/preview-audience.
 * Backend: bulletin_v2.py :: PreviewAudienceResponse
 *
 * The same gate state that POST /api/v2/bulletins enforces — preview
 * lets editors see blockers before publishing instead of hitting a
 * `insufficient_field_coverage` 422 after composing.
 */
export interface PreviewAudienceResponse {
  /** Number of users currently matched by the audience query. */
  count: number;
  /** Up to 10 user UUIDs from the matching set, for sanity-checking. */
  sampleUuids: string[];
  /** Per-referenced-field coverage rows. */
  fieldCoverage: BulletinFieldCoverageEntry[];
  /**
   * Field names that fail the gate. Non-empty means publish would reject
   * with `insufficient_field_coverage` (or `staff_only_audience` for staff
   * fields when the caller is not staff).
   */
  blockers: string[];
  /** Maximum users the publish path will allow in a single fan-out (default 50000). */
  audienceSizeCap: number;
}

// ─────────────────────────────────────────────────────────────────────
// Personal feed (GET /feed) + read/dismiss/pin
// ─────────────────────────────────────────────────────────────────────

/**
 * Bulletin enriched with the caller's per-user delivery state.
 * Backend: bulletin_v2.py :: BulletinFeedItem
 *
 * Returned by GET /api/v2/bulletins/feed. `read_at` is null until the
 * caller marks the bulletin as read; `dismissed_at` hides the bulletin
 * from the feed without deleting the row.
 */
export interface BulletinFeedItem {
  /** Bulletin UUID. */
  uuid: string;
  /** Bulletin title. */
  title: string;
  /** Bulletin description/body. */
  description: string;
  /** Image URL or null. */
  image_url: string | null;
  /** Document URL or null. */
  document_url: string | null;
  /** ISO-8601 datetime when the bulletin was published. */
  published_at: string;
  /** ISO-8601 datetime when this user received the delivery row. */
  delivered_at: string;
  /** ISO-8601 datetime when the user marked it read. Null when unread. */
  read_at: string | null;
  /** ISO-8601 datetime when the user dismissed it. Null when not dismissed. */
  dismissed_at: string | null;
  /** ISO-8601 datetime when the user pinned it. Null when not pinned. Pinned rows surface first. */
  pinned_at: string | null;
}

/**
 * Response from GET /api/v2/bulletins/feed.
 * Backend: bulletin_v2.py :: BulletinFeedResponse
 */
export interface BulletinFeedResponse {
  /** Page of feed items, pinned-first then newest delivered first. */
  items: BulletinFeedItem[];
  /** Total feed items (excluding dismissed). */
  total: number;
  /** Count of unread, undismissed items — drives the badge. */
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────────────
// Recipients view (admin)
// ─────────────────────────────────────────────────────────────────────

/**
 * One BulletinDelivery row, returned to admins for audit.
 * Backend: bulletin_v2.py :: BulletinRecipientItem
 */
export interface BulletinRecipientItem {
  /** Internal user id of the recipient. */
  userId: number;
  /** ISO-8601 datetime when the row was inserted. */
  deliveredAt: string;
  /** ISO-8601 datetime when the user marked it read, or null. */
  readAt: string | null;
  /** ISO-8601 datetime when the user dismissed it, or null. */
  dismissedAt: string | null;
}

/**
 * Response from GET /api/v2/bulletins/{uuid}/recipients.
 * Backend: bulletin_v2.py :: BulletinRecipientsResponse
 */
export interface BulletinRecipientsResponse {
  /** Total number of recipients (excluding soft-deleted delivery rows). */
  total: number;
  /** Number of recipients who marked the bulletin as read. */
  readCount: number;
  /** Number of recipients who dismissed the bulletin. */
  dismissedCount: number;
  /** Page of recipient rows. */
  items: BulletinRecipientItem[];
}
