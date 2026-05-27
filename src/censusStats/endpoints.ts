/**
 * Census-stats endpoint paths — V1 stored stats + exports + V2 on-demand
 * statistics / municipalities / map.
 *
 * Backend:
 * - V1: `app/presentation/api/v1/census_stats.py` (prefix
 *   `/api/v1/census-stats`).
 * - V2: `app/presentation/api/v2/censuses_v2.py` (prefix
 *   `/api/v2/censuses`).
 *
 * All endpoints are JWT-authenticated and scope-filtered by
 * `CensusStatsRepository`: admin sees every census, advisors only their
 * assigned companies. The scope filter applies to both V1 and V2.
 */

export const CENSUS_STATS_V1_ENDPOINTS = {
  // ── V1 JSON ─────────────────────────────────────────────────
  /** GET → CensusStatsV1ListResponse. Query: company_ids (CSV). */
  V1_LATEST: "/api/v1/census-stats/latest",
  /** GET → CensusStatsV1ListResponse. Query: year, quarter, company_ids (CSV). */
  V1_PERIOD: "/api/v1/census-stats/period",
  /** GET → CensusStatsV1ListResponse. Query: year, quarter, limit, offset. */
  V1_BY_COMPANY: "/api/v1/census-stats/company/{company_id}",
  /** GET → CensusStatsV1Item. 404s when the census UUID isn't found. */
  V1_BY_CENSUS: "/api/v1/census-stats/{census_uuid}",

  // ── V1 XLSX / ZIP export ────────────────────────────────────
  /** GET → application/vnd.openxmlformats-officedocument.spreadsheetml.sheet or application/zip. */
  V1_EXPORT_COMPANY: "/api/v1/census-stats/export/company/{company_id}",
  /** GET → xlsx/zip stream. Query: layout, company_ids (CSV). */
  V1_EXPORT_LATEST: "/api/v1/census-stats/export/latest",
  /** GET → xlsx/zip stream. Query: year, quarter, layout, company_ids (CSV). */
  V1_EXPORT_PERIOD: "/api/v1/census-stats/export/period",
} as const;

export const CENSUS_STATS_V2_ENDPOINTS = {
  /** GET → CensusStatsStatisticsEnvelope. Query: preset, include (CSV). */
  V2_STATISTICS: "/api/v2/censuses/{census_uuid}/statistics",
  /** GET → CensusStatsMunicipalitiesEnvelope. */
  V2_MUNICIPALITIES: "/api/v2/censuses/{census_uuid}/municipalities",
  /** GET → CensusStatsMapEnvelope. */
  V2_MAP: "/api/v2/censuses/{census_uuid}/map",
} as const;

/** Combined map for typed-access by key. */
export const CENSUS_STATS_ENDPOINTS = {
  ...CENSUS_STATS_V1_ENDPOINTS,
  ...CENSUS_STATS_V2_ENDPOINTS,
} as const;

export type CensusStatsV1EndpointKey = keyof typeof CENSUS_STATS_V1_ENDPOINTS;
export type CensusStatsV2EndpointKey = keyof typeof CENSUS_STATS_V2_ENDPOINTS;
export type CensusStatsEndpointKey = keyof typeof CENSUS_STATS_ENDPOINTS;
export type CensusStatsEndpoint =
  (typeof CENSUS_STATS_ENDPOINTS)[CensusStatsEndpointKey];
