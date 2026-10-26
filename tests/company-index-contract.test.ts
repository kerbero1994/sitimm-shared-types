import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { censusPeriods, idle, loading } from "./fixtures/company-index-contract";

/** Las llaves de cable de mini-back SITIMM-1546 (`companies/listing.py`), en orden. */
const BE_KEYS = {
  censusPeriod: ["year", "quarter", "receivedAt"],
  processing: [
    "isProcessing",
    "processingStatus",
    "processingProgress",
    "processingEstimatedSeconds",
    "processedRows",
    "totalRows",
  ],
};

/**
 * Vitest transpila sin chequear tipos, así que la fixture de la lista de empresas (SITIMM-1546) la
 * compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("lista de empresas: trimestres del padrón y filas en carga (SITIMM-1546)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-index-contract.ts")], {
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

  it("cada forma tiene las llaves del BE, ni una más ni una menos", () => {
    for (const p of censusPeriods) expect(Object.keys(p)).toEqual(BE_KEYS.censusPeriod);
    expect(Object.keys(loading)).toEqual(BE_KEYS.processing);
    expect(Object.keys(idle)).toEqual(BE_KEYS.processing);
  });

  it("el trimestre más reciente va primero", () => {
    const order = censusPeriods.map((p) => p.year * 10 + p.quarter);
    expect(order).toEqual([...order].sort((a, b) => b - a));
  });

  it("el porcentaje sale de las filas", () => {
    expect(loading.processingProgress).toBe(Math.round((loading.processedRows! / loading.totalRows!) * 1000) / 10);
  });
});
