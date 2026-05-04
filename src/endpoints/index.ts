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
  /** GET → V2Response<EmploymentV2>. Returns employment data. Auth required. */
  USERS_ME_EMPLOYMENT: "/users/me/employment",
  /** GET → V2Response<CompanyDataV2>. Returns company info for current user. Auth required. */
  USERS_ME_COMPANY: "/users/me/company",
  /** POST → Body: AvatarUploadRequest (fileUuid). Returns V2Response<AvatarV2Response>. Auth required. */
  USERS_ME_AVATAR: "/users/me/avatar",
  /** DELETE → V2Response<AvatarV2Response>. Removes profile picture. Auth required. */
  USERS_ME_AVATAR_DELETE: "/users/me/avatar",

  // ── Social Auth ───────────────────────────────────────────

  /** POST → Body: SocialLoginRequest. Returns V2Response<SocialLoginResponse>. No auth. */
  AUTH_SOCIAL_LOGIN: "/auth/social/login",
  /** POST → Body: VerifyIdentityRequest. Returns V2Response<VerifyIdentityResponse>. No auth. */
  AUTH_SOCIAL_VERIFY: "/auth/social/verify",
  /** POST → Body: GuestLoginRequest. Returns V2Response<GuestLoginResponse>. No auth. */
  AUTH_SOCIAL_GUEST: "/auth/social/guest",
  /** GET → V2Response<SocialAccountListResponse>. Auth required. */
  AUTH_SOCIAL_ACCOUNTS: "/auth/social/accounts",

  // ── Events ───────────────────────────────────────────────

  /** GET → V2Response<EventListV2Response>. Query: page, page_size, search, sort, category, year. Auth required. */
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
  /** GET → V2Response<MyEventsV2Response>. Returns user's registered events. Auth required. */
  EVENTS_MY: "/events/my-events",

  // ── Event Participants ───────────────────────────────────

  /** GET → V2Response<ParticipantListV2Response>. Query: event_uuid (required), page, per_page. Auth required. */
  EVENT_PARTICIPANTS: "/event-participants",
  /** POST → Body: CreateParticipantV2Request. Query: event_uuid. Returns V2Response<EventParticipantV2>. Auth required. */
  EVENT_PARTICIPANTS_REGISTER: "/event-participants",
  /** GET → V2Response<ParticipantListV2Response>. Current user's registrations. Auth required. */
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

  // ── Consultations ────────────────────────────────────────

  /** POST → Body: ListConsultationsV2Request. Returns V2Response<ListConsultationsV2Response>. Auth required.
   *  Note: uses POST (not GET) because filters are sent in the body. */
  CONSULTATIONS: "/consultations",
  /** POST → Body: CreateConsultationV2Request. Returns V2Response<ConsultationV2>. Status 201. Auth required. */
  CONSULTATIONS_CREATE: "/consultations/create",
  /** GET → ConsultationTypeV2[]. List consultation type catalog. Auth required. */
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
  /** POST → V2Response<MagazineDetailV2Response>. Sets is_published=true. Requires magazines:update. */
  MAGAZINE_PUBLISH: "/magazines/{uuid}/publish",
  /** POST → V2Response<MagazineLikeResponse>. Toggle like. Auth required. */
  MAGAZINE_LIKE: "/magazines/{uuid}/like",
  /** DELETE → V2Response<MagazineLikeResponse>. Remove like. Auth required. */
  MAGAZINE_UNLIKE: "/magazines/{uuid}/like",
  /** POST → V2Response<{message}>. Record a view (debounced 1h server-side). Auth required. */
  MAGAZINE_VIEW: "/magazines/{uuid}/view",

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
} as const;

export type V1PublicEndpoint = (typeof V1_PUBLIC_ENDPOINTS)[keyof typeof V1_PUBLIC_ENDPOINTS];
export type V2Endpoint = (typeof V2_ENDPOINTS)[keyof typeof V2_ENDPOINTS];

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
