/**
 * SITIMM-586 — el contrato de "solicitar registro".
 *
 * Se comprueba sobre el `.d.ts` EMITIDO, no con `expectTypeOf`: `tsconfig.include`
 * sólo cubre `src/**`, así que nada typechequea este directorio y una aserción
 * de tipos aquí no puede fallar nunca. El artefacto publicado sí es texto.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const dts = readFileSync(
  resolve(__dirname, "../dist/events/index.d.ts"),
  "utf8"
);

/** Nombres de campo declarados en una interfaz, sin comentarios. */
function campos(nombre: string): string[] {
  return [...cuerpo(nombre).matchAll(/^\s{4}(\w+)\??:/gm)].map((m) => m[1]);
}

/** Cuerpo de una interfaz por nombre, hasta su llave de cierre. */
function cuerpo(nombre: string): string {
  const i = dts.indexOf(`interface ${nombre} `);
  expect(i, `${nombre} no está en el .d.ts — ¿cambió el nombre?`).toBeGreaterThan(-1);
  const abre = dts.indexOf("{", i);
  return dts.slice(abre, dts.indexOf("\n}", abre));
}

describe("la app sabe si el botón dice Registrarme o Solicitar registro", () => {
  it("`requiresApproval` viaja en el detalle del evento", () => {
    expect(cuerpo("EventDetailV2")).toContain("requiresApproval: boolean");
  });

  it("es OBLIGATORIO, no opcional", () => {
    // Opcional dejaría que la app leyera `undefined` y lo tratara como `false`,
    // pintando "Registrarme" en un evento que exige aprobación. El rechazo
    // llegaría al pulsar, que es justo lo que este campo evita.
    expect(cuerpo("EventDetailV2")).not.toContain("requiresApproval?");
  });

  it("el criterio sigue siendo `unknown`: la app no lo interpreta", () => {
    // `audience` va en blanco en público. Tiparlo con forma invitaría a
    // reimplementar la evaluación en el cliente, que es donde no debe vivir.
    expect(cuerpo("EventDetailV2")).toContain("audience: unknown | null");
  });
});

describe("quien solicita puede explicar por qué", () => {
  it("el registro CON sesión lo acepta", () => {
    expect(cuerpo("CreateParticipantV2Request")).toContain("requestNote?: string");
  });

  it("el registro ANÓNIMO también", () => {
    // El caso (b) del PO: evento privado, sin cuenta, llena el formulario a
    // mano. Argumenta igual que quien lo pide con sesión.
    expect(cuerpo("RegisterPublicV2Request")).toContain("requestNote?: string");
  });

  it("es opcional en ambos", () => {
    // Decisión #2 del PO: opcional siempre. No se añade fricción a quien quizá
    // sí debería entrar.
    for (const tipo of ["CreateParticipantV2Request", "RegisterPublicV2Request"]) {
      expect(cuerpo(tipo)).not.toContain("requestNote: string");
    }
  });

  it("NO se cuela `reviewNote` en un cuerpo de solicitud", () => {
    // `reviewNote` es del ADMIN al resolver. Que el cuerpo de registro no lo
    // acepte es lo que impide que un solicitante escriba su propia resolución.
    //
    // Se busca la DECLARACIÓN, no la palabra: la primera versión hacía
    // `toContain("reviewNote")` y fallaba contra mi propio JSDoc, que menciona
    // el campo justo para explicar que no va aquí.
    for (const tipo of ["CreateParticipantV2Request", "RegisterPublicV2Request"]) {
      expect(campos(tipo)).not.toContain("reviewNote");
    }
  });
});

describe("la insignia de la cola tiene ruta", () => {
  it("el registro de endpoints la declara", () => {
    const endpoints = readFileSync(
      resolve(__dirname, "../dist/endpoints/index.d.ts"),
      "utf8"
    );

    expect(endpoints).toContain("EVENT_APPROVALS_PENDING_COUNT");
    expect(endpoints).toContain('"/events/approvals/pending-count"');
  });
});
