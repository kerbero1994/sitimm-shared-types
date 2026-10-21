/**
 * Fixture de tests/company-contacts-contract.test.ts: la compila tsc, no vitest. Los payloads tienen la
 * forma exacta del cable de la rama de mini-back SITIMM-1499-company-contacts-crud @ d293f672 (contrato
 * Jira 1499 c18422), con datos sintéticos. Los @ts-expect-error fijan lo que no viaja o no vale.
 */
import type { V2Response } from "../../src/common";
import type {
  CompanyContact,
  CompanyContactV2,
  CompanyContactV2Create,
  CompanyContactV2Update,
} from "../../src/companies";

const contact: CompanyContactV2 = {
  uuid: "8e9f0a1b-2c3d-4e5f-8a6b-7c8d9e0f1a2b",
  contactType: "RH",
  name: "Ana Ejemplo Ruiz",
  position: "Jefa de recursos humanos",
  email: "rh@ejemplo.mx",
  phone: null,
  isPrimary: true,
  notes: null,
  source: "panel",
  createdAt: "2026-10-21T15:00:00",
  updatedAt: "2026-10-21T15:00:00",
};

export const created: V2Response<CompanyContactV2> = { status: "success", data: contact };
export const fromExcel: CompanyContactV2 = { ...contact, source: "excel", isPrimary: false };

// @ts-expect-error la respuesta no trae company_id: el id de la empresa solo va en la ruta
export const withCompanyId: CompanyContactV2 = { ...contact, company_id: 45 };

// @ts-expect-error source va en minúsculas
export const upperSource: CompanyContactV2 = { ...contact, source: "PANEL" };

export const createBody: CompanyContactV2Create = { contactType: "DELEGATE", name: "Elena Ejemplo Soto" };

// @ts-expect-error el panel no escribe asesores: vienen de /advisor-assignments
export const advisorBody: CompanyContactV2Create = { contactType: "ADVISOR", name: "Elena Ejemplo Soto" };

export const clearPhone: CompanyContactV2Update = { phone: null, isPrimary: true };

// @ts-expect-error el nombre no se puede vaciar con null (422)
export const nullName: CompanyContactV2Update = { name: null };

// show.contacts[]: uuid y source son opcionales y pueden venir en null.
export const shown: CompanyContact = {
  id: 7,
  contactType: "MANAGER",
  name: "Elena Ejemplo Soto",
  isPrimary: true,
  isActive: true,
  uuid: "8e9f0a1b-2c3d-4e5f-8a6b-7c8d9e0f1a2b",
  source: "excel",
};
export const shownLegacy: CompanyContact = { id: 8, contactType: "OTHER", isPrimary: false, isActive: true, uuid: null, source: null };
