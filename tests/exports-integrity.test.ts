import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import pkg from "../package.json";

/**
 * Integridad de exports (SITIMM-28): cada export path del package.json debe
 * resolver a artefactos de build reales e importables con símbolos dentro.
 *
 * Atrapa la clase de drift que ya dolió en los consumidores: módulo
 * renombrado/borrado, entry de exports apuntando a un dist inexistente, o un
 * build que emite un módulo vacío. Corre contra `dist/` — el script `test`
 * builda primero.
 *
 * Data-driven: un módulo nuevo en exports queda cubierto automáticamente.
 */

interface ExportTarget {
  import: { types: string; default: string };
  require: { types: string; default: string };
}

const exportEntries = Object.entries(
  pkg.exports as Record<string, ExportTarget>
);

describe("package.json exports", () => {
  it("declara los módulos del ecosistema", () => {
    const paths = exportEntries.map(([key]) => key);
    // Espina dorsal — si uno de estos desaparece, algún repo consumidor rompe.
    for (const core of [
      ".",
      "./common",
      "./users",
      "./auth",
      "./consultations",
      "./events",
      "./endpoints",
      "./socket-events",
      "./validation",
      "./locales",
    ]) {
      expect(paths, `export path faltante: ${core}`).toContain(core);
    }
  });

  describe.each(exportEntries)("export %s", (_exportPath, target) => {
    it("sus 4 artefactos de dist existen", () => {
      for (const file of [
        target.import.types,
        target.import.default,
        target.require.types,
        target.require.default,
      ]) {
        expect(existsSync(resolve(__dirname, "..", file)), `falta ${file}`).toBe(
          true
        );
      }
    });

    it("el módulo ESM importa; exporta símbolos runtime o declaraciones type-only", async () => {
      const mod: Record<string, unknown> = await import(
        resolve(__dirname, "..", target.import.default)
      );
      if (Object.keys(mod).length > 0) return;
      // Módulo type-only: el .mjs queda legítimamente vacío en runtime —
      // el contrato vive en el .d.mts, que debe declarar algo.
      const dts = readFileSync(
        resolve(__dirname, "..", target.import.types),
        "utf8"
      );
      expect(
        /\bexport\b/.test(dts),
        "ni exports runtime ni declaraciones en el .d.mts (¿build vacío?)"
      ).toBe(true);
    });
  });
});
