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
  /** True if the SITIMM AI fallback was auto-assigned after removing the last human advisor. */
  sitimm_fallback_assigned: boolean;
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

// ---------------------------------------------------------------------------
// Catalog schemas (V2 replacement for V1 /catalogs/advisors endpoints)
// ---------------------------------------------------------------------------

/** Single advisor entry in the V2 catalog list. */
export interface AdvisorCatalogItem {
  /** Advisor user UUID. */
  uuid: string;
  /** Advisor email. */
  email: string;
  /** Full display name ("name lastNames"), or null if profile missing. */
  name: string | null;
  /** Phone number (mobile-first, fallback to personal), or null. */
  phone: string | null;
  /** Number of companies currently assigned to this advisor. */
  assigned_companies_count: number;
  /** True if this is the SITIMM AI auto-advisor. */
  is_auto_advisor: boolean;
  /** ISO datetime when the advisor user was created. */
  createdAt: string;
}

/** Response for GET /advisor-assignments/catalog. */
export interface AdvisorCatalogListResponse {
  items: AdvisorCatalogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Single advisor row in a company-scoped advisor list. */
export interface CompanyAdvisorEntry {
  /** Advisor user UUID. */
  uuid: string;
  /** Advisor email. */
  email: string;
  /** First name, or null. */
  name: string | null;
  /** Last names (camelCase because backend uses Pydantic alias). */
  lastNames: string | null;
  /** Phone (mobile-first, null if absent). */
  phone: string | null;
  /** True if this is the SITIMM AI virtual fallback. */
  is_auto_advisor: boolean;
}

/** Response for GET /advisor-assignments/by-company-uuid/{uuid}. */
export interface CompanyAdvisorsListResponse {
  company_uuid: string;
  company_name: string;
  advisors: CompanyAdvisorEntry[];
  total: number;
}
