/**
 * Fixture de tests/company-import-contract.test.ts: la compila tsc, no vitest. El payload tiene la
 * forma exacta del cable de `POST /api/v1/companies/upload-csv?validateOnly=true` en mini-back
 * SITIMM-1498 (sin sobre `V2Response`), con datos sintéticos y municipios reales del catálogo.
 * Los @ts-expect-error fijan lo que ya no viaja o no vale.
 */
import type {
  CompanyBulkItem,
  CompanyBulkResultItem,
  CompanyBulkUploadRequest,
  CompanyBulkUploadResponse,
  CompanyImportCorrection,
  CompanyImportIssue,
} from "../../src/companies";

const noParams = { column: null, value: null, suggestion: null, suggestions: [], duplicateOfRow: null, email: null };

export const preview: CompanyBulkUploadResponse = {
  total: 4,
  created: 1,
  skipped: 1,
  failed: 2,
  validationOnly: true,
  results: [
    { row: 2, name: "Empresa Valida SA", success: true, companyId: null, companyUuid: null, errors: [], warnings: [] },
    {
      row: 3,
      name: "Mal Escrito SA",
      success: false,
      companyId: null,
      companyUuid: null,
      errors: [
        {
          code: "MUNICIPALITY_MISSPELLED",
          params: { ...noParams, column: "municipio", value: "Celya", suggestion: "Celaya" },
        },
      ],
      warnings: [],
    },
    {
      row: 4,
      name: "No Existe SA",
      success: false,
      companyId: null,
      companyUuid: null,
      errors: [
        {
          code: "MUNICIPALITY_NOT_IN_CATALOG",
          params: {
            ...noParams,
            column: "municipio",
            value: "Sn Luis",
            suggestions: ["San Luis de la Paz", "San Luis Rio Colorado", "San Luis Potosí"],
          },
        },
      ],
      warnings: [{ code: "DATE_UNPARSEABLE", params: { ...noParams, column: "fecha_afiliacion", value: "31-31-2020" } }],
    },
    {
      row: 6,
      name: "EMPRESA VALIDA SA",
      success: false,
      companyId: null,
      companyUuid: null,
      errors: [
        { code: "DUPLICATE_NAME", params: { ...noParams, column: "nombre_empresa", value: "EMPRESA VALIDA SA", duplicateOfRow: 2 } },
      ],
      warnings: [],
    },
  ],
};

// @ts-expect-error el texto en inglés `error` ya no viaja: son `errors[]` con código
export const oldShape: CompanyBulkResultItem = { row: 2, name: "X", success: false, companyId: null, companyUuid: null, error: "Unknown city: X", warnings: [] };

// @ts-expect-error un código que el BE no emite
export const unknownCode: CompanyImportIssue = { code: "UNKNOWN_CITY", params: noParams };

// @ts-expect-error los avisos también son {code, params}, no textos
export const textWarning: CompanyBulkResultItem = { ...preview.results[0], warnings: ["Unparseable date"] };

/** La confirmación con la sugerencia aceptada, y lo que responde por esa fila (SITIMM-1498). */
export const corrections: CompanyImportCorrection[] = [{ row: 4, field: "municipality", value: "San Luis Potosí" }];

export const corrected: CompanyBulkResultItem = {
  row: 4,
  name: "No Existe SA",
  success: true,
  companyId: 1001,
  companyUuid: "8d3b5f9a-2c1e-4a7b-9f0d-6e5c4b3a2f10",
  errors: [],
  warnings: [
    {
      code: "MUNICIPALITY_CORRECTED",
      params: { ...noParams, column: "municipio", value: "Sn Luis", suggestion: "San Luis Potosí" },
    },
  ],
};

export const advisorRejected: CompanyImportIssue = {
  code: "ADVISOR_EMAIL_UNKNOWN",
  params: { ...noParams, column: "correos_asesores", email: "nadie@otra.com" },
};

// @ts-expect-error solo el municipio se corrige
export const otherField: CompanyImportCorrection = { row: 4, field: "name", value: "X" };

// @ts-expect-error el cliente no elige el id del municipio: manda el nombre de la sugerencia
export const byId: CompanyImportCorrection = { row: 4, field: "municipality", value: "San Luis Potosí", cityId: 113366 };

// @ts-expect-error `email` siempre viaja (null si no aplica)
export const noEmailKey: CompanyImportIssue = { code: "DATE_INVALID", params: { column: "fecha_vigencia_contrato", value: "31/31/2025", suggestion: null, suggestions: [], duplicateOfRow: null } };

/**
 * La petición de `/bulk-upload`, literal como la manda el test de mini-back
 * (`test_wire_shape_of_the_request_and_the_corrected_result`, SITIMM-1498).
 */
export const bulkRequest: CompanyBulkUploadRequest = {
  companies: [{ name: "Json SA", cityName: "Sn Luis Potosi" }],
  skipDuplicates: true,
  validateOnly: true,
  corrections: [{ row: 1, field: "municipality", value: "San Luis Potosí" }],
};

/** Solo `companies` es obligatorio: lo demás toma el default del BE. */
export const minimalRequest: CompanyBulkUploadRequest = { companies: [{ name: "Mínima SA" }] };

/**
 * Cada llave de la petición y del ítem. `Required<>` obliga a que estén todas: si TS tuviera una
 * llave de más, la fixture no compila; el test compara estas llaves con las del BE.
 */
export const fullItem: Required<CompanyBulkItem> = {
  name: "Plantilla SA",
  phone: "4621234567",
  rhPassword: "RH2024",
  address: "Av. Industrial 123",
  electoralId: null,
  hasCommittee: false,
  companyTypeCode: "NACIONAL",
  countryName: "México",
  stateName: "Guanajuato",
  cityName: "Silao de la Victoria",
  industrialParkName: "Puerto Interior",
  advisorEmails: "asesor1@mail.com;asesor2@mail.com",
  acceptanceDate: "2019-12-31",
  operationStart: "2020-01-01",
  contractValidity: "2025-12-31",
  lastRevision: "2024-06-15",
  productCodes: null,
  clientCodes: null,
  contractTypeCode: "CCT",
};

export const fullRequest: Required<CompanyBulkUploadRequest> = {
  companies: [fullItem],
  skipDuplicates: false,
  validateOnly: false,
  corrections: [],
};

// @ts-expect-error un campo de más en la petición: el BE no lo conoce
export const extraRequestKey: CompanyBulkUploadRequest = { companies: [{ name: "X" }], dryRun: true };

// @ts-expect-error un campo de más en el ítem
export const extraItemKey: CompanyBulkUploadRequest = { companies: [{ name: "X", cityId: 113366 }] };

// @ts-expect-error `companies` es obligatorio
export const noCompanies: CompanyBulkUploadRequest = { validateOnly: true };

// @ts-expect-error el ítem sin `name`
export const namelessItem: CompanyBulkItem = { cityName: "León" };
