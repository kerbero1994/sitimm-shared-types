import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS_GENERATED } from "../src/endpoints";

/**
 * Vitest transpila sin chequear tipos, así que la fixture de documentos de empresa (SITIMM-1418,
 * D11 del detalle) la compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("documentos de empresa v2 (SITIMM-1418)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-documents-contract.ts")], {
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

  it("las rutas llevan el id numérico de la empresa y el uuid del documento", () => {
    expect(V2_ENDPOINTS_GENERATED.companies.LIST_COMPANY_DOCUMENTS(45)).toBe("/api/v2/companies/45/documents");
    expect(V2_ENDPOINTS_GENERATED.companies.GET_COMPANY_DOCUMENT(45, "d-1")).toBe(
      "/api/v2/companies/45/documents/d-1",
    );
  });
});
