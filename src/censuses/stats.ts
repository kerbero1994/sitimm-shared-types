/**
 * Census stats types.
 *
 * Backend equivalents (mini-back):
 * - DistributionEntry  -> app/presentation/schemas/census_stats.py :: DistributionEntryOut
 * - CensusStatsRef     -> census_stats.py :: CensusRefOut
 * - CensusStatsPayload -> census_stats.py :: CensusStatsOut
 * - CensusStatsItem    -> census_stats.py :: CensusStatsItemOut
 * - CensusStatsList    -> census_stats.py :: CensusStatsListOut
 *
 * Returned by /api/v1/census-stats/{latest,period,company/{id},{id}}.
 * Decimal fields are serialized as JSON strings to preserve precision —
 * parse with Number() / parseFloat() before arithmetic.
 */

/** Single row of an education- or municipality-distribution list. */
export interface DistributionEntry {
  /** Display name (education level or municipality). */
  name: string;
  /** Raw count of employees matching this name. */
  count: number;
  /** Percentage of total (0–100), rounded to 2 decimals. */
  pct: number;
}

/** Reference to the census that produced a stats row. */
export interface CensusStatsRef {
  /** Census primary key. */
  id: number;
  /** Owning company ID (FK to Company). */
  company_id: number;
  /** Resolved company name (joined server-side). Empty string when missing. */
  company_name: string;
  /** Calendar year for the census (e.g. 2026). NULL for legacy rows. */
  year: number | null;
  /** Quarter 1–4 (March pivot). NULL for legacy rows. */
  quarter: number | null;
  /** ISO calendar date when the census file was received. NULL for legacy rows. */
  received_at: string | null;
  /** ISO 8601 datetime when the Census row was created. */
  created_at: string;
  /** MinIO object key for the original uploaded file. NULL for legacy rows. */
  original_file_url: string | null;
}

/** Tenure buckets keyed by year ranges. Always contains all five keys. */
export type TenureBuckets = Record<
  "0-1" | "2-5" | "6-10" | "10+" | "unknown",
  number
>;

/** Aggregated stats for a single census. */
export interface CensusStatsPayload {
  /** Total employees in the census. */
  headcount: number;
  /** Gender = "M" count. */
  men_count: number;
  /** Gender = "F" count. */
  women_count: number;
  /** Gender NULL or neither "M" nor "F" count. */
  other_count: number;
  /** Decimal serialized as string. NULL when all salaries are missing. */
  avg_salary: string | null;
  /** Decimal serialized as string. NULL when all birth dates are missing. */
  avg_age_years: string | null;
  /** Count of employees < 30 years old. */
  under_30_count: number;
  /** Decimal serialized as string. NULL when all entry dates are missing. */
  avg_tenure_years: string | null;
  /** Tenure bucket counts. Sum equals `headcount` (INV-04). */
  tenure_buckets: TenureBuckets;
  /** Ordered desc by count. */
  education_distribution: DistributionEntry[];
  /** Ordered desc by count. */
  municipality_distribution: DistributionEntry[];
  /** ISO 8601 datetime when the stats row was computed. */
  computed_at: string;
}

/** One item in a list response — census reference + its stats payload. */
export interface CensusStatsItem {
  census: CensusStatsRef;
  stats: CensusStatsPayload;
}

/** List response envelope returned by /latest, /period, /company/{id}. */
export interface CensusStatsList {
  items: CensusStatsItem[];
  /** Count of items returned. Not a total across pages — the feature is not paginated. */
  total: number;
}
