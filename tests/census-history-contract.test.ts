import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS, V2_ENDPOINTS_GENERATED } from "../src/endpoints";

/**
 * Vitest transpila sin chequear tipos, así que la fixture del historial en padrones (SITIMM-1472)
 * la compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("historial en padrones por empleado (SITIMM-1472)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/census-history-contract.ts")], {
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

  it("la ruta lleva el uuid del empleado, no el RFC", () => {
    expect(V2_ENDPOINTS.USERS_CENSUS_HISTORY_BY_EMPLOYEE).toBe("/users/census-history/by-employee/{employee_uuid}");
    expect(V2_ENDPOINTS_GENERATED.users.GET_CENSUS_HISTORY_BY_EMPLOYEE("e-1")).toBe(
      "/api/v2/users/census-history/by-employee/e-1",
    );
  });
});
