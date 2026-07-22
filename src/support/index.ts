/**
 * Support-ticket flow types (SITIMM-317).
 *
 * Backend contracts:
 *   - Enums:   app/domain/enums/support.py
 *   - Public:  app/presentation/schemas/support_v2.py
 *   - Staff:   app/presentation/schemas/support_admin_v2.py
 *   - Recipients: app/presentation/api/v2/support_recipients_v2.py
 *
 * The feature is a single non-staff report channel with TWO routing lanes,
 * decided server-side (the client never sets channel/severity):
 *   - `bug`     — something is broken; eligible for automatic Jira creation.
 *   - `support` — member support; human triage only, Jira only if a staffer
 *                 escalates.
 * See `docs/v2/Support/spec.md` (INV-01..17) in the backend repo.
 *
 * WIRE FORMAT. Every success response is wrapped by the V1-style
 * `success_response()` helper as `{ "status": "success", "data": <T> }`, where
 * `<T>` is the interface documented here. Error responses are raw:
 * `{ "detail": ... }` (FastAPI/validation) or
 * `{ "code": string, "message": string }` (domain errors). All object keys are
 * camelCase on the wire (backend serializes with `by_alias=True`).
 */

// ---------------------------------------------------------------------------
// Enums (stored as varchar + CHECK on the backend, never PG enum types)
// ---------------------------------------------------------------------------

/** Routing lane for a ticket. `CATEGORY_CHANNEL` maps every category to one. */
export type SupportChannel = "bug" | "support";

/**
 * User-facing report category. Derived from the non-staff critical paths in
 * spec §4. The first three are `bug` lane; the rest are `support` lane
 * (see {@link CATEGORY_CHANNEL}).
 */
export type SupportCategory =
  | "app_error"
  | "contenido_roto"
  | "rendimiento"
  | "cuenta_acceso"
  | "afiliacion"
  | "datos_personales"
  | "cuotas"
  | "consulta_legal"
  | "evento"
  | "eleccion"
  | "notificaciones"
  | "otro";

/**
 * Triage lifecycle. `new` / `in_progress` are the *open* states that the
 * canonical-dedupe partial index (`uq_support_canonical_open`) keys on — see
 * {@link SUPPORT_OPEN_STATUSES}.
 */
/**
 * Kanban triage lifecycle (SITIMM-459). The four non-`closed` states are the
 * open states. `qa` is bug-lane only (support goes backlog → working → closed).
 * Migrated from the legacy 4-state model (new→backlog, in_progress→working,
 * resolved/closed→closed).
 */
export type SupportStatus =
  | "backlog"
  | "assigned"
  | "working"
  | "qa"
  | "closed";

/** Server-derived severity. `high` when `httpStatus >= 500` (spec §5.1). */
export type SupportSeverity = "normal" | "high";

/**
 * Why a ticket was closed — mandatory on every close (SITIMM-453 decision #8).
 * `moved_consulta`/`escalated_jira` pair with a `movedTo` pointer to the
 * destination; `anon_no_contact` is the terminal state for an anonymous
 * misrouted report that left no way to reach the reporter.
 */
export type SupportCloseReason =
  | "resolved_direct"
  | "moved_consulta"
  | "escalated_jira"
  | "anon_no_contact"
  | "invalid"
  | "duplicate";

/**
 * Who performed a ticket audit event (SITIMM-456). `ai` = the daily triage pass
 * (advisory only), `human` = a staff action, `system` = automatic.
 */
export type SupportEventActor = "ai" | "human" | "system";

/** The append-only audit vocabulary for a ticket's lifecycle (SITIMM-456). */
export type SupportEventAction =
  | "created"
  | "claimed"
  | "status_changed"
  | "category_recommended"
  | "category_changed"
  | "ai_recommendation"
  | "moved"
  | "escalated"
  | "closed"
  | "reopened"
  | "note";

/**
 * One row of a ticket's append-only audit log (`support_ticket_events`). Rows
 * are never updated or deleted — the AI↔human go/no-go trail (SITIMM-453 T3).
 * Backend: support_ticket_event_repository.py :: SupportTicketEvent
 */
export interface SupportTicketEvent {
  id: number;
  actor: SupportEventActor;
  /** Staff user who acted; `null` for `system`/`ai` actors or purged users. */
  actorUserId: number | null;
  action: SupportEventAction;
  fromValue: string | null;
  toValue: string | null;
  payload: Record<string, unknown>;
  /** ISO 8601. */
  createdAt: string;
}

