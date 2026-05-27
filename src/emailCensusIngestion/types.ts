/**
 * Email census ingestion types — automated email-to-census pipeline.
 *
 * Backend: `app/presentation/schemas/automation.py` +
 * `app/presentation/api/automation/routes.py` (mini-back).
 *
 * The ingestion surface is V1-only (the router mounts at
 * `/api/v1/automation/...` and uses API-key auth, not JWT). Three
 * frontends consume it:
 *
 * - `new_dashboard` — admin approval queue, sender-trust management,
 *   processing-log explorer.
 * - `mini-back` itself — internal Celery dispatchers (`email_census_tasks`)
 *   call these schemas through the in-process service layer.
 *
 * Wire conventions:
 * - Pydantic uses snake_case for response/request bodies (except for the
 *   `userType` field on the Ask surface, which lives in another module).
 * - Enums are exported as string-literal unions (Pydantic `StrEnum`
 *   serialises by value).
 * - All `*_at` fields are ISO 8601 strings.
 * - `uuid` is UUID v4 string.
 */

// ─────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────

/**
 * Lifecycle status of one row in the pending-files queue.
 * Backend: `PendingFileStatus` in `schemas/automation.py`.
 */
export const EMAIL_CENSUS_PENDING_FILE_STATUSES = [
  "pending",
  "assigned",
  "processing",
  "auto_processing",
  "completed",
  "rejected",
  "failed",
] as const;
export type EmailCensusPendingFileStatus =
  (typeof EMAIL_CENSUS_PENDING_FILE_STATUSES)[number];

/**
 * Outcome status of a single census processing run.
 * Backend: `ProcessingLogStatus`.
 */
export const EMAIL_CENSUS_PROCESSING_LOG_STATUSES = [
  "success",
  "partial",
  "failed",
] as const;
export type EmailCensusProcessingLogStatus =
  (typeof EMAIL_CENSUS_PROCESSING_LOG_STATUSES)[number];

/**
 * Origin of the census file. `email` = ingested from an IMAP poller,
 * `api` = uploaded via mini-back's REST surface, `manual` = ingested
 * from an admin-uploaded file.
 * Backend: `SourceType`.
 */
export const EMAIL_CENSUS_SOURCE_TYPES = ["email", "api", "manual"] as const;
export type EmailCensusSourceType = (typeof EMAIL_CENSUS_SOURCE_TYPES)[number];

/**
 * Role-flag set on an `AuthorizedEmail` row. One email can carry many
 * roles.
 * Backend: `EmailRole`.
 */
export const EMAIL_CENSUS_EMAIL_ROLES = [
  "imap_source",
  "notification_recipient",
  "error_recipient",
  "summary_recipient",
] as const;
export type EmailCensusEmailRole = (typeof EMAIL_CENSUS_EMAIL_ROLES)[number];

/**
 * Health states of the email-poller cron job.
 * Backend: `JobStatus`.
 */
export const EMAIL_CENSUS_JOB_STATUSES = [
  "running",
  "paused",
  "error",
  "no_job",
  "not_initialized",
] as const;
export type EmailCensusJobStatus = (typeof EMAIL_CENSUS_JOB_STATUSES)[number];

/**
 * Transformation operation kind on a per-company rewrite rule.
 * Backend: `RuleType`.
 */
export const EMAIL_CENSUS_RULE_TYPES = [
  "split",
  "concat",
  "autoincrement",
  "education_from_years",
  "constant",
] as const;
export type EmailCensusRuleType = (typeof EMAIL_CENSUS_RULE_TYPES)[number];

/**
 * Detection layers consulted by the rule cascade. Multiple sources can
 * stack on a single `DetectedCandidate.sources` list.
 * Backend: `CompanyCandidate.sources` in
 * `app/application/services/census/rule_cascade.py`.
 */
export const EMAIL_CENSUS_DETECTION_SOURCES = [
  "authorized_email",
  "sender_history",
  "filename_match",
  "fingerprint",
  "ai_classifier",
] as const;
export type EmailCensusDetectionSource =
  (typeof EMAIL_CENSUS_DETECTION_SOURCES)[number];

/**
 * Auto-routing decision returned by the trust-tier engine.
 * Backend: `Action` enum in
 * `app/application/services/census/trust_tier_engine.py`.
 */
export const EMAIL_CENSUS_TRUST_ACTIONS = [
  "must_approve",
  "recommended",
  "auto_process",
] as const;
export type EmailCensusTrustAction =
  (typeof EMAIL_CENSUS_TRUST_ACTIONS)[number];

