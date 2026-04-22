/**
 * Company benefits catalog types.
 *
 * These types model the benefit-catalog plus per-company benefit-value system:
 *
 * - `BenefitCategory`  — high-level grouping (e.g. "Bonuses", "Insurance").
 * - `BenefitCatalogItem` — canonical benefit definition (e.g. "Christmas Bonus",
 *   "Savings Fund"). Shared across companies.
 * - `NormalizedBenefit` — per-company benefit value joined with the catalog entry.
 * - `ContractVersion`  — collective contract revision that the benefit applies to.
 *
 * Backend endpoints:
 * - `GET /api/v1/benefits/catalog`      -> `BenefitCatalogItem[]`
 * - `GET /api/v1/benefits/categories`   -> `BenefitCategory[]`
 * - `GET /api/v1/benefits/company/{id}` -> `NormalizedBenefit[]`
 * - `GET /api/v1/contract-versions/company/{id}` -> `ContractVersion[]`
 */

/**
 * High-level benefit grouping displayed in the CMS UI.
 *
 * Backend: Bonuses_Category (or equivalent catalog table).
 */
export interface BenefitCategory {
  /** Numeric primary key. */
  id: number;
  /** Short programmatic code (e.g. "BONUSES"). */
  code: string;
  /** Display name (localized). */
  name: string;
  /** UI sort order (ascending). */
  displayOrder: number;
}

/**
 * Canonical benefit definition in the catalog.
 * Independent of any specific company.
 *
 * Backend: Benefit_Catalog (or equivalent).
 */
export interface BenefitCatalogItem {
  /** Numeric primary key. */
  id: number;
  /** Record UUID. */
  uuid: string;
  /** Programmatic code (e.g. "CHRISTMAS_BONUS"). */
  code: string;
  /** Display name (localized). */
  name: string;
  /** FK to the category this benefit belongs to. */
  categoryId: number;
  /** Resolved category display name (joined server-side). */
  categoryName: string;
  /**
   * How the benefit is measured.
   * Examples: "DAYS", "PERCENT", "AMOUNT", "BOOLEAN", "TEXT".
   */
  measurementType: string;
  /**
   * Unit for the measurement.
   * Examples: "days", "MXN", "%", "months", "boolean".
   */
  measurementUnit: string;
  /** Legal minimum required by Mexican labor law, if any. */
  legalMinimum: number | null;
  /** Citation or link to the legal reference (LFT article, etc.). */
  legalReference: string | null;
  /** Human-readable description for the CMS tooltip. */
  description: string | null;
  /**
   * Whether this benefit is commonly offered (used to surface it in default
   * company templates).
   */
  isCommon: boolean;
}

/**
 * Per-company benefit record — the denormalized view that joins
 * `CompanyBenefitValue` with its `BenefitCatalog` row and the active
 * `ContractVersion`.
 *
 * Backend: `/api/v1/benefits/company/{id}` — combines three tables server-side.
 */
export interface NormalizedBenefit {
  /** Numeric primary key (row id in CompanyBenefitValue). */
  id: number;
  /** Record UUID. */
  uuid: string;
  /** Foreign key to the company table. */
  CompanyId: number;
  /** Foreign key to the catalog row (what benefit this is). */
  BenefitCatalogId: number;
  /** Catalog code (e.g. "CHRISTMAS_BONUS"). */
  benefitCode: string;
  /** Catalog display name. */
  benefitName: string;
  /** Catalog category name. */
  categoryName: string;
  /** Catalog measurement type (see `BenefitCatalogItem.measurementType`). */
  measurementType: string;
  /** Catalog measurement unit (see `BenefitCatalogItem.measurementUnit`). */
  measurementUnit: string;
  /** Numeric value, if the benefit is measured numerically. Null otherwise. */
  numericValue: number | null;
  /** Text value, if the benefit is free-form text. Null otherwise. */
  textValue: string | null;
  /** Boolean value, if the benefit is a flag. Null otherwise. */
  booleanValue: boolean | null;
  /** ISO-8601 date the benefit value becomes effective. Null if undated. */
  effectiveFrom: string | null;
  /** ISO-8601 date the benefit value expires. Null if ongoing. */
  effectiveTo: string | null;
  /** Whether this benefit record is currently active. */
  isActive: boolean;
  /** Free-form notes from the admin who created the record. */
  notes: string | null;
  /**
   * Which employee subset the benefit applies to.
   * Examples: "ALL", "UNIONIZED", "MANAGERS".
   */
  appliesTo: string;
  /** FK to the contract version this benefit is tied to. Null if independent. */
  ContractVersionId: number | null;
  /** Resolved contract version label (e.g. "2024-2026"). */
  contractVersion: string | null;
}

/**
 * Collective contract revision.
 *
 * Backend: `/api/v1/contract-versions/company/{id}`.
 */
export interface ContractVersion {
  /** Numeric primary key. */
  id: number;
  /** Record UUID. */
  uuid: string;
  /** Foreign key to the company table. */
  CompanyId: number;
  /** Human-readable version label (e.g. "2024-2026"). */
  version: string;
  /** Monotonic counter (1, 2, 3, ...). */
  versionNumber: number;
  /** ISO-8601 date the contract was signed. Null if not yet signed. */
  signedDate: string | null;
  /** ISO-8601 date the contract becomes effective. */
  effectiveFrom: string | null;
  /** ISO-8601 date the contract expires. Null if ongoing. */
  effectiveTo: string | null;
  /** Percentage salary increase vs. the previous contract, if applicable. */
  salaryIncreasePercent: number | null;
  /** Absolute salary increase (MXN) vs. the previous contract, if applicable. */
  salaryIncreaseAmount: number | null;
  /** URL to the signed contract document in S3/MinIO. */
  documentUrl: string | null;
  /** Contract lifecycle status. */
  status: "ACTIVE" | "INACTIVE";
  /** Free-form notes from the admin. */
  notes: string | null;
}
