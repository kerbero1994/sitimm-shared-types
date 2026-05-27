/**
 * Census statistics types — covers both the V1 stored-stats endpoints and
 * the V2 on-demand statistics / municipalities / map endpoints.
 *
 * Backend:
 * - V1 (stored, pre-computed): `app/presentation/schemas/census_stats.py`
 *   served from `app/presentation/api/v1/census_stats.py` under
 *   `/api/v1/census-stats/...`.
 * - V2 (on-demand, opt-in sections):
 *   `app/presentation/schemas/census_statistics_v2.py` served from
 *   `app/presentation/api/v2/censuses_v2.py` under
 *   `/api/v2/censuses/{uuid}/{statistics|municipalities|map}`.
 *
 * Wire conventions:
 * - Pydantic schemas use snake_case — TS interfaces mirror that exactly.
 * - V2 responses are wrapped in `{ "status": "success", "data": ... }`
 *   (see `success_response()` in `app/utils/response_builder.py`).
 * - `Decimal` fields (latitude / longitude on map / municipality
 *   employees) serialise to JSON **strings** because
 *   `model_dump(by_alias=True, mode="json")` is the V2 convention.
 *   Frontends `parseFloat` them when feeding into map libraries.
 * - Percentages are floats already rounded to 2 decimals server-side.
 */

// ─────────────────────────────────────────────────────────────────────
// Enums (V2)
// ─────────────────────────────────────────────────────────────────────

/**
 * V2 statistics preset (`preset` query param).
 * Backend: `StatisticsPreset` enum in `census_statistics_v2.py`.
 *
 * - `basic` — composition, demographics, employment, tenure,
 *   compensation (basic), geography (basic).
 * - `advanced` — everything in basic plus demographic extras, hiring
 *   trend, advanced compensation breakdowns and geography extras.
 * - `full` — advanced plus data-quality and intersectional analysis.
 */
export const CENSUS_STATS_PRESETS = ["basic", "advanced", "full"] as const;
export type CensusStatsPreset = (typeof CENSUS_STATS_PRESETS)[number];

/**
 * Opt-in section names accepted by the `include=a,b,c` query parameter
 * on `GET /api/v2/censuses/{uuid}/statistics`.
 * Backend: `StatisticsSection` enum.
 */
export const CENSUS_STATS_SECTIONS = [
  "composition",
  "demographics",
  "demographics_extras",
  "employment",
  "tenure",
  "hiring_trend",
  "compensation",
  "compensation_advanced",
  "geography",
  "geography_advanced",
  "data_quality",
  "intersectional",
] as const;
export type CensusStatsSection = (typeof CENSUS_STATS_SECTIONS)[number];

/**
 * Export layout accepted by the V1 export endpoints.
 * Backend: `Layout` literal in
 * `app/application/use_cases/census_stats/xlsx_exporter.py`.
 */
export const CENSUS_STATS_EXPORT_LAYOUTS = [
  "single_file",
  "sheet_per_company",
  "multi_file",
] as const;
export type CensusStatsExportLayout =
  (typeof CENSUS_STATS_EXPORT_LAYOUTS)[number];

// ─────────────────────────────────────────────────────────────────────
// Shared building blocks
// ─────────────────────────────────────────────────────────────────────

/**
 * One "name + count + pct" tuple. Used by every distribution slice
 * (education, municipality, top jobs, top departments, status, ...).
 * Backend: `DistributionEntryOut`.
 */
export interface CensusStatsDistributionEntry {
  name: string;
  count: number;
  /** 0..100, rounded to 2 decimals server-side. */
  pct: number;
}

/**
 * One "range + count + pct" tuple. Used by tenure buckets, salary
 * ranges, age ranges.
 * Backend: `RangeEntryOut`.
 */
export interface CensusStatsRangeEntry {
  range: string;
  count: number;
  pct: number;
}

/**
 * Min / max / avg / median snapshot. Every numeric field is nullable
 * because empty slices have no aggregate.
 * Backend: `NumericStatsOut`.
 */
