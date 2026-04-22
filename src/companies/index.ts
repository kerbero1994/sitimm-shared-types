/**
 * Company and employee types.
 *
 * Backend equivalents:
 * - Company        -> app/presentation/schemas/company.py :: CompanyResponse
 * - Employee       -> app/presentation/schemas/employee.py :: EmployeeResponse
 * - CompanyDetails -> company.py + statistics aggregation
 *
 * Note: These are V1-style types (camelCase, Sequelize timestamps).
 * Used by new_dashboard company views.
 */

import type { BaseEntity } from "../common";

/**
 * Union personnel role catalog entry.
 *
 * Backend: `/api/v1/catalogs/union-roles` — maps to the `UnionRole` table.
 */
export interface UnionRole {
  /** Numeric primary key. */
  id: number;
  /** Display name (localized). */
  name: string;
  /** Short programmatic code (e.g. "GENERAL_SECRETARY"). */
  code: string;
  /** Which structure the role belongs to. */
  structureType: "COMMITTEE" | "DELEGATES" | "BOTH";
  /** UI sort order (ascending) for display lists. */
  hierarchyOrder: number;
  /** Whether the role allows a substitute to also be assigned. */
  allowsSubstitute: boolean;
  /** Whether only one person can hold this role at a time (per company). */
  isSingular: boolean;
}

/**
 * Per-company union personnel assignment.
 *
 * Backend: `/api/v1/companies/{id}/union-personnel`.
 */
export interface UnionPersonnel {
  /** Numeric primary key. */
  id: number;
  /** Record UUID. */
  uuid: string;
  /** Numeric company FK. */
  companyId: number;
  /** Numeric employee FK. */
  employeeId: number;
  /** Resolved employee full name (joined server-side). */
  employeeName: string;
  /** Resolved employee payroll id. Null if missing. */
  employeePayroll: string | null;
  /** Numeric role FK. */
  unionRoleId: number;
  /** Resolved role display name. */
  unionRoleName: string;
  /** Resolved role code. */
  unionRoleCode: string;
  /** Which structure the role belongs to ("COMMITTEE" | "DELEGATES" | "BOTH"). */
  structureType: string;
  /** Whether this is the primary occupant (vs substitute). */
  isPrimary: boolean;
  /** Whether the assignment is currently active. */
  isActive: boolean;
  /** ISO-8601 start date. Null if not set. */
  startDate: string | null;
  /** ISO-8601 end date. Null if ongoing. */
  endDate: string | null;
  /** Free-form admin notes. */
  notes: string | null;
}

/**
 * Full company admin record (for CMS list).
 * Backend: `/api/v1/company-admins/index` — richer shape than `CompanyAdmin`.
 */
export interface CompanyAdminFull {
  /** Numeric primary key. */
  id: number;
  /** Admin's full display name. */
  fullName: string;
  /** Admin contact email. */
  email: string;
  /** Phone number. Null if missing. */
  phone: string | null;
  /** Job title. Null if missing. */
  title: string | null;
  /** Free-form title type qualifier. Null if missing. */
  titleType: string | null;
  /** FK to the company. */
  CompanyId: number;
  /** FK to the contact-type catalog. Null for uncategorized. */
  ContactTypeId: number | null;
  /** FK to the admin-position catalog. Null for uncategorized. */
  AdminPositionId: number | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
}

/**
 * Top job title in a company (used by `CompanyDetailsResponse.topJobs`).
 */
export interface TopJob {
  /** Job title string as stored in Employee.job. */
  job: string;
  /** Count of employees with this exact job title. */
  count: number;
}

/**
 * Company advisor (union representative) summary.
 *
 * Used in the dashboard company-detail view.
 *
 * Backend field casing is preserved (note the capitalized `Uuid`).
 */
export interface CompanyAdvisor {
  /** Advisor UUID (note capitalized key — matches backend). */
  Uuid: string;
  /** Advisor login email. */
  email: string;
  /** Nested user profile snapshot. */
  UserProfile: {
    /** First name. */
    name: string;
    /** Full surname(s). */
    lastNames: string;
    /** Mobile phone. */
    mobilePhone?: string;
    /** Job title / charge within the union. */
    charge?: string;
  };
}

