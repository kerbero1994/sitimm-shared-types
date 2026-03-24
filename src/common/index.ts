/**
 * Common types shared across all SITIMM repos.
 *
 * Backend equivalents:
 * - ApiResponse       -> FastAPI JSONResponse wrapper
 * - V2Response        -> FastAPI success_response() wrapper → { status, data, message? }
 * - PaginatedResponse -> app/presentation/schemas (ListResponse pattern)
 * - ApiError          -> FastAPI HTTPException / ValidationError
 */

/**
 * Standard API response wrapper (V1 style).
 * Used by legacy Node.js endpoints.
 */
export interface ApiResponse<T = unknown> {
  /** Response payload. */
  data: T;
  /** Optional message (usually on error or confirmation). */
  message?: string;
}

/**
 * Paginated list response (V1 style).
 * Used by legacy Node.js list endpoints.
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page. */
  data: T[];
  /** Total number of items across all pages. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Total number of pages. */
  pages: number;
  /** Items per page (same as the request `limit`). */
  limit: number;
}

/**
 * V2 API response wrapper (mini-back style).
 * All V2 endpoints return `success_response(data)` → `{ status: "success", data: T }`.
 * On error, status is "error" and data may be empty.
 */
export interface V2Response<T> {
  /** "success" on normal responses, "error" on failures. */
  status: "success" | "error";
  /** Response payload. */
  data: T;
  /** Optional message (usually on error). */
  message?: string;
}

/**
 * V2 list response (mini-back paginated style).
 * Used by list endpoints that return arrays.
 */
export interface V2ListResponse<T> {
  /** "success" or "error". */
  status: "success" | "error";
  /** Array of items. */
  data: T[];
  /** Total number of items across all pages. */
  total?: number;
  /** Current page number (1-based). */
  page?: number;
  /** Items per page. */
  limit?: number;
}

/**
 * FastAPI validation error structure.
 * Backend: pydantic.ValidationError → serialized as array of error details.
 *
 * @example
 * ```json
 * { "loc": ["body", "description"], "msg": "String should have at most 10000 characters", "type": "string_too_long" }
 * ```
 */
export interface ValidationError {
  /** Path to the invalid field. E.g., ["body", "description"] or ["query", "page"]. */
  loc: (string | number)[];
  /** Human-readable error message. */
  msg: string;
  /** Pydantic error type identifier (e.g., "string_too_long", "missing"). */
  type: string;
}

/**
 * API error response.
 * `detail` is a string for HTTPException, or array for validation errors.
 */
export interface ApiError {
  /** Error detail — string for simple errors, array for validation errors. */
  detail: string | ValidationError[];
}

/**
 * Base entity fields present in most V1 database records.
 * Backend: Sequelize-style timestamps (createdAt/updatedAt/deletedAt).
 */
export interface BaseEntity {
  /** Record UUID — primary identifier for API operations. */
  uuid: string;
  /** Numeric auto-increment ID (legacy, optional). */
  id?: number;
  /** ISO-8601 creation timestamp. */
  createdAt?: string;
  /** ISO-8601 last update timestamp. */
  updatedAt?: string;
  /** ISO-8601 soft-delete timestamp, or null if active. */
  deletedAt?: string | null;
}

/**
 * Common query parameters for V1 list endpoints.
 */
export interface ListQueryParams {
  /** Page number (1-based). Default: 1. */
  page?: number;
  /** Items per page. Default: 20. Max: 100. */
  limit?: number;
  /** Search query string (filters by name, email, etc. depending on endpoint). */
  search?: string;
  /** Field name to sort by. */
  sortBy?: string;
  /** Sort direction. Default: "asc". */
  sortOrder?: "asc" | "desc";
}

// -- Pagination defaults --

/** Pagination constants matching mini-back defaults. */
export const PAGINATION_DEFAULTS = {
  /** Default page number. */
  PAGE: 1,
  /** Default items per page. */
  PER_PAGE: 20,
  /** Maximum items per page (enforced server-side). Backend: ge=1, le=100. */
  MAX_PER_PAGE: 100,
} as const;
