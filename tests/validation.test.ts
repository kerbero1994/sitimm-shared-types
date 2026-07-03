import { describe, expect, it } from "vitest";

import {
  CURP_PATTERN,
  PHONE_MX_PATTERN,
  POSTAL_CODE_MX_PATTERN,
  RFC_PATTERN,
  cleanDigits,
} from "../src/validation";

/**
 * Los patterns de validación son contratos vivos: web (afiliación) y app
 * (perfil) validan formularios de socios reales con ellos. Un cambio que
 * rechace CURPs válidas bloquea afiliaciones; uno que acepte basura mete
 * datos sucios al censo.
 */

describe("RFC_PATTERN", () => {
  it.each(["PEGJ900515AB1", "GODE561231GR8", "ABC680524P76"])(
    "acepta RFC válido %s",
    (rfc) => {
      expect(RFC_PATTERN.test(rfc)).toBe(true);
    }
  );

  it.each([
    "PEGJ9005151", // muy corto
    "pegj900515ab1", // minúsculas — normalizar antes de validar
    "PEGJ900515ABCD", // 14 chars
    "1234567890123", // sin letras iniciales
  ])("rechaza %s", (rfc) => {
    expect(RFC_PATTERN.test(rfc)).toBe(false);
  });
});

describe("CURP_PATTERN", () => {
  it.each(["PEGJ900515HJCRNS09", "GODE561231MGRNNS02"])(
    "acepta CURP válida %s",
    (curp) => {
      expect(CURP_PATTERN.test(curp)).toBe(true);
    }
  );

  it.each([
    "PEGJ900515XJCRNS09", // sexo debe ser H o M
    "PEGJ900515HJCRNS0", // 17 chars
    "pegj900515hjcrns09", // minúsculas
  ])("rechaza %s", (curp) => {
    expect(CURP_PATTERN.test(curp)).toBe(false);
  });
});

describe("PHONE_MX_PATTERN + cleanDigits", () => {
  it("acepta 10 dígitos limpios", () => {
    expect(PHONE_MX_PATTERN.test("3312345678")).toBe(true);
  });

  it("el flujo real: formatear → limpiar → validar", () => {
    expect(PHONE_MX_PATTERN.test(cleanDigits("  331 234-5678 "))).toBe(true);
    expect(PHONE_MX_PATTERN.test(cleanDigits("(33) 1234 5678"))).toBe(true);
  });

  it.each(["331234567", "33123456789", "331234567a"])("rechaza %s", (raw) => {
    expect(PHONE_MX_PATTERN.test(raw)).toBe(false);
  });
});

describe("POSTAL_CODE_MX_PATTERN", () => {
  it("acepta CP de 5 dígitos", () => {
    expect(POSTAL_CODE_MX_PATTERN.test("36100")).toBe(true);
  });

  it.each(["3610", "361000", "3610A"])("rechaza %s", (cp) => {
    expect(POSTAL_CODE_MX_PATTERN.test(cp)).toBe(false);
  });
});
