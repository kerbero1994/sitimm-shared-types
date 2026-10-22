import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { shown } from "./fixtures/company-show-contract";

describe("companies/show contract (SITIMM-1418)", () => {
  it("compiles the exact wire fixture", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-show-contract.ts")], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    expect(diagnostics).toEqual([]);
  });

  it("keeps the response envelope and BE field casing", () => {
    const detail = shown.data.company;
    expect(detail.company.logoUrl).toContain("company-logo");
    expect(detail.company.technical_detail?.products?.[0].name).toBe("Producto Ejemplo");
    expect(detail.company.LatestCensus?.men_count).toBe(75);
    expect(detail.statistics?.total_census).toBe(detail.censusCount);
    expect(detail.advisors[0].is_auto_advisor).toBe(true);
  });
});
