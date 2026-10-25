import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { bulkRequest, fullItem, fullRequest, preview } from "./fixtures/company-import-contract";

/** Las llaves de `CompanyBulkItem` y `CompanyBulkUploadRequest` en mini-back `8cbf556e`, en orden. */
const BE_ITEM_KEYS = [
  "name",
  "phone",
  "rhPassword",
  "address",
  "electoralId",
  "hasCommittee",
  "companyTypeCode",
  "countryName",
  "stateName",
  "cityName",
  "industrialParkName",
  "advisorEmails",
  "acceptanceDate",
  "operationStart",
  "contractValidity",
  "lastRevision",
  "productCodes",
  "clientCodes",
  "contractTypeCode",
];
const BE_REQUEST_KEYS = ["companies", "skipDuplicates", "validateOnly", "corrections"];

/**
 * Vitest transpila sin chequear tipos, así que la fixture de importar empresas (SITIMM-1498) la
 * compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("importar empresas desde un archivo (SITIMM-1498)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-import-contract.ts")], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
    expect(diagnostics).toEqual([]);
  });

  it("los conteos cuadran con las filas: N de M para el reporte", () => {
    expect(preview.results.filter((r) => r.success)).toHaveLength(preview.created);
    expect(preview.created + preview.skipped + preview.failed).toBe(preview.total);
  });

  it("la petición de /bulk-upload tiene las llaves del BE, ni una más ni una menos", () => {
    expect(Object.keys(fullItem)).toEqual(BE_ITEM_KEYS);
    expect(Object.keys(fullRequest)).toEqual(BE_REQUEST_KEYS);
  });

  it("la petición real lleva la corrección con la forma que el BE revalida", () => {
    expect(bulkRequest.corrections).toEqual([{ row: 1, field: "municipality", value: "San Luis Potosí" }]);
  });

  it("una fila que no se importa dice por qué; una que sí, no trae errores", () => {
    for (const r of preview.results) expect(r.success).toBe(r.errors.length === 0);
  });
});
