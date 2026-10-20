/**
 * Fixture de tests/company-documents-contract.test.ts: la compila tsc, no vitest. Los payloads tienen
 * la forma exacta que arma mini-back origin/main @ 27aac2ab (company_documents_v2.py :: _to_response y
 * list_company_documents, datos sintéticos); los @ts-expect-error fijan lo que no viaja o no vale.
 */
import type { V2Response } from "../../src/common";
import type { CompanyDocument, CompanyDocumentGroup } from "../../src/companies";

const version2: CompanyDocument = {
  id: 12,
  uuid: "7d3f1a2b-4c5d-4e6f-8a9b-0c1d2e3f4a5b",
  documentType: "COLLECTIVE_CONTRACT",
  versionNumber: 2,
  fileUrl: null,
  fileName: "contrato-ejemplo.pdf",
  mimeType: "application/pdf",
  sizeBytes: 482113,
  title: null,
  notes: null,
  effectiveDate: "2026-02-01",
  isActive: true,
  uploadedBy: 7,
  createdAt: "2026-10-20T15:04:05.123456+00:00",
  updatedAt: "2026-10-20T15:04:05.123456+00:00",
};

// La lista: un grupo por tipo con documentos, sin URL.
export const list: V2Response<CompanyDocumentGroup[]> = {
  status: "success",
  data: [{ documentType: "COLLECTIVE_CONTRACT", currentVersion: version2, versionCount: 2, versions: [] }],
};

// Filtrado por un tipo sin documentos: el grupo sale vacío.
export const emptyType: CompanyDocumentGroup = {
  documentType: "OTHER",
  currentVersion: null,
  versionCount: 0,
  versions: [],
};

// El documento suelto y la respuesta de la subida traen la URL firmada.
export const single: V2Response<CompanyDocument> = {
  status: "success",
  data: { ...version2, fileUrl: "https://storage.ejemplo.mx/documents/x?X-Amz-Signature=abc" },
};

// @ts-expect-error documentType es uno de los 5 del BE
export const unknownType: CompanyDocument = { ...version2, documentType: "PAYROLL" };

// @ts-expect-error uploadedBy es el id numérico del usuario, no un nombre
export const uploaderName: CompanyDocument = { ...version2, uploadedBy: "Nombre Ejemplo" };

// @ts-expect-error fileUrl viaja siempre (null en la lista), no se omite
export const noUrlKey: CompanyDocument = (({ fileUrl: _omit, ...rest }) => rest)(version2);
