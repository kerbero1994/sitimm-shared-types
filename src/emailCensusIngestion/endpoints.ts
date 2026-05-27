/**
 * Email census ingestion endpoint paths.
 *
 * Backend: `app/presentation/api/automation/routes.py` mounted at
 * `/api/v1/automation/...` in `app/main.py`.
 *
 * Auth: every endpoint is gated by an API key (`verify_api_key`), not a
 * JWT. The dashboard's environment carries the key as a request header.
 *
 * The full ingestion surface is V1-only — there is no `/api/v2/`
 * counterpart today. When V2 lands, add a `_V2_ENDPOINTS` group alongside
 * this one.
 */

const PREFIX = "/api/v1/automation";

export const EMAIL_CENSUS_ENDPOINTS = {
  // ── Health ─────────────────────────────────────────────────
  /** GET → EmailCensusHealthCheck. Public read; API key still required. */
  HEALTH: `${PREFIX}/health`,

  // ── Authorized emails ──────────────────────────────────────
  /** GET → EmailCensusAuthorizedEmail[]. Query: active_only. */
  AUTHORIZED_EMAILS_LIST: `${PREFIX}/authorized-emails`,
  /** GET → EmailCensusAuthorizedEmail. */
  AUTHORIZED_EMAIL_GET: `${PREFIX}/authorized-emails/{email_id}`,
  /** POST → Body: EmailCensusAuthorizedEmailCreate. Returns EmailCensusAuthorizedEmail. Status 201. */
  AUTHORIZED_EMAIL_CREATE: `${PREFIX}/authorized-emails`,
  /** PUT → Body: EmailCensusAuthorizedEmailUpdate. Returns EmailCensusAuthorizedEmail. */
  AUTHORIZED_EMAIL_UPDATE: `${PREFIX}/authorized-emails/{email_id}`,
  /** DELETE → 204. */
  AUTHORIZED_EMAIL_DELETE: `${PREFIX}/authorized-emails/{email_id}`,
  /** POST → Body: EmailCensusAuthorizedEmailCompaniesUpdate. Returns { status, companies }. */
  AUTHORIZED_EMAIL_COMPANIES: `${PREFIX}/authorized-emails/{email_id}/companies`,
  /** PUT → Body: EmailCensusAuthorizedEmailRolesUpdate. Returns { status, roles }. */
  AUTHORIZED_EMAIL_ROLES: `${PREFIX}/authorized-emails/{email_id}/roles`,

  // ── Manager emails (notification recipients) ───────────────
  /** GET → EmailCensusManagerEmail[]. Query: active_only. */
  MANAGER_EMAILS_LIST: `${PREFIX}/manager-emails`,
  /** GET → EmailCensusManagerEmail. */
  MANAGER_EMAIL_GET: `${PREFIX}/manager-emails/{email_id}`,
  /** POST → Body: EmailCensusManagerEmailCreate. Returns EmailCensusManagerEmail. Status 201. */
  MANAGER_EMAIL_CREATE: `${PREFIX}/manager-emails`,
  /** PUT → Body: EmailCensusManagerEmailUpdate. Returns EmailCensusManagerEmail. */
  MANAGER_EMAIL_UPDATE: `${PREFIX}/manager-emails/{email_id}`,
  /** DELETE → 204. */
  MANAGER_EMAIL_DELETE: `${PREFIX}/manager-emails/{email_id}`,

  // ── Transformation rules ───────────────────────────────────
  /** GET → EmailCensusTransformationRule[]. Query: active_only. */
  TRANSFORMATION_RULES_LIST: `${PREFIX}/transformation-rules`,
  /** GET → EmailCensusTransformationRule. */
  TRANSFORMATION_RULE_GET: `${PREFIX}/transformation-rules/{rule_id}`,
  /** POST → Body: EmailCensusTransformationRuleCreate. Returns EmailCensusTransformationRule. Status 201. */
  TRANSFORMATION_RULE_CREATE: `${PREFIX}/transformation-rules`,
  /** PUT → Body: EmailCensusTransformationRuleUpdate. Returns EmailCensusTransformationRule. */
  TRANSFORMATION_RULE_UPDATE: `${PREFIX}/transformation-rules/{rule_id}`,
  /** DELETE → 204. */
  TRANSFORMATION_RULE_DELETE: `${PREFIX}/transformation-rules/{rule_id}`,

  // ── File processing (manual upload) ────────────────────────
  /** POST → multipart/form-data with `file` field. Returns EmailCensusFileProcessResponse. */
  PROCESS_FILE: `${PREFIX}/process-file`,

  // ── Email automation control ───────────────────────────────
  /** POST → { status, message }. Manual IMAP poll trigger. */
  START_EMAIL_AUTOMATION: `${PREFIX}/start`,

  // ── Cronjob control + jobs list ────────────────────────────
  /** GET → EmailCensusCronJobStatus. */
  CRONJOB_STATUS: `${PREFIX}/cronjob/status`,
  /** POST → Body: EmailCensusCronJobControlRequest. Returns { status }. */
  CRONJOB_CONTROL: `${PREFIX}/cronjob/control`,
  /** GET → EmailCensusAllCronJobsResponse. */
  CRONJOB_JOBS: `${PREFIX}/cronjob/jobs`,
  /** PUT → Body: EmailCensusCronScheduleConfig. Returns { status, job }. */
  CRONJOB_SCHEDULE: `${PREFIX}/cronjob/schedule`,

  // ── Email accounts (IMAP credentials) ──────────────────────
  /** GET → EmailCensusEmailAccount[]. Query: active_only. */
  EMAIL_ACCOUNTS_LIST: `${PREFIX}/email-accounts`,
  /** GET → EmailCensusEmailAccount. */
  EMAIL_ACCOUNT_GET: `${PREFIX}/email-accounts/{account_id}`,
  /** POST → Body: EmailCensusEmailAccountCreate. Returns EmailCensusEmailAccount. Status 201. */
  EMAIL_ACCOUNT_CREATE: `${PREFIX}/email-accounts`,
  /** PUT → Body: EmailCensusEmailAccountUpdate. Returns EmailCensusEmailAccount. */
  EMAIL_ACCOUNT_UPDATE: `${PREFIX}/email-accounts/{account_id}`,
  /** DELETE → 204. */
  EMAIL_ACCOUNT_DELETE: `${PREFIX}/email-accounts/{account_id}`,
  /** POST → Body: EmailCensusEmailAccountTestRequest. Returns EmailCensusEmailAccountTestResponse. */
  EMAIL_ACCOUNT_TEST: `${PREFIX}/email-accounts/test`,
  /** GET → Diagnostic envelope (folder list + unread + recent emails). */
  EMAIL_ACCOUNT_DIAGNOSE: `${PREFIX}/email-accounts/{account_id}/diagnose`,
  /** POST → Per-account or per-fleet IMAP poll. Returns { status, accounts_processed, results[] }. */
  EMAIL_ACCOUNT_PROCESS_NOW: `${PREFIX}/email-accounts/process-now`,
  /** PUT → Body: EmailCensusEmailAccountScheduleUpdate. Returns EmailCensusEmailAccountSchedule. */
  EMAIL_ACCOUNT_SCHEDULE: `${PREFIX}/email-accounts/{account_id}/schedule`,
  /** GET → EmailCensusEmailAccountSchedule. */
  EMAIL_ACCOUNT_NEXT_RUNS: `${PREFIX}/email-accounts/{account_id}/next-runs`,
  /** POST → Body: EmailCensusCronValidationRequest. Returns EmailCensusCronValidationResponse. */
  EMAIL_ACCOUNT_VALIDATE_CRON: `${PREFIX}/email-accounts/validate-cron`,

  // ── Pending census files (approval queue) ──────────────────
  /** GET → EmailCensusPendingFile[]. Query: status, company_id, skip, limit. */
  PENDING_FILES_LIST: `${PREFIX}/pending-census-files`,
  /** GET → EmailCensusPendingFilesCount. */
  PENDING_FILES_COUNT: `${PREFIX}/pending-census-files/count`,
  /** GET → EmailCensusPendingFile. */
  PENDING_FILE_GET: `${PREFIX}/pending-census-files/{file_id}`,
  /** POST → Body: EmailCensusAssignPendingFileRequest. Returns { status, file_id, company_id }. */
  PENDING_FILE_ASSIGN: `${PREFIX}/pending-census-files/{file_id}/assign`,
  /** POST → Body: EmailCensusRejectPendingFileRequest. Returns { status, file_id, reason }. */
  PENDING_FILE_REJECT: `${PREFIX}/pending-census-files/{file_id}/reject`,
  /** POST → Full-file pipeline run. Returns { status, file_id, census_id, processing_log_id, stats, errors, warnings }. */
  PENDING_FILE_PROCESS: `${PREFIX}/pending-census-files/{file_id}/process`,
  /** DELETE → 204. */
  PENDING_FILE_DELETE: `${PREFIX}/pending-census-files/{file_id}`,

  // ── Sender trust ───────────────────────────────────────────
  /** GET → EmailCensusSenderTrust[]. Query: tier. */
  SENDER_TRUST_LIST: `${PREFIX}/sender-trust`,
  /** GET → EmailCensusSenderTrust. */
  SENDER_TRUST_GET: `${PREFIX}/sender-trust/{email}`,
  /** PUT → Query: new_tier. Returns { status, email, new_tier }. */
  SENDER_TRUST_PROMOTE: `${PREFIX}/sender-trust/{email}/promote`,
  /** PUT → Returns { status: "blocked", email }. */
  SENDER_TRUST_BLOCK: `${PREFIX}/sender-trust/{email}/block`,
  /** PUT → Returns { status: "unblocked", email }. */
  SENDER_TRUST_UNBLOCK: `${PREFIX}/sender-trust/{email}/unblock`,

  // ── Processing logs ────────────────────────────────────────
  /** GET → EmailCensusProcessingLog[]. Query: company_id, source_type, status, start_date, end_date, skip, limit. */
  PROCESSING_LOGS_LIST: `${PREFIX}/census-processing-logs`,
  /** GET → EmailCensusProcessingLog. */
  PROCESSING_LOG_GET: `${PREFIX}/census-processing-logs/{log_id}`,
  /** GET → EmailCensusProcessingStatsSummary. Query: days. */
  PROCESSING_LOGS_SUMMARY: `${PREFIX}/census-processing-logs/stats/summary`,
  /** GET → EmailCensusProcessingStatsCompany. Query: days. */
  PROCESSING_LOGS_COMPANY: `${PREFIX}/census-processing-logs/stats/company/{company_id}`,
} as const;

export type EmailCensusEndpointKey = keyof typeof EMAIL_CENSUS_ENDPOINTS;
export type EmailCensusEndpoint =
  (typeof EMAIL_CENSUS_ENDPOINTS)[EmailCensusEndpointKey];
