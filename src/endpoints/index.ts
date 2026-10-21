/**
 * API endpoint path constants for the SITIMM ecosystem.
 *
 * V1 = legacy Node.js API (api.sitimm.org)
 * V2 = mini-back FastAPI (various base URLs per environment)
 *
 * Parameterized paths use `{param}` placeholders.
 * Use `endpoint()` helper to replace them with actual values.
 *
 * Each entry includes a JSDoc comment documenting:
 * - HTTP method(s)
 * - Request body type (if any)
 * - Response type
 * - Required permissions or roles
 */

// -- V1 Public Endpoints (read-only, used by sitimmApp + Sitimm-web) --

export const V1_PUBLIC_ENDPOINTS = {
  /** GET — Returns array of bonuses. Public, no auth. */
  BONUSES: "/bonuses/showall",
  /** GET — Returns array of magazines. Public, no auth. */
  MAGAZINES: "/magazines/showall",
  /** GET — Returns array of blog posts. Public, no auth. */
  BLOG_POSTS: "/blogposts/showall",
  /**
   * GET — Returns array of pages/programs. Public, no auth.
   * @deprecated Use `V2_ENDPOINTS.PROGRAMS_PUBLIC` instead. The V1 Node.js
   * backend endpoint will be retired once all FE consumers migrate to the
   * mini-back V2 contract (`GET /api/v2/programs/public`). Active V1
   * consumers as of 2026-05-04: sitimmApp `publicEndpoints.ts`,
   * Sitimm-web `programs.ts`.
   */
  PROGRAMS: "/pages/showall",
  /** GET — Returns array of FAQ entries. Public, no auth. */
  FAQ: "/frequentqas/showall",
  /** GET — Returns array of general bulletins. Public, no auth. */
  BULLETINS_GENERAL: "/bulletins-general/showall",
  /** GET — Returns array of private bulletins. Auth required. */
  BULLETINS_PRIVATE: "/bulletins/showall",
  /** GET — Returns array of companies. Public, no auth. */
  COMPANIES: "/companies/showall",
  /** GET — Returns array of events. Public, no auth. */
  EVENTS: "/events/showall",
} as const;

// -- V2 Endpoints (mini-back, used by sitimmApp + new_dashboard) --