/**
 * Document attachment with associated date.
 *
 * Used for collective-contract revisions, legal documents, etc.
 */
export interface DocumentWithDate {
  /** Document URL (presigned S3 URL or relative path). */
  url: string;
  /** ISO-8601 date associated with the document. */
  date: string;
}

/**
 * Quarterly contribution/payment status for a company.
 *
 * Backend: `/api/v1/companies/{id}/contribution-status`.
 */
export interface ContributionStatus {
  /** Human-readable quarter label (e.g. "Q2 2026"). */
  quarterLabel: string;
  /** Amount due in MXN. */
  amountDue: number;
  /** Current payment lifecycle state. */
  paymentStatus: "pending" | "partial" | "complete";
  /** Number of workers covered in this quarter's contribution. */
  workerCount: number;
}

/**
 * Superset company record with all resolved FKs and extras.
 *
 * Backend: aggregated by `GET /api/v1/companies/{uuid}/details` —
 * joins `Company` with its city/state/company-type/economic-activity catalogs,
 * latest census snapshot, and a few admin-only fields.
 */
export interface CompanyDetails {
  /** Numeric primary key. */
  id: number;
  /** Record UUID — primary identifier for API operations. */
  uuid: string;
  /** Company name. */
  name?: string;
  /** Company address. */
  address?: string;
  /** ISO-8601 date when the company was accepted into the union. */
  acceptanceDate?: string;
  /** Free-form country label (localized). */
  country?: string;
  /** Phone number. */
  phone?: string;
  /** Free-form industrial-park label. */
  industrialPark?: string;
  /** Electoral identifier (INE-related). */
  electoralId?: string;
  /** Whether the company has a union committee. */
  hasCommittee?: boolean;
  /**
   * Shared password used by the HR module to upload files.
   * Admin-only field; never exposed in the public API.
   */
  rhPassword?: string;
  /** RFC (tax ID). */
  rfc?: string;
  /** GPS latitude. Range: -90 to 90. */
  latitude?: number | null;
  /** GPS longitude. Range: -180 to 180. */
  longitude?: number | null;
  /** Country catalog FK. Null if unassigned. */
  CountryId?: number | null;
  /** State catalog FK. Null if unassigned. */
  StateId?: number | null;
  /** City catalog FK. Null if unassigned. */
  CityId?: number | null;
  /** Company type catalog FK. Null if unassigned. */
  CompanyTypeId?: number | null;
  /** Economic activity catalog FK. Null if unassigned. */
  EconomicActivityId?: number | null;
  /** Industrial park catalog FK. Null if unassigned. */
  IndustrialParkId?: number | null;
  /** Resolved city name (joined server-side). */
  cityName?: string;
  /** Resolved state name (joined server-side). */
  stateName?: string;
  /** Resolved company type display name. */
  companyTypeName?: string;
  /** Resolved economic activity display name. */
  economicActivityName?: string;
  /** Resolved company type code. */
  companyTypeCode?: string;
  /** Resolved economic activity code. */
  economicActivityCode?: string;
  /** Resolved headquarter display name. */
  headquarterName?: string;
  /** Presigned S3 URL for the collective contract. */
  collectiveContractUrl?: string;
  /** Latest census snapshot joined server-side. */
  latestCensus?: {
    /** Numeric census PK. */
    id: number;
    /** Census UUID. */
    uuid: string;
    /** Total employees in this census. */
    total: number;
    /** Calendar year. */
    year: number;
    /** Quarter (1-4). */
    quarter: number;
    /** Overall compliance level (0-100). */
    complianceLevel: number;
    /** Male count. */
    menCount: number;
    /** Female count. */
    womenCount: number;
    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** Per-field compliance breakdowns (0-100). */
    complianceJob?: number;
    compliancePayroll?: number;
    accuracyScore?: number;
    complianceCurp?: number;
    complianceNss?: number;
    complianceAddress?: number;
    complianceName?: number;
    complianceSalary?: number;
  };
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
  /** ISO-8601 soft-delete timestamp. Null if active. */
  deletedAt?: string;
}

/**
 * Company record.
 * Backend: company.py :: CompanyResponse
 */
