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
  /** POST → Body: SocialLoginRequest. NO auth. Response FLAT SocialLoginResponse. V2 (antes V1). */
  AUTH_SOCIAL_LOGIN: "/auth/social",
  /** POST → Body: GuestLoginRequest ({session_id}). NO auth. Response FLAT GuestLoginResponse. V2 (antes V1). */
  AUTH_SOCIAL_GUEST: "/auth/social/guest",
  /** GET → Response FLAT SocialAccountListResponse. Auth required. V2 (antes V1). DELETE en `${AUTH_SOCIAL_ACCOUNTS}/{provider}`. */
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
  /** POST → Body: ParticipantRegisterV2 (modality, campus_id, is_alternative, ...). Returns
      V2Response<EventParticipantV2> (201). Auth required (get_user_context). THE canonical authed
      self-registration route (event_participants_v2.py). NOTE: EVENT_PARTICIPANTS_REGISTER below is stale. */
  EVENT_REGISTER: "/events/{uuid}/register",
  /** POST → Body: RegisterPublicV2Request. NO auth. IP rate-limited. Returns
      V2Response<RegisterPublicV2Response> (202). Anonymous registration; sends double-opt-in email. */
  EVENT_REGISTER_PUBLIC: "/events/{uuid}/register-public",
  /** POST → Body: ConfirmRegistrationV2Request. NO auth. IP rate-limited. Returns
      V2Response<ConfirmRegistrationV2Response>. Consumes the one-time email token, creates the participant. */
  EVENT_REGISTRATION_CONFIRM: "/events/registration/confirm",

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
