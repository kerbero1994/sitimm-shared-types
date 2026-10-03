import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEPRECATED_SUPER_ADMIN_ID,
  USER_TYPE_HIERARCHY,
  UserType,
  hasAtLeast,
  resolveUserType,
} from "../src/users";

/**
 * Los IDs de user type y su jerarquía son EL contrato RBAC del ecosistema:
 * el BE los emite en tokens, dashboard y app deciden permisos con ellos.
 * Cambiar un ID o un nivel sin migración coordinada = escalación o bloqueo
 * de permisos silencioso. Estos tests congelan el contrato.
 */

describe("UserType IDs (contrato con mini-back)", () => {
  it.each([
    ["INVITADO", 41726],
    ["EMPLOYEE", 63974],
    ["HR", 23648],
    ["OFFICE", 57341],
    ["ADVISOR", 48235],
    ["ADMIN_COMMUNICATION", 31847],
    ["ADMIN_EMPLOYEES", 29563],
    ["FINANCIAL", 85672],
    ["ADMIN", 81493],
    ["MANAGER", 45298],
  ] as const)("%s = %d", (name, id) => {
    expect(UserType[name]).toBe(id);
  });

  it("SUPER_ADMIN deprecado conserva su ID legacy", () => {
    expect(DEPRECATED_SUPER_ADMIN_ID).toBe(72468);
  });
});

describe("jerarquía", () => {
  it("orden completo: INVITADO(0) < EMPLOYEE < HR/OFFICE(2) < ADVISOR < sub-admins(4) < ADMIN(5) < MANAGER(6)", () => {
    expect(USER_TYPE_HIERARCHY[UserType.INVITADO]).toBe(0);
    expect(USER_TYPE_HIERARCHY[UserType.EMPLOYEE]).toBe(1);
    expect(USER_TYPE_HIERARCHY[UserType.HR]).toBe(2);
    expect(USER_TYPE_HIERARCHY[UserType.OFFICE]).toBe(2);
    expect(USER_TYPE_HIERARCHY[UserType.ADVISOR]).toBe(3);
    expect(USER_TYPE_HIERARCHY[UserType.ADMIN_COMMUNICATION]).toBe(4);
    expect(USER_TYPE_HIERARCHY[UserType.ADMIN_EMPLOYEES]).toBe(4);
    expect(USER_TYPE_HIERARCHY[UserType.FINANCIAL]).toBe(4);
    expect(USER_TYPE_HIERARCHY[UserType.ADMIN]).toBe(5);
    expect(USER_TYPE_HIERARCHY[UserType.MANAGER]).toBe(6);
  });

  it("hasAtLeast respeta la jerarquía (y MANAGER > ADMIN — el gotcha clásico)", () => {
    expect(hasAtLeast(UserType.MANAGER, UserType.ADMIN)).toBe(true);
    expect(hasAtLeast(UserType.ADMIN, UserType.MANAGER)).toBe(false);
    expect(hasAtLeast(UserType.ADVISOR, UserType.EMPLOYEE)).toBe(true);
    expect(hasAtLeast(UserType.EMPLOYEE, UserType.HR)).toBe(false);
    expect(hasAtLeast(UserType.ADMIN, UserType.ADMIN)).toBe(true);
  });

  it("hasAtLeast nunca concede ante valores desconocidos", () => {
    expect(hasAtLeast(99999 as never, UserType.EMPLOYEE)).toBe(false);
    expect(hasAtLeast(UserType.MANAGER, 99999 as never)).toBe(false);
  });
});

describe("resolveUserType (backward compat)", () => {
  it("mapea SUPER_ADMIN legacy → MANAGER", () => {
    expect(resolveUserType(DEPRECATED_SUPER_ADMIN_ID)).toBe(UserType.MANAGER);
  });

  it("pasa IDs vigentes tal cual", () => {
    expect(resolveUserType(81493)).toBe(UserType.ADMIN);
  });

  it("desconocidos/null → undefined", () => {
    expect(resolveUserType(99999)).toBeUndefined();
    expect(resolveUserType(null)).toBeUndefined();
    expect(resolveUserType(undefined)).toBeUndefined();
  });
});

describe("JSDoc de mobilePhone (SITIMM-941)", () => {
  // Desde SITIMM-933 el BE guarda y devuelve mobilePhone en E.164. Un JSDoc que
  // pida 10 dígitos lleva a un front a rechazar el valor leído (no deja guardar
  // el perfil aunque no se toque el teléfono).
  it("lectura y escritura documentan E.164, no 10 dígitos", () => {
    const src = readFileSync(resolve(__dirname, "../src/users/index.ts"), "utf8");
    const docs = [
      ...src.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*mobilePhone\??:/g),
    ].map((m) => m[1]);
    expect(docs).toHaveLength(2); // UserProfileV2 + UserProfileUpdateV2
    for (const doc of docs) expect(doc).toMatch(/E\.164/);
    expect(src).not.toMatch(/10 digits/);
    expect(src).toMatch(/"mobilePhone": "\+52\d{10}"/);
  });
});
