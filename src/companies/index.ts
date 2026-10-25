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

import type { BaseEntity, V2Response } from "../common";

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

/** Shared catalog relation in `POST /api/v1/companies/show`. */
export interface CompanyShowCatalog {
  id: number;
  uuid: string | null;
  name: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Catalog relation with Sequelize soft-delete metadata. */
export interface CompanyShowCatalogWithDeletion extends CompanyShowCatalog {
  deletedAt: string | null;
}

/** City relation in `CompanyDetails.City`. */
export interface CompanyShowCity extends CompanyShowCatalogWithDeletion {
  StateId: number | null;
}

/** State relation in `CompanyDetails.State`. */
export interface CompanyShowState extends CompanyShowCatalogWithDeletion {
  CountryId: number | null;
}

/** Latest census relation in `CompanyDetails.LatestCensus`; its snake_case keys are wire keys. */
export interface CompanyShowLatestCensus {
  id: number;
  uuid: string | null;
  year: number | null;
  quarter: number | null;
  total: number;
  men_count: number;
  women_count: number;
  compliance_level: number | null;
  compliance_curp: number | null;
  compliance_nss: number | null;
  compliance_address: number | null;
  compliance_name: number | null;
  compliance_salary: number | null;
  compliance_job: number | null;
  compliance_payroll: number | null;
  accuracy_score: number | null;
  createdAt: string | null;
}

/** One normalized benefit embedded in `CompanyDetails.normalized_benefits`. */
export interface CompanyShowNormalizedBenefit {
  benefit_catalog_id: number;
  code: string;
  name: string;
  category: string | null;
  measurement_type: string | null;
  unit: string | null;
  numeric_value: number | null;
  text_value: string | null;
  boolean_value: boolean | null;
  effective_from: string | null;
  notes: string | null;
  is_active: boolean;
}

/** Profile projection returned for an advisor in `POST /api/v1/companies/show`. */
export interface CompanyShowAdvisorProfile {
  id: number;
  uuid: string | null;
  name: string | null;
  lastNames: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  rfc: string | null;
  personalPhone: string | null;
  mobilePhone: string | null;
  nss: string | null;
  charge: string | null;
  address: string | null;
  otherMail: string | null;
  isFatherAlive: boolean | null;
  profilePic: string | null;
  title: string | null;
  city: string | null;
  titleType: string | null;
  affiliationDate: string | null;
  UserId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  CivilStateId: number | null;
  ScholarshipId: number | null;
}

/** Assignment relation nested in an advisor returned by `companies/show`. */
export interface CompanyShowAdvisorAssignment {
  CompanyId: number;
  UserId: number;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Advisor returned by `POST /api/v1/companies/show`; `is_auto_advisor` is the wire key. */
export interface CompanyShowAdvisor {
  id: number;
  uuid: string | null;
  email: string;
  userType: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  CandidatePositionId: number | null;
  CompanyId: number | null;
  AssemblyMemberOfId: number | null;
  OtherAssemblyMemberOfId: number | null;
  RhOfId: number | null;
  UserProfile: CompanyShowAdvisorProfile | null;
  AdvisorCompany: CompanyShowAdvisorAssignment | null;
  is_auto_advisor: boolean;
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
 * Backend: `POST /api/v1/companies/show` (`data.company.company`) — joins
 * `Company` with its city/state/company-type/economic-activity catalogs and
 * latest census snapshot. Field names preserve the JSON wire contract.
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
  /** Public company-logo URL. `null` when no logo is configured. */
  logoUrl?: string | null;
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
  /**
   * «Detalles técnicos» (SITIMM-1497): the `TechnicalDetail` row plus the company's catalog
   * assignments. The wire key is `technical_detail`: the BE dumps the company by field name, and its
   * `TechnicalDetail` alias does not travel. `null` when the company has neither.
   * Sent by `POST /api/v1/companies/show` in `data.company.company`, also to HR (`basic_show` keeps it).
   */
  technical_detail?: TechnicalDetail | null;
  /** Legacy JSON update-date payload. The response schema declares a list; legacy rows can hold an object. */
  updateDates?: unknown[] | Record<string, unknown> | null;
  /** Legacy RH relation. The response always serializes an array. */
  Rhs?: unknown[];
  /** Resolved catalog relations returned by `companies/show`. */
  City?: CompanyShowCity | null;
  State?: CompanyShowState | null;
  Country?: CompanyShowCatalogWithDeletion | null;
  IndustrialPark?: CompanyShowCatalogWithDeletion | null;
  CompanyType?: CompanyShowCatalog & { code: string | null } | null;
  EconomicActivity?: CompanyShowCatalog & { code: string | null } | null;
  /** Latest census in its original wire casing (unlike the legacy `latestCensus` compatibility field above). */
  LatestCensus?: CompanyShowLatestCensus | null;
  /** Legacy top-level assignments; `technical_detail.productIds` / `clientIds` are the populated source. */
  client_ids?: string[] | null;
  product_ids?: string[] | null;
  /** Modern benefits returned by the show endpoint. */
  normalized_benefits?: CompanyShowNormalizedBenefit[] | null;
  /**
   * Legacy benefit relation documented for `companies/show`. Its old flat benefit fields no longer travel;
   * use `normalized_benefits` for values. Current BE schema omits this key, hence optional.
   */
  benefit_info?: Benefit | null;
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

/** Statistics object as sent by `POST /api/v1/companies/show`. */
export interface CompanyShowStatistics {
  noOfEmployees: number;
  noOfMen: number;
  noOfWomen: number;
  percentOfMen: number | null;
  percentOfWomen: number | null;
  minWage: number | null;
  maxWage: number | null;
  meanWage: number | null;
  meanAge: number | null;
  total_census: number | null;
  last_census_date: string | null;
  active_advisors: number | null;
  medianWage: number | null;
  avgTenureMonths: number | null;
  oldestEntryDate: string | null;
  newestEntryDate: string | null;
  noWithoutGender: number;
}

/**
 * Company technical/operational details, with the company's catalog assignments (SITIMM-1497).
 * Products and clients can exist without a `TechnicalDetail` row (the catalog routes write them
 * alone): then `id`, `uuid` and the dates are `null`.
 *
 * Backend: `app/presentation/schemas/company_detail.py` :: `TechnicalDetail` (mini-back #779 @ 5b6ff292).
 * Legacy fields REMOVED (v0.15.0): delegates, commissioners, secretaries, manager,
 * productionManager, product, clients.
 */
export interface TechnicalDetail {
  /** Numeric primary key; `null` without a row. */
  id: number | null;
  /** Record UUID; `null` without a row. */
  uuid: string | null;
  /** Start of operations: an ISO-8601 datetime (the column is a timestamp). */
  operationStart: string | null;
  /** Collective contract reference. */
  contract: string | null;
  /** Last contract revision: `YYYY-MM-DD`. */
  lastRevision: string | null;
  /** Numeric company FK; `null` without a row. */
  CompanyId: number | null;
  /** ISO-8601 creation timestamp of the row. */
  createdAt: string | null;
  /** ISO-8601 last-update timestamp of the row. */
  updatedAt: string | null;
  /** `qwr_client_catalog` uuids assigned to the company; `null` when not loaded. */
  clientIds: string[] | null;
  /** `qwr_product_catalog` uuids assigned to the company; `null` when not loaded. */
  productIds: string[] | null;
  /**
   * The same clients with their catalog names, ordered by name, so a reader without `all-options`
   * (HR: no `company_catalogs:read`) can show them. `null` when not loaded.
   */
  clients: CatalogName[] | null;
  /** The same products with their catalog names, ordered by name. `null` when not loaded. */
  products: CatalogName[] | null;
}

/**
 * A product or client assigned to a company, with its catalog name (SITIMM-1497).
 *
 * Backend: `app/presentation/schemas/company_detail.py` :: `CatalogName` (mini-back #779 @ 5b6ff292).
 */
export interface CatalogName {
  /** Catalog uuid (`qwr_product_catalog` / `qwr_client_catalog`). */
  id: string;
  /** Catalog name. */
  name: string;
}

/**
 * «Detalles técnicos» in the company's own create and update (D3 and D8), with the company's
 * permission (SITIMM-1497). Products and clients are `all-options` catalog uuids; a list replaces the
 * company's whole set and `[]` empties it. A key left out changes nothing.
 *
 * Backend: `app/presentation/schemas/company.py` :: `CompanyTechnicalFields` (base of
 * `CompanyCreateRequest` and `CompanyUpdateRequest`, mini-back #779).
 */
export interface CompanyTechnicalFields {
  /** Product uuids, up to 500. */
  productIds?: string[] | null;
  /** Client uuids, up to 500. */
  clientIds?: string[] | null;
  /** `YYYY-MM-DD`; `null` clears it. */
  operationStart?: string | null;
  /** `YYYY-MM-DD`; `null` clears it. */
  lastRevision?: string | null;
}

/**
 * Answer of `POST /api/v1/companies/import/check-duplicate?name=&rfc=` (`companies:create`), inside
 * `V2Response`: whether a company with that name and/or RFC already exists. D3's «Ver la empresa»
 * links by `existing_company_uuid` (SITIMM-1497).
 *
 * Backend: `app/presentation/api/v1/company_import.py` :: `check_duplicate_company` (mini-back #779).
 */
export interface CompanyDuplicateCheck {
  is_duplicate: boolean;
  existing_company_id: number | null;
  /** The existing company's uuid, for the link; `null` when there is no duplicate. */
  existing_company_uuid: string | null;
  existing_company_name: string | null;
  /** `"name and/or RFC"` when there is a duplicate. */
  match_criteria: string | null;
}

/**
 * Stable code of a row error or warning in the company import (SITIMM-1498). The panel owns the
 * wording; nothing travels as text.
 *
 * - Errors, the row is not created: `REQUIRED_FIELD_MISSING`, `INVALID_VALUE`, `DUPLICATE_NAME`,
 *   `MUNICIPALITY_MISSPELLED`, `MUNICIPALITY_NOT_IN_CATALOG`, `ADVISOR_EMAIL_UNKNOWN` (an email of
 *   `correos_asesores` that no live advisor has), `ADVISOR_ASSIGN_FORBIDDEN` (the uploader lacks
 *   `offices.assign_advisors`), `DATE_INVALID` (`fecha_vigencia_contrato` unreadable),
 *   `CORRECTION_INVALID` (a `CompanyImportCorrection` that is not one of the row's suggestions, or
 *   for a row without a municipio error), `ROW_FAILED` (only the real pass).
 * - Warnings, the row is created: `NOT_IN_CATALOG`, `DATE_UNPARSEABLE` (that field left empty),
 *   `MUNICIPALITY_CORRECTED` (municipio corrected to `params.suggestion`).
 *
 * Backend: `app/presentation/schemas/company.py` :: `CompanyImportIssueCode`.
 */
export type CompanyImportIssueCode =
  | "REQUIRED_FIELD_MISSING"
  | "INVALID_VALUE"
  | "DUPLICATE_NAME"
  | "MUNICIPALITY_MISSPELLED"
  | "MUNICIPALITY_NOT_IN_CATALOG"
  | "ADVISOR_EMAIL_UNKNOWN"
  | "ADVISOR_ASSIGN_FORBIDDEN"
  | "DATE_INVALID"
  | "CORRECTION_INVALID"
  | "ROW_FAILED"
  | "NOT_IN_CATALOG"
  | "DATE_UNPARSEABLE"
  | "MUNICIPALITY_CORRECTED";

/**
 * Values for the panel's message. All six keys always travel, `null` or `[]` when they do not apply.
 *
 * Backend: `app/presentation/schemas/company.py` :: `CompanyImportIssueParams` (`extra="forbid"`).
 */
export interface CompanyImportIssueParams {
  /** Template column, e.g. `"municipio"`. */
  column: string | null;
  /** The value as it came in the row. */
  value: string | null;
  /**
   * `MUNICIPALITY_MISSPELLED`: the one catalog name it is a near miss of.
   * `MUNICIPALITY_CORRECTED`: the catalog name the municipio was corrected to.
   */
  suggestion: string | null;
  /** `MUNICIPALITY_NOT_IN_CATALOG`: up to 3 similar catalog names; may be empty. */
  suggestions: string[];
  /** `DUPLICATE_NAME`: earlier row of the same file; `null` = the name is already in the system. */
  duplicateOfRow: number | null;
  /** `ADVISOR_EMAIL_UNKNOWN`: the email, as written, that no live advisor has. */
  email: string | null;
}

/** A coded row error or warning. Backend: `CompanyImportIssue`. */
export interface CompanyImportIssue {
  code: CompanyImportIssueCode;
  params: CompanyImportIssueParams;
}

/**
 * One row of `POST /api/v1/companies/upload-csv` (and `/bulk-upload`). The preview
 * (`validateOnly=true`) and the real pass apply the same rule, so `success` in the preview is what
 * the confirmation creates.
 *
 * Backend: `app/presentation/schemas/company.py` :: `CompanyBulkResultItem`.
 */
export interface CompanyBulkResultItem {
  /** CSV: spreadsheet row (header = 1, first company = 2). JSON `/bulk-upload`: 1-based position. */
  row: number;
  /** `""` when the row has no name (`REQUIRED_FIELD_MISSING`). */
  name: string;
  /** Created; with `validateOnly`, would be created. */
  success: boolean;
  /** Set only on a created row of the real pass. */
  companyId: number | null;
  companyUuid: string | null;
  /** Why the row was not (or would not be) created; empty when `success`. */
  errors: CompanyImportIssue[];
  /** Created anyway: that field left empty, or the municipio corrected. */
  warnings: CompanyImportIssue[];
}

/**
 * A municipio fix the panel sends after the preview, taken from that row's suggestions (owner,
 * 2026-10-24: «Aceptar en la app»). `/upload-csv` takes the list as the multipart form field
 * `corrections`, `JSON.stringify`-ed; `/bulk-upload`, as `corrections` in the body. Valid with and
 * without `validateOnly`: the preview with corrections answers what the real pass will do. The
 * server re-validates: a value that is not, as given, one of the row's suggestions is
 * `CORRECTION_INVALID`; a repeated row, or one the file does not have, is 400
 * `CORRECTIONS_INVALID`.
 *
 * Backend: `app/presentation/schemas/company.py` :: `CompanyImportCorrection` (`extra="forbid"`).
 */
export interface CompanyImportCorrection {
  /** The row as the preview reported it. */
  row: number;
  field: "municipality";
  /** One of `params.suggestion` / `params.suggestions` of that row, exactly as it came. */
  value: string;
}

/**
 * Answer of `POST /api/v1/companies/upload-csv?validateOnly=&skipDuplicates=` (`companies:create`),
 * **without** the `V2Response` envelope. One result per row, in file order. The template is
 * `GET /api/v1/companies/template` (the header row this endpoint reads). File-level problems answer
 * 400 `{detail: {code, params}}` with `FILE_NOT_CSV`, `FILE_UNREADABLE`, `MISSING_COLUMNS`,
 * `FILE_EMPTY`, `TOO_MANY_ROWS` or `CORRECTIONS_INVALID`. Optional form field `corrections`:
 * `CompanyImportCorrection[]` as JSON.
 *
 * Backend: `app/presentation/api/v1/companies/csv_upload.py` :: `upload_csv_companies` (SITIMM-1498).
 */
export interface CompanyBulkUploadResponse {
  /** Rows processed. */
  total: number;
  /** Created; with `validateOnly`, would be created. The «N» of «N de M empresas dadas de alta». */
  created: number;
  /** Not created: only `DUPLICATE_NAME`, with `skipDuplicates=true`. */
  skipped: number;
  /** Not created for any other error. */
  failed: number;
  results: CompanyBulkResultItem[];
  validationOnly: boolean;
}

/**
 * Legacy benefit relation of a company.
 *
 * `POST /api/v1/companies/show` documents it as `benefit_info`, but its old
 * flat text values no longer travel. Read `normalized_benefits` for values.
 *
 * @deprecated Use `NormalizedBenefit` from `@kerbero1994/shared-types/benefits`.
 */
export interface Benefit {
  /** Numeric primary key. */
  id: number;
  /** Record UUID. */
  uuid: string | null;
  /** Owning company id. */
  CompanyId: number | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string | null;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string | null;
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
  | "MANAGER"
  | "DELEGATE"
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
  /**
   * Addresses the contact in `/api/v2/companies/{company_id}/contacts/{contact_uuid}` (SITIMM-1499).
   * Optional in `show.contacts[]` (`CompanyContactInfo`).
   */
  uuid?: string | null;
  /**
   * `"panel"`: captured or edited in the panel, and the Excel load no longer touches it. `"excel"`: it
   * came from the Excel load (SITIMM-1499).
   */
  source?: CompanyContactSource | null;
}

/** Contact object as sent by `POST /api/v1/companies/show`. */
export interface CompanyShowContact {
  id: number;
  uuid: string | null;
  source: CompanyContactSource | null;
  /** The BE schema accepts a string; a catalog can add types without changing this response contract. */
  contactType: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

/** Where a company contact comes from (SITIMM-1499): the panel or the Excel load. Lowercase on the wire. */
export type CompanyContactSource = "panel" | "excel";

/** The contact types the panel can write: every type but `ADVISOR`, since advisors come from `/advisor-assignments` (SITIMM-1481). */
export type CompanyContactV2Type = Exclude<CompanyContactType, "ADVISOR">;

/**
 * A company contact written from the panel. It is the answer of `POST /api/v2/companies/{company_id}/contacts`
 * (201) and of `PATCH …/{contact_uuid}` (200), inside `V2Response`. `company_id` is the company's numeric id and
 * only travels in the path. `DELETE …/{contact_uuid}` answers 204 with no body (soft delete).
 * Permission: the `companies.edit` capability, within the caller's companies.
 *
 * Backend: `app/presentation/schemas/company_contact_v2.py` :: `CompanyContactV2` (mini-back branch
 * `SITIMM-1499-company-contacts-crud` @ d293f672, contract Jira 1499 c18422).
 */
export interface CompanyContactV2 {
  uuid: string;
  /** Typed `str` in the response; one of `CompanyContactV2Type` for what the panel writes. */
  contactType: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  notes: string | null;
  source: CompanyContactSource;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
}

/**
 * Body of `POST /api/v2/companies/{company_id}/contacts`. The server rejects unknown keys (`extra="forbid"`),
 * trims the texts (empty becomes `null`) and lowercases the email. Making one primary moves the previous
 * primary of the same type off, in the same transaction.
 *
 * Backend: `company_contact_v2.py` :: `CompanyContactV2Create`.
 */
export interface CompanyContactV2Create {
  contactType: CompanyContactV2Type;
  /** 1–500. */
  name: string;
  /** Up to 255. */
  position?: string | null;
  /** A valid email address. */
  email?: string | null;
  /** Up to 255. */
  phone?: string | null;
  /** Defaults to `false`. */
  isPrimary?: boolean;
  notes?: string | null;
}

/**
 * Body of `PATCH /api/v2/companies/{company_id}/contacts/{contact_uuid}`. Only what is sent changes. An
 * explicit `null` clears an optional field, but `contactType`, `name` and `isPrimary` can't be `null`
 * (422). Editing an Excel contact makes it `"panel"`.
 *
 * Backend: `company_contact_v2.py` :: `CompanyContactV2Update`.
 */
export interface CompanyContactV2Update {
  contactType?: CompanyContactV2Type;
  /** 1–500; can't be emptied. */
  name?: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
  notes?: string | null;
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
  /** % of employees with a job title. */
  job: number | null;
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

/** Census-history item as sent by `POST /api/v1/companies/show`. */
export interface CompanyShowCensusHistory {
  year: number;
  quarter: number;
  total: number;
  men_count: number;
  women_count: number;
  compliance_level: number | null;
  accuracy_score: number | null;
  createdAt: string | null;
}

/** Contribution object as sent by `POST /api/v1/companies/show`. */
export interface CompanyShowContributionStatus {
  quarter_label: string | null;
  amount_due: number | null;
  payment_status: string | null;
  worker_count: number | null;
}

/**
 * Inner `data.company` object of `POST /api/v1/companies/show`.
 *
 * The endpoint's success body is `V2Response<{ company: CompanyDetailsResponse }>`. HR receives
 * `statistics` and `topJobs` as `null`, and empty advisor/contact/benefit arrays.
 * `technical_detail`, legacy `benefit_info`, the catalog relations and `logoUrl` live inside
 * `company`, exactly as the BE serializes them.
 *
 * Backend: `app/presentation/api/v1/companies/crud.py` :: `show_company`.
 */
export interface CompanyDetailsResponse {
  /** Extended company record (see `CompanyDetails` for the full shape). */
  company: CompanyDetails;
  /** Aggregated employee statistics; `null` in the basic HR view. */
  statistics: CompanyShowStatistics | null;
  /** Advisors assigned to this company. */
  advisors: CompanyShowAdvisor[];
  /** Company contact people by role. */
  contacts: CompanyShowContact[];
  /** Top job titles by employee count; `null` in the basic HR view. */
  topJobs: TopJob[] | null;
  /** Data quality percentages per field. */
  dataQuality: DataQuality;
  /** Historical census data for trend charts. */
  censusHistory: CompanyShowCensusHistory[];
  /** Count of all company censuses, including in the basic HR view. */
  censusCount: number;
  /** Current quarterly contribution status. `null` without data or access. */
  contributionStatus: CompanyShowContributionStatus | null;
}

/** Complete success response of `POST /api/v1/companies/show`. */
export type CompanyShowResponse = V2Response<{ company: CompanyDetailsResponse }>;

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

/**
 * Document type of a company document.
 *
 * Backend: `app/infrastructure/database/models/document_models.py` :: `DocumentType`
 * (with its `CHECK` on `CompanyDocument.documentType`).
 */
export type CompanyDocumentType =
  | "COLLECTIVE_CONTRACT"
  | "INTERNAL_REGULATION"
  | "NOMINATION"
  | "BENEFITS_HISTORY"
  | "OTHER";

/**
 * One version of a company document (V2). Every key always travels; empty ones are `null`.
 *
 * Backend: `app/presentation/schemas/company_document.py` :: `CompanyDocumentResponse`.
 * Returned by `GET` and `POST /api/v2/companies/{company_id}/documents[/{doc_uuid}]`
 * inside `V2Response`, and inside each `CompanyDocumentGroup` of the list.
 */
export interface CompanyDocument {
  /** Numeric primary key. */
  id: number;
  /** Document UUID: the `doc_uuid` of the single-document and delete routes. */
  uuid: string;
  /** Document type. */
  documentType: CompanyDocumentType;
  /** Version within its type, from 1. */
  versionNumber: number;
  /**
   * Signed download URL in the single document and the upload response; **always `null` in the
   * list** (SITIMM-1477): to download, ask for the single document.
   */
  fileUrl: string | null;
  /** Original file name. */
  fileName: string;
  /** MIME type. */
  mimeType: string | null;
  /** File size in bytes. */
  sizeBytes: number | null;
  /** Optional title. */
  title: string | null;
  /** Optional notes. */
  notes: string | null;
  /** Date the document takes effect, `YYYY-MM-DD`. */
  effectiveDate: string | null;
  /** True for the current version of its type. */
  isActive: boolean;
  /** Numeric id of the uploader's user, not a name. */
  uploadedBy: number | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

/**
 * The documents of one type in `GET /api/v2/companies/{company_id}/documents`, which returns
 * `V2Response<CompanyDocumentGroup[]>`. Types without documents are left out unless the request
 * filters by `documentType`.
 *
 * Backend: `app/presentation/schemas/company_document.py` :: `CompanyDocumentListResponse`.
 */
export interface CompanyDocumentGroup {
  /** Document type of the group. */
  documentType: CompanyDocumentType;
  /** The current version, or `null` if none is active. */
  currentVersion: CompanyDocument | null;
  /** Number of versions of this type. */
  versionCount: number;
  /** Every version, only with `includeVersions=true`; otherwise `[]`. */
  versions: CompanyDocument[];
}

/**
 * Body of the manual registration of one person in a company (Padrones 2d «Dar de alta a una
 * persona», SITIMM-1469): identity and employment in one call. The server rejects unknown keys
 * (`extra="forbid"`) and trims strings.
 *
 * RFC or CURP identify the person. With neither (or only SAT's generic `XAXX010101…` /
 * `XEXX010101…`, which names nobody), `birthDate` is required. Status `422` otherwise.
 *
 * Backend: `app/presentation/schemas/company_employee_v2.py` :: `CompanyEmployeeCreate`
 * (mini-back #768, head `ba5737af`).
 */
export interface CompanyEmployeeCreate {
  /** Given name(s), 1–255. */
  name: string;
  /** Last names, 1–255. */
  lastNames: string;
  /** Employee (payroll) number in this company, 1–255. */
  payroll: string;
  /** Job title, 1–255. */
  job: string;
  /** Daily salary, > 0, up to 10 digits with 2 decimals. Sent as a number or a decimal string. */
  daySalary: number | string;
  /** RFC; validated and normalized by the server. */
  rfc?: string | null;
  /** CURP; validated and normalized by the server. */
  curp?: string | null;
  /** `YYYY-MM-DD`. Required when there is no own RFC nor CURP. */
  birthDate?: string | null;
  /** Sex as the BE stores it. */
  gender?: "M" | "F" | null;
  /** Entry date in this company, `YYYY-MM-DD`. */
  entryDate?: string | null;
  /** Department, up to 255. */
  department?: string | null;
  /** Phone, up to 50. */
  phone?: string | null;
  /** E-mail (validated as an address). */
  email?: string | null;
  /** NSS: exactly 11 digits. */
  nss?: string | null;
  /**
   * Civil state id from `GET /api/v2/catalogs/employee-options`; stored on this company's row
   * (SITIMM-1500). An id outside its catalog: `422`.
   */
  civilStateId?: number | null;
  /** Schooling id from the same catalog; stored on this company's row (SITIMM-1500). */
  scholarshipId?: number | null;
  /**
   * Affiliation date, `YYYY-MM-DD`, not after Mexico City's today (`422`). Saved only on a NEW
   * account's profile; with an existing account the answer says `affiliationIgnored`.
   */
  affiliationDate?: string | null;
}

/**
 * `201` answer of `POST /api/v2/companies/{company_uuid}/employees`, inside `V2Response`.
 * Nothing about the person's other employment comes back.
 *
 * Backend: `app/presentation/schemas/company_employee_v2.py` :: `CompanyEmployeeCreated`.
 */
export interface CompanyEmployeeCreated {
  /** UUID of the new employee row in this company. */
  employeeUuid: string;
  /** The RFC/CURP already had a SITIMM account: the new row is linked to it. */
  existingAccount: boolean;
  /**
   * An affiliation date was typed and the account already existed: its profile is not
   * touched, so the date was not saved (SITIMM-1500).
   */
  affiliationIgnored: boolean;
  /** «Alta registrada», or «Alta registrada. Ya tenía cuenta en SITIMM; usa la misma.». */
  message: string;
}

/** One option of a v2 catalog: `{id, name}`, the name as the catalog has it. */
export interface EmployeeCatalogOption {
  id: number;
  name: string;
}

/**
 * `GET /api/v2/catalogs/employee-options` (`census:create`), inside `V2Response`: the 2d's
 * catalogs in one call (SITIMM-1500).
 *
 * Backend: `app/presentation/schemas/company_employee_v2.py` :: `EmployeeOptions`.
 */
export interface EmployeeOptions {
  civilStates: EmployeeCatalogOption[];
  scholarships: EmployeeCatalogOption[];
}

/** Stable codes of the `409` answers of the manual registration. */
export type CompanyEmployeeConflictCode = "employee_active_here" | "identity_mismatch";

/**
 * `409` body of `POST /api/v2/companies/{company_uuid}/employees`: FastAPI wraps the route's
 * `detail` object. `employee_active_here`: the person already has a live row in this company.
 * `identity_mismatch`: the RFC and the CURP do not name one same account; no data of the
 * record comes back.
 *
 * Backend: `company_employees_v2.py` :: `ACTIVE_HERE`, `IDENTITY_MISMATCH`.
 */
export interface CompanyEmployeeConflict {
  detail: { code: CompanyEmployeeConflictCode; message: string };
}

// ── Union representatives v2 (SITIMM-1491, ola 3 delta: D14) ─────────────────

/**
 * One union role of the catalog, filtered by the company's structure: `COMMITTEE` when the
 * company has a committee, `DELEGATES` otherwise. `GET /api/v2/companies/{company_id}/union-representatives/roles`,
 * inside `V2Response`.
 *
 * Backend: `app/presentation/schemas/union_representative.py` :: `UnionRoleResponse`.
 */
export interface UnionRoleV2 {
  id: number;
  uuid: string;
  /** Display name, e.g. «Secretario General». */
  name: string;
  /** Stable code of the role. */
  code: string;
  /** `COMMITTEE` or `DELEGATES` (typed `str` in the BE). */
  structureType: string;
  /** Ascending order of the role in the structure. */
  hierarchyOrder: number;
  /** Whether the role can have a substitute. */
  allowsSubstitute: boolean;
  /** Whether only one person can hold the role. */
  isSingular: boolean;
  description: string | null;
}

/**
 * One union representative of a company, with the role and person names joined server-side.
 * `GET /api/v2/companies/{company_id}/union-representatives[?activeOnly=]` answers a list of these and
 * `POST` answers one, inside `V2Response`. `company_id` is the company's numeric id.
 *
 * Backend: `app/presentation/schemas/union_representative.py` :: `UnionRepresentativeResponse`.
 */
export interface UnionRepresentativeV2 {
  id: number;
  uuid: string;
  CompanyId: number;
  EmployeeId: number;
  UnionRoleId: number;
  /** `COMMITTEE` or `DELEGATES`. */
  structureType: string;
  /** Titular (`true`) or substitute (`false`). */
  isPrimary: boolean;
  isActive: boolean;
  /** `YYYY-MM-DD`. */
  startDate: string | null;
  /** `YYYY-MM-DD`. */
  endDate: string | null;
  notes: string | null;
  /** ISO-8601 datetime. */
  createdAt: string;
  /** ISO-8601 datetime. */
  updatedAt: string;
  roleName: string | null;
  roleCode: string | null;
  employeeName: string | null;
  employeeLastNames: string | null;
  /**
   * The representative's payroll number (`Employee.payroll`). Always present (mini-back #776, SITIMM-1517).
   * The value reaches only the full census tier (MANAGER, ADMIN, ADMIN_EMPLOYEES, HR): it is identity in
   * SITIMM-1419, so the limited tier (OFFICE, ADVISOR) gets `null`. The `POST` answer also carries `null`.
   */
  employeePayroll: string | null;
}

/**
 * Body of `POST /api/v2/companies/{company_id}/union-representatives`.
 *
 * Backend: `app/presentation/schemas/union_representative.py` :: `UnionRepresentativeCreate`.
 */
export interface UnionRepresentativeCreateV2 {
  EmployeeId: number;
  UnionRoleId: number;
  /** Defaults to `true` (titular). */
  isPrimary?: boolean;
  /** `YYYY-MM-DD`. */
  startDate?: string | null;
  /** `YYYY-MM-DD`. */
  endDate?: string | null;
  /** Up to 500. */
  notes?: string | null;
}

/**
 * Body of `PATCH /api/v2/companies/{company_id}/union-representatives/{rep_uuid}`. The answer is
 * `V2Response<{ message: string }>`, the same as `DELETE`.
 *
 * Backend: `app/presentation/schemas/union_representative.py` :: `UnionRepresentativeUpdate`.
 */
export interface UnionRepresentativeUpdateV2 {
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  /** `YYYY-MM-DD`. */
  startDate?: string | null;
  /** `YYYY-MM-DD`. */
  endDate?: string | null;
  /** Up to 500. */
  notes?: string | null;
}
