/**
 * Fixture de tests/company-index-contract.test.ts: la compila tsc, no vitest. Las piezas tienen la
 * forma exacta que arma mini-back SITIMM-1546 (listing.py :: `_group_census_periods_by_company` y
 * `_build_processing_entry`, JSON del handler con datos sintéticos); los @ts-expect-error fijan lo
 * que no viaja.
 */
import type { CompanyCensusPeriod, CompanyIndexProcessing } from "../../src/companies";

// The newest quarter first; a late Q3 padrón received in October, and a padrón without date.
export const censusPeriods: CompanyCensusPeriod[] = [
  { year: 2026, quarter: 3, receivedAt: "2026-10-02" },
  { year: 2026, quarter: 2, receivedAt: null },
];

// A company without census.
export const noCensus: CompanyCensusPeriod[] = [];

// "Cargándose: 58 de 137 personas".
export const loading: CompanyIndexProcessing = {
  isProcessing: true,
  processingStatus: "processing",
  processingProgress: 42.3,
  processingEstimatedSeconds: null,
  processedRows: 58,
  totalRows: 137,
};

export const idle: CompanyIndexProcessing = {
  isProcessing: false,
  processingStatus: null,
  processingProgress: null,
  processingEstimatedSeconds: null,
  processedRows: null,
  totalRows: null,
};

// The quarter is 1–4, as the DB check says.
// @ts-expect-error quarter 5 does not exist
export const fifthQuarter: CompanyCensusPeriod = { year: 2026, quarter: 5, receivedAt: null };

// The period is not the census id nor its uuid: the panel only needs the quarter and its date.
// @ts-expect-error censusId does not travel
export const withCensusId: CompanyCensusPeriod = { ...censusPeriods[0], censusId: 10 };

// Both row counts travel, even when null.
// @ts-expect-error totalRows is required
export const withoutTotal: CompanyIndexProcessing = { ...loading, totalRows: undefined };
