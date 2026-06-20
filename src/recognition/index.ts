/**
 * Advisor recognition — a guest (INVITADO) requests recognition + upgrade to
 * EMPLOYEE by an advisor (name + company + RFC/CURP/NSS → advisor approval).
 *
 * Backend: mini-back account-gdpr-recognition (PR mini-back#94).
 *   POST /api/v2/recognition-requests           (INVITADO intake)
 *   GET  /api/v2/recognition-requests/me        (own status)
 *   GET  /api/v2/recognition-requests           (advisor queue, company-scoped)
 *   GET  /api/v2/recognition-requests/{uuid}    (advisor detail)
 *   POST /api/v2/recognition-requests/{uuid}/approve | /reject (advisor)
 */

/** Official id type the guest submits. */
export type RecognitionIdType = "rfc" | "curp" | "nss";

/** Recognition request lifecycle. */
export type RecognitionStatus = "pending" | "approved" | "rejected";

/**
 * Body for POST /api/v2/recognition-requests.
 * Anti-enumeration: the response is always `pending` regardless of whether the
 * id matches a real employee.
 */
export interface RecognitionCreateV2Request {
  /** First name(s). 1–100 chars. */
  firstName: string;
  /** Last name(s). 1–100 chars. */
  lastName: string;
  /** Company name. 1–200 chars. */
  companyName: string;
  /** Which official id is supplied. */
  idType: RecognitionIdType;
  /** The id value (RFC/CURP/NSS); stored as a keyed HMAC server-side. */
  idValue: string;
}

/** Own request status — POST response + GET /me (unwrapped). `null` if none. */
export interface RecognitionStatusV2Response {
  requestUuid: string;
  status: RecognitionStatus;
}

/**
 * Advisor/admin queue item — NEVER exposes the id value / hmac.
 * Backend: RecognitionAdminItem.
 */
export interface RecognitionAdminItemV2 {
  requestUuid: string;
  firstName: string;
  lastName: string;
  companyName: string;
  idType: RecognitionIdType;
  status: RecognitionStatus;
  /** Resolved company; null = unassigned (admin-only). */
  companyId: number | null;
  /** ISO-8601. */
  createdAt: string | null;
}

/** Response from GET /api/v2/recognition-requests (advisor queue, unwrapped). */
export interface RecognitionListV2Response {
  items: RecognitionAdminItemV2[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Body for POST /api/v2/recognition-requests/{uuid}/approve.
 * The admin may supply the matched Employee for a CURP/NSS request that didn't
 * auto-resolve one (RFC requests resolve it automatically).
 */
export interface RecognitionApproveV2Request {
  employeeId?: number | null;
}

/** Body for POST /api/v2/recognition-requests/{uuid}/reject. */
export interface RecognitionRejectV2Request {
  reason?: string | null;
}
