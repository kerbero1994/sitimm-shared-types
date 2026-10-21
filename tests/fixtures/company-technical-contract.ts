/**
 * Fixture de tests/company-technical-contract.test.ts: la compila tsc, no vitest. Los payloads tienen la
 * forma exacta del cable de mini-back #779 @ 5b6ff292 (SITIMM-1497), con datos sintéticos:
 * - `POST /api/v1/companies/show`: `data.company.company.technical_detail` (dump por nombre de campo);
 * - `POST /api/v1/companies/import/check-duplicate`: en sobre `success_response`;
 * - el cuerpo técnico de create/update (`CompanyTechnicalFields`).
 * Los @ts-expect-error fijan lo que no viaja o no vale.
 */
import type { V2Response } from "../../src/common";
import type { CompanyDetails, CompanyDuplicateCheck, CompanyTechnicalFields, TechnicalDetail } from "../../src/companies";

const withRow: TechnicalDetail = {
  id: 77,
  uuid: "6c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f",
  operationStart: "2015-03-01T00:00:00",
  contract: null,
  lastRevision: "2025-11-20",
  CompanyId: 45,
  createdAt: "2026-10-21T10:00:00",
  updatedAt: "2026-10-21T10:00:00",
  clientIds: ["0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e"],
  productIds: ["1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a"],
  // Los mismos, con su nombre del catálogo y ordenados por nombre (los lee HR sin all-options).
  clients: [{ id: "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e", name: "Cliente Ejemplo" }],
  products: [
    { id: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a", name: "Arneses Ejemplo" },
    { id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", name: "Motores Ejemplo" },
  ],
};

// @ts-expect-error cada producto trae su nombre del catálogo, no solo el id
export const productWithoutName: TechnicalDetail = { ...withRow, products: [{ id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f" }] };

// Productos y clientes sin fila de TechnicalDetail (los escribió la ruta de catálogos).
export const catalogOnly: TechnicalDetail = {
  id: null, uuid: null, operationStart: null, contract: null, lastRevision: null,
  CompanyId: null, createdAt: null, updatedAt: null, clientIds: [], productIds: ["1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f"],
  clients: [], products: [{ id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", name: "Motores Ejemplo" }],
};

export const shown: Pick<CompanyDetails, "technical_detail"> = { technical_detail: withRow };
export const none: Pick<CompanyDetails, "technical_detail"> = { technical_detail: null };

// @ts-expect-error la llave del cable es technical_detail: el alias TechnicalDetail no viaja
export const aliasKey: Pick<CompanyDetails, "technical_detail"> = { TechnicalDetail: withRow };

export const duplicate: V2Response<CompanyDuplicateCheck> = {
  status: "success",
  message: "Duplicate company found",
  data: {
    is_duplicate: true,
    existing_company_id: 45,
    existing_company_uuid: "7d3f1a2b-4c5d-4e6f-8a9b-0c1d2e3f4a5b",
    existing_company_name: "EMPRESA EJEMPLO DEL BAJÍO, S.A. DE C.V.",
    match_criteria: "name and/or RFC",
  },
};
export const noDuplicate: V2Response<CompanyDuplicateCheck> = {
  status: "success",
  message: "No duplicate found",
  data: { is_duplicate: false, existing_company_id: null, existing_company_uuid: null, existing_company_name: null, match_criteria: null },
};

// @ts-expect-error el enlace de D3 usa el uuid (texto), no el id
export const uuidAsNumber: CompanyDuplicateCheck = { ...noDuplicate.data, existing_company_uuid: 45 };

export const updateBody: CompanyTechnicalFields = { productIds: [], operationStart: "2015-03-01", lastRevision: null };

// @ts-expect-error los productos son uuids del catálogo, no ids numéricos
export const numericProducts: CompanyTechnicalFields = { productIds: [12, 13] };