/** Kind of deferred side-effect written to the transactional outbox (spec §5.2). */
export type SupportOutboxKind =
  | "jira_create"
  | "jira_comment"
  | "jira_redact"
  | "email_ack"
  | "email_inbox"
  // Staff-facing creation notifications (SITIMM-447): dedicated Discord
  // channel + WS toast/FCM push fan-out to support_tickets:notify grantees.
  | "discord_notify"
  | "staff_notify";

/** Delivery state of one outbox row. `dead` after 5 failed attempts. */
export type SupportOutboxState = "pending" | "sending" | "sent" | "failed" | "dead";

/**
 * Antivirus verdict for an attachment. Attachments are inactive in v1
 * (`SUPPORT_ATTACHMENTS_ENABLED=false`); only `clean` may ever be served.
 */
export type SupportScanStatus = "clean" | "unscanned" | "infected";

// ---------------------------------------------------------------------------
// Public create channel — POST /api/v2/support/tickets
// ---------------------------------------------------------------------------

/**
 * Technical breadcrumbs the frontend auto-attaches to a report (the user does
 * NOT type these). Every field is optional — an anonymous web report may carry
 * almost none. This is the REQUEST shape (camelCase wire aliases). The stored
 * form returned on the staff detail is snake_case — see
 * {@link SupportTicketContextStored}.
 *
 * Backend: support_v2.py :: SupportTicketContext
 */
export interface SupportTicketContext {
  /** `ios` | `android` | `web` | `dashboard` (max 20 chars). */
  platform?: string | null;
  /** Client app/build version (max 40). */
  appVersion?: string | null;
  /** Route/screen where the problem occurred (max 300). */
  route?: string | null;
  /** HTTP status of the failing request, if any. Drives severity + bug lane. */
  httpStatus?: number | null;
  /** Application error code (max 80). */
  errorCode?: string | null;
  /** Correlation id of the failing request (max 80). */
  requestId?: string | null;
  /** Sentry event id, if the client captured one (max 64). */
  sentryEventId?: string | null;
  /** UI locale (max 10). */
  locale?: string | null;
  /** User-agent string (max 300). */
  userAgent?: string | null;
}

/**
 * Body of `POST /api/v2/support/tickets`. No `channel` / `severity` — those are
 * derived server-side (INV-03 / INV-04).
 *
 * Backend: support_v2.py :: SupportTicketCreateRequest
 */
export interface SupportTicketCreateRequest {
  category: SupportCategory;
  /** 1..{@link SUPPORT_TITLE_MAX} chars. */
  title: string;
  /** 1..{@link SUPPORT_DESCRIPTION_MAX} chars. */
  description: string;
  context?: SupportTicketContext | null;
}

/**
 * `data` payload of a successful create.
 * Backend: support_v2.py :: SupportTicketCreateResponse
 */
export interface SupportTicketCreateResponse {
  /** Human-facing folio (base32) the reporter can quote. */
  folio: string;
  uuid: string;
  channel: SupportChannel;
}

/**
 * One row of `GET /api/v2/support/categories` (drives the FE category picker).
 * Backend: support_v2.py :: SupportCategoryInfo
 */
export interface SupportCategoryInfo {
  id: SupportCategory;
  /** Spanish label shown in the picker. */
  labelEs: string;
  channel: SupportChannel;
}

/**
 * `data` payload of `GET /api/v2/support/categories`. `supportEmail` powers the
 * fast `mailto:` channel (SITIMM-324).
 * Backend: support_v2.py :: SupportCategoryListResponse
 */
export interface SupportCategoryListResponse {
  categories: SupportCategoryInfo[];
  supportEmail: string;
}

// ---------------------------------------------------------------------------
// Staff triage channel — /api/v2/support/tickets (ADMIN/MANAGER, not company-scoped)
// ---------------------------------------------------------------------------

/**
 * Stored technical context returned on the staff detail. Persisted via
 * `model_dump(exclude_none=True)` WITHOUT aliasing, so keys are snake_case and
 * absent fields are omitted (never `null`). Contrast with the camelCase request
 * form {@link SupportTicketContext}.
 */
export interface SupportTicketContextStored {
  platform?: string;
  app_version?: string;
  route?: string;
  http_status?: number;
  error_code?: string;
  request_id?: string;
  sentry_event_id?: string;
  locale?: string;
  user_agent?: string;
}

/**
 * One row of `GET /api/v2/support/tickets` — the triage-list projection (no
 * free-text body; that lives on the detail).
 * Backend: support_admin_v2.py :: SupportTicketListItem
 */
