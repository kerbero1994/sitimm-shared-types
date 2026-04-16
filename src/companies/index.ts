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
 * All text fields removed. Use NormalizedBenefit (from CompanyBenefitValue + BenefitCatalog) instead.
 * @deprecated Use normalizedBenefits on CompanyDetailsResponse
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
 */
export interface CompanyDetailsResponse {
  /** Company base data + additional resolved fields. */
  company: Company & {
    /** GPS latitude. Range: -90 to 90. */
    latitude?: number | null;
    /** GPS longitude. Range: -180 to 180. */
    longitude?: number | null;
    /** Resolved city name (from City catalog). */
    cityName?: string;
    /** Resolved state name (from State catalog). */
    stateName?: string;
    /** Resolved company type name. */
    companyTypeName?: string;
    /** Resolved economic activity name. */
    economicActivityName?: string;
  };
  /** Aggregated employee statistics. */
  statistics?: CompanyStatistics;
  /** Advisors assigned to this company. */
  advisors?: Array<{
    Uuid: string;
    email: string;
    UserProfile: {
      name: string;
      lastNames: string;
      mobilePhone?: string;
      charge?: string;
    };
  }>;
  /** Company contact people by role. */
  contacts?: CompanyContact[];
  /** Technical/operational details. */
  technicalDetail?: TechnicalDetail;
  /** Top job titles by employee count. */
  topJobs?: Array<{ job: string; count: number }>;
  /** Data quality percentages per field. */
  dataQuality?: DataQuality;
  /** Historical census data for trend charts. */
  censusHistory?: CensusHistoryEntry[];
}
