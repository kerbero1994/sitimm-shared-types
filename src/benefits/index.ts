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
 * Backend endpoints (mini-back `app/presentation/api/v1/_benefits_common.py`, plain JSON, no envelope):
 * - `GET /api/v1/benefits/catalog`      -> `BenefitCatalogItem[]`
 * - `GET /api/v1/benefits/categories`   -> `BenefitCategory[]`
 * - `GET /api/v1/benefits/company/{id}` -> `NormalizedBenefit[]`
 * - `GET /api/v1/benefits/company/{id}/contracts` -> `ContractVersion[]`
 */

/**
 * A pydantic `Decimal` on the wire: pydantic v2 serializes it as JSON text, e.g. `"30.00"`.
 * Parse it with `Number()` where the screen needs a number.
 */
export type DecimalString = string;

/**
 * High-level benefit grouping displayed in the CMS UI.
 *
 * Backend: `_benefits_common.py` :: `BenefitCategoryResponse`.
 */
export interface BenefitCategory {
  /** Numeric primary key. */
  id: number;
  /** Record UUID. */
  uuid: string;
  /** Short programmatic code (e.g. "BONUSES"). */
  code: string;
  /** Display name (localized). */
  name: string;
  /** Description of the category, if any. */
  description: string | null;
  /** UI sort order (ascending). */
  displayOrder: number;
}

/**
 * Canonical benefit definition in the catalog.
 * Independent of any specific company.
 *
 * Backend: `_benefits_common.py` :: `BenefitCatalogResponse`.
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
  categoryName: string | null;
  /**
   * How the benefit is measured.
   * Examples: "DAYS", "PERCENT", "AMOUNT", "BOOLEAN", "TEXT".
   */
  measurementType: string;
  /**
   * Unit for the measurement.
   * Examples: "days", "MXN", "%", "months", "boolean".
   */
  measurementUnit: string | null;
  /** Legal minimum required by Mexican labor law, if any. A `Decimal`: JSON text. */
  legalMinimum: DecimalString | null;
  /** Citation or link to the legal reference (LFT article, etc.). */
  legalReference: string | null;
  /** Human-readable description for the CMS tooltip. */
  description: string | null;
  /** UI sort order (ascending). */
  displayOrder: number;
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
 * Backend: `_benefits_common.py` :: `CompanyBenefitResponse` (`/api/v1/benefits/company/{id}`).
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
  benefitCode: string | null;
  /** Catalog display name. */
  benefitName: string | null;
  /** Catalog category name. */
  categoryName: string | null;
  /** Catalog measurement type (see `BenefitCatalogItem.measurementType`). */
  measurementType: string | null;
  /** Catalog measurement unit (see `BenefitCatalogItem.measurementUnit`). */
  measurementUnit: string | null;
  /** Numeric value, if the benefit is measured numerically. A `Decimal`: JSON text. Null otherwise. */
  numericValue: DecimalString | null;
  /** Text value, if the benefit is free-form text. Null otherwise. */
  textValue: string | null;
  /** Boolean value, if the benefit is a flag. Null otherwise. */
  booleanValue: boolean | null;
  /** ISO-8601 date the benefit value becomes effective. */
  effectiveFrom: string;
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
 * The 5 lifecycle states of a contract version: the `CHECK` constraint of the
 * `ContractVersion` table (`benefit_models.py`). The response types it as `str`.
 */
export const CONTRACT_VERSION_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "EXPIRED", "SUPERSEDED"] as const;

/** One of `CONTRACT_VERSION_STATUSES`. */
export type ContractVersionStatus = (typeof CONTRACT_VERSION_STATUSES)[number];

/**
 * Collective contract revision.
 *
 * Backend: `_benefits_common.py` :: `ContractVersionResponse` (`/api/v1/benefits/company/{id}/contracts`).
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
  effectiveFrom: string;
  /** ISO-8601 date the contract expires. Null if ongoing. */
  effectiveTo: string | null;
  /** Percentage salary increase vs. the previous contract, if applicable. A `Decimal`: JSON text. */
  salaryIncreasePercent: DecimalString | null;
  /** Absolute salary increase (MXN) vs. the previous contract, if applicable. A `Decimal`: JSON text. */
  salaryIncreaseAmount: DecimalString | null;
  /** URL to the signed contract document in S3/MinIO. */
  documentUrl: string | null;
  /** Contract lifecycle status. */
  status: ContractVersionStatus;
  /** Free-form notes from the admin. */
  notes: string | null;
}
