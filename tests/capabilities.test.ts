/**
 * SITIMM-1369 — the panel capabilities, one source for every front.
 *
 * `Capability` must be a closed union: `can("event.edit")` (a typo) has to fail to compile,
 * not deny in silence. `tsconfig.include` covers only `src/**`, so a `@ts-expect-error` in
 * this file would never bite (see programs-audience.test.ts). These tests compile a probe
 * with the TypeScript compiler instead, and read the emitted `.d.ts`.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { CAPABILITIES } from "../src/users";

const PROBE = resolve(__dirname, "__capability_probe__.ts");

/** Type-check `code` as if it were a file next to this one; return the error messages. */
function typeErrors(code: string): string[] {
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (name, version, ...rest) =>
    name === PROBE ? ts.createSourceFile(name, code, version) : read(name, version, ...rest);
  const program = ts.createProgram([PROBE], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

const HEADER = `import type { Capability, CompanyScope, UserMeV2Response } from "../src/users";\n`;

describe("Capability es una unión cerrada", () => {
  it("una capacidad del catálogo compila, y la forma de /me también (ancla)", () => {
    const errors = typeErrors(
      HEADER +
        `const c: Capability = "events.edit";
         const me: Pick<UserMeV2Response, "capabilities" | "companyScope"> = {
           capabilities: [c, "panel.enter"],
           companyScope: "assigned",
         };
         export { me };`,
    );
    expect(errors).toEqual([]);
  });

  it.each([
    ["event.edit", `const c: Capability = "event.edit"; export { c };`],
    ["string suelto", `const s: string = "x"; const c: Capability = s; export { c };`],
    [
      "capabilities mal escrita en /me",
      `const me: Pick<UserMeV2Response, "capabilities"> = { capabilities: ["users.editt"] };
       export { me };`,
    ],
    ["companyScope fuera de la unión", `const s: CompanyScope = "some"; export { s };`],
  ])("%s no compila", (_name, code) => {
    const errors = typeErrors(HEADER + code);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join("\n")).toMatch(/not assignable/);
  });
});

describe("CAPABILITIES (catálogo de mini-back, app/domain/enums/capabilities.py)", () => {
  it("63 capacidades, sin repetidas, con la forma área.verbo", () => {
    expect(CAPABILITIES).toHaveLength(63);
    expect(new Set(CAPABILITIES).size).toBe(CAPABILITIES.length);
    for (const c of CAPABILITIES) expect(c).toMatch(/^[a-z_]+\.[a-z_]+$/);
  });

  it("el .d.ts publicado conserva los literales, no string[]", () => {
    const dts = readFileSync(resolve(__dirname, "../dist/users/index.d.ts"), "utf8");
    expect(dts).toMatch(/declare const CAPABILITIES: readonly \["panel\.enter", "companies\.view"/);
    expect(dts).toContain('type CompanyScope = "all" | "assigned" | "none";');
    expect(dts).toMatch(/capabilities: Capability\[\];/);
    expect(dts).toMatch(/companyScope: CompanyScope;/);
  });
});
