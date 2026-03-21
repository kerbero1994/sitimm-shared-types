/**
 * API endpoint path constants for the SITIMM ecosystem.
 *
 * V1 = legacy Node.js API (api.sitimm.org)
 * V2 = mini-back FastAPI (various base URLs per environment)
 *
 * Parameterized paths use `{param}` placeholders.
 * Each repo replaces them with actual values in their API layer.
 */

// -- V1 Public Endpoints (read-only, used by sitimmApp + Sitimm-web) --

export const V1_PUBLIC_ENDPOINTS = {
  BONUSES: "/bonuses/showall",
  MAGAZINES: "/magazines/showall",
  BLOG_POSTS: "/blogposts/showall",
  PROGRAMS: "/pages/showall",
  FAQ: "/frequentqas/showall",
  BULLETINS_GENERAL: "/bulletins-general/showall",
  BULLETINS_PRIVATE: "/bulletins/showall",
  COMPANIES: "/companies/showall",
  EVENTS: "/events/showall",
} as const;

// -- V2 Endpoints (mini-back, used by sitimmApp + new_dashboard) --

export const V2_ENDPOINTS = {
  // Profile
  USERS_ME: "/users/me",

  // Event Participants
  EVENT_PARTICIPANTS: "/event-participants",
  EVENT_PARTICIPANTS_MINE: "/event-participants/mine",
  EVENT_PARTICIPANT: "/event-participants/{uuid}",
  EVENT_PARTICIPANT_CONFIRM: "/event-participants/{uuid}/confirm",

  // Consultations
  CONSULTATIONS: "/consultations",
  CONSULTATIONS_CREATE: "/consultations/create",
  CONSULTATIONS_TYPES: "/consultations/types",
  CONSULTATION: "/consultations/{uuid}",
  CONSULTATION_MESSAGES: "/consultations/{uuid}/messages",
  CONSULTATION_PROPOSE_CLOSE: "/consultations/{uuid}/propose-close",
  CONSULTATION_CONFIRM_CLOSE: "/consultations/{uuid}/confirm-close",
  CONSULTATION_REJECT_CLOSE: "/consultations/{uuid}/reject-close",
  CONSULTATION_RATE: "/consultations/{uuid}/rate",

  // Bulletins
  BULLETINS: "/bulletins",
} as const;

export type V1PublicEndpoint = (typeof V1_PUBLIC_ENDPOINTS)[keyof typeof V1_PUBLIC_ENDPOINTS];
export type V2Endpoint = (typeof V2_ENDPOINTS)[keyof typeof V2_ENDPOINTS];
