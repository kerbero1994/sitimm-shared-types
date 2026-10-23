/**
 * Fixture de tests/census-reports-contract.test.ts: la compila tsc. Formas de mini-back #784
 * (SITIMM-1520, `app/application/dtos/census_report.py`), con datos sintéticos.
 */
import type {
  CensusReportBatchStatusResponse,
  CensusReportConfig,
  CensusReportFile,
} from "../../src/censuses";

// Los 7 campos del dueño («Ofrecerlos opcionales») junto a los de siempre.
export const config: CensusReportConfig = {
  fields: ["payroll", "full_name", "nss", "age_years", "civil_state", "scholarship", "city", "state", "postal_code"],
  exclude_fields: [],
  split_name: { mode: "full_name" },
  split_address: { mode: "colony_city" },
};

export const failedFile: CensusReportFile = {
  company_uuid: "c-1",
  company_name: "EMPRESA EJEMPLO",
  status: "error",
  employee_count: 0,
  error_message: "No employees found in census",
  error_code: "no_census_employees",
};

export const readyFile: CensusReportFile = {
  company_uuid: "c-2",
  company_name: "OTRA EJEMPLO",
  status: "ready",
  employee_count: 12,
  validation: { valid_count: 11, total_count: 12, issues: [{ field: "curp", count: 1 }] },
  download_url: "/api/v1/census-reports/download/t",
  error_code: null,
};

export const lostJob: CensusReportBatchStatusResponse = {
  job_id: "j-1",
  status: "failed",
  progress: { current: 1, total: 2, percentage: 50 },
  files: [failedFile, readyFile],
  created_at: "2026-10-23T06:00:00Z",
  updated_at: "2026-10-23T06:20:00Z",
  error_code: "timeout",
};

// @ts-expect-error desde SITIMM-1520 los issues son {field, count}, no frases
export const textIssue: CensusReportFile = { ...readyFile, validation: { valid_count: 1, total_count: 2, issues: ["CURP vacío: 1 empleados"] } };

// @ts-expect-error error_code es uno de los 3 códigos estables
export const otherCode: CensusReportFile = { ...failedFile, error_code: "boom" };

// @ts-expect-error el error_code del trabajo solo es "timeout"
export const jobCode: CensusReportBatchStatusResponse = { ...lostJob, error_code: "internal" };
