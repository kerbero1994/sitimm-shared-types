/**
 * Email census ingestion — barrel re-export.
 *
 * Backend: `app/presentation/api/automation/routes.py` (mini-back) — API-
 * key gated automation surface that powers the IMAP → census pipeline,
 * sender-trust tiering, transformation-rule editor, cron schedule
 * editor, and processing-log explorer used by `new_dashboard`.
 *
 * The full ingestion surface is V1-only (no V2 router today).
 *
 * ```ts
 * import { EmailCensusPendingFile, EMAIL_CENSUS_ENDPOINTS }
 *   from "@kerbero1994/shared-types";
 * // or
 * import * as EmailCensus from "@kerbero1994/shared-types/emailCensusIngestion";
 * ```
 */

export * from "./types";
export * from "./endpoints";