/**
 * 4-tier sender-trust level.
 * - 0: blocked / fresh / demoted — always queue for approval.
 * - 1: candidate — show as "recommended" but require approval.
 * - 2: verified — auto-process with audit log.
 * - 3: gold — auto-process and skip the audit alert.
 */
export type EmailCensusTrustTier = 0 | 1 | 2 | 3;

// ─────────────────────────────────────────────────────────────────────
// Common refs
// ─────────────────────────────────────────────────────────────────────

/**
 * Compact company reference shipped on responses that need to name a
 * resolved company without the full hydration.
 * Backend: `CompanyRef`.
 */
export interface EmailCensusCompanyRef {
  id: number;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────
// Authorized emails (multi-company + roles)
// ─────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /authorized-emails`.
 * Backend: `AuthorizedEmailCreate`.
 */
export interface EmailCensusAuthorizedEmailCreate {
  email: string;
  /** Legacy single-company shorthand — prefer `company_ids`. */
  company_name?: string | null;
  /** New canonical multi-company list. Defaults to `[]` server-side. */
  company_ids?: number[];
  /** Defaults to `["imap_source"]` server-side when omitted. */
  roles?: EmailCensusEmailRole[];
  /** Defaults to `true`. */
  is_active?: boolean;
  notes?: string | null;
}

/**
 * Body for `PUT /authorized-emails/{email_id}`.
 * Backend: `AuthorizedEmailUpdate`. Every field is optional — only
 * present keys are written.
 */
export interface EmailCensusAuthorizedEmailUpdate {
  email?: string | null;
  company_name?: string | null;
  company_ids?: number[] | null;
  roles?: EmailCensusEmailRole[] | null;
  is_active?: boolean | null;
  notes?: string | null;
}

/**
 * Read shape for one authorized email.
 * Backend: `AuthorizedEmailResponse`.
 */
export interface EmailCensusAuthorizedEmail {
  id: number;
  email: string;
  /** Legacy single-company field. */
  company_name?: string | null;
  companies: EmailCensusCompanyRef[];
  roles: EmailCensusEmailRole[];
  is_active: boolean;
  notes: string | null;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

/** Body for `POST /authorized-emails/{email_id}/companies`. */
export interface EmailCensusAuthorizedEmailCompaniesUpdate {
  company_ids: number[];
}

/** Body for `PUT /authorized-emails/{email_id}/roles`. */
export interface EmailCensusAuthorizedEmailRolesUpdate {
  roles: EmailCensusEmailRole[];
}

// ─────────────────────────────────────────────────────────────────────
// Manager emails (notification recipients)
// ─────────────────────────────────────────────────────────────────────

/** Body for `POST /manager-emails`. Backend: `ManagerEmailCreate`. */
export interface EmailCensusManagerEmailCreate {
  email: string;
  name: string;
  department?: string | null;
  /** Defaults to `true`. */
  is_active?: boolean;
}

/** Body for `PUT /manager-emails/{email_id}`. Backend: `ManagerEmailUpdate`. */
export interface EmailCensusManagerEmailUpdate {
  email?: string | null;
  name?: string | null;
  department?: string | null;
  is_active?: boolean | null;
}

/** Backend: `ManagerEmailResponse`. */
export interface EmailCensusManagerEmail {
  id: number;
  email: string;
  name: string;
  department: string | null;
  is_active: boolean;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Transformation rules (per-company column rewrites)
// ─────────────────────────────────────────────────────────────────────

/** Backend: `ComputedFieldRule`. */
export interface EmailCensusComputedFieldRule {
  type: EmailCensusRuleType;
  source?: string | null;
  columns?: string[] | null;
  separator?: string | null;
  index?: number | null;
  start?: number | null;
  /** Free-form value (string / number / boolean depending on rule). */
  value?: unknown;
}

/** Backend: `TransformationRuleCreate`. */
export interface EmailCensusTransformationRuleCreate {
  company_name: string;
  /** Defaults to `0`. */
  header_row?: number;
  /** Defaults to `[]`. */
  skip_rows?: number[];
  /** Defaults to `[]`. */
  columns_to_drop?: string[];
  /** Defaults to `{}`. */
  rename?: Record<string, string>;
  /** Defaults to `{}`. */
  computed?: Record<string, EmailCensusComputedFieldRule>;
  /** Defaults to `[]`. */
  keep_only?: string[];
  /** Defaults to `true`. */
  is_active?: boolean;
  notes?: string | null;
}

/** Backend: `TransformationRuleUpdate`. Every field optional. */
export interface EmailCensusTransformationRuleUpdate {
  company_name?: string | null;
  header_row?: number | null;
  skip_rows?: number[] | null;
  columns_to_drop?: string[] | null;
  rename?: Record<string, string> | null;
  computed?: Record<string, EmailCensusComputedFieldRule> | null;
  keep_only?: string[] | null;
  is_active?: boolean | null;
  notes?: string | null;
}

/** Backend: `TransformationRuleResponse`. */
export interface EmailCensusTransformationRule {
  id: number;
  company_name: string;
  header_row: number;
  skip_rows: number[];
  columns_to_drop: string[];
  rename: Record<string, string>;
  /** Stored as a free-form dict on the wire (lazy-typed). */
  computed: Record<string, unknown>;
  keep_only: string[];
  is_active: boolean;
  notes: string | null;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// File processing (manual single-file submit)
// ─────────────────────────────────────────────────────────────────────

/**
 * One row-level validation error reported by the file transformer.
 * Backend: `ValidationError`.
 */
export interface EmailCensusValidationError {
  row: number;
  column: string;
  /** Captured cell value (string / number / null depending on column). */
  value: unknown;
  error: string;
}

/**
 * Outcome of `POST /process-file`.
 * Backend: `FileProcessResponse`.
 */
export interface EmailCensusFileProcessResponse {
  success: boolean;
  message: string;
  original_filename: string;
  processed_filename: string | null;
  rows_processed: number;
  rows_valid: number;
  rows_invalid: number;
  validation_errors: EmailCensusValidationError[];
  /** Download path on this API host — null when no file was produced. */
  download_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Email accounts (IMAP credentials)
// ─────────────────────────────────────────────────────────────────────

/** Backend: `EmailAccountCreate`. */
export interface EmailCensusEmailAccountCreate {
  name: string;
  email: string;
  /** Encrypted server-side before persistence. */
  app_password: string;
  imap_host?: string;
  imap_port?: number;
  use_ssl?: boolean;
  is_active?: boolean;
  is_primary?: boolean;
  /** Legacy poll interval. */
  check_interval_minutes?: number;
  /** Defaults to `"INBOX"`. */
  folder?: string;
  cron_expression?: string;
  cron_timezone?: string;
}

/** Backend: `EmailAccountUpdate`. Every field optional. */
export interface EmailCensusEmailAccountUpdate {
  name?: string | null;
  email?: string | null;
  app_password?: string | null;
  imap_host?: string | null;
  imap_port?: number | null;
  use_ssl?: boolean | null;
  is_active?: boolean | null;
  is_primary?: boolean | null;
  check_interval_minutes?: number | null;
  folder?: string | null;
  cron_expression?: string | null;
  cron_timezone?: string | null;
}

/**
 * Read shape for an email account. The encrypted `app_password` is
 * never returned over the wire.
 * Backend: `EmailAccountResponse`.
 */
export interface EmailCensusEmailAccount {
  id: number;
  /** UUID v4. */
  uuid: string;
  name: string;
  email: string;
  imap_host: string;
  imap_port: number;
  use_ssl: boolean;
  is_active: boolean;
  is_primary: boolean;
  check_interval_minutes: number;
  folder: string;
  cron_expression?: string | null;
  cron_timezone?: string | null;
  /** ISO 8601 — null when never scheduled. */
  next_check_at?: string | null;
  /** ISO 8601 — null when never polled. */
  last_checked_at: string | null;
  last_error: string | null;
  emails_processed: number;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

/** Backend: `EmailAccountTestRequest`. */
export interface EmailCensusEmailAccountTestRequest {
  email_account_id: number;
}

/** Backend: `EmailAccountTestResponse`. */
export interface EmailCensusEmailAccountTestResponse {
  success: boolean;
  message: string;
  unread_count: number | null;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Cron scheduling
// ─────────────────────────────────────────────────────────────────────

/** Backend: `CronJobStatusResponse`. */
export interface EmailCensusCronJobStatus {
  status: EmailCensusJobStatus;
  /** ISO 8601 — null when never run. */
  last_run: string | null;
  /** ISO 8601 — null when paused / not scheduled. */
  next_run: string | null;
  schedule: string;
  enabled: boolean;
}

/** Backend: `CronJobControlRequest`. */
export interface EmailCensusCronJobControlRequest {
  /** `"start"` (resume) or `"pause"`. */
  action: string;
}

/** Backend: `CronScheduleConfig`. */
export interface EmailCensusCronScheduleConfig {
  /** Job identifier, e.g. `"email_processor"`, `"census_processor"`. */
  job_id: string;
  enabled?: boolean;
  interval_hours?: number | null;
  interval_minutes?: number | null;
  /** Custom cron expression — overrides interval when set. */
  cron_expression?: string | null;
}

/** Backend: `CronScheduleResponse`. */
export interface EmailCensusCronSchedule {
  job_id: string;
  enabled: boolean;
  schedule: string;
  /** ISO 8601 — null when paused. */
  next_run: string | null;
  /** ISO 8601 — null when never run. */
  last_run: string | null;
}

/** Backend: `AllCronJobsResponse`. */
export interface EmailCensusAllCronJobsResponse {
  jobs: EmailCensusCronSchedule[];
  scheduler_running: boolean;
}

/** Backend: `EmailAccountScheduleUpdate`. */
export interface EmailCensusEmailAccountScheduleUpdate {
  /** 5-token cron expression — server-validated against `croniter`. */
  cron_expression: string;
  /** IANA timezone — defaults to `"America/Mexico_City"`. */
  cron_timezone?: string;
}

/** Backend: `EmailAccountScheduleResponse`. */
export interface EmailCensusEmailAccountSchedule {
  id: number;
  email: string;
  cron_expression: string;
  cron_timezone: string;
  /** ISO 8601 — null when never scheduled. */
  next_check_at: string | null;
  /** ISO 8601 list — next 5 occurrences. */
  next_runs: string[];
}

/** Backend: `CronValidationRequest`. */
export interface EmailCensusCronValidationRequest {
  cron_expression: string;
  /** Defaults to `"America/Mexico_City"`. */
  timezone?: string;
}

/** Backend: `CronValidationResponse`. */
export interface EmailCensusCronValidationResponse {
  valid: boolean;
  message: string;
  /** ISO 8601 list — next 5 occurrences (empty when invalid). */
  next_runs: string[];
  description: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Pending census files (approval queue)
// ─────────────────────────────────────────────────────────────────────

/**
 * One company-classification candidate produced by the rule cascade
 * and/or AI classifier.
 * Backend: `DetectedCandidate`.
 */
export interface EmailCensusDetectedCandidate {
  company_name: string;
  /** Confidence score 0..1. */
  confidence: number;
  /** At least one detection source — multiple stack on a single row. */
  sources: EmailCensusDetectionSource[];
}

/**
 * Read shape for one row in the pending-files approval queue.
 * Backend: `PendingCensusFileResponse`.
 */
export interface EmailCensusPendingFile {
  id: number;
  /** UUID v4. */
  uuid: string;
  filename: string;
  /** S3 URL (signed download). */
  file_url: string;
  file_size_bytes: number | null;
  sender_email: string;
  subject: string | null;
  /** ISO 8601. */
  received_at: string;
  detected_candidates: EmailCensusDetectedCandidate[];
  detection_source: string | null;
  status: EmailCensusPendingFileStatus;
  assigned_company: EmailCensusCompanyRef | null;
  assigned_by_email: string | null;
  /** ISO 8601 — null when not yet assigned. */
  assigned_at: string | null;
  rejection_reason: string | null;
  rejection_message: string | null;
  processed_census_id: number | null;
  /** ISO 8601 — null when not yet processed. */
  processed_at: string | null;
  /** ISO 8601. */
  created_at: string;
  /** ISO 8601. */
  updated_at: string;
}

/** Body for `POST /pending-census-files/{file_id}/assign`. */
export interface EmailCensusAssignPendingFileRequest {
  company_id: number;
}

/** Body for `POST /pending-census-files/{file_id}/reject`. */
export interface EmailCensusRejectPendingFileRequest {
  /** Max 100 chars. */
  reason: string;
  message?: string | null;
}

/** Backend: `PendingFilesCountResponse`. */
export interface EmailCensusPendingFilesCount {
  pending_count: number;
  assigned_count: number;
  processing_count: number;
  total_actionable: number;
}

// ─────────────────────────────────────────────────────────────────────
// Processing logs
// ─────────────────────────────────────────────────────────────────────

/**
 * Per-field "missing" counters — how many rows lacked each field.
 * Backend: `MissingFieldsStats`.
 */
export interface EmailCensusMissingFieldsStats {
  rfc: number;
  nss: number;
  curp: number;
  email: number;
  phone: number;
  address: number;
  birthdate: number;
  salary: number;
}

/**
 * Read shape for one processing-log row.
 * Backend: `ProcessingLogResponse`.
 */
export interface EmailCensusProcessingLog {
  id: number;
  /** UUID v4. */
  uuid: string;
  census_id: number | null;
  company_id: number;
  company_name: string | null;
  pending_file_id: number | null;
  source_type: EmailCensusSourceType;
  source_email: string | null;
  original_filename: string | null;
  employees_total: number;
  employees_new: number;
  employees_updated: number;
  employees_removed: number;
  /** 0..1 — null when not computed. */
  data_capture_rate: number | null;
  /** Loose map; non-empty fields mirror `MissingFieldsStats`. */
  missing_fields: Record<string, number>;
  status: EmailCensusProcessingLogStatus;
  error_message: string | null;
  processing_time_ms: number | null;
  /** Server-computed: `True` when the rollback token is still valid. */
  rollback_available: boolean;
  /** ISO 8601 — null when no rollback window. */
  rollback_expires_at: string | null;
  /** ISO 8601. */
  processed_at: string;
  /** ISO 8601. */
  created_at: string;
}

/** Backend: `TopCompany`. */
export interface EmailCensusTopCompany {
  id: number;
  name: string;
  process_count: number;
}

/** Backend: `ProcessingStatsSummary`. */
export interface EmailCensusProcessingStatsSummary {
  total_processes: number;
  successful: number;
  partial: number;
  failed: number;
  companies_processed: number;
  total_employees: number;
  /** 0..1. */
  avg_capture_rate: number;
  avg_processing_time_ms: number;
  top_companies: EmailCensusTopCompany[];
  /** Days included in the rolling window (default 7). */
  period_days: number;
}

/** Backend: `ProcessingStatsCompany`. */
export interface EmailCensusProcessingStatsCompany {
  total_processes: number;
  successful: number;
  partial: number;
  failed: number;
  total_employees_processed: number;
  total_employees_new: number;
  total_employees_updated: number;
  total_employees_removed: number;
  avg_data_capture_rate: number;
  avg_processing_time_ms: number;
  from_email: number;
  from_api: number;
  from_manual: number;
}

// ─────────────────────────────────────────────────────────────────────
// Email-poller live reports (manual / cron triggers)
// ─────────────────────────────────────────────────────────────────────

/** Backend: `ProcessedAttachmentResponse`. */
export interface EmailCensusProcessedAttachment {
  original_filename: string;
  status: string;
  processed_filename: string | null;
  error: string | null;
}

/** Backend: `EmailProcessingResult`. */
export interface EmailCensusEmailProcessingResult {
  message_uid: string;
  sender: string;
  subject: string | null;
  /** ISO 8601 — server emits an unparsed RFC-822 date string when set. */
  received_at: string | null;
  status: string;
  company_name: string | null;
  sent_email_id: string | null;
  error: string | null;
  attachments: EmailCensusProcessedAttachment[];
}

/** Backend: `EmailProcessingSummary`. */
export interface EmailCensusEmailProcessingSummary {
  total_messages: number;
  processed_messages: number;
  skipped_messages: number;
  results: EmailCensusEmailProcessingResult[];
}

// ─────────────────────────────────────────────────────────────────────
// Sender trust (raw dict; no Pydantic schema today)
// ─────────────────────────────────────────────────────────────────────

/**
 * Read shape for one `sender_trust` row. The endpoint returns the raw
 * SQL row mapping so this contract may evolve when a Pydantic schema is
 * added.
 *
 * Backend: `sender_trust` table dump via
 * `GET /sender-trust` / `GET /sender-trust/{email}`.
 */
export interface EmailCensusSenderTrust {
  id: number;
  /** UUID v4. */
  uuid: string;
  email: string;
  trust_tier: EmailCensusTrustTier;
  successful_count: number;
  rejected_count: number;
  /** ISO 8601 — null when never successful. */
  last_success_at: string | null;
  /** ISO 8601 — null when never rejected. */
  last_rejection_at: string | null;
  promoted_by_user_id: number | null;
  /** ISO 8601 — null when never manually promoted. */
  promoted_at: string | null;
  demotion_reason: string | null;
  notes: string | null;
  is_blocked: boolean;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. */
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────
// Misc
// ─────────────────────────────────────────────────────────────────────

/** Backend: `HealthCheckResponse`. */
export interface EmailCensusHealthCheck {
  status: string;
  version: string;
  environment: string;
  /** ISO 8601. */
  timestamp: string;
}
