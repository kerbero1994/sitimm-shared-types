import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Vitest transpila sin chequear tipos y tsconfig sólo cubre src/, así que una prueba que
 * sólo instancia interfaces no prueba nada. Ésta compila con tsc la fixture de payloads del
 * BE (2.21.0, SITIMM-1277): un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("contratos de login 2.21.0 contra payloads del BE", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/login-contracts.ts")], {
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
});
