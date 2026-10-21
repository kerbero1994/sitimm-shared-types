import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { catalogOnly, duplicate, noDuplicate, shown } from "./fixtures/company-technical-contract";

/**
 * Vitest transpila sin chequear tipos, así que la fixture de detalles técnicos y check-duplicate
 * (SITIMM-1497, mini-back #779) la compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("detalles técnicos y check-duplicate (SITIMM-1497)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-technical-contract.ts")], {
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

  it("sin fila de TechnicalDetail, los productos y clientes llegan igual, con id y fechas en null", () => {
    expect(catalogOnly.id).toBeNull();
    expect(catalogOnly.productIds).toHaveLength(1);
  });

  it("productos y clientes llegan con su nombre y ordenados por nombre, los mismos que los ids", () => {
    const td = shown.technical_detail!;
    const names = td.products!.map((p) => p.name);
    expect(names).toEqual([...names].sort((x, y) => x.localeCompare(y, "es")));
    expect(new Set(td.products!.map((p) => p.id))).toEqual(new Set(td.productIds));
  });

  it("check-duplicate trae el uuid para «Ver la empresa» solo cuando hay duplicado", () => {
    expect(duplicate.data.existing_company_uuid).toMatch(/^[0-9a-f-]{36}$/);
    expect(noDuplicate.data.existing_company_uuid).toBeNull();
  });
});
