/**
 * Audience Template types — reusable AudienceSpec library (V2).
 *
 * Backend: app/application/dtos/audience_template_v2.py (re-exported through
 * app/presentation/schemas/audience_template_v2.py); router
 * app/presentation/api/v2/audience_templates_v2.py — `/api/v2/audience-templates`.
 *
 * Admin-only utility surface consumed by the Events/Bulletins admin consoles.
 * EVERY endpoint — reads included — is gated on a write-tier `events:*`
 * permission (list/get/create/update → `events:update`, delete →
 * `events:delete`). `events:read` is BASE-level (granted to every
 * authenticated user, incl. INVITADO/EMPLOYEE) and is intentionally NOT
 * sufficient here.
 *
 * The `spec` payload is the same `AudienceSpec` shape stored on
 * `Event.audience` — see `events/eligibility`.
 */

import type { AudienceSpec } from "../events/eligibility";

// ── Response Types ──

/**
 * A saved audience template.
 * Backend: audience_template_v2.py :: AudienceTemplateResponse
 */
export interface AudienceTemplateV2 {
  /** Template UUID — primary identifier. */
  uuid: string;
  /** Display name. Min 1, max 255 chars. Stored trimmed. */
  name: string;
  /** Optional description. Max 500 chars. Null when not set. */
  description: string | null;
  /**
   * Serialized `AudienceSpec` as raw JSON — the backend stores and returns the
   * spec as an opaque dict (`AudienceTemplateResponse.spec: dict`); clients
   * re-validate/narrow it via `AudienceSpec` before use.
   */
  spec: Record<string, unknown>;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Paginated audience-template list.
 * Backend: audience_template_v2.py :: AudienceTemplateListResponse
 */
export interface AudienceTemplateListV2Response {
  /** Templates for the current page. */
  items: AudienceTemplateV2[];
  /** Total number of templates matching the search filter. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Items per page. Default: 50. Max: 100. */
  pageSize: number;
  /** Whether there are more pages after this one. */
  hasNext: boolean;
}

// ── Request Types ──

/**
 * Request body for POST /api/v2/audience-templates.
 * Backend: audience_template_v2.py :: AudienceTemplateCreate
 */
export interface CreateAudienceTemplateRequest {
  /** Display name. Required. Min 1, max 255 chars (trimmed server-side). */
  name: string;
  /** Optional description. Max 500 chars. */
  description?: string | null;
  /**
   * Audience specification. Validated server-side with `AudienceSpec`
   * (`extra="forbid"` — unknown keys are rejected 422). Sub-fields omitted in
   * the payload take backend defaults: `mode="public"`, `combinator="all"`,
   * `rules=[]`, `guestPolicy="auto_accept"`, `denialMessage=null`. `rules`
   * must be non-empty iff `mode="custom"`.
   */
  spec: AudienceSpec;
}

/**
 * Request body for PATCH /api/v2/audience-templates/{uuid}.
 * Partial update — `null`/omitted fields keep their current value (the
 * service ignores `None`; `null` never clears a field).
 * Backend: audience_template_v2.py :: AudienceTemplateUpdate
 */
export interface UpdateAudienceTemplateRequest {
  /** Display name. Min 1, max 255 chars (trimmed server-side). */
  name?: string;
  /** Description. Max 500 chars. `null`/omitted = keep current. */
  description?: string | null;
  /**
   * Replacement audience spec (validated like on create). `null`/omitted =
   * keep current. Replaces the whole spec — no deep merge.
   */
  spec?: AudienceSpec | null;
}
