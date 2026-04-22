/**
 * Census report batch-generation contract types.
 *
 * Backend: `/api/v1/census-reports/*`
 *
 * This slice covers only the API contract: enums, request bodies, response
 * envelopes, and shared DTOs. UI-side viewmodels (modal state, Spanish
 * labels, status->color helpers) stay in each frontend.
 */

// ============================================================
// Enums
// ============================================================

/**
 * Batch job lifecycle state.
 * Backend: CensusReportJob.status column.
 */
export type CensusReportJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Per-file generation state within a batch.
 * Backend: CensusReportFile.status column.
 */
export type CensusReportFileStatus =
  | "pending"
  | "generating"
  | "ready"
  | "error"
  | "downloaded";

/**
 * How to split the employee's full name into columns in the generated file.
 *
 * - `full_name` — Single "Nombre Completo" column.
 * - `name_lastnames` — Two columns: "Nombre(s)" + "Apellidos".
 * - `name_paterno_materno` — Three columns: "Nombre(s)" + paternal + maternal.
 */
export type CensusReportNameSplitMode =
  | "full_name"
  | "name_lastnames"
  | "name_paterno_materno";

/**
 * How to split the employee's address into columns.
 *
 * - `full_address` — Single address column.
 * - `colony_city` — Two columns: colony + municipality.
 * - `street_colony_city` — Three columns: street + colony + municipality.
 */
export type CensusReportAddressSplitMode =
  | "full_address"
  | "colony_city"
  | "street_colony_city";

/**
 * Catalog of fields that can be included in the generated report.
 */
export type CensusReportField =
  | "payroll"
  | "job"
  | "salary"
  | "entry_date"
  | "full_name"
  | "full_address"
  | "rfc"
  | "curp"
  | "sex"
  | "date_of_birth"
  | "phone";

// ============================================================
// Request DTOs
// ============================================================

/**
 * Report configuration for a batch generation request.
 */
export interface CensusReportConfig {
  /** Fields to include (ordered). */
  fields: CensusReportField[];
  /** Fields to explicitly exclude (even if in `fields`). */
  exclude_fields: CensusReportField[];
  /** How to split the name field. */
  split_name: { mode: CensusReportNameSplitMode };
  /** How to split the address field. */
  split_address: { mode: CensusReportAddressSplitMode };
}

/**
 * Request body for `POST /api/v1/census-reports/batch`.
 */
export interface CensusReportBatchRequest {
  /** Target company UUIDs. One file per company will be produced. */
  company_uuids: string[];
  /** Report configuration applied uniformly across all companies. */
  config: CensusReportConfig;
  /**
   * Filename template with `{company_name}` / `{date}` placeholders.
   * Example: `"{company_name}_{date}"`.
   */
  file_name_template: string;
}

// ============================================================
// Response DTOs
// ============================================================

/**
 * Initial response after enqueuing a batch generation job.
 */
export interface CensusReportBatchResponse {
  /** Server-generated job UUID. Use for subsequent status polls. */
  job_id: string;
  /** Number of target companies. */
  total_companies: number;
  /** Initial job status. Always `"queued"` immediately after creation. */
  status: string;
  /** Human-readable server message. */
  message: string;
}

/**
 * Per-file validation summary (generated while processing each company).
 */
export interface CensusReportFileValidation {
  /** Number of rows that passed validation. */
  valid_count: number;
  /** Total rows inspected. */
  total_count: number;
  /** Non-fatal validation issues encountered. */
  issues: string[];
}

/**
 * Per-file output within a batch.
 */
export interface CensusReportFile {
  /** Target company UUID. */
  company_uuid: string;
  /** Resolved company display name. */
  company_name: string;
  /** Current per-file lifecycle state. */
  status: CensusReportFileStatus;
  /** Total employees included. */
  employee_count: number;
  /** Validation summary. Absent when validation has not run yet. */
  validation?: CensusReportFileValidation;
  /** Presigned download URL. Present only when `status === "ready"`. */
  download_url?: string;
  /** ISO-8601 presigned-URL expiration. Present only when `download_url` is. */
  download_expires?: string;
  /** Suggested filename from the template. */
  suggested_file_name?: string;
  /** Error message. Present only when `status === "error"`. */
  error_message?: string;
}

/**
 * Aggregate batch progress counters.
 */
export interface CensusReportBatchProgress {
  /** Number of files completed so far (processing + ready + error + downloaded). */
  current: number;
  /** Total files in the batch. */
  total: number;
  /** Completion percentage (0-100). */
  percentage: number;
}

/**
 * Response for `GET /api/v1/census-reports/{job_id}/status`.
 */
export interface CensusReportBatchStatusResponse {
  /** Job UUID. */
  job_id: string;
  /** Current overall lifecycle state. */
  status: CensusReportJobStatus;
  /** Aggregate progress counters. */
  progress: CensusReportBatchProgress;
  /** File currently being generated, if any. */
  current_file?: CensusReportFile;
  /** All files in the batch (one per target company). */
  files: CensusReportFile[];
  /** ISO-8601 timestamp when the job was enqueued. */
  created_at: string;
  /** ISO-8601 timestamp when the job completed. Null/absent for unfinished jobs. */
  completed_at?: string;
  /** Top-level error message. Present only when `status === "failed"`. */
  error_message?: string;
}

/**
 * Response for `GET /api/v1/census-reports/files/{file_id}/info`.
 */
export interface CensusReportFileInfoResponse {
  /** Server-chosen filename (post-template expansion). */
  file_name: string;
  /** Company UUID this file belongs to. */
  company_uuid: string;
  /** ISO-8601 creation timestamp. */
  created_at: string;
  /** ISO-8601 expiration timestamp (after which the file is deleted). */
  expires_at: string;
  /** Whether the file still exists on disk. */
  file_exists: boolean;
  /** Size in bytes. Zero for deleted files. */
  file_size_bytes: number;
}

/**
 * Compact summary for the user's jobs list.
 */
export interface CensusReportJobSummary {
  /** Job UUID. */
  job_id: string;
  /** Current lifecycle state. */
  status: CensusReportJobStatus;
  /** Total target companies. */
  total: number;
  /** Files completed so far. */
  current: number;
  /** Completion percentage (0-100). */
  percentage: number;
  /** ISO-8601 enqueue timestamp. */
  created_at: string;
  /** ISO-8601 completion timestamp, if applicable. */
  completed_at?: string;
}

/**
 * Response for `GET /api/v1/census-reports/jobs`.
 */
export interface CensusReportJobsListResponse {
  /** Jobs visible to the current user, ordered by recency (desc). */
  jobs: CensusReportJobSummary[];
  /** Total count (equals `jobs.length` today — the endpoint is unpaginated). */
  total: number;
}
