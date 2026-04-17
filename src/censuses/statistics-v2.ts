/**
 * Census V2 on-demand statistics types.
 *
 * Backend equivalents (mini-back):
 * - app/presentation/schemas/census_statistics_v2.py
 * - app/application/services/census_statistics_service.py
 *
 * Returned by:
 * - GET /api/v2/censuses/{uuid}/statistics
 * - GET /api/v2/censuses/{uuid}/municipalities
 * - GET /api/v2/censuses/{uuid}/map
 *
 * All numeric aggregates come back as JSON numbers (not strings) unlike v1
 * stats. Nullable fields come back as `null`, not missing keys.
 */

// ── Preset + section enums ──────────────────────────────────────────

export type StatisticsPreset = "basic" | "advanced" | "full";

export type StatisticsSection =
  | "composition"
  | "demographics"
  | "demographics_extras"
  | "employment"
  | "tenure"
  | "hiring_trend"
  | "compensation"
  | "compensation_advanced"
  | "geography"
  | "geography_advanced"
  | "data_quality"
  | "intersectional";

// ── Shared building blocks ──────────────────────────────────────────

export interface DistributionEntryV2 {
  name: string;
  count: number;
  pct: number;
}

export interface RangeEntry {
  range: string;
  count: number;
  pct: number;
}

export interface NumericStats {
  avg: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
}

export interface CensusRefV2 {
  id: number;
  uuid: string;
  company_id: number;
  company_name: string;
  year: number | null;
  quarter: number | null;
  received_at: string | null;
  created_at: string;
  original_file_url: string | null;
}

// ── Composition ─────────────────────────────────────────────────────

export interface Composition {
  headcount: number;
  men_count: number;
  women_count: number;
  other_count: number;
  men_pct: number;
  women_pct: number;
  other_pct: number;
}

// ── Demographics ────────────────────────────────────────────────────

export interface GenerationEntry {
  generation: string;
  count: number;
  pct: number;
}

export interface AgePyramidEntry {
  range: string;
  men: number;
  women: number;
  other: number;
}

export interface DemographicsBasic {
  age: NumericStats;
  age_ranges: RangeEntry[];
  civil_state: DistributionEntryV2[];
  scholarship: DistributionEntryV2[];
}

export interface DemographicsExtras {
  generation: GenerationEntry[];
  age_pyramid: AgePyramidEntry[];
}

export interface Demographics {
  basic: DemographicsBasic;
  extras: DemographicsExtras | null;
}

// ── Employment ──────────────────────────────────────────────────────

export interface Employment {
  top_jobs: DistributionEntryV2[];
  top_departments: DistributionEntryV2[];
  contract_type: DistributionEntryV2[];
  status: DistributionEntryV2[];
}

// ── Tenure ──────────────────────────────────────────────────────────

export interface Tenure {
  stats: NumericStats;
  buckets: RangeEntry[];
}

// ── Hiring trend ────────────────────────────────────────────────────

export interface HiringYearEntry {
  year: number;
  count: number;
}

export interface HiringQuarterEntry {
  year: number;
  quarter: number;
  count: number;
}

export interface HiringTrend {
  by_year: HiringYearEntry[];
  by_quarter: HiringQuarterEntry[];
}

// ── Compensation ────────────────────────────────────────────────────

export interface SalaryPercentiles {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
}

export interface SalaryByGender {
  men_avg: number | null;
  women_avg: number | null;
  other_avg: number | null;
}

export interface GenderGap {
  men_avg: number | null;
  women_avg: number | null;
  abs_gap: number | null;
  pct_gap: number | null;
}

export interface SalaryByGroupEntry {
  group: string;
  avg: number;
  count: number;
}

export interface CompensationBasic {
  stats: NumericStats;
  ranges: RangeEntry[];
  by_gender: SalaryByGender;
}

export interface CompensationAdvanced {
  percentiles: SalaryPercentiles;
  by_department: SalaryByGroupEntry[];
  by_job: SalaryByGroupEntry[];
  by_age_range: SalaryByGroupEntry[];
  by_tenure_bucket: SalaryByGroupEntry[];
  gender_gap: GenderGap;
}

export interface Compensation {
  basic: CompensationBasic;
  advanced: CompensationAdvanced | null;
}

// ── Geography ───────────────────────────────────────────────────────

export interface GeographyBasic {
  states: DistributionEntryV2[];
  municipalities: DistributionEntryV2[];
  top_cities: DistributionEntryV2[];
}

export interface GeographyAdvanced {
  top_localplaces: DistributionEntryV2[];
  top_postal_codes: DistributionEntryV2[];
  geocoded_count: number;
  geocoded_pct: number;
}

export interface Geography {
  basic: GeographyBasic;
  advanced: GeographyAdvanced | null;
}

// ── Data quality ────────────────────────────────────────────────────

export interface FieldCoverageEntry {
  field: string;
  count: number;
  pct: number;
}

export interface DuplicateEntry {
  value: string;
  count: number;
}

export interface Duplicates {
  rfc: DuplicateEntry[];
  curp: DuplicateEntry[];
  payroll: DuplicateEntry[];
}

export interface DataQualityV2 {
  coverage: FieldCoverageEntry[];
  duplicates: Duplicates;
  flags_summary: DistributionEntryV2[];
}

// ── Intersectional ──────────────────────────────────────────────────

export interface GenderByDepartmentEntry {
  department: string;
  men: number;
  women: number;
  other: number;
}

export interface TenureByDepartmentEntry {
  department: string;
  avg_tenure: number | null;
  count: number;
}

export interface Intersectional {
  gender_by_department: GenderByDepartmentEntry[];
  gender_age_pyramid: AgePyramidEntry[];
  tenure_by_department: TenureByDepartmentEntry[];
}

// ── Top-level statistics response ───────────────────────────────────

export interface CensusStatisticsResponseV2 {
  census: CensusRefV2;
  preset: StatisticsPreset;
  sections_included: StatisticsSection[];
  composition: Composition | null;
  demographics: Demographics | null;
  employment: Employment | null;
  tenure: Tenure | null;
  hiring_trend: HiringTrend | null;
  compensation: Compensation | null;
  geography: Geography | null;
  data_quality: DataQualityV2 | null;
  intersectional: Intersectional | null;
  computed_in_ms: number;
}

// ── Municipalities endpoint ─────────────────────────────────────────

export interface MunicipalityEmployee {
  uuid: string;
  name: string;
  last_names: string | null;
  job: string | null;
  payroll: string | null;
  gender: string | null;
  /** Decimal serialized as string — parse with Number() before use. */
  latitude: string | null;
  longitude: string | null;
}

export interface MunicipalityEntry {
  id: number | null;
  name: string;
  state_name: string | null;
  count: number;
  pct: number;
  employees: MunicipalityEmployee[];
}

export interface CensusMunicipalitiesResponseV2 {
  census: CensusRefV2;
  total: number;
  items: MunicipalityEntry[];
}

// ── Map endpoint ────────────────────────────────────────────────────

export interface MapEmployee {
  uuid: string;
  name: string;
  last_names: string | null;
  payroll: string | null;
  job: string | null;
  department: string | null;
  gender: string | null;
  city_name: string | null;
  municipality_name: string | null;
  state_name: string | null;
  /** Decimal serialized as string — parse with Number() before use. */
  latitude: string;
  longitude: string;
}

export interface CensusMapResponseV2 {
  census: CensusRefV2;
  total_with_geo: number;
  total_without_geo: number;
  items: MapEmployee[];
}
