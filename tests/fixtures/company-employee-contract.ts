/**
 * Fixture de tests/company-employee-contract.test.ts: la compila tsc, no vitest. Las formas son las de
 * mini-back #768 @ ba5737af (company_employee_v2.py y company_employees_v2.py), con datos sintéticos;
 * los @ts-expect-error fijan lo que el servidor no acepta o no manda.
 */
import type { V2Response } from "../../src/common";
import type { CompanyEmployeeConflict, CompanyEmployeeCreate, CompanyEmployeeCreated } from "../../src/companies";

// Lo mínimo: los 5 obligatorios y una identidad (aquí, la fecha de nacimiento, sin RFC ni CURP).
export const minimal: CompanyEmployeeCreate = {
  name: "Laura",
  lastNames: "Ejemplo Vega",
  payroll: "N-1001",
  job: "Operadora",
  daySalary: 315.81,
  birthDate: "1990-03-15",
};

// Todo lo que el formulario de la 2d manda.
export const full: CompanyEmployeeCreate = {
  ...minimal,
  daySalary: "315.81",
  rfc: "EJVL900315XX4",
  curp: null,
  gender: "F",
  entryDate: "2026-10-01",
  department: "Producción",
  phone: "461 000 0101",
  email: "laura.vega@ejemplo.mx",
  nss: "12345678901",
};

export const created: V2Response<CompanyEmployeeCreated> = {
  status: "success",
  data: { employeeUuid: "0b9c3c1e-5a52-4d6b-9a77-3f0d2f7b9e11", existingAccount: true, message: "Alta registrada. Ya tenía cuenta en SITIMM; usa la misma." },
};

export const activeHere: CompanyEmployeeConflict = { detail: { code: "employee_active_here", message: "Ya está activa en esta empresa" } };

// @ts-expect-error extra="forbid": el estado civil no es parte del contrato de 1469
export const extraKey: CompanyEmployeeCreate = { ...minimal, CivilStateId: 2 };

// @ts-expect-error gender es "M" o "F", como lo guarda el BE
export const badGender: CompanyEmployeeCreate = { ...minimal, gender: "Mujer" };

// @ts-expect-error payroll es obligatorio
export const noPayroll: CompanyEmployeeCreate = { name: "Laura", lastNames: "Ejemplo Vega", job: "Operadora", daySalary: 315.81, birthDate: "1990-03-15" };

// @ts-expect-error el 201 no trae datos del otro empleo
export const leak: CompanyEmployeeCreated = { ...created.data, otherCompany: "EMPRESA EJEMPLO" };

// @ts-expect-error el 409 solo tiene los dos códigos
export const otherCode: CompanyEmployeeConflict = { detail: { code: "duplicate", message: "x" } };