export const V2_ENDPOINTS = {
  // ── Profile ──────────────────────────────────────────────

  /** GET → V2Response<UserMeV2Response>. Returns user + profile + employment + fieldPermissions. Auth required. */
  USERS_ME: "/users/me",
  /** PATCH → Body: UserProfileUpdateV2. Only "editable" fields accepted; server returns 403 for others. Auth required. */
  USERS_ME_UPDATE: "/users/me",
  /** PUT → Body: { declared: boolean }. Returns { declared, declaredAt }. Declares the caller is NOT a union member so the onboarding stops asking for an RFC; reversible, idempotent, and 409 `identity_already_claimed` when an employee record is already linked. Auth required (SITIMM-597). */
  USERS_ME_NOT_A_MEMBER: "/users/me/not-a-member",
  /** POST → Body: ClaimRfcV2Request. Returns V2Response<ClaimRfcV2Response>. Errores: ClaimRfcV2ErrorCode. Auth required (INVITADO o EMPLOYEE sin empleo vivo). SITIMM-954. */
  USERS_ME_CLAIM_RFC: "/users/me/claim-rfc",
  /** POST → Body: PasswordUpdateV2Request. Revoca las sesiones: re-login con la contraseña nueva. Auth required. */
  USERS_PASSWORD_UPDATE: "/users/password-update",
  /** GET → V2Response<EmploymentV2>. Returns employment data. Auth required. */
  USERS_ME_EMPLOYMENT: "/users/me/employment",
  /** GET → V2Response<CompanyDataV2>. Returns company info for current user. Auth required. */
  USERS_ME_COMPANY: "/users/me/company",
  /** POST → Body: AvatarUploadRequest (fileUuid). Returns V2Response<AvatarV2Response>. Auth required. */
  USERS_ME_AVATAR: "/users/me/avatar",
  /** DELETE → V2Response<AvatarV2Response>. Removes profile picture. Auth required. */
  USERS_ME_AVATAR_DELETE: "/users/me/avatar",
  /** DELETE → Body: DeleteAccountV2Request ({reauthToken}). Returns V2Response<DeleteAccountV2Response> (202, purgeAfter). Borrado con 30 días de gracia; idempotente. Errores: DeleteAccountV2ErrorCode. Auth required; 5/hora por cuenta. */
  USERS_ME_DELETE: "/users/me",
  /** POST → sin body. Returns V2Response<RestoreAccountV2Response>. Cancela el borrado durante la gracia; no pide reauth. Errores (`detail`): RestoreAccountV2ErrorCode. Auth required; 10/hora por cuenta. */
  USERS_ME_RESTORE: "/users/me/restore",
  /** POST → Body: { full_name (2–255), identifier_type: "rfc" | "curp" | "nss", identifier_value (3–64), company_uuid? | company_name_freetext? (una de las dos), note? (≤2000) }. Auth required: un INVITADO pide la revisión de su cuenta (o la vuelve a pedir). Returns V2Response<{ review_request_uuid }>. Backend: users_activation_v2.py `ActivationRequestBody`. SITIMM-1380. */
  USERS_ME_ACTIVATION_REQUEST: "/users/me/activation-request",
  /** GET → V2Response<UserCensusHistoryData>. A person's census history by the uuid of one of their
   *  employee rows, so no RFC travels in the path (it replaces V1 `/user-profiles/show-history/{rfc}`).
   *  Requires `users.view`, or being the person; anyone else gets 404 `Employee not found`. SITIMM-1472. */
  USERS_CENSUS_HISTORY_BY_EMPLOYEE: "/users/census-history/by-employee/{employee_uuid}",

  // ── Companies: manual registration of one person (SITIMM-1469) ──────

  /** POST → Body: CompanyEmployeeCreate. Returns V2Response<CompanyEmployeeCreated> (201).
   *  `census:create` (HR, ADMIN, MANAGER) within the caller's companies; out of scope → 404.
   *  409 CompanyEmployeeConflict (`employee_active_here` | `identity_mismatch`). The row joins no
   *  census and does not change `Census.total`. Reaches prod with mini-back #768. */
  COMPANY_EMPLOYEES_CREATE: "/companies/{company_uuid}/employees",

  // ── Admin users: an HR user's companies (SITIMM-1391) ──────────────

  /** GET → HrCompaniesV2Response. Requires `users.view`. 422 `not_hr` if the user is not HR. */
  ADMIN_USER_HR_COMPANIES: "/admin/users/{uuid}/hr-companies",
  /** PUT → Body: HrCompaniesV2Request (the whole set; `[]` unassigns all). Returns
   *  HrCompaniesV2Response. Requires `users.edit` + role ceiling. 422 `not_hr` /
   *  `company_not_found` (with `missing`), 409 `conflict`. */
  ADMIN_USER_HR_COMPANIES_SET: "/admin/users/{uuid}/hr-companies",

  // ── Auth (V2 desde el hard cutover 9e3a4255, 2026-06-22) ──────────

  /** POST → Body: LoginV2Request ({email, pass}). Returns LoginV2Response. NO auth. Rate limit 5/min + lockout por email. */
  AUTH_LOGIN: "/users/login",
  /** POST → Body: LoginPhoneV2Request ({phone, pass}). Returns LoginV2Response. NO auth. Rate limit 3/min. */
  AUTH_LOGIN_PHONE: "/users/login-phone",
  /** POST → Body: RefreshV2Request. Returns RefreshV2Response. NO auth. Refresh token rotativo one-time-use. */
  AUTH_REFRESH: "/users/refresh",
  /** POST → Body: LogoutV2Request. Bearer access token requerido. Blacklistea access + revoca refresh. */
  AUTH_LOGOUT: "/users/logout",
  /** POST → Body: SetupInitV2Request. Authorization: Bearer <setupToken> (JWT type="setup"). */
  AUTH_SETUP: "/auth/setup",
  /** POST → Body: SetupVerifyV2Request. Bearer <setupToken>. Returns SetupVerifyV2Response. */
  AUTH_SETUP_VERIFY: "/auth/setup/verify",
  /** POST → Body: ForgotPasswordV2Request. NO auth. 5/hour/IP. */
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  /** POST → Body: VerifyResetV2Request. NO auth. Returns {status,data:{success,data:{resetToken}}} (envelope doble). */
  AUTH_VERIFY_RESET: "/auth/verify-reset",
  /** POST → Body: ResetPasswordV2Request. Bearer <resetToken> + token en body. */
  AUTH_RESET_PASSWORD: "/auth/reset-password",
  /** POST → Body: SignupOtpV2Request. Returns V2Response<SignupOtpV2Response> (session_id). NO auth; 30/min por IP. Errores: SignupOtpV2ErrorCode en `data.message`; otros 429 traen texto del BE. */
  AUTH_OTP_REQUEST: "/auth/otp/request",
  /** POST → Body: SignupOtpVerifyV2Request. Returns V2Response<SignupOtpVerifyV2Response> (signup_token). NO auth; 30/min por IP. 410 `session_expired` o código caducado · 400 código incorrecto · 429 intentos agotados. */
  AUTH_OTP_VERIFY: "/auth/otp/verify",
  /** POST → Body: EmployeeMatchV2Request. Bearer <signup_token>. Returns V2Response<EmployeeMatchV2Response>. 403 `age_restricted`, 429 `too_many_attempts`. */
  AUTH_EMPLOYEE_MATCH: "/auth/employee/match",
  /** POST → Body: EmployeeClaimV2Request. Bearer <signup_token>. Returns V2Response<EmployeeClaimV2Response> (sesión; `refresh_token` en snake_case). Errores: EmployeeClaimV2ErrorCode. */
  AUTH_EMPLOYEE_CLAIM: "/auth/employee/claim",
  /** POST → Body: GuestSignupV2Request. Bearer <signup_token>. Returns V2Response<GuestSignupV2Response> (sesión INVITADO). Errores: GuestSignupV2ErrorCode. */
  AUTH_GUEST: "/auth/guest",
  /** GET ?search=&limit= (search 2+ caracteres; limit 1–20, default 20) → V2Response<{ companies: { uuid: string; name: string }[]; total: number }>. NO auth: el selector mínimo de empresas del alta, antes del OTP. 429 `rate_limited` por IP. Backend: auth_signup.py `companies_picker`. SITIMM-1380. */
  AUTH_COMPANIES: "/auth/companies",
  /** POST → Body: { password (8–128), full_name (2–255), identifier_type: "rfc" | "curp" | "nss", identifier_value (3–64), company_uuid? | company_name_freetext? (una de las dos), note? (≤2000) }. Bearer <signup_token>. Sin coincidencia en el padrón: crea la cuenta INVITADO y la solicitud de revisión. Returns V2Response<{ status: "authenticated", …sesión, review_request_uuid }>. 410 `session_expired`. Backend: auth_signup.py `ReviewRequestBody`. SITIMM-1380. */
  AUTH_REVIEW_REQUEST: "/auth/review-request",
  /** POST → Body: ReauthV2Request (contraseña, o provider + idToken). Returns V2Response<ReauthV2Response> (reauthToken de un solo uso, 5 min). Errores (`detail`): ReauthV2ErrorCode. Auth required; 5/min por cuenta. */
  AUTH_REAUTH: "/auth/reauth",
  /** POST → Body: SocialLoginRequest. NO auth. Response FLAT SocialLoginResponse. V2 (antes V1). */
  AUTH_SOCIAL_LOGIN: "/auth/social",
  /** POST → Body: GuestLoginRequest ({session_id}). NO auth. Response FLAT GuestLoginResponse. V2 (antes V1). */
  AUTH_SOCIAL_GUEST: "/auth/social/guest",
  /** GET → Response FLAT SocialAccountListResponse. Auth required. V2 (antes V1). POST → Body: SocialLinkV2Request (liga con sesión + reauth, SITIMM-955), misma respuesta. DELETE en `${AUTH_SOCIAL_ACCOUNTS}/{provider}`. */
  AUTH_SOCIAL_ACCOUNTS: "/auth/social/accounts",
  /** POST → Body: ContactInitV2Request. Returns V2Response<ContactCodeSentV2Response>. Código al canal de identidad (el mismo campo o el otro canal real). Errores por estado HTTP, sin código. Auth required. SITIMM-937/959. */
  AUTH_CONTACT_INIT: "/auth/contact/init",
  /** POST → Body: ContactConfirmIdentityV2Request. Returns V2Response<ContactCodeSentV2Response>. Verifica la identidad y manda código al valor nuevo; 409 = empezar de nuevo. Auth required. */
  AUTH_CONTACT_CONFIRM_IDENTITY: "/auth/contact/confirm-identity",
  /** POST → Body: ContactConfirmNewV2Request. Returns V2Response<ContactUpdatedV2Response>. Aplica el cambio ya verificado. Auth required. */
  AUTH_CONTACT_CONFIRM_NEW: "/auth/contact/confirm-new",

  // ── Events ───────────────────────────────────────────────

  /** GET → Query: EventListV2Query (incl. companyId / campusId, SITIMM-1389). Returns V2Response<EventListV2Response>. Auth required. */
  EVENTS: "/events",
  /** POST → Body: CreateEventV2Request. Returns V2Response<EventV2>. Requires events:create permission. */
  EVENTS_CREATE: "/events",
  /** GET → V2Response<EventDetailV2>. Full event with content/files. Auth required. */
  EVENT: "/events/{uuid}",
  /** PATCH → Body: UpdateEventV2Request. Returns V2Response<EventV2>. Requires events:update permission. */
  EVENT_UPDATE: "/events/{uuid}",
  /** DELETE → V2Response<{message}>. Requires events:delete permission. */
  EVENT_DELETE: "/events/{uuid}",
  /** POST → V2Response<EventV2>. Clones the event. Requires events:create permission. */
  EVENT_CLONE: "/events/{uuid}/clone",
  /** POST → Body: EventNotifyV2Request. Returns V2Response<EventNotifyV2Response> (202, the
      fan-out is queued). Requires `events:notify` (ADMIN, MANAGER, ADMIN_EVENTS) and the event's
      company scope; 10/hour per user; one send per event+target per 24 h, or per 1 h for the
      urgent templates (SITIMM-1349, `participants` only, a slot of their own). Errors:
      `EventNotifyErrorCode` (409 `notify_cooldown` carries `retryAfter`). Ships with mini-back
      SITIMM-1317. */
  EVENT_NOTIFY: "/events/{uuid}/notify",
  /** GET ?target=participants|audience → V2Response<EventNotifyPreviewV2Response>. Requires
      `events:notify`. How many users the push would reach and when the target's 24 h cooldown
      ends (`cooldownUntil`, null when free). Optional `?template=`: with an urgent one
      (SITIMM-1349) it reports the 1 h urgent slot instead. Ships with mini-back SITIMM-1317. */
  EVENT_NOTIFY_PREVIEW: "/events/{uuid}/notify/preview",
  /** POST → Body: CancelEventV2Request. Returns V2Response<EventCancelV2Response>. Requires
      `events:cancel` (ADMIN, MANAGER, ADMIN_EVENTS) and the event company scope. Disables the
      event, cancels every live registration and pushes `event_cancelled`. Errors:
      `EventCancelErrorCode` (409 `event_already_cancelled`). Ships with mini-back SITIMM-1323. */
  EVENT_CANCEL: "/events/{uuid}/cancel",
  /** GET → V2Response<EventScannersV2Response>. PUT → Body: SetEventScannersV2Request (the full
      list), returns V2Response<EventScannersV2Response>. Requires `events:manage_scanners`
      (ADMIN, MANAGER, ADMIN_EVENTS) and the event company scope. SITIMM-805 / SITIMM-1322. */
  EVENT_SCANNERS: "/events/{uuid}/scanners",
  /** GET ?q=&limit= → V2Response<EventScannerCandidateV2[]>. Same gate as EVENT_SCANNERS. Active
      event staff matching `q` (2+ chars); `limit` ≤ 50. Ships with mini-back SITIMM-1322. */
  EVENT_SCANNER_CANDIDATES: "/events/{uuid}/scanners/candidates",
  /** GET ?q=&limit= → V2Response<EventDoorCandidateV2[]>. Requires `events:check_in`, the event's
      scanner list (`canScanTickets`), the harness and the event company scope. Affiliates of the
      caller's companies whose name contains `q`, whose RFC starts with it or whose phone contains
      its digits (`q` 3+ chars, `limit` ≤ 50). Ships with mini-back SITIMM-1341. */
  EVENT_DOOR_CANDIDATES: "/events/{uuid}/door/candidates",
  /** POST → Body: EventDoorCheckInV2Request. Returns V2Response<EventDoorCheckInV2Response>. Same
      gate as EVENT_DOOR_CANDIDATES. Registers the affiliate if needed and checks them in, in one
      step. Errors: `EventDoorErrorCode`. Ships with mini-back SITIMM-1341. */
  EVENT_DOOR_CHECK_IN: "/events/{uuid}/door/check-in",
  /** GET → V2Response<SupportCategoryListResponse> (las categorías del formulario de reporte + `supportEmail`). NO auth; estático. Backend: support_v2.py `list_categories`. SITIMM-1380. */
  SUPPORT_CATEGORIES: "/support/categories",
  /** POST → Body: SupportTicketCreateRequest. Auth opcional: anónimo con límite por IP y tope global, autenticado con límite por usuario. 201 → V2Response<SupportTicketCreateResponse> (folio, uuid, channel). Backend: support_v2.py `create_ticket`. La misma ruta en GET es la bandeja de staff (permiso `support_tickets:read`; V2Response<SupportTicketListResponse>, support_admin_v2.py `list_tickets`). SITIMM-1380. */
  SUPPORT_TICKETS: "/support/tickets",
  /** GET → V2Response<MyEventsV2Response>. Returns user's registered events. Auth required. */
  EVENTS_MY: "/events/my-events",
  /** POST → Body: `CreateParticipantV2Request` (events module). Returns
      V2Response<EventParticipantV2> (201). Auth required (get_user_context). THE canonical authed
      self-registration route (event_participants_v2.py).

      The event comes from the PATH; the body has no event field.

      Wire format is **camelCase** — `campusId`, `isAlternative`, `needTransport`… Every field on
      the backend model is an explicit alias and `populate_by_name=True` also accepts snake_case.
      An earlier version of this note listed the Python field names (`campus_id`, `is_alternative`),
      which read as if the wire were snake_case. It is not.

      Both `EVENT_PARTICIPANTS` and `EVENT_PARTICIPANTS_MINE` below are DEAD — verified against
      production, not inferred. Use this route to register and `EVENTS_MY` to list. */
  EVENT_REGISTER: "/events/{uuid}/register",
  /** POST → Body: RegisterPublicV2Request. NO auth. IP rate-limited. Returns
      V2Response<RegisterPublicV2Response> (202). Anonymous registration; sends double-opt-in email. */
  EVENT_REGISTER_PUBLIC: "/events/{uuid}/register-public",
  /** GET → V2Response<PendingApprovalsCount>. Perm `events:approve_guests`.
      La insignia de la cola de solicitudes (SITIMM-586, decisión #10 del PO).
      Cuenta TODAS las pendientes en eventos habilitados y futuros, no por
      evento: un evento pasado dejaría la insignia encendida sobre algo que ya
      no se puede aprobar. */
  EVENT_APPROVALS_PENDING_COUNT: "/events/approvals/pending-count",
  /** POST → Body: WaitlistPromoteV2Request. Returns V2Response<WaitlistPromoteV2Response>.
      Requires `event_participants:update` and the event company scope. Promotes the chosen
      waitlisted rows; over capacity without `allowOverCapacity` → 409
      `promotion_over_capacity` with `overCapacity`. Errors: `WaitlistPromoteErrorCode`.
      Ships with mini-back SITIMM-1347. */
  EVENT_WAITLIST_PROMOTE: "/events/{uuid}/waitlist/promote",
  /** GET ?from&to&groupBy&eventTypeId&campusId&companyId → V2Response<EventAnalyticsV2Response>.
      Requires `events:analytics` (ADMIN, MANAGER, ADMIN_EVENTS) and the event company scope.
      Registered, attended, no-show, cancelled and waitlist across events; defaults to the
      last 90 days, 366 at most. Errors: `EventAnalyticsErrorCode`. Own prefix (not under
      /events). Ships with mini-back SITIMM-1343. */
  EVENT_ANALYTICS: "/event-analytics",
  /**
   * GET → V2Response<EventCompanyOptionV2[]>. The companies owning at least one live, non-QA
   * event in the caller's event scope, by name — the options of the event list's company
   * filter, for every role (ADMIN_EVENTS has no companies:read). No pagination. Requires
   * events:update. SITIMM-1389.
   */
  EVENT_COMPANY_OPTIONS: "/events/company-options",
  /** GET ?page&pageSize&action&actorUuid → V2Response<EventChangesV2Response>. Requires
      `events:update`, the event company scope and the QA harness (uniform 404). The readable
      history of an event — who changed what, newest first — with the actor and participants
      by name, never an email. Ships with mini-back SITIMM-1345. */
  EVENT_CHANGES: "/events/{uuid}/changes",
  /** POST → Body: ConfirmRegistrationV2Request. NO auth. IP rate-limited. Returns
      V2Response<ConfirmRegistrationV2Response>. Consumes the one-time email token, creates the participant. */
  EVENT_REGISTRATION_CONFIRM: "/events/registration/confirm",

  // ── Event Participants ───────────────────────────────────

  /** @deprecated DEAD ROUTE — the backend serves nothing at `/event-participants`.
      Verified against production 2026-08-26: **404 on both GET and POST**, with no session
      (404 = no route; 401 would mean the route exists and wants auth).
      To list an event's participants use `LIST_EVENT_PARTICIPANTS`. */
  EVENT_PARTICIPANTS: "/event-participants",
  /** @deprecated DEAD ROUTE — same path as `EVENT_PARTICIPANTS`, same 404.
      To register, use `EVENT_REGISTER` (`POST /events/{uuid}/register`). */
  EVENT_PARTICIPANTS_REGISTER: "/event-participants",
  /** @deprecated DEAD ROUTE — there is no literal `/mine` segment; the string falls through to the
      `/{uuid}` path param, reaches the query as a UUID and Postgres rejects it. The caller sees
      **500 `DB_ERROR`, which is a 404 in disguise** — verified in the server trace
      (`invalid UUID 'mine'`), not inferred from the status code.
      A probe alone cannot catch this: the auth check runs BEFORE the path param is parsed, so an
      unauthenticated request answers 401 and looks alive.
      Use `EVENTS_MY` (`/events/my-events`) instead. */
  EVENT_PARTICIPANTS_MINE: "/event-participants/mine",
  /** GET → V2Response<EventParticipantV2>. Single participant detail. Auth required. */
  EVENT_PARTICIPANT: "/event-participants/{uuid}",
  /** PATCH → Body: UpdateParticipantV2Request. Auth required. */
  EVENT_PARTICIPANT_UPDATE: "/event-participants/{uuid}",
  /** DELETE → V2Response<{message}>. Unregister from event. Auth required. */
  EVENT_PARTICIPANT_DELETE: "/event-participants/{uuid}",
  /** POST → V2Response<EventParticipantV2>. Confirm attendance. Auth required. */
  EVENT_PARTICIPANT_CONFIRM: "/event-participants/{uuid}/confirm",

  // ── Event Types ──────────────────────────────────────────

  /** GET → V2Response<EventTypeV2[]>. List all event types. Auth required. */
  EVENT_TYPES: "/event-types",
  /** POST → Body: CreateEventTypeV2Request. Requires event_types:create permission. */
  EVENT_TYPES_CREATE: "/event-types",
  /** GET → V2Response<EventTypeV2>. Single event type. Auth required. */
  EVENT_TYPE: "/event-types/{id}",
  /** PATCH → Body: UpdateEventTypeV2Request. Requires event_types:update permission. */
  EVENT_TYPE_UPDATE: "/event-types/{id}",
  /** DELETE → V2Response<{message}>. Requires event_types:delete permission. */
  EVENT_TYPE_DELETE: "/event-types/{id}",

  // ── Event Venues · Transport links · Logistics (SITIMM-228) ──
  // Gaps not covered by V2_ENDPOINTS_GENERATED. Notes, venue-participants,
  // audit-log, and participant import already live in that generated map
  // (SET_PARTICIPANT_NOTES / LIST_VENUE_PARTICIPANTS / GET_EVENT_AUDIT_LOG /
  // PARSE_CSV) and are intentionally not duplicated here.

  /** POST → Body: `{ eventCampusId }`. 204 No Content. Links a transport stop to a sede. Zero links ⇒ stop serves ALL sedes. Requires events:update. */
  EVENT_TRANSPORT_STOP_CAMPUSES: "/events/{uuid}/transport/{stopUuid}/campuses",
  /** DELETE → 204 No Content. Unlinks a transport stop from a sede. Requires events:update. */
  EVENT_TRANSPORT_STOP_CAMPUS:
    "/events/{uuid}/transport/{stopUuid}/campuses/{eventCampusId}",
  /** GET → V2Response<EventLogistics>. Confirmed-vs-minimum per sede + per transport stop. Requires events:read. */
  EVENT_LOGISTICS: "/events/{uuid}/logistics",

  // ── Event i18n label sidecars (SITIMM-257) ───────────────
  // Admin capture surface for the four label-translation sidecars
  // `EventTranslation` does not cover: agenda day-headers + sessions
  // (events:manage), event venues + transport stops (events:update). Each
  // entity: GET list · PUT {lang} upsert · DELETE {lang}. Bodies + row types
  // live in the `events` module (EventSidecarTranslation, …UpsertBody,
  // …DeleteResponse). Backend: event_translations_v2.py.

  /** GET → V2Response<EventSidecarTranslationList>. Day-header translation rows. Requires events:manage. */
  EVENT_DAY_TRANSLATIONS: "/events/{uuid}/agenda/days/{dayUuid}/translations",
  /** PUT → Body: EventTitleDescTranslationUpsertBody → V2Response<EventSidecarTranslation>. DELETE → V2Response<EventSidecarTranslationDeleteResponse>. Requires events:manage. */
  EVENT_DAY_TRANSLATION:
    "/events/{uuid}/agenda/days/{dayUuid}/translations/{lang}",
  /** GET → V2Response<EventSidecarTranslationList>. Session translation rows. Requires events:manage. */
  EVENT_SESSION_TRANSLATIONS:
    "/events/{uuid}/agenda/sessions/{sessionUuid}/translations",
  /** PUT → Body: EventTitleDescTranslationUpsertBody → V2Response<EventSidecarTranslation>. DELETE → V2Response<EventSidecarTranslationDeleteResponse>. Requires events:manage. */
  EVENT_SESSION_TRANSLATION:
    "/events/{uuid}/agenda/sessions/{sessionUuid}/translations/{lang}",
  /** GET → V2Response<EventSidecarTranslationList>. Venue (EventCampus) label translation rows. Requires events:update. */
  EVENT_VENUE_TRANSLATIONS: "/events/{uuid}/venues/{venueUuid}/translations",
  /** PUT → Body: EventLabelTranslationUpsertBody → V2Response<EventSidecarTranslation>. DELETE → V2Response<EventSidecarTranslationDeleteResponse>. Requires events:update. */
  EVENT_VENUE_TRANSLATION:
    "/events/{uuid}/venues/{venueUuid}/translations/{lang}",
  /** GET → V2Response<EventSidecarTranslationList>. Transport-stop (EventBusStop) label translation rows. Requires events:update. */
  EVENT_TRANSPORT_STOP_TRANSLATIONS:
    "/events/{uuid}/transport/{stopUuid}/translations",
  /** PUT → Body: EventLabelTranslationUpsertBody → V2Response<EventSidecarTranslation>. DELETE → V2Response<EventSidecarTranslationDeleteResponse>. Requires events:update. */
  EVENT_TRANSPORT_STOP_TRANSLATION:
    "/events/{uuid}/transport/{stopUuid}/translations/{lang}",

  // ── Audience Templates ───────────────────────────────────
  // Reusable AudienceSpec library (audience_templates_v2.py). Admin-only
  // surface: reads included require a write-tier events:* permission —
  // events:read is BASE-level and intentionally NOT sufficient.

  /** GET → V2Response<AudienceTemplateListV2Response>. Query: page (≥1), pageSize (1-100, default 50), search (1-255). Requires events:update. */
  AUDIENCE_TEMPLATES: "/audience-templates",
  /** POST → Body: CreateAudienceTemplateRequest. Returns V2Response<AudienceTemplateV2> (201). Requires events:update. */
  AUDIENCE_TEMPLATES_CREATE: "/audience-templates",
  /** GET → V2Response<AudienceTemplateV2>. 404 if unknown/soft-deleted. Requires events:update. */
  AUDIENCE_TEMPLATE: "/audience-templates/{uuid}",
  /** PATCH → Body: UpdateAudienceTemplateRequest (null/omitted fields keep current). Returns V2Response<AudienceTemplateV2>. Requires events:update. */
  AUDIENCE_TEMPLATE_UPDATE: "/audience-templates/{uuid}",
  /** DELETE → 204 No Content (no envelope). Soft-delete. Requires events:delete. */
  AUDIENCE_TEMPLATE_DELETE: "/audience-templates/{uuid}",

  // ── Consultations ────────────────────────────────────────

  /** POST → Body: ListConsultationsV2Request. Returns V2Response<ListConsultationsV2Response>. Auth required.
   *  Note: uses POST (not GET) because filters are sent in the body. */
  CONSULTATIONS: "/consultations",
  /** POST → Body: CreateConsultationV2Request. Returns V2Response<ConsultationV2>. Status 201. Auth required. */
  CONSULTATIONS_CREATE: "/consultations/create",
  /** POST → Body: GuestConsultationV2Request. Returns V2Response<GuestConsultationV2Response>. Status 201. PUBLIC — a visitor without an account; a session, if sent, is ignored. Refusals: GuestConsultationErrorV2 (422 invalid_type | invalid_company, 429 visitor_limit_*). SITIMM-944. */
  CONSULTATIONS_GUEST: "/consultations/guest",
  /** GET → V2Response<{ types: ConsultationTypeV2[]; total: number }>. The whole type catalog. PUBLIC since SITIMM-944 (the visitor form needs it without a session). */
  CONSULTATIONS_TYPES: "/consultations/types",
  /** GET → V2Response<ConsultationV2>. Single consultation detail. Auth required. */
  CONSULTATION: "/consultations/{uuid}",
  /** PATCH → Body: UpdateConsultationV2Request (action: "take"|"solve"|"rate"). Auth required. */
  CONSULTATION_UPDATE: "/consultations/{uuid}",
  /** POST → V2Response<ConsultationV2>. Advisor takes the consultation (state 1→2). Requires ADVISOR+. */
  CONSULTATION_TAKE: "/consultations/{uuid}/take",
  /** GET → V2Response<ListMessagesV2Response>. Query: page, per_page. Auth required. */
  CONSULTATION_MESSAGES: "/consultations/{uuid}/messages",
  /** POST → Body: SendMessageV2Request (body: 1–2000 chars, is_internal?). Returns V2Response<ConsultationMessageV2>. */
  CONSULTATION_SEND_MESSAGE: "/consultations/{uuid}/send-message",
  /** POST → Body: ProposeCloseV2Request (solution: 1–4000 chars). Sets state=4. Advisor-only. */
  CONSULTATION_PROPOSE_CLOSE: "/consultations/{uuid}/propose-close",
  /** POST → Body: ConfirmCloseV2Request (score?: 1–5, feedback?). Sets state=3. Employee-only. */
  CONSULTATION_CONFIRM_CLOSE: "/consultations/{uuid}/confirm-close",
  /** POST → Body: RejectCloseV2Request (reason?: max 2000). Sets state=5. Employee-only. */
  CONSULTATION_REJECT_CLOSE: "/consultations/{uuid}/reject-close",
  /** POST → Body: RateConsultationV2Request (score: 1–5, feedback?). State must be 3 with score=null. Employee-only. */
  CONSULTATION_RATE: "/consultations/{uuid}/rate",

  // ── Consultation Admin ────────────────────────────────────

  /** POST → Body: AssignConsultationV2Request. Admin-only. Assigns advisor. */
  CONSULTATION_ASSIGN: "/consultations/{uuid}/assign",
  /** POST → Body: EscalateConsultationV2Request. Admin-only. Escalates priority. */
  CONSULTATION_ESCALATE: "/consultations/{uuid}/escalate",
  /** POST → Body: TransferConsultationV2Request. Admin-only. Transfers to another advisor. */
  CONSULTATION_TRANSFER: "/consultations/{uuid}/transfer",
  /** POST → Body: AddCoAdvisorV2Request. Admin-only. Adds co-advisor. */
  CONSULTATION_ADD_ADVISOR: "/consultations/{uuid}/add-advisor",

  // ── Consultation Messages with Attachments ─────────────────

  /** POST → Multipart body: files[] + body + is_internal?. Returns V2Response<ConsultationMessageV2>. Max 5 files, 10MB each. Auth required. */
  CONSULTATION_SEND_MESSAGE_ATTACHMENTS: "/consultations/{uuid}/messages/with-attachments",

  // ── Consultation Transitions (Audit Log) ──────────────────

  /** GET → V2Response<ListTransitionsV2Response>. Full state transition history. Auth required. */
  CONSULTATION_TRANSITIONS: "/consultations/{uuid}/transitions",

  // ── Consultation Statistics ───────────────────────────────

  /** POST → Body: ConsultationStatsV2Request. Returns V2Response<ConsultationStatsV2Response>. Admin-only. */
  CONSULTATION_STATS: "/consultations/stats",
  /** GET → V2Response<AdvisorMyStatsV2Response>. Personal advisor metrics. Advisor+ only. */
  CONSULTATION_MY_STATS: "/consultations/my-stats",

  // ── Consultation Templates ────────────────────────────────

  /** GET → V2Response<ListTemplatesV2Response>. Advisors see active only; admins see all. Auth required. */
  CONSULTATION_TEMPLATES: "/consultations/templates",
  /** POST → Body: CreateTemplateV2Request. Returns V2Response<TemplateV2Response>. Status 201. Admin/Manager only. */
  CONSULTATION_TEMPLATES_CREATE: "/consultations/templates",
  /** PATCH → Body: UpdateTemplateV2Request. Returns V2Response<TemplateV2Response>. Admin/Manager only. */
  CONSULTATION_TEMPLATE: "/consultations/templates/{uuid}",
  /** DELETE → 204 No Content. Admin/Manager only. */
  CONSULTATION_TEMPLATE_DELETE: "/consultations/templates/{uuid}",
  /** POST → V2Response<TemplateV2Response>. Increments usage_count. Advisor+ only. */
  CONSULTATION_TEMPLATE_USE: "/consultations/templates/{uuid}/use",

  // ── Consultation Archive ──────────────────────────────────

  /** POST → V2Response<{message}>. Archive consultation for current user. Auth required. */
  CONSULTATION_ARCHIVE: "/consultations/{uuid}/archive",
  /** DELETE → 204 No Content. Unarchive consultation. Auth required. */
  CONSULTATION_ARCHIVE_DELETE: "/consultations/{uuid}/archive",

  // ── Consultation Reports ──────────────────────────────────

  /** POST → Body: CreateReportRequest (reason: 10–2000 chars). Auth required. Files a report against the other party. */
  CONSULTATION_REPORT: "/consultations/{uuid}/report",
  /** GET → V2Response<ListReportsV2Response>. Query: status, report_type, company_uuid, date_from, date_to, page, per_page. Admin-only. */
  CONSULTATION_REPORTS: "/consultations/reports",
  /** PATCH → Body: ResolveReportRequest. Admin-only. Resolves/dismisses a report. */
  CONSULTATION_REPORT_RESOLVE: "/consultations/reports/{uuid}",
  /** DELETE → 204 No Content. Manager-only. */
  CONSULTATION_REPORT_DELETE: "/consultations/reports/{uuid}",

  // ── Bulletins ────────────────────────────────────────────

  /** GET → V2Response<ListBulletinsV2Response>. Query: page, page_size, company_uuid?, is_general?. Auth required. */
  BULLETINS: "/bulletins",
  /** GET → V2Response<ListBulletinsV2Response>. Query: page, page_size. Public — no auth. Returns general bulletins whose published_at is in the past. */
  BULLETINS_PUBLIC: "/bulletins/public",
  /** GET → V2Response<BulletinV2>. Public — no auth. Same visibility predicate as BULLETINS_PUBLIC; hidden rows are 404 (never 403). Target of the bulletins_new_{locale} topic push deep link. */
  BULLETIN_PUBLIC: "/bulletins/public/{uuid}",
  /** GET → V2Response<BulletinFeedResponse>. Query: page, page_size, unread_only?. Auth required. Personal materialized inbox. */
  BULLETINS_FEED: "/bulletins/feed",
  /** POST → Body: PreviewAudienceRequest. Returns V2Response<PreviewAudienceResponse>. Requires content:create. Run the coverage gate before publishing. */
  BULLETINS_PREVIEW_AUDIENCE: "/bulletins/preview-audience",
  /** POST → Body: CreateBulletinV2Body. Returns V2Response<BulletinV2>. Status 201. Requires content:create. Queues fan-out task. */
  BULLETINS_CREATE: "/bulletins",
  /** GET → V2Response<BulletinV2>. Auth required. */
  BULLETIN: "/bulletins/{uuid}",
  /** PATCH → Body: UpdateBulletinV2Body. Returns V2Response<BulletinV2>. Requires content:update. Scope is immutable. */
  BULLETIN_UPDATE: "/bulletins/{uuid}",
  /** DELETE → V2Response<{message}>. Requires content:delete. Soft delete. */
  BULLETIN_DELETE: "/bulletins/{uuid}",
  /** POST → V2Response<{message}>. Auth required. Marks the caller's BulletinDelivery row as read. */
  BULLETIN_READ: "/bulletins/{uuid}/read",
  /** POST → V2Response<{message}>. Auth required. Hides the bulletin from the caller's feed (also marks read). */
  BULLETIN_DISMISS: "/bulletins/{uuid}/dismiss",
  /** POST → V2Response<{message}>. Query: pin=true|false. Auth required. Toggles pinned state in the caller's feed. */
  BULLETIN_PIN: "/bulletins/{uuid}/pin",
  /** GET → V2Response<BulletinRecipientsResponse>. Query: page, page_size. Requires content:update. Admin recipients audit + read/dismissed roll-ups. */
  BULLETIN_RECIPIENTS: "/bulletins/{uuid}/recipients",

  // ── Magazines ────────────────────────────────────────────

  /** GET → V2Response<MagazineListV2Response>. Public, no auth required. Query: page, page_size, search, sort, category, year, featured_only. */
  MAGAZINES_PUBLIC: "/magazines/public",
  /** GET → V2Response<MagazineListV2Response>. Auth required. Includes drafts. */
  MAGAZINES: "/magazines",
  /** POST → Body: MagazineCreateV2. Returns V2Response<MagazineDetailV2Response>. Status 201. Requires magazines:create. */
  MAGAZINES_CREATE: "/magazines",
  /** GET → V2Response<MagazineListV2Response>. User's liked magazines. Auth required. */
  MAGAZINES_LIKED: "/magazines/liked",
  /** GET → V2Response<MagazineDetailV2Response>. Full detail with TOC, related. Auth required. */
  MAGAZINE: "/magazines/{uuid}",
  /** PATCH → Body: MagazineUpdateV2. Requires magazines:update. */
  MAGAZINE_UPDATE: "/magazines/{uuid}",
  /** DELETE → V2Response<{message}>. Requires magazines:delete. */
  MAGAZINE_DELETE: "/magazines/{uuid}",
  // NOTE: there is NO POST /magazines/{uuid}/publish route — publishing is done
  // via PATCH /magazines/{uuid} with { is_published: true }. (drift cleanup)
  // ── Magazine comments (engagement subject adapter @ /api/v2/magazines) ──
  // Magazine-named mirror of BLOG_V2_ENDPOINTS.BLOG_POST_COMMENTS*. Served by
  // the generic engagement comment routes (`attach_factory.py`); equivalent to
  // engagementSubjectEndpoints("/api/v2/magazines").{COMMENTS_LIST,COMMENTS_CREATE,COMMENT_DELETE_OWN}.
  /** GET → V2Response<MagazineCommentListResponseV2>. Auth optional (read public). Query: limit, offset. */
  MAGAZINE_COMMENTS: "/magazines/{uuid}/comments",
  /** POST → Body: MagazineCommentCreateRequestV2. Returns V2Response<MagazineCommentV2>. Status 201. Auth required. Rate-limited 3/min per (user, subject). */
  MAGAZINE_COMMENTS_CREATE: "/magazines/{uuid}/comments",
  /** DELETE → 204. Path: comment_uuid (UUID v4). Soft-delete the caller's own comment. Auth: owner only. Admin moderation deletes live under /api/v2/engagement/admin/comments/{comment_uuid}. */
  MAGAZINE_COMMENT_DELETE: "/magazines/comments/{comment_uuid}",
  /** POST → V2Response<MagazineLikeResponse>. Authed like (toggle). Requires magazines:engage. */
  MAGAZINE_LIKE: "/magazines/{uuid}/like",
  /** DELETE → V2Response<MagazineLikeResponse>. Remove authed like. */
  MAGAZINE_UNLIKE: "/magazines/{uuid}/like",
  /** POST → V2Response<MagazineLikeResponse>. Anonymous like — append-only vanity bump, IP rate-limited. No anonymous unlike exists. */
  MAGAZINE_LIKE_PUBLIC: "/magazines/{uuid}/like/public",
  /** POST → V2Response<ViewMagazineV2Response>. Record a view (deduped per X-Device-Id + calendar day). Anonymous allowed. */
  MAGAZINE_VIEW: "/magazines/{uuid}/view",
  /** POST → V2Response<MagazineShareResponse>. Record a share (optional channel). Anonymous allowed, IP rate-limited. */
  MAGAZINE_SHARE: "/magazines/{uuid}/share",
  /** POST → V2Response<MagazineDownloadResponse>. Record a download — returns counters only (download_count_real/_vanity), NOT a pdfUrl; read the PDF URL from MagazineDetailV2.pdfUrl. Anonymous allowed, IP rate-limited. */
  MAGAZINE_DOWNLOAD: "/magazines/{uuid}/download",
  /** POST → V2Response. Toggle a useful/not_useful/neutral reaction. Auth required. */
  MAGAZINE_REACTIONS: "/magazines/{uuid}/reactions",
  /** POST (add) / DELETE (remove) → bookmark this magazine. Auth required. */
  MAGAZINE_BOOKMARK: "/magazines/{uuid}/bookmark",

  // ── Home CMS ─────────────────────────────────────────────

  /** GET → V2Response<ListHomeSectionsV2Response>. Public, no auth. Query: lang (unknown → es). Enabled sections, ordered, merged structure+text, image refs resolved to URLs. */
  HOME_SECTIONS_PUBLIC: "/home/sections",
  /** GET → V2Response<AdminListHomeSectionsV2Response>. All 9 sections incl. disabled, raw trees + per-lang translation status. Requires content:read. */
  HOME_SECTIONS_ADMIN: "/home/sections/admin",
  /** PATCH → Body: PatchHomeSectionV2Request. Returns V2Response<PatchHomeSectionV2Response>. Errors: 404 section_not_found, 409 not_editable_yet (Fase-2 key), 422 shape_mismatch. Requires content:update. Rate-limited 60/min per user. */
  HOME_SECTION_PATCH: "/home/sections/{key}",
  /** POST → Body: ReorderHomeSectionsV2Request (all 9 keys exactly once, else 422 invalid_order). Returns V2Response<ReorderHomeSectionsV2Response>. Requires content:update. Rate-limited 60/min per user. */
  HOME_SECTIONS_REORDER: "/home/sections/reorder",

  // ── Home featured carousel (SITIMM-582) ──────────────────
  // Curation behind the hero carousel: which content is promoted, in what
  // order, under what headline, for how long. The PUBLIC read stays
  // HOME_SECTIONS_PUBLIC — resolved slides arrive inside hero_carousel.

  /** GET → V2Response<HomeFeaturedItemsV2Response>. All curation rows incl. disabled, each with `live` (on the page right now) + `resolved`. Query: lang. Requires content:read. */
  HOME_FEATURED_LIST: "/home/featured",
  /** POST → Body: HomeFeaturedItemV2Request. Returns V2Response<{uuid}>, 201. Errors: 409 already_featured, 409 featured_limit_reached, 422 featured_invalid. Requires content:update. Rate-limited 60/min per user. */
  HOME_FEATURED_CREATE: "/home/featured",
  /** PUT → Body: HomeFeaturedItemV2Request (FULL replace, not a patch). Returns V2Response<{uuid}>. Errors: 404 featured_not_found, 409 featured_limit_reached, 409 already_featured. Requires content:update. */
  HOME_FEATURED_REPLACE: "/home/featured/{uuid}",
  /** DELETE → V2Response<{deleted}>. Idempotent — deleting an already-deleted row succeeds. Requires content:update. */
  HOME_FEATURED_DELETE: "/home/featured/{uuid}",
  /** POST → Body: HomeFeaturedReorderV2Request (every uuid exactly once, else 422 invalid_order). Returns V2Response<{order}>. Requires content:update. */
  HOME_FEATURED_REORDER: "/home/featured/reorder",

  // ── Headquarters ───────────────────────────────────────────

  /** GET → V2Response<AllHQMetricsResponse>. Real-time metrics for all HQs. Admin+ only. */
  HQ_METRICS: "/headquarters/metrics",
  /** GET → V2Response<HQMetricsSummary>. Real-time metrics for one HQ. Admin+ only. */
  HQ_METRICS_SINGLE: "/headquarters/{hq_uuid}/metrics",
  /** GET → V2Response<HQHistoryResponse>. Historical snapshots. Query: from, to. Manager only. */
  HQ_METRICS_HISTORY: "/headquarters/{hq_uuid}/metrics/history",

  // ── Advisor Assignments ────────────────────────────────────

  /** POST → Body: AssignRequest (advisor_uuid, company_uuids[]). Returns V2Response<AssignResponse>. Status 201. Admin+ only. */
  ADVISOR_ASSIGN: "/advisor-assignments/assign",
  /** POST → Body: UnassignRequest (advisor_uuid, company_uuid). Returns V2Response<UnassignResponse>. Admin+ only. */
  ADVISOR_UNASSIGN: "/advisor-assignments/unassign",
  /** GET → V2Response<ByAdvisorResponse>. Companies assigned to an advisor. Admin+ only. */
  ADVISOR_BY_ADVISOR: "/advisor-assignments/by-advisor/{advisor_uuid}",
  /** GET → V2Response<ByCompanyResponse>. Advisors assigned to a company. Admin+ only. */
  ADVISOR_BY_COMPANY: "/advisor-assignments/by-company/{company_uuid}",
  /** GET → V2Response<ByAdvisorResponse>. Current advisor's own companies. Advisor only. */
  ADVISOR_MY_COMPANIES: "/advisor-assignments/my-companies",

  // ── Programs ───────────────────────────────────────────────

  /** GET → V2Response<ListProgramsV2Response>. Query: page, page_size, q?, include_deleted?, include_subs?, lang?. Auth required. */
  PROGRAMS: "/programs",
  /** GET → V2Response<ListProgramsV2PublicResponse>. Query: page, page_size, q?, include_subs?, lang?. Public — no auth. Cached 60s with ETag. */
  PROGRAMS_PUBLIC: "/programs/public",
  /** POST → Body: CreateProgramV2Body. Returns V2Response<ProgramV2>. Status 201. Requires programs:create. */
  PROGRAMS_CREATE: "/programs",
  /** GET → V2Response<ProgramV2>. Auth required. */
  PROGRAM: "/programs/{program_uuid}",
  /** PATCH → Body: UpdateProgramV2Body (with optional if_match_updated_at). Returns V2Response<ProgramV2>. Requires programs:update. */
  PROGRAM_UPDATE: "/programs/{program_uuid}",
  /** DELETE → Body: DeleteProgramV2Body (optional). Returns V2Response<{message,uuid}>. Requires programs:delete. Cascades soft-delete to active SubPrograms. */
  PROGRAM_DELETE: "/programs/{program_uuid}",
  /** POST → Body: CreateSubProgramV2Body. Returns V2Response<SubProgramV2>. Status 201. Requires programs:create. */
  PROGRAM_SUBPROGRAMS_CREATE: "/programs/{program_uuid}/subprograms",
  /** PATCH → Body: ReorderSubProgramsBody. Returns V2Response<ReorderSubProgramsResponse>. Requires programs:update. */
  PROGRAM_SUBPROGRAMS_REORDER: "/programs/{program_uuid}/subprograms/reorder",
  /** POST → multipart/form-data {file}. Returns V2Response<ImageUploadResponse>. Requires programs:create. 5MB cap, MIME whitelist, 10/min/user. */
  PROGRAMS_UPLOAD_IMAGE: "/programs/upload-image",
  /** PATCH → Body: UpdateSubProgramV2Body. Returns V2Response<SubProgramV2>. Requires programs:update. */
  SUBPROGRAM_UPDATE: "/subprograms/{sub_uuid}",
  /** DELETE → Body: DeleteProgramV2Body (optional). Returns V2Response<{message,uuid}>. Requires programs:delete. Soft delete. */
  SUBPROGRAM_DELETE: "/subprograms/{sub_uuid}",
  /** GET → V2Response<ListProgramTranslationsV2Response>. Auth required. v0.47.0+. PUT → Body: ProgramTranslationBulkUpsertBody → V2Response<BulkTranslationsV2Response>. Atomic. v0.48.0+. */
  PROGRAM_TRANSLATIONS: "/programs/{program_uuid}/translations",
  /** PUT → Body: ProgramTranslationUpsertBody. Returns V2Response<ProgramTranslationV2>. Requires programs:update. v0.47.0+. */
  PROGRAM_TRANSLATION: "/programs/{program_uuid}/translations/{lang}",
  /** GET → V2Response<ListProgramTranslationsV2Response>. Auth required. v0.47.0+. PUT → Body: SubProgramTranslationBulkUpsertBody → V2Response<BulkTranslationsV2Response>. Atomic. v0.48.0+. */
  SUBPROGRAM_TRANSLATIONS: "/subprograms/{sub_uuid}/translations",
  /** PUT → Body: SubProgramTranslationUpsertBody. Returns V2Response<SubProgramTranslationV2>. Requires programs:update. v0.47.0+. */
  SUBPROGRAM_TRANSLATION: "/subprograms/{sub_uuid}/translations/{lang}",

  // ── FAQ ──────────────────────────────────────────────────
  // Public reader endpoints — no auth required. Optional Bearer token
  // enables per-user dedupe on view/feedback. All list endpoints accept
  // `locale` (defaults to `"es"`); fallback to Spanish is signalled with
  // the `X-FAQ-Locale-Fallback` response header. v0.54.0+.

  /** GET → V2Response<FAQCategoryTreeResponse>. Public. 2-level tree with article counts. */
  FAQ_CATEGORIES: "/faq/categories",
  /** GET → V2Response<ListFAQArticlesV2Response>. Query: categoryId?, parentCategoryId?, tag?, locale?, pinned?, page?, limit?. Public. */
  FAQ_ARTICLES: "/faq/articles",
  /** GET → V2Response<FAQArticleV2>. Query: locale?. Public. Path param is slug, not UUID. */
  FAQ_ARTICLE_BY_SLUG: "/faq/articles/{slug}",
  /** GET → V2Response<FAQRelatedArticlesResponse>. Query: locale?. Public. */
  FAQ_ARTICLE_RELATED: "/faq/articles/{article_uuid}/related",
  /** POST → 204. Anonymous needs X-Device-Id header. 24h Redis dedupe; duplicate raises 429 FAQ_VIEW_RATE_LIMITED. */
  FAQ_ARTICLE_VIEW: "/faq/articles/{article_uuid}/view",
  /** POST → Body: FAQArticleFeedbackRequest. Returns V2Response<FAQArticleFeedbackResponse>. Auth users get 409 FAQ_FEEDBACK_DUPLICATE on second submit. */
  FAQ_ARTICLE_FEEDBACK: "/faq/articles/{article_uuid}/feedback",
  /** GET → V2Response<FAQSearchV2Response>. Query: q (2-200), locale?, categoryId?, limit (1-50). Public. */
  FAQ_SEARCH: "/faq/search",
  /** GET → V2Response<FAQSearchSuggestV2Response>. Query: q (2-80), locale?, limit (1-8). Public typeahead. */
  FAQ_SEARCH_SUGGEST: "/faq/search/suggest",
  /** GET → V2Response<FAQGlossaryListV2Response>. Query: locale?, page?, limit (1-100). Public. */
  FAQ_GLOSSARY: "/faq/glossary",
  /** GET → V2Response<FAQGlossaryTermV2>. Query: locale?. Public. Path param is term slug, case-insensitive. */
  FAQ_GLOSSARY_TERM: "/faq/glossary/{term}",
  /** GET → application/pdf. Query: locale?. Public. Streamed file response, not wrapped in V2Response. */
  FAQ_ARTICLE_PDF: "/faq/articles/{slug}.pdf",

  // ── FAQ — me-scoped (auth required) ──────────────────────

  /** GET → V2Response<FAQBookmarkListResponse>. Auth required. */
  FAQ_ME_BOOKMARKS: "/me/faq-bookmarks",
  /** POST → V2Response<FAQBookmarkAddResponse>. Idempotent — re-bookmarking returns 201 with existing row. Auth required. */
  FAQ_ME_BOOKMARK_ADD: "/me/faq-bookmarks/{article_uuid}",
  /** DELETE → 204. Returns 404 FAQ_BOOKMARK_NOT_FOUND if not bookmarked. Auth required. */
  FAQ_ME_BOOKMARK_DELETE: "/me/faq-bookmarks/{article_uuid}",
  /** GET → V2Response<FAQSubscriptionListResponse>. Auth required. */
  FAQ_ME_SUBSCRIPTIONS: "/me/faq-subscriptions",
  /** POST → V2Response<FAQSubscriptionAddResponse>. Idempotent. Auth required. */
  FAQ_ME_SUBSCRIPTION_ADD: "/me/faq-subscriptions/{category_uuid}",
  /** DELETE → 204. Returns 404 FAQ_SUBSCRIPTION_NOT_FOUND if not subscribed. Auth required. */
  FAQ_ME_SUBSCRIPTION_DELETE: "/me/faq-subscriptions/{category_uuid}",

  // ── Media (DAM Fase 1 — SITIMM-204) ──────────────────────
  // All gated by the existing `galleries` permission (no new permission in
  // F1). Design doc: mini-back docs/superpowers/specs/
  // 2026-07-09-dam-fase1-media-design.md §7. Types: `media` module.

  /** POST → Body: CreateMediaV2Body. Returns MediaAdminV2 — 201 created, or 200 with the EXISTING asset when `checksum` matches an active Media (dedupe). Requires galleries permission. */
  MEDIA: "/media",
  /** GET → MediaAdminV2 (with tags + gallery memberships). PATCH → Body: UpdateMediaV2Body (metadata/tags only). DELETE → soft-delete the ASSET (removes it from every gallery). Requires galleries permission. */
  MEDIA_DETAIL: "/media/{uuid}",
  /** GET → MediaSearchV2Response. Query: MediaSearchQueryV2 (q?, tag?, type?, entityType?, entityUuid?, year?, orphan?, page?, pageSize?). `orphan=true` lists unassigned media (trash bin). Requires galleries permission. */
  MEDIA_SEARCH: "/media/search",
  /** GET → MediaTagListV2Response. Query: q? (autocomplete). POST → Body: CreateTagV2Body — idempotent by slug. Requires galleries permission. */
  MEDIA_TAGS: "/media/tags",
  /** GET → GalleryMediaListV2Response (ordered by sortOrder, with captionOverride). POST → Body: AttachGalleryMediaV2Body — attach an EXISTING Media (201). Requires galleries permission. */
  GALLERY_MEDIA: "/galleries/{gallery_uuid}/media",
  /** DELETE → UNLINK the media from the gallery (soft-deletes the gallery_media join row; the asset survives — orphan if it was its last gallery). Requires galleries permission. */
  GALLERY_MEDIA_DETAIL: "/galleries/{gallery_uuid}/media/{media_uuid}",
  /** PATCH → Body: ReorderGalleryMediaV2Body (mediaUuids in desired order). Requires galleries permission. */
  GALLERY_MEDIA_REORDER: "/galleries/{gallery_uuid}/media/reorder",

  // ── Collections (DAM Fase 2a — SITIMM-219) ──────────────────────
  // Top layer of the DAM hierarchy: Collection → Gallery → Media, joined
  // through `collection_galleries` (mirror of F1's `gallery_media`). Gated
  // by the existing `galleries` permission, same as the media surface.
  // Types: `collections` module. Backend: app/presentation/schemas/collection.py.

  /** GET → CollectionListV2Response. Query: page? (1-based, default 1), pageSize? (default 20, max 100). POST → Body: CreateCollectionV2Body (201). Requires galleries permission. */
  COLLECTIONS: "/collections",
  /** GET → CollectionV2 (with galleryCount). PATCH → Body: UpdateCollectionV2Body (metadata only; explicit-null-clears semantics). DELETE → soft-delete the COLLECTION (member galleries survive). Requires galleries permission. */
  COLLECTION_DETAIL: "/collections/{uuid}",
  /** GET → CollectionGalleryListV2Response (ordered by sortOrder; restricted member galleries filtered per-caller). POST → Body: AttachCollectionGalleryV2Body — attach an EXISTING gallery (201; duplicate active attach rejected). Requires galleries permission. */
  COLLECTION_GALLERIES: "/collections/{collection_uuid}/galleries",
  /** DELETE → DETACH the gallery from the collection (soft-deletes the collection_galleries join row; the gallery and its media survive). Requires galleries permission. */
  COLLECTION_GALLERY_DETAIL: "/collections/{collection_uuid}/galleries/{gallery_uuid}",
  /** PATCH → Body: ReorderCollectionGalleriesV2Body (galleryUuids in desired order — gallery UUIDs, not join-row UUIDs). Requires galleries permission. */
  COLLECTION_GALLERIES_REORDER: "/collections/{collection_uuid}/galleries/reorder",
} as const;

