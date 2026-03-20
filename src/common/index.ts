/**
 * Common types shared across all SITIMM repos.
 *
 * Backend equivalents:
 * - ApiResponse       -> FastAPI JSONResponse wrapper
 * - PaginatedResponse -> app/presentation/schemas (ListResponse pattern)
 * - ApiError          -> FastAPI HTTPException / ValidationError
 */

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/** V2 API response (includes status field) */
export interface V2Response<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

/** V2 list response */
export interface V2ListResponse<T> {
  status: "success" | "error";
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * FastAPI validation error structure.
 * Backend: pydantic.ValidationError
 */
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** API error response */
export interface ApiError {
  detail: string | ValidationError[];
}

/**
 * Base entity fields present in most database records.
 * Backend: Sequelize-style timestamps (createdAt/updatedAt/deletedAt)
 */
export interface BaseEntity {
  uuid: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** Query parameters for list endpoints */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
