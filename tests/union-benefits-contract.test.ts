import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION_STATUSES } from "../src/benefits";
import { V2_ENDPOINTS_GENERATED } from "../src/endpoints";

/**
 * Vitest transpila sin chequear tipos, así que la fixture de representantes v2 y prestaciones
 * (SITIMM-1491, delta de la ola 3) la compila tsc: un campo mal escrito o un negativo que deja de
 * fallar la rompe.
 */
describe("representantes v2 y prestaciones (SITIMM-1491)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/union-benefits-contract.ts")], {
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

  it("los estados de una versión son los 5 del CHECK de la tabla", () => {
    expect(CONTRACT_VERSION_STATUSES).toEqual(["DRAFT", "PENDING", "ACTIVE", "EXPIRED", "SUPERSEDED"]);
  });

  it("las rutas de representantes llevan el id numérico de la empresa", () => {
    const c = V2_ENDPOINTS_GENERATED.companies;
    expect(c.LIST_UNION_ROLES(45)).toBe("/api/v2/companies/45/union-representatives/roles");
    expect(c.UPDATE_UNION_REPRESENTATIVE(45, "r-1")).toBe("/api/v2/companies/45/union-representatives/r-1");
  });
});
