/**
 * Consultation V2 types — state machine, messaging, bilateral close.
 *
 * Backend equivalents:
 * - ConsultationV2         -> app/presentation/schemas/consultation_v2.py :: ConsultationV2Response
 * - ConsultationMessageV2  -> consultation_v2.py :: MessageV2Response
 * - CloseProposalInfo      -> consultation_v2.py :: CloseProposalInfoV2
 * - ConsultationTypeV2     -> consultation_v2.py :: ConsultationTypeV2Response
 *
 * States: 1=Pending, 2=Resolving, 3=Closed, 4=CloseProposed, 5=Reopened
 *
 * Constants:
 * - MAX_MESSAGES          -> consultation_messages_v2.py :: MAX_MESSAGES
 * - MAX_REOPENS           -> consultation_helpers.py :: MAX_REOPENS
 * - CLOSE_PROPOSAL_TTL_HOURS -> consultation_helpers.py :: CLOSE_PROPOSAL_TTL_HOURS
 */

// -- Close Proposal --

export interface CloseProposalInfo {
  proposed_at: string;
  expires_at: string;
  solution: string;
  reopen_count: number;
  max_reopens: number;
}

// -- State Machine Constants --

export const CONSULTATION_STATES = {
  PENDING: 1,
  RESOLVING: 2,
  CLOSED: 3,
  CLOSE_PROPOSED: 4,
  REOPENED: 5,
} as const;

/**
 * Consultation limits — match mini-back constants.
 * Backend: consultation_helpers.py, consultation_messages_v2.py
 */
export const CONSULTATION_LIMITS = {
  /** Max messages per consultation thread */
  MAX_MESSAGES: 50,
  /** Max times a consultation can be reopened after close proposal */
  MAX_REOPENS: 3,
  /** Hours before a close proposal auto-expires */
  CLOSE_PROPOSAL_TTL_HOURS: 72,
} as const;

export type ConsultationStateId =
  (typeof CONSULTATION_STATES)[keyof typeof CONSULTATION_STATES];

// -- Consultation --

export interface ConsultationV2 {
  uuid: string;
  type_uuid: string;
  type_name: string;
  state_uuid: string;
  state_name: string;
  state_id: number;
  description: string;
  priority: "normal" | "high";
  affiliate_uuid: string;
  affiliate_name: string;
  affiliate_phone: string | null;
  affiliate_email: string | null;
  advisor_uuid: string | null;
  advisor_name: string | null;
  solution: string | null;
  score: number | null;
  feedback: string | null;
  taken_at: string | null;
  solved_at: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
  last_message_at: string | null;
  close_proposal: CloseProposalInfo | null;
  reopen_count: number;
}

// -- List --

export interface ListConsultationsV2Request {
  role: "advisor" | "affiliate";
  states?: string[];
  types?: string[];
  priority?: "high";
  date_from?: string;
  page?: number;
  per_page?: number;
}

export interface ListConsultationsV2Response {
  consultations: ConsultationV2[];
  total: number;
  page: number;
  per_page: number;
}

// -- Create --

export interface CreateConsultationV2Request {
  type_uuid: string;
  description: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  company_uuid?: string;
}

// -- Update (take / solve / rate) --

export interface UpdateConsultationV2Request {
  uuid: string;
  action: "take" | "solve" | "rate";
  solution?: string;
  score?: number;
  feedback?: string;
}

// -- Messages --

export type MessageType =
  | "text"
  | "system"
  | "proposal"
  | "confirmation"
  | "rejection";

export interface ConsultationMessageV2 {
  uuid: string;
  consultation_uuid: string;
  author_uuid: string;
  author_name: string;
  author_role: "employee" | "advisor" | "system";
  body: string;
  message_type: MessageType;
  is_internal: boolean;
  created_at: string;
}

export interface ListMessagesV2Request {
  consultation_uuid: string;
  limit?: number;
  offset?: number;
  include_internal?: boolean;
}

export interface ListMessagesV2Response {
  messages: ConsultationMessageV2[];
  total: number;
}

export interface SendMessageV2Request {
  consultation_uuid: string;
  body: string;
  is_internal?: boolean;
}

// -- Bilateral Close --

export interface ProposeCloseV2Request {
  consultation_uuid: string;
  solution: string;
}

export interface ConfirmCloseV2Request {
  consultation_uuid: string;
  score?: number;
  feedback?: string;
}

export interface RejectCloseV2Request {
  consultation_uuid: string;
  reason?: string;
}

// -- Rating --

export interface RateConsultationV2Request {
  consultation_uuid: string;
  score: number;
  feedback?: string;
}

// -- Consultation Types --

export interface ConsultationTypeV2 {
  uuid: string;
  id: number;
  content: string;
}

// -- Socket.IO Events --

export type SocketConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "auth_failed";

export interface SocketPresenceUser {
  user_uuid: string;
  last_seen: string;
}

export interface SocketPresencePayload {
  consultation_uuid: string;
  users: SocketPresenceUser[];
}

export interface SocketErrorPayload {
  code: string;
  message: string;
}
