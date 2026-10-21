import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS_GENERATED } from "../src/endpoints";

/**
 * Vitest transpila sin chequear tipos, así que la fixture de contactos v2 (SITIMM-1499) la compila tsc:
 * un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("contactos de empresa v2 (SITIMM-1499)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-contacts-contract.ts")], {
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

  it("las rutas llevan el id numérico de la empresa y el uuid del contacto", () => {
    const c = V2_ENDPOINTS_GENERATED.companies;
    expect(c.CREATE_COMPANY_CONTACT(45)).toBe("/api/v2/companies/45/contacts");
    expect(c.UPDATE_COMPANY_CONTACT(45, "k-1")).toBe("/api/v2/companies/45/contacts/k-1");
    expect(c.DELETE_COMPANY_CONTACT(45, "k-1")).toBe("/api/v2/companies/45/contacts/k-1");
  });
});
