/**
 * Fixture de tests/company-notifications-contract.test.ts: la compila tsc, no vitest. Los
 * payloads tienen la forma exacta del `data` de `/api/v2/notifications/companies/*` en
 * mini-back SITIMM-1537 (`efb85505`), con datos sintéticos. Los @ts-expect-error fijan lo que
 * no viaja o no vale.
 */
import type {
  CompanyNotificationHistoryResponse,
  CompanyNotificationPreviewRequest,
  CompanyNotificationPreviewResponse,
  CompanyNotificationSendRequest,
  CompanyNotificationSendResponse,
  CompanyPushResult,
} from "../../src/notificationsContent";

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KEY = "5f0c2a8e-6c1d-4f4e-9a57-2b0d1e3c4f5a";

export const previewRequest: CompanyNotificationPreviewRequest = { companyUuids: [A, B] };

export const preview: CompanyNotificationPreviewResponse = {
  companies: [
    { uuid: A, name: "Empresa A", people: 229 },
    { uuid: B, name: "Empresa B", people: 0 },
  ],
  companyCount: 2,
  totalPeople: 229,
};

export const sendRequest: CompanyNotificationSendRequest = {
  companyUuids: [A, B],
  idempotencyKey: KEY,
  title: "Asamblea",
  body: "Mañana a las 10.",
};

export const sent: CompanyPushResult = {
  companyUuid: A,
  companyName: "Empresa A",
  status: "sent",
  messageId: "projects/p/messages/0:1729879200000000",
  code: null,
  reason: null,
};

export const failed: CompanyPushResult = {
  companyUuid: B,
  companyName: "Empresa B",
  status: "failed",
  messageId: null,
  code: "unavailable",
  reason: "FCM is down",
};

/** Escrito antes del mensaje y aún sin la respuesta de FCM: ni id ni código. */
export const pending: CompanyPushResult = {
  companyUuid: B,
  companyName: "Empresa B",
  status: "pending",
  messageId: null,
  code: null,
  reason: null,
};

export const sendResponse: CompanyNotificationSendResponse = {
  uuid: KEY,
  createdAt: "2026-10-25T18:00:00Z",
  sent: 1,
  failed: 1,
  pending: 0,
  results: [sent, failed],
};

export const history: CompanyNotificationHistoryResponse = {
  items: [
    {
      uuid: sendResponse.uuid,
      title: sendRequest.title,
      body: sendRequest.body,
      actor: { uuid: "0b6c1d2e-0000-4000-8000-000000000001", name: "Ana López" },
      createdAt: sendResponse.createdAt,
      sent: 1,
      failed: 1,
      pending: 0,
      results: [sent, failed],
    },
    {
      uuid: "3c9e7b1a-2d4f-4a6b-8c0e-1f2a3b4c5d6e",
      title: "t",
      body: "b",
      actor: null,
      createdAt: "2026-10-24T18:00:00Z",
      sent: 1,
      failed: 0,
      pending: 1,
      results: [sent, pending],
    },
  ],
  total: 21,
  page: 1,
  pageSize: 20,
  hasNext: true,
};

/** Un código que FCM sume mañana sigue tipando: la lista de `code` queda abierta. */
export const futureCode: CompanyPushResult = { ...failed, code: "sender_id_mismatch" };

// ── negativos ───────────────────────────────────────────────────────

// @ts-expect-error — el BE rechaza el nombre en snake_case (extra="forbid")
export const snake: CompanyNotificationPreviewRequest = { company_uuids: [A] };

// @ts-expect-error — no hay topic libre: el canal es el de cada empresa
export const withTopic: CompanyNotificationSendRequest = { ...sendRequest, topic: "global" };

// @ts-expect-error — el envío exige el texto
export const noBody: CompanyNotificationSendRequest = { idempotencyKey: KEY, companyUuids: [A], title: "t" };

// @ts-expect-error — el envío exige su llave de idempotencia
export const noKey: CompanyNotificationSendRequest = { companyUuids: [A], title: "t", body: "b" };

// @ts-expect-error — `delivered` no existe: FCM no confirma entregas a un topic
export const delivered: CompanyPushResult = { ...sent, status: "delivered" };

// @ts-expect-error — no se cuentan dispositivos
export const devices: CompanyNotificationPreviewResponse = { ...preview, devicesTargeted: 1 };
