/**
 * SITIMM-586 — programas hablan de audiencia, y el criterio no sale en público.
 *
 * Fijan la forma del contrato, no lógica. Un `audience` que reaparezca en la
 * forma pública no rompe ningún runtime: sólo filtra el criterio de
 * segmentación a quien no tiene sesión.
 *
 * Ojo con lo que aquí se puede comprobar y lo que no: `tsconfig.include` sólo
 * cubre `src/**`, así que **nada typechequea este archivo**. `expectTypeOf` y
 * `@ts-expect-error` no fallan nunca aquí — lo comprobé devolviendo `audience`
 * a las formas públicas y las 152 seguían verdes. Lo que sí se puede leer es el
 * `.d.ts` emitido, que es texto y es lo que se publica; ahí van las aserciones
 * que de verdad muerden.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, expectTypeOf } from "vitest";

import type {
  AudienceSpec,
  ProgramV2,
  ProgramV2Public,
  SubProgramV2,
  UpdateProgramV2Body,
  UpdateSubProgramV2Body,
} from "../src/programs";

describe("el tagline y la regla son cosas distintas", () => {
  it("conviven en la forma autenticada", () => {
    expectTypeOf<ProgramV2>().toHaveProperty("target_audience");
    expectTypeOf<ProgramV2>().toHaveProperty("audience");
  });

  it("el tagline es texto y la regla es un spec", () => {
    // Un spec no puede expresar "Para trabajadores en activo", y una frase no
    // puede filtrar a nadie. Colapsarlos perdería uno de los dos.
    expectTypeOf<ProgramV2["target_audience"]>().toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf<ProgramV2["audience"]>().toEqualTypeOf<
      AudienceSpec | null | undefined
    >();
  });

  it("el subprograma hereda ambos", () => {
    expectTypeOf<SubProgramV2>().toHaveProperty("target_audience");
    expectTypeOf<SubProgramV2>().toHaveProperty("audience");
  });
});

describe("en público sale el hecho, nunca el criterio", () => {
  // Se comprueba sobre el .d.ts EMITIDO, no con `@ts-expect-error`.
  //
  // La primera versión de esto usaba `@ts-expect-error` + `expectTypeOf`, y
  // era decorado: `tsconfig.include` sólo cubre `src/**`, así que nada
  // typechequea `tests/` y esas aserciones no podían fallar nunca —
  // verificado devolviendo `audience` a las formas públicas: 152 verdes.
  //
  // El artefacto que se publica sí es texto, y sí se puede leer.
  const dts = readFileSync(
    resolve(__dirname, "../dist/programs/index.d.ts"),
    "utf8"
  );

  const omitDe = (nombre: string): string => {
    const i = dts.indexOf(nombre);
    expect(i, `${nombre} no está en el .d.ts — ¿cambió el nombre?`).toBeGreaterThan(-1);
    return dts.slice(i, dts.indexOf("{", i));
  };

  it("la forma pública del programa excluye la audiencia", () => {
    expect(omitDe("interface ProgramV2Public")).toContain('"audience"');
  });

  it("la del subprograma también", () => {
    expect(omitDe("type SubProgramV2Public")).toContain('"audience"');
  });

  it("pero el tagline SÍ sale: es copy pensado para leerse", () => {
    expect(omitDe("interface ProgramV2Public")).not.toContain('"target_audience"');
    expectTypeOf<ProgramV2Public>().toHaveProperty("target_audience");
  });
});

describe("el CMS puede escribirla", () => {
  it("los cuerpos de actualización la aceptan", () => {
    // Sin esto el dashboard no podría segmentar un programa: el editor
    // existiría y el PATCH tiraría el campo por el camino.
    const programa: UpdateProgramV2Body = { audience: { mode: "public" } };
    const sub: UpdateSubProgramV2Body = { audience: { mode: "public" } };

    expect(programa.audience).toEqual({ mode: "public" });
    expect(sub.audience).toEqual({ mode: "public" });
  });

  it("es opcional: no hay que mandarla en cada guardado", () => {
    const sinAudiencia: UpdateProgramV2Body = { subtitle: "Becas" };

    expect(sinAudiencia.audience).toBeUndefined();
  });
});
