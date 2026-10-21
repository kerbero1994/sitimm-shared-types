import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS, V2_ENDPOINTS_GENERATED } from "../src/endpoints";

/**
 * Vitest transpila sin chequear tipos, así que la fixture del alta manual (SITIMM-1469, Padrones 2d)
 * la compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("alta manual de una persona en la empresa (SITIMM-1469)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-employee-contract.ts")], {
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

  it("la ruta lleva el uuid de la empresa", () => {
    expect(V2_ENDPOINTS.COMPANY_EMPLOYEES_CREATE).toBe("/companies/{company_uuid}/employees");
    expect(V2_ENDPOINTS_GENERATED.companies.CREATE_COMPANY_EMPLOYEE("c-1")).toBe("/api/v2/companies/c-1/employees");
  });
});