export interface CensusStatsNumericStats {
  avg: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
}

/**
 * Census reference + parent company hydration. Present on both V1 and
 * V2 responses. V1 omits `uuid` (the schema literally has no uuid field
 * on this row — use the parent `Census.uuid` lookup if needed).
 *
 * Backend (V1): `CensusRefOut` in `schemas/census_stats.py`.
 * Backend (V2): `CensusRefOut` in `schemas/census_statistics_v2.py`.
 */
export interface CensusStatsCensusRef {
  id: number;
  /** UUID v4 — only populated on the V2 schema. */
  uuid?: string;
  company_id: number;
  company_name: string;
  year: number | null;
  /** 1..4 — `null` when the census was never tagged with a quarter. */
  quarter: number | null;
  /** ISO date `YYYY-MM-DD` — null when not recorded. */
  received_at: string | null;
  /** ISO 8601. */
  created_at: string;
  original_file_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// V1 — stored stats (precomputed)
// ─────────────────────────────────────────────────────────────────────

/**
 * V1 stored stats payload. Mirrors the pre-computed `CensusStat` row
 * shape returned by `/api/v1/census-stats/*`.
 *
 * `avg_salary`, `avg_age_years`, `avg_tenure_years` are Pydantic
 * `Decimal | None` — they serialise as JSON strings (e.g. `"45.32"`)
 * not floats, because Pydantic v2 emits Decimal as string in JSON mode.
 *
 * Backend: `CensusStatsOut`.
 */
export interface CensusStatsV1Stats {
  headcount: number;
  men_count: number;
  women_count: number;
  other_count: number;
  /** Decimal-as-string (e.g. `"6543.21"`) or null on empty slice. */
  avg_salary: string | null;
  /** Decimal-as-string (years, e.g. `"34.5"`) or null. */
  avg_age_years: string | null;
  under_30_count: number;
  /** Decimal-as-string or null. */
  avg_tenure_years: string | null;
  /** Map of bucket label → count, e.g. `{ "<1y": 12, "1-3y": 88 }`. */
  tenure_buckets: Record<string, number>;
  education_distribution: CensusStatsDistributionEntry[];
  municipality_distribution: CensusStatsDistributionEntry[];
  /** ISO 8601. */
  computed_at: string;
}

/**
 * One row in `/api/v1/census-stats/*` JSON list endpoints.
 * Backend: `CensusStatsItemOut`.
 */
export interface CensusStatsV1Item {
  census: CensusStatsCensusRef;
  stats: CensusStatsV1Stats;
}

/**
 * Paged-but-not-paginated wrapper. The V1 endpoints return the full set
 * the caller may see plus a `total` count.
 * Backend: `CensusStatsListOut`.
 */
export interface CensusStatsV1ListResponse {
  items: CensusStatsV1Item[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────
// V2 — on-demand statistics
// ─────────────────────────────────────────────────────────────────────

/**
 * Composition slice. Always present on the basic preset.
 * Backend: `CompositionOut`.
 */
export interface CensusStatsComposition {
  headcount: number;
  men_count: number;
  women_count: number;
  other_count: number;
  men_pct: number;
  women_pct: number;
  other_pct: number;
}

/**
 * One generation cohort.
 * Backend: `GenerationEntryOut`.
 */
export interface CensusStatsGenerationEntry {
  generation: string;
  count: number;
  pct: number;
}

/**
 * One age-pyramid bucket. Each gender carries its own count for that
 * age range.
 * Backend: `AgePyramidEntryOut`.
 */
export interface CensusStatsAgePyramidEntry {
  range: string;
  men: number;
  women: number;
  other: number;
}

/**
 * Demographics — basic preset slice.
 * Backend: `DemographicsBasicOut`.
 */
export interface CensusStatsDemographicsBasic {
  age: CensusStatsNumericStats;
  age_ranges: CensusStatsRangeEntry[];
  civil_state: CensusStatsDistributionEntry[];
  scholarship: CensusStatsDistributionEntry[];
}

/**
 * Demographics — advanced extras.
 * Backend: `DemographicsExtrasOut`.
 */
export interface CensusStatsDemographicsExtras {
  generation: CensusStatsGenerationEntry[];
  age_pyramid: CensusStatsAgePyramidEntry[];
}

/**
 * Demographics composite — `extras` is null on the basic preset.
 * Backend: `DemographicsOut`.
 */
export interface CensusStatsDemographics {
  basic: CensusStatsDemographicsBasic;
  extras: CensusStatsDemographicsExtras | null;
}

/**
 * Employment slice. Each `top_*` list is bounded to 15 entries.
 * Backend: `EmploymentOut`.
 */
export interface CensusStatsEmployment {
  top_jobs: CensusStatsDistributionEntry[];
  top_departments: CensusStatsDistributionEntry[];
  contract_type: CensusStatsDistributionEntry[];
  status: CensusStatsDistributionEntry[];
}

/**
 * Tenure slice.
 * Backend: `TenureOut`.
 */
export interface CensusStatsTenure {
  stats: CensusStatsNumericStats;
  buckets: CensusStatsRangeEntry[];
}

/**
 * One hiring year-count row.
 * Backend: `HiringYearEntryOut`.
 */
export interface CensusStatsHiringYearEntry {
  year: number;
  count: number;
}

/**
 * One hiring (year, quarter)-count row.
 * Backend: `HiringQuarterEntryOut`.
 */
export interface CensusStatsHiringQuarterEntry {
  year: number;
  quarter: number;
  count: number;
}

/**
 * Hiring-trend slice (advanced preset).
 * Backend: `HiringTrendOut`.
 */
export interface CensusStatsHiringTrend {
  by_year: CensusStatsHiringYearEntry[];
  by_quarter: CensusStatsHiringQuarterEntry[];
}

/**
 * Salary percentiles (advanced preset).
 * Backend: `SalaryPercentilesOut`.
 */
export interface CensusStatsSalaryPercentiles {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
}

/**
 * Average salary broken out by gender.
 * Backend: `SalaryByGenderOut`.
 */
export interface CensusStatsSalaryByGender {
  men_avg: number | null;
  women_avg: number | null;
  other_avg: number | null;
}

/**
 * Gender-pay-gap snapshot.
 * Backend: `GenderGapOut`.
 *
 * `abs_gap` = `men_avg - women_avg`. `pct_gap` = `abs_gap / men_avg *
 * 100`. Both are null when either side is empty.
 */
export interface CensusStatsGenderGap {
  men_avg: number | null;
  women_avg: number | null;
  abs_gap: number | null;
  pct_gap: number | null;
}

/**
 * One "group → avg salary, count" row used by `by_department`, `by_job`,
 * `by_age_range`, `by_tenure_bucket`.
 * Backend: `SalaryByGroupEntryOut`.
 */
export interface CensusStatsSalaryByGroupEntry {
  group: string;
  avg: number;
  count: number;
}

/**
 * Compensation — basic preset slice.
 * Backend: `CompensationBasicOut`.
 */
export interface CensusStatsCompensationBasic {
  stats: CensusStatsNumericStats;
  ranges: CensusStatsRangeEntry[];
  by_gender: CensusStatsSalaryByGender;
}

/**
 * Compensation — advanced preset slice. Each `by_*` list is bounded to
 * 10 entries.
 * Backend: `CompensationAdvancedOut`.
 */
export interface CensusStatsCompensationAdvanced {
  percentiles: CensusStatsSalaryPercentiles;
  by_department: CensusStatsSalaryByGroupEntry[];
  by_job: CensusStatsSalaryByGroupEntry[];
  by_age_range: CensusStatsSalaryByGroupEntry[];
  by_tenure_bucket: CensusStatsSalaryByGroupEntry[];
  gender_gap: CensusStatsGenderGap;
}

/**
 * Compensation composite — `advanced` is null on the basic preset.
 * Backend: `CompensationOut`.
 */
export interface CensusStatsCompensation {
  basic: CensusStatsCompensationBasic;
  advanced: CensusStatsCompensationAdvanced | null;
}

/**
 * Geography — basic preset slice. `top_cities` bounded to 15.
 * Backend: `GeographyBasicOut`.
 */
export interface CensusStatsGeographyBasic {
  states: CensusStatsDistributionEntry[];
  municipalities: CensusStatsDistributionEntry[];
  top_cities: CensusStatsDistributionEntry[];
}

/**
 * Geography — advanced extras. Each `top_*` bounded to 20.
 * Backend: `GeographyAdvancedOut`.
 */
export interface CensusStatsGeographyAdvanced {
  top_localplaces: CensusStatsDistributionEntry[];
  top_postal_codes: CensusStatsDistributionEntry[];
  geocoded_count: number;
  geocoded_pct: number;
}

/**
 * Geography composite — `advanced` is null on the basic preset.
 * Backend: `GeographyOut`.
 */
export interface CensusStatsGeography {
  basic: CensusStatsGeographyBasic;
  advanced: CensusStatsGeographyAdvanced | null;
}

/**
 * One field-coverage row, e.g. `{ field: "rfc", count: 4_312, pct: 98.2 }`.
 * Backend: `FieldCoverageEntryOut`.
 */
export interface CensusStatsFieldCoverageEntry {
  field: string;
  count: number;
  pct: number;
}

/**
 * One duplicate identifier row.
 * Backend: `DuplicateEntryOut`.
 */
export interface CensusStatsDuplicateEntry {
  /** Normalised: `trim().toUpperCase()`. */
  value: string;
  /** Always `>= 2`. */
  count: number;
}

/**
 * Duplicate identifiers grouped by their column.
 * Backend: `DuplicatesOut`.
 */
export interface CensusStatsDuplicates {
  rfc: CensusStatsDuplicateEntry[];
  curp: CensusStatsDuplicateEntry[];
  payroll: CensusStatsDuplicateEntry[];
}

/**
 * Data-quality slice (full preset).
 * Backend: `DataQualityOut`.
 */
export interface CensusStatsDataQuality {
  coverage: CensusStatsFieldCoverageEntry[];
  duplicates: CensusStatsDuplicates;
  flags_summary: CensusStatsDistributionEntry[];
}

/**
 * One "department → gender breakdown" row.
 * Backend: `GenderByDepartmentEntryOut`.
 */
export interface CensusStatsGenderByDepartmentEntry {
  department: string;
  men: number;
  women: number;
  other: number;
}

/**
 * One "department → tenure breakdown" row.
 * Backend: `TenureByDepartmentEntryOut`.
 */
export interface CensusStatsTenureByDepartmentEntry {
  department: string;
  avg_tenure: number | null;
  count: number;
}

/**
 * Intersectional slice (full preset).
 * Backend: `IntersectionalOut`.
 *
 * `gender_by_department` and `tenure_by_department` are bounded to top
 * 10. `gender_age_pyramid` is the full age-range set.
 */
export interface CensusStatsIntersectional {
  gender_by_department: CensusStatsGenderByDepartmentEntry[];
  gender_age_pyramid: CensusStatsAgePyramidEntry[];
  tenure_by_department: CensusStatsTenureByDepartmentEntry[];
}

/**
 * V2 statistics response payload (the inner `data` of the V2 wrapper).
 * Sections not in `sections_included` come back as `null` so the FE can
 * render a "load more" action.
 * Backend: `StatisticsResponseOut`.
 */
export interface CensusStatsStatisticsResponse {
  census: CensusStatsCensusRef;
  preset: CensusStatsPreset;
  /** Sorted ascending by section enum value. */
  sections_included: CensusStatsSection[];
  composition: CensusStatsComposition | null;
  demographics: CensusStatsDemographics | null;
  employment: CensusStatsEmployment | null;
  tenure: CensusStatsTenure | null;
  hiring_trend: CensusStatsHiringTrend | null;
  compensation: CensusStatsCompensation | null;
  geography: CensusStatsGeography | null;
  data_quality: CensusStatsDataQuality | null;
  intersectional: CensusStatsIntersectional | null;
  computed_in_ms: number;
}

// ─────────────────────────────────────────────────────────────────────
// V2 — municipalities endpoint
// ─────────────────────────────────────────────────────────────────────

/**
 * One employee row attached to a municipality.
 * Backend: `MunicipalityEmployeeOut`.
 *
 * `latitude` and `longitude` are Pydantic `Decimal | None`; over the
 * wire they are JSON **strings** (e.g. `"19.43261"`) or null.
 */
export interface CensusStatsMunicipalityEmployee {
  /** UUID v4. */
  uuid: string;
  name: string;
  last_names: string | null;
  job: string | null;
  payroll: string | null;
  /** Free-form gender column from the census ("M" / "F" / other). */
  gender: string | null;
  /** Decimal-as-string. */
  latitude: string | null;
  /** Decimal-as-string. */
  longitude: string | null;
}

/**
 * One municipality bucket (or city_text fallback when MunicipalityId is
 * unresolved).
 * Backend: `MunicipalityEntryOut`.
 */
export interface CensusStatsMunicipalityEntry {
  /** `null` when grouping by `city_text` (no resolved MunicipalityId). */
  id: number | null;
  name: string;
  state_name: string | null;
  count: number;
  pct: number;
  employees: CensusStatsMunicipalityEmployee[];
}

/**
 * V2 `GET /api/v2/censuses/{uuid}/municipalities` response payload.
 * Backend: `MunicipalitiesResponseOut`.
 */
export interface CensusStatsMunicipalitiesResponse {
  census: CensusStatsCensusRef;
  total: number;
  items: CensusStatsMunicipalityEntry[];
}

// ─────────────────────────────────────────────────────────────────────
// V2 — map endpoint
// ─────────────────────────────────────────────────────────────────────

/**
 * One geo-referenced employee on the map. Unlike the municipality
 * variant, `latitude` and `longitude` are always present (the map
 * endpoint filters to rows with both coordinates set).
 * Backend: `MapEmployeeOut`.
 */
export interface CensusStatsMapEmployee {
  /** UUID v4. */
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
  /** Decimal-as-string — always present. */
  latitude: string;
  /** Decimal-as-string — always present. */
  longitude: string;
}

/**
 * V2 `GET /api/v2/censuses/{uuid}/map` response payload.
 * Backend: `MapResponseOut`.
 */
export interface CensusStatsMapResponse {
  census: CensusStatsCensusRef;
  total_with_geo: number;
  total_without_geo: number;
  items: CensusStatsMapEmployee[];
}

// ─────────────────────────────────────────────────────────────────────
// V2 response envelope
// ─────────────────────────────────────────────────────────────────────

/**
 * Common V2 success envelope produced by `success_response()` in
 * `app/utils/response_builder.py`. All three V2 census-stats endpoints
 * wrap their payload in this shape.
 */
export interface CensusStatsV2Envelope<T> {
  status: "success";
  data: T;
}

/** Typed envelope for `GET /api/v2/censuses/{uuid}/statistics`. */
export type CensusStatsStatisticsEnvelope =
  CensusStatsV2Envelope<CensusStatsStatisticsResponse>;
/** Typed envelope for `GET /api/v2/censuses/{uuid}/municipalities`. */
export type CensusStatsMunicipalitiesEnvelope =
  CensusStatsV2Envelope<CensusStatsMunicipalitiesResponse>;
/** Typed envelope for `GET /api/v2/censuses/{uuid}/map`. */
export type CensusStatsMapEnvelope = CensusStatsV2Envelope<CensusStatsMapResponse>;
