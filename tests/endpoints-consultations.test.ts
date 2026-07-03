import { describe, expect, it } from "vitest";

import { CONSULTATION_STATES } from "../src/consultations";
import { V2_ENDPOINTS, endpoint } from "../src/endpoints";

/**
 * endpoint() y las rutas V2 son cómo TODOS los frontends construyen URLs
 * contra mini-back; CONSULTATION_STATES es la máquina de estados que
 * app/dashboard usan para renderizar y decidir acciones.
 */

describe("endpoint()", () => {
  it("sustituye un param", () => {
    expect(endpoint(V2_ENDPOINTS.CONSULTATION, { uuid: "abc-123" })).toBe(
      "/consultations/abc-123"
    );
  });

  it("sustituye múltiples ocurrencias/params", () => {
    expect(endpoint("/a/{x}/b/{y}/{x}", { x: "1", y: "2" })).toBe("/a/1/b/2/1");
  });

  it("param faltante queda como placeholder (falla visible, no silenciosa)", () => {
    expect(endpoint("/a/{x}", {})).toBe("/a/{x}");
  });
});

describe("rutas V2 estables (contrato con consumidores)", () => {
  it.each([
    ["USERS_ME", "/users/me"],
    ["CONSULTATIONS", "/consultations"],
  ] as const)("%s = %s", (key, path) => {
    expect(V2_ENDPOINTS[key]).toBe(path);
  });
});

describe("CONSULTATION_STATES (máquina de 6 estados)", () => {
  it("IDs congelados — el BE los persiste en filas", () => {
    expect(CONSULTATION_STATES).toEqual({
      PENDING: 1,
      RESOLVING: 2,
      CLOSED: 3,
      CLOSE_PROPOSED: 4,
      REOPENED: 5,
      ESCALATED: 6,
    });
  });
});