export interface Company extends BaseEntity {
  /** Company name. Max 255 chars. */
  name: string;
  /** Company phone number. Max 255 chars. */
  phone?: string;
  /** Company address. Max 500 chars. */
  address?: string;
  /** RFC (tax ID). Max 20 chars. */
  rfc?: string;
  /** Whether the company has a union committee. */
  hasCommittee?: boolean;
  /** City UUID (foreign key to cities catalog). */
  cityUuid?: string;
  /** State UUID (foreign key to states catalog). */
  stateUuid?: string;
  /** ISO-8601 date when the company was accepted into the union. */
  acceptanceDate?: string;
  /** Country catalog FK. */
  CountryId?: number;
  /** Industrial park catalog FK. */
  IndustrialParkId?: number;
  /** Company type catalog FK. */
  CompanyTypeId?: number;
  /** State catalog FK. */
  StateId?: number;
  /** City catalog FK. */
  CityId?: number;
  /** Economic activity catalog FK. */
  EconomicActivityId?: number;
  /** GPS latitude. Range: -90 to 90. */
  latitude?: number;
  /** GPS longitude. Range: -180 to 180. */
  longitude?: number;
  /** URL to company logo (Clearbit or S3). Max 500 chars. */
  logoUrl?: string;
}

/**
 * Employee record.
 * Backend: employee.py :: EmployeeResponse
 */
export interface Employee extends BaseEntity {
  /** Employee full name. */
  name: string;
  /** Payroll number/identifier. */
  payroll?: string;
  /** Job title. */
  job?: string;
  /** Daily salary in MXN. */
  daySalary?: number;
  /** Biological sex. "M" (male) or "F" (female). */
  gender?: "M" | "F";
  /** ISO-8601 date of birth. */
  birth_date?: string;
  /** RFC (tax ID). 12–13 chars. Validate with RFC_PATTERN. */
  rfc?: string;
  /** CURP (national ID). 18 chars. Validate with CURP_PATTERN. */
  curp?: string;
  /** NSS (social security number). */
  nss?: string;
  /** Street address. */
  address?: string;
  /** ISO-8601 company entry/hire date. */
  entry?: string;
  /** Employee email. */
  email?: string;
  /** Phone number. */
  phone?: string;
  /** Foreign key to Company table. */
  CompanyId?: number;
}

/**
 * Aggregated company statistics.
 * Computed server-side from employee data.
 */
export interface CompanyStatistics {
  /** Total number of active employees. */
  noOfEmployees: number;
  /** Mean daily salary across all employees (MXN). */
  meanWage?: number;
  /** Mean age of employees (years). */
  meanAge?: number;
  /** Highest daily salary (MXN). */
  maxWage?: number;
  /** Lowest daily salary (MXN). */
  minWage?: number;
  /** Percentage of male employees (0–100). */
  percentOfMen: number;
  /** Count of male employees. */
  noOfMen: number;
  /** Percentage of female employees (0–100). */
  percentOfWomen: number;
  /** Count of female employees. */
  noOfWomen: number;
  /** Total employees in the last census. */
  totalCensus?: number;
  /** ISO-8601 date of the last census import. */
  lastCensusDate?: string;
  /** Number of active advisors assigned to this company. */
  activeAdvisors?: number;
  /** Count of employees without gender data. */
  noWithoutGender?: number;
  /** Median daily salary (MXN). */
  medianWage?: number;
  /** Average employee tenure in months. */
  avgTenureMonths?: number;
  /** ISO-8601 date of the earliest employee entry among the active workforce. */
  oldestEntryDate?: string;
  /** ISO-8601 date of the most recent employee entry. */
  newestEntryDate?: string;
}

/**
 * Company technical/operational details.
 *
 * Legacy fields REMOVED (v0.15.0): delegates, commissioners, secretaries,
 * manager, productionManager, product, clients.
 * Use CompanyAdmin for contacts, CompanyUnionPersonal for union reps,
 * client_ids/product_ids for catalog-based assignments.
 */
export interface TechnicalDetail {
  /** Record UUID. */
  uuid: string;
  /** Collective contract reference. */
  contract?: string;
  /** ISO-8601 date when operations started. */
  operationStart?: string;
  /** ISO-8601 date of last contract revision. */
  lastRevision?: string;
  /** Catalog-based client UUIDs. */
  clientIds?: string[];
  /** Catalog-based product UUIDs. */
  productIds?: string[];
}

