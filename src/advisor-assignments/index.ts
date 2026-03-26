/**
 * Advisor-company assignment types for the SITIMM ecosystem.
 *
 * Backend source: app/presentation/schemas/advisor_assignment.py
 * Router: app/presentation/api/v2/advisor_assignments_v2.py
 *
 * All fields use snake_case (matching BE Pydantic field names, no aliases).
 */

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

/** POST /advisor-assignments/assign — assign companies to an advisor. Admin+ only. */
export interface AssignRequest {
  /** UUID of the advisor to assign companies to. */
  advisor_uuid: string;
  /** List of company UUIDs to assign (min 1). */
  company_uuids: string[];
}

/** POST /advisor-assignments/unassign — remove a company from an advisor. Admin+ only. */
export interface UnassignRequest {
  /** UUID of the advisor. */
  advisor_uuid: string;
  /** UUID of the company to unassign. */
  company_uuid: string;
}

// ---------------------------------------------------------------------------
// Shared info types
// ---------------------------------------------------------------------------

/** Company info within an assignment context. */
export interface CompanyAssignmentInfo {
  /** Company UUID. */
  uuid: string;
  /** Company name. */
  name: string;
  /** Number of employees in this company (null if not computed). */
  employee_count: number | null;
  /** ISO datetime when the assignment was created. */
  assigned_at: string;
}

/** Advisor info within an assignment context. */
export interface AdvisorInfo {
  /** Advisor user UUID. */
  uuid: string;
  /** Advisor display name. */
  name: string;
  /** Headquarter name the advisor belongs to (null if none). */
  headquarter: string | null;
}

/** Advisor info with assignment date (used in by-company responses). */
export interface AdvisorAssignmentInfo {
  /** Advisor user UUID. */
  uuid: string;
  /** Advisor display name. */
  name: string;
  /** Headquarter name (null if none). */
  headquarter: string | null;
  /** ISO datetime when assigned. */
  assigned_at: string;
}

// ---------------------------------------------------------------------------
// Response schemas
// ---------------------------------------------------------------------------

/** Response for POST /advisor-assignments/assign. */
export interface AssignResponse {
  /** UUID of the advisor that was assigned. */
  advisor_uuid: string;
  /** Advisor display name. */
  advisor_name: string;
  /** Companies that were assigned. */
  companies: CompanyAssignmentInfo[];
  /** Total number of companies assigned in this request. */
  total: number;
}

/** Response for POST /advisor-assignments/unassign. */
export interface UnassignResponse {
  /** UUID of the advisor. */
  advisor_uuid: string;
  /** UUID of the company that was unassigned. */
  company_uuid: string;
  /** ISO datetime when unassigned. */
  unassigned_at: string;
}

/** Response for GET /advisor-assignments/by-advisor/{uuid} and /my-companies. */
export interface ByAdvisorResponse {
  /** Advisor info. */
  advisor: AdvisorInfo;
  /** Companies assigned to this advisor. */
  companies: CompanyAssignmentInfo[];
  /** Total company count. */
  total: number;
}

/** Response for GET /advisor-assignments/by-company/{uuid}. */
export interface ByCompanyResponse {
  /** Company UUID. */
  company_uuid: string;
  /** Company name. */
  company_name: string;
  /** Advisors assigned to this company. */
  advisors: AdvisorAssignmentInfo[];
  /** Total advisor count. */
  total: number;
}