export type V1PublicEndpoint = (typeof V1_PUBLIC_ENDPOINTS)[keyof typeof V1_PUBLIC_ENDPOINTS];
export type V2Endpoint = (typeof V2_ENDPOINTS)[keyof typeof V2_ENDPOINTS];

// -- Auto-generated V2 endpoints (full coverage of mini-back) -------------
//
// The hand-maintained `V2_ENDPOINTS` constant above only covers a curated
// subset (~96/314 routes as of AUDIT_20260527.md). The full set is exported
// by `V2_ENDPOINTS_GENERATED`, regenerated via the mini-back
// `make dump-v2-routes` target + this repo's `scripts/import-v2-endpoints.sh`.
//
// `V2_ENDPOINTS` is preserved for backward-compat — existing frontend code
// keeps working — and `V2_ENDPOINTS_GENERATED` is the source of truth for
// new code that needs guaranteed coverage of every backend route.
export {
  V2_ENDPOINTS_GENERATED,
  type V2EndpointFeature,
} from "./v2_endpoints_generated";

/**
 * Replace `{param}` placeholders in endpoint templates.
 *
 * @example
 * ```ts
 * endpoint(V2_ENDPOINTS.CONSULTATION, { uuid: "abc-123" })
 * // → "/consultations/abc-123"
 *
 * endpoint(V2_ENDPOINTS.EVENT_TYPE, { id: "5" })
 * // → "/event-types/5"
 * ```
 */
export function endpoint(
  template: string,
  params: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}
