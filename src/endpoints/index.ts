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
  /** GET — Returns array of pages/programs. Public, no auth. */
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

  // ── Bulletins ────────────────────────────────────────────

  /** GET → V2Response<ListBulletinsV2Response>. Query: company_uuid?. Auth required. */
  BULLETINS: "/bulletins",

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