export interface SupportTicketListItem {
  uuid: string;
  folio: string;
  channel: SupportChannel;
  /** Immutable origin category (server-derived at creation, anchors dedupe/audit). */
  category: SupportCategory;
  /** Mutable triage category — AI recommends, human confirms. Equals `category` until re-classified (SITIMM-453). */
  triageCategory: SupportCategory;
  severity: SupportSeverity;
  status: SupportStatus;
  title: string;
  /** How many reports deduped into this canonical ticket (>= 1). */
  occurrenceCount: number;
  isAnonymous: boolean;
  /** Triage owner (claimant); `null` until someone takes the ticket. */
  handledBy: number | null;
  /** Always `null` in v1 — company is not resolved at report time. */
  companyId: number | null;
  /** Reporter's effective UserType at report time (snapshot). */
  userTypeAtReport: number | null;
  jiraIssueKey: string | null;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. */
  updatedAt: string;
}

/**
 * `data` payload of the staff list endpoint.
 * Backend: support_admin_v2.py :: SupportTicketListResponse
 */
export interface SupportTicketListResponse {
  items: SupportTicketListItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * A duplicate report that deduped into the canonical ticket.
 * Backend: support_admin_v2.py :: SupportTicketDuplicate
 */
export interface SupportTicketDuplicate {
  uuid: string;
  folio: string;
  status: SupportStatus;
  isAnonymous: boolean;
  /** ISO 8601. */
  createdAt: string;
}

/**
 * Delivery state of one deferred side-effect (Jira/email). Never carries the
 * raw provider response — only a structured `lastErrorCode`.
 * Backend: support_admin_v2.py :: SupportOutboxItem
 * (`kind` / `state` are `str` on the backend; the only values emitted are the
 * enum members typed here.)
 */
export interface SupportOutboxItem {
  id: number;
  kind: SupportOutboxKind;
  state: SupportOutboxState;
  attempts: number;
  lastErrorCode: string | null;
}

/**
 * Full ticket view for `GET /api/v2/support/tickets/{uuid}` — list fields plus
 * body, reporter identifiers, dedupe lineage and outbox delivery state.
 * Backend: support_admin_v2.py :: SupportTicketDetail
 */
export interface SupportTicketDetail extends SupportTicketListItem {
  description: string;
  reporterUserId: number | null;
  reporterEmail: string | null;
  fingerprint: string | null;
  fingerprintVersion: number;
  duplicateOfId: number | null;
  context: SupportTicketContextStored;
  internalNote: string | null;
  resolvedBy: number | null;
  /** ISO 8601. */
  resolvedAt: string | null;
  /** ISO 8601. When the current owner claimed the ticket. */
  claimedAt: string | null;
  /** Why the ticket was closed; `null` while still open (SITIMM-453 decision #8). */
  closeReason: SupportCloseReason | null;
  /** Forwarding pointer to where the ticket ended up: a consultation UUID or Jira key. */
  movedTo: string | null;
  /** Machine-readable resolution code (containment metric). */
  resolutionCode: string | null;
  duplicates: SupportTicketDuplicate[];
  outbox: SupportOutboxItem[];
}

/**
 * Body of `PATCH /api/v2/support/tickets/{uuid}`. Every field optional; an
 * omitted field is left unchanged.
 * Backend: support_admin_v2.py :: SupportTicketUpdateRequest
 */
export interface SupportTicketUpdateRequest {
  status?: SupportStatus | null;
  severity?: SupportSeverity | null;
  /** Re-classification — writes the MUTABLE `triageCategory`, never the immutable origin `category` (SITIMM-453). */
  category?: SupportCategory | null;
  /** max {@link SUPPORT_INTERNAL_NOTE_MAX} chars. */
  internalNote?: string | null;
}

/**
 * Body of `POST /api/v2/support/tickets/{uuid}/move` (SITIMM-455). Reroutes a
 * misfiled support ticket into Consultations. `typeUuid` is the advisor-room
 * routing decision; `companyUuid` optional (falls back to reporter's employer).
 */
export interface SupportMoveRequest {
  typeUuid: string;
  companyUuid?: string | null;
}

/** `data` payload of `POST /tickets/{uuid}/move` — the ticket is now closed. */
export interface SupportMoveResponse {
  uuid: string;
  movedTo: string;
  consultationUuid: string;
  closeReason: SupportCloseReason;
}

/**
 * Body of `POST /api/v2/support/tickets/{uuid}/close` (SITIMM-457). The reason
 * is MANDATORY — a ticket never closes silently (decision #8). Both `claim` and
 * `close` return the full {@link SupportTicketDetail}.
 */
export interface SupportCloseRequest {
  reason: SupportCloseReason;
  /** max {@link SUPPORT_INTERNAL_NOTE_MAX} chars. */
  note?: string | null;
}

/**
 * `data` payload of `POST /api/v2/support/tickets/{uuid}/escalate`.
 * `outboxKind` is always `jira_create` in v1 (the only escalation target).
 * Backend: support_admin_v2.py :: SupportEscalateResponse
 */
export interface SupportEscalateResponse {
  uuid: string;
  outboxKind: SupportOutboxKind;
  state: SupportOutboxState;
}

// ---------------------------------------------------------------------------
// Notification recipients — /api/v2/support/notification-recipients (MANAGER)
// ---------------------------------------------------------------------------

/**
 * One recipient of support inbox notifications (a user holding the
 * `support_tickets:notify` grant).
 * Backend: support_admin_v2.py :: SupportRecipientItem
 */
export interface SupportRecipientItem {
  userId: number;
  uuid: string;
  email: string | null;
  /** ISO 8601. */
  grantedAt: string;
  /** ISO 8601, or null for a non-expiring grant. */
  expiresAt: string | null;
}

/**
 * Body of `POST /api/v2/support/notification-recipients`.
 * Backend: support_recipients_v2.py :: AddRecipientRequest
 */
export interface AddRecipientRequest {
  userId: number;
  /** ISO 8601, or null/omitted for a non-expiring grant. */
  expiresAt?: string | null;
}

/**
 * `data` payload of the recipient list endpoint.
 * Backend: support_recipients_v2.py :: `{ recipients: [...] }`
 */
export interface SupportRecipientListResponse {
  recipients: SupportRecipientItem[];
}

/**
 * Ack body for add/remove recipient. `status` is `"added"` for POST,
 * `"removed"` for DELETE.
 * Backend: support_recipients_v2.py
 */
export interface SupportRecipientMutationResponse {
  userId: number;
  status: "added" | "removed";
}

// ---------------------------------------------------------------------------
// Constants (mirror the backend enums/limits — safe to use in FE validation)
// ---------------------------------------------------------------------------

/** Max title length on create (support_v2.py :: TITLE_MAX). */
export const SUPPORT_TITLE_MAX = 140;
/** Max description length on create (support_v2.py :: DESCRIPTION_MAX). */
export const SUPPORT_DESCRIPTION_MAX = 4000;
/** Max staff internal-note length (support_admin_v2.py :: INTERNAL_NOTE_MAX). */
export const SUPPORT_INTERNAL_NOTE_MAX = 4000;

/**
 * The load-bearing routing decision: only `bug` categories are eligible for
 * automatic Jira creation. Mirrors `support.py :: CATEGORY_CHANNEL`.
 */
export const CATEGORY_CHANNEL: Record<SupportCategory, SupportChannel> = {
  app_error: "bug",
  contenido_roto: "bug",
  rendimiento: "bug",
  cuenta_acceso: "support",
  afiliacion: "support",
  datos_personales: "support",
  cuotas: "support",
  consulta_legal: "support",
  evento: "support",
  eleccion: "support",
  notificaciones: "support",
  otro: "support",
};

/** Spanish category labels. Mirrors `support.py :: CATEGORY_LABELS_ES`. */
export const CATEGORY_LABELS_ES: Record<SupportCategory, string> = {
  app_error: "La app falló o se cerró",
  contenido_roto: "Contenido roto (imagen, PDF, revista)",
  rendimiento: "Lento o no carga",
  cuenta_acceso: "Problema de acceso o registro",
  afiliacion: "Mi afiliación o vínculo con la empresa",
  datos_personales: "Datos personales incorrectos (RFC, CURP, NSS, nombre)",
  cuotas: "Cuotas o aportaciones",
  consulta_legal: "Consulta legal o asesoría",
  evento: "Eventos",
  eleccion: "Elecciones o votaciones",
  notificaciones: "Notificaciones",
  otro: "Otro",
};

/**
 * The two statuses in which a canonical ticket is still "open" and participates
 * in fingerprint dedupe. Mirrors `support.py :: OPEN_STATUSES`.
 */
export const SUPPORT_OPEN_STATUSES: readonly SupportStatus[] = ["new", "in_progress"];
