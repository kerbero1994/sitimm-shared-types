import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { preview } from "./fixtures/company-import-contract";

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

  it("una fila que no se importa dice por qué; una que sí, no trae errores", () => {
    for (const r of preview.results) expect(r.success).toBe(r.errors.length === 0);
  });
});
