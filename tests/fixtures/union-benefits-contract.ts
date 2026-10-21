/**
 * Fixture de tests/union-benefits-contract.test.ts: la compila tsc, no vitest. Los payloads tienen la
 * forma exacta del cable de mini-back origin/main @ c57dacfe, con datos sintéticos:
 * - representantes v2: union_representatives_v2.py, en sobre `success_response`;
 * - prestaciones y versiones v1: _benefits_common.py, planas. Los `Decimal` viajan como texto
 *   (pydantic 2: `"30.00"`).
 * Los @ts-expect-error fijan lo que no viaja o no vale.
 */
import type { ContractVersion, NormalizedBenefit, BenefitCatalogItem, BenefitCategory } from "../../src/benefits";
import type { V2Response } from "../../src/common";
import type {
  UnionRepresentativeV2,
  UnionRepresentativeCreateV2,
  UnionRepresentativeUpdateV2,
  UnionRoleV2,
} from "../../src/companies";

const rep: UnionRepresentativeV2 = {
  id: 31,
  uuid: "5b0c2a6e-1f3d-4c8b-9a7e-2d4f6a8c0e1b",
  CompanyId: 45,
  EmployeeId: 9021,
  UnionRoleId: 2,
  structureType: "COMMITTEE",
  isPrimary: true,
  isActive: true,
  startDate: "2025-01-15",
  endDate: null,
  notes: null,
  createdAt: "2026-10-20T15:04:05.123456",
  updatedAt: "2026-10-20T15:04:05.123456",
  roleName: "Secretario General",
  roleCode: "SEC_GENERAL",
  employeeName: "Laura",
  employeeLastNames: "Ejemplo Vega",
};

export const list: V2Response<UnionRepresentativeV2[]> = { status: "success", data: [rep] };
export const created: V2Response<UnionRepresentativeV2> = { status: "success", data: rep };
export const patched: V2Response<{ message: string }> = { status: "success", data: { message: "Representative updated" } };

export const roles: V2Response<UnionRoleV2[]> = {
  status: "success",
  data: [
    {
      id: 2,
      uuid: "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
      name: "Secretario General",
      code: "SEC_GENERAL",
      structureType: "COMMITTEE",
      hierarchyOrder: 1,
      allowsSubstitute: true,
      isSingular: true,
      description: null,
    },
  ],
};

export const createBody: UnionRepresentativeCreateV2 = { EmployeeId: 9021, UnionRoleId: 2 };
export const updateBody: UnionRepresentativeUpdateV2 = { isActive: false, endDate: "2026-10-20" };

// @ts-expect-error el alta pide el rol
export const createWithoutRole: UnionRepresentativeCreateV2 = { EmployeeId: 9021 };

export const category: BenefitCategory = {
  id: 1,
  uuid: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
  code: "BONUSES",
  name: "Bonos",
  description: null,
  displayOrder: 1,
};

export const catalogItem: BenefitCatalogItem = {
  id: 7,
  uuid: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a",
  code: "VALES_DESPENSA",
  name: "Vales de despensa",
  categoryId: 1,
  categoryName: "Bonos",
  measurementType: "AMOUNT",
  measurementUnit: "MXN",
  legalMinimum: null,
  legalReference: null,
  description: null,
  displayOrder: 3,
  isCommon: true,
};

const benefit: NormalizedBenefit = {
  id: 88,
  uuid: "3e4f5a6b-7c8d-4e9f-0a1b-2c3d4e5f6a7b",
  CompanyId: 45,
  BenefitCatalogId: 7,
  benefitCode: "VALES_DESPENSA",
  benefitName: "Vales de despensa",
  categoryName: "Bonos",
  measurementType: "AMOUNT",
  measurementUnit: "MXN",
  numericValue: "1500.00",
  textValue: null,
  booleanValue: null,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  isActive: true,
  notes: null,
  appliesTo: "ALL",
  ContractVersionId: 4,
  contractVersion: "2026-2027",
};
export const benefits: NormalizedBenefit[] = [benefit];

// @ts-expect-error un Decimal viaja como texto, no como número
export const numericBenefit: NormalizedBenefit = { ...benefit, numericValue: 1500 };

const contract: ContractVersion = {
  id: 4,
  uuid: "4f5a6b7c-8d9e-4f0a-1b2c-3d4e5f6a7b8c",
  CompanyId: 45,
  version: "2026-2027",
  versionNumber: 2,
  signedDate: null,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  salaryIncreasePercent: "5.50",
  salaryIncreaseAmount: null,
  documentUrl: null,
  status: "SUPERSEDED",
  notes: null,
};
export const contracts: ContractVersion[] = [contract];

// @ts-expect-error INACTIVE no existe: el CHECK de la tabla tiene DRAFT, PENDING, ACTIVE, EXPIRED y SUPERSEDED
export const inactive: ContractVersion = { ...contract, status: "INACTIVE" };
