/**
 * Census statistics — barrel re-export.
 *
 * Covers both the V1 stored-stats endpoints
 * (`/api/v1/census-stats/...`) and the V2 on-demand statistics +
 * municipalities + map endpoints (`/api/v2/censuses/{uuid}/...`).
 *
 * ```ts
 * import { CensusStatsStatisticsResponse, CENSUS_STATS_ENDPOINTS }
 *   from "@kerbero1994/shared-types";
 * // or
 * import * as CensusStats from "@kerbero1994/shared-types/censusStats";
 * ```
 */

export * from "./types";
export * from "./endpoints";
