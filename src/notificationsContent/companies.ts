/**
 * Aviso a empresas por su canal (SITIMM-1537): vista previa, envío por empresa e historial.
 *
 * Backend: mini-back `app/presentation/schemas/company_notifications_v2.py` +
 * `app/presentation/api/v2/company_notifications_v2.py`. Las 3 rutas piden sesión y
 * `notifications.send` (ADMIN, ADMIN_COMMUNICATION, MANAGER). Los tipos de respuesta son el
 * `data` del sobre `{ status: "success", data }`.
 *
 * Decisión del dueño (24-oct): «Por el canal de cada empresa». Un mensaje por empresa a su
 * topic `{uuid}-TA`. FCM no dice quién está suscrito a un topic, así que:
 * - la vista previa promete «hasta N personas en sus padrones», nunca dispositivos;
 * - `sent` significa **«FCM lo aceptó»**, no «le llegó a alguien». Hoy la app no se suscribe a
 *   ese topic (SITIMM-1541): el panel tiene que decir que el aviso solo llega a quien tenga la
 *   versión nueva de la app.
 */

/** Empresas por petición, en la vista previa y en el envío. Más → 422. */
export const MAX_COMPANIES_PER_SEND = 50;

export const COMPANY_NOTIFICATIONS_ENDPOINTS = {
  /** POST → Body: CompanyNotificationPreviewRequest. data: CompanyNotificationPreviewResponse. No manda nada. */
  PREVIEW: "/api/v2/notifications/companies/preview",
  /** POST → Body: CompanyNotificationSendRequest. data: CompanyNotificationSendResponse. 200 aunque falle alguna empresa. */
  SEND: "/api/v2/notifications/companies/send",
  /** GET ?page&pageSize (1..100) → data: CompanyNotificationHistoryResponse. Lo más reciente primero. */
  HISTORY: "/api/v2/notifications/companies/history",
} as const;

// ─────────────────────────────────────────────────────────────────────
// Vista previa
// ─────────────────────────────────────────────────────────────────────

/**
 * `POST …/preview`. El BE rechaza cualquier otra llave (`extra="forbid"`), también
 * `company_uuids`. 1..50 uuids; un repetido cuenta una vez.
 */
export interface CompanyNotificationPreviewRequest {
  companyUuids: string[];
}

export interface CompanyAudience {
  uuid: string;
  name: string | null;
  /** Personas en el padrón: usuarios vivos con un `Employee` vivo en la empresa. No son dispositivos. */
  people: number;
}

export interface CompanyNotificationPreviewResponse {
  /** En el orden pedido, sin repetidos. */
  companies: CompanyAudience[];
  companyCount: number;
  /** Suma de `people`: «hasta N personas» (una persona en dos padrones cuenta dos veces). */
  totalPeople: number;
}

// ─────────────────────────────────────────────────────────────────────
// Envío
// ─────────────────────────────────────────────────────────────────────

/** `POST …/send`. `title` 1..200 y `body` 1..1000, tras recortar espacios. */
export interface CompanyNotificationSendRequest extends CompanyNotificationPreviewRequest {
  title: string;
  body: string;
}

/** `"sent"` = FCM aceptó el mensaje para el topic (dio un `messageId`); no que le llegó a alguien. */
export type CompanyPushStatus = "sent" | "failed";

/**
 * `code` de un `failed`. `suppressed`: el título o el texto llevan `__TEST__` y no salió nada.
 * `unknown`: un error sin código. El resto es el código de error de FCM en minúsculas; la
 * lista queda abierta porque FCM puede sumar códigos.
 */
export type CompanyPushFailureCode =
  | "suppressed"
  | "unknown"
  | "invalid_argument"
  | "unavailable"
  | "internal"
  | "resource_exhausted"
  | "unauthenticated"
  | "permission_denied"
  | "not_found"
  | (string & {});

export interface CompanyPushResult {
  companyUuid: string;
  /** El nombre que tenía la empresa al enviar. */
  companyName: string | null;
  status: CompanyPushStatus;
  /** Id de mensaje de FCM; solo con `sent`. */
  messageId: string | null;
  /** Solo con `failed`. */
  code: CompanyPushFailureCode | null;
  /** Mensaje del error (≤ 300 caracteres); solo con `failed`. Para soporte, no para la persona. */
  reason: string | null;
}

export interface CompanyNotificationSendResponse {
  /** La fila del historial. */
  uuid: string;
  /** ISO 8601. */
  createdAt: string;
  sent: number;
  failed: number;
  /** Una por empresa, en el orden pedido. */
  results: CompanyPushResult[];
}

// ─────────────────────────────────────────────────────────────────────
// Historial
// ─────────────────────────────────────────────────────────────────────

export interface CompanyNotificationActor {
  uuid: string;
  /** Del perfil vivo; nunca un correo. */
  name: string | null;
}

export interface CompanyNotificationHistoryItem {
  uuid: string;
  title: string;
  body: string;
  /** `null` si la cuenta ya no existe. */
  actor: CompanyNotificationActor | null;
  /** ISO 8601. */
  createdAt: string;
  sent: number;
  failed: number;
  results: CompanyPushResult[];
}

export interface CompanyNotificationHistoryResponse {
  items: CompanyNotificationHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}