/**
 * Company benefits — LEGACY (v0.15.0).
 * All text fields removed. Use `NormalizedBenefit` (from the benefits module)
 * joined with `ContractVersion` instead.
 *
 * @deprecated Use `NormalizedBenefit` from `@kerbero1994/shared-types/benefits`.
 */
export interface Benefit {
  /** Record UUID. */
  uuid: string;
}

/**
 * Company contact role type.
 */
export type CompanyContactType =
  | "ADVISOR"
  | "RH"
  | "RH_SECONDARY"
  | "GENERAL_MANAGER"
  | "PRODUCTION_MANAGER"
  | "OTHER";

/**
 * Company contact person.
 */
export interface CompanyContact {
  /** Numeric contact ID. */
  id: number;
  /** Contact role within the company. */
  contactType: CompanyContactType;
  /** Contact person's full name. */
  name?: string;
  /** Contact email. */
  email?: string;
  /** Contact phone number. */
  phone?: string;
  /** Job position/title. */
  position?: string;
  /** Whether this is the primary contact for this role. */
  isPrimary: boolean;
  /** Whether the contact is currently active. */
  isActive: boolean;
}

/**
 * Data quality percentages per field (0–100).
 * Indicates what percentage of employees have this field filled.
 */
export interface DataQuality {
  /** % of employees with RFC data. */
  rfc: number | null;
  /** % of employees with CURP data. */
  curp: number | null;
  /** % of employees with NSS data. */
  nss: number | null;
  /** % of employees with address data. */
  address: number | null;
  /** % of employees with salary data. */
  salary: number | null;
  /** % of employees with entry date data. */
  entry: number | null;
}

/**
 * Historical census entry for trend tracking.
 */
export interface CensusHistoryEntry {
  /** Census year. */
  year: number;
  /** Quarter (1–4). */
  quarter: number;
  /** Total employees in this census period. */
  total: number;
  /** Male employees count. */
  menCount: number;
  /** Female employees count. */
  womenCount: number;
  /** Compliance score (0–100). */
  complianceLevel: number;
  /** Data accuracy score (0–100). */
  accuracyScore?: number;
  /** ISO-8601 when this census was imported. */
  createdAt: string;
}

/**
 * Full company details response — aggregated from multiple tables.
 * Used by the company detail view in new_dashboard.
 *
 * Returned by `GET /api/v1/companies/{uuid}/details`.
 */
export interface CompanyDetailsResponse {
  /** Aggregated company record (see `CompanyDetails` for the full shape). */
  company: CompanyDetails;
  /** Aggregated employee statistics. */
  statistics?: CompanyStatistics;
  /** Advisors assigned to this company. */
  advisors?: CompanyAdvisor[];
  /** Company contact people by role. */
  contacts?: CompanyContact[];
  /** Technical/operational details. */
  technicalDetail?: TechnicalDetail;
  /**
   * Legacy embedded benefit blob — deprecated.
   * @deprecated Use `NormalizedBenefit[]` from the `benefits` module instead.
   */
  benefit?: Benefit;
  /** History of contract/benefit revisions for the company. */
  history?: Array<{
    /** Numeric primary key. */
    id: number;
    /** JSON blob snapshot of the change. */
    content?: Record<string, unknown>;
    /** Numeric company FK. */
    CompanyId?: number;
    /** ISO-8601 creation timestamp. */
    createdAt?: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt?: string;
  }>;
  /** Top job titles by employee count. */
  topJobs?: TopJob[];
  /** Data quality percentages per field. */
  dataQuality?: DataQuality;
  /** Historical census data for trend charts. */
  censusHistory?: CensusHistoryEntry[];
  /** Current quarterly contribution status. Null if no data. */
  contributionStatus?: ContributionStatus | null;
}

/**
 * Company record with aggregated employee statistics attached.
 * Used by the companies list view in new_dashboard.
 */
export interface CompanyWithStats extends Company {
  /** Aggregated statistics (non-optional on this type). */
  statistics: CompanyStatistics;
  /** Advisors payload — shape varies; typed loosely for backward compat. */
  Advisors?: Record<string, unknown>;
}
