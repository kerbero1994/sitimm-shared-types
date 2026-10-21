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

/**
 * RFC_PATTERN y CURP_PATTERN son los del BE (SITIMM-1469): lo que el BE acepta tiene que pasar aquí y lo que el BE
 * rechaza con 422, también aquí. Los casos «BE» salen de mini-back `tests/unit/domain/test_value_objects.py`
 * (`RFC.is_valid`, `CURP.is_valid`); los «regex» prueban cada parte de `CURP_PATTERN_STR`
 * (`app/shared/utils/mexican_id_patterns.py`).
 */
describe("RFC_PATTERN", () => {
  it.each([
    "PEGJ850101ABC", // BE: persona física; el último carácter no es dígito ni «A»
    "ABC850101XY9", // BE: persona moral
  ])("acepta lo que el BE acepta: %s", (rfc) => {
    expect(RFC_PATTERN.test(rfc)).toBe(true);
  });

  it.each([
    "PEGJ85", // BE: muy corto
    "PEGJ850101AB", // BE: homoclave de 2 (solo pasa el «relaxed»)
  ])("rechaza lo que el BE rechaza: %s", (rfc) => {
    expect(RFC_PATTERN.test(rfc)).toBe(false);
  });

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
  it.each([
    "PEGJ850101HGTRRN09", // BE
    "PEGJ850101MGTRRN09", // BE: mujer
    "GARC010101HDFRRLA9", // BE (SITIMM-386): nacida desde 2000, homoclave con letra
    "GACO851215HDFRRS09", // BE: antes de 2000, homoclave con dígito
    "EEVL900315MGTXXX04", // la persona sintética de la 2d (Padrones), corregida
  ])("acepta lo que el BE acepta: %s", (curp) => {
    expect(CURP_PATTERN.test(curp)).toBe(true);
  });

  it.each([
    "GARC010101HDFRRLAA", // BE: letra en el dígito verificador
    "INVALID", // BE
    "EJVL900315MGTXXX04", // regex: posición 2 sin vocal (la persona sintética vieja de la 2d)
    "PEGJ851301HGTRRN09", // regex: mes 13
    "PEGJ850132HGTRRN09", // regex: día 32
    "PEGJ850101HXXRRN09", // regex: estado que no existe
    "PEGJ850101HGTAEI09", // regex: vocales donde van las consonantes internas
  ])("rechaza lo que el BE rechaza: %s", (curp) => {
    expect(CURP_PATTERN.test(curp)).toBe(false);
  });

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

  it("es sólo de entrada: el mobilePhone que devuelve el BE (E.164) no pasa ni tras cleanDigits", () => {
    // SITIMM-933/941: no validar con este patrón un teléfono leído de la API.
    expect(PHONE_MX_PATTERN.test(cleanDigits("+523312345678"))).toBe(false);
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
