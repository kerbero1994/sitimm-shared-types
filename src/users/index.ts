/**
 * User types, permissions, and profile types.
 *
 * Backend equivalents:
 * - UserType      -> app/domain/enums/user_types.py :: UserType(IntEnum)
 * - Action        -> app/domain/enums/permissions.py :: Action(StrEnum)
 * - Resource      -> app/domain/enums/permissions.py :: Resource(StrEnum)
 * - UserProfileV2 -> app/presentation/schemas/user.py (V2 response)
 */

/**
 * Production user type IDs matching mini-back IntEnum.
 * Backend: app/domain/enums/user_types.py :: UserType
 */
export const UserType = {
  INVITADO: 41726,
  EMPLOYEE: 63974,
  HR: 23648,
  ADVISOR: 48235,
  ADMIN: 81493,
  ADMIN_COMMUNICATION: 31847,
  ADMIN_EMPLOYEES: 29563,
  SUPER_ADMIN: 72468,
  FINANCIAL: 85672,
  MANAGER: 45298,
} as const;

export type UserTypeValue = (typeof UserType)[keyof typeof UserType];

/** Hierarchy levels for each role (-1 = guest, 6 = highest) */
export const USER_TYPE_HIERARCHY: Record<UserTypeValue, number> = {
  [UserType.INVITADO]: -1,
  [UserType.EMPLOYEE]: 0,
  [UserType.HR]: 1,
  [UserType.ADVISOR]: 2,
  [UserType.ADMIN]: 3,
  [UserType.ADMIN_COMMUNICATION]: 3,
  [UserType.ADMIN_EMPLOYEES]: 3,
  [UserType.SUPER_ADMIN]: 4,
  [UserType.FINANCIAL]: 5,
  [UserType.MANAGER]: 6,
};

/** Check if a user type meets or exceeds a required hierarchy level */
export function hasAtLeast(
  userType: UserTypeValue,
  required: UserTypeValue
): boolean {
  return (
    (USER_TYPE_HIERARCHY[userType] ?? -1) >=
    (USER_TYPE_HIERARCHY[required] ?? 999)
  );
}

/**
 * Permission actions.
 * Backend: app/domain/enums/permissions.py :: Action(StrEnum)
 */
export const Action = {
  READ: "read",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export type ActionValue = (typeof Action)[keyof typeof Action];

/**
 * Controllable resources — matches production entities.js.
 * Backend: app/domain/enums/permissions.py :: Resource(StrEnum)
 */
export const Resource = {
  CITIES: "cities",
  COUNTRIES: "countries",
  STATES: "states",
  LOCALPLACES: "localplaces",
  USERS: "users",
  USER_PROFILES: "user_profiles",
  USER_PERMISSIONS: "user_permissions",
  COMPANIES: "companies",
  HEADQUARTERS: "headquarters",
  INDUSTRIAL_PARKS: "industrial_parks",
  COMPANY_ADMINS: "company_admins",
  EMPLOYEES: "employees",
  CENSUS: "census",
  UPLOAD_CENSUS: "upload_census",
  EMPLOYEE_MANAGEMENT: "employee_management",
  CONSULTATIONS: "consultations",
  CONSULTATION_TYPES: "consultation_types",
  CONSULTATION_STATES: "consultation_states",
  BLOGPOSTS: "blogposts",
  MAGAZINES: "magazines",
  PAGES: "pages",
  PROGRAMS: "programs",
  EVENTS: "events",
  BONUSES: "bonuses",
  FREQUENT_QAS: "frequent_qas",
  BULLETINS: "bulletins",
  BULLETINS_GENERAL: "bulletins_general",
  CANDIDATE_WORKSHEETS: "candidate_worksheets",
  BOLETUS: "boletus",
  CANDIDATE_POSITIONS: "candidate_positions",
  VOTES: "votes",
  ELECTION_SESSIONS: "election_sessions",
  CANDIDATES: "candidates",
  ELECTIONS: "elections",
  ELECTION_DEVICES: "election_devices",
  RHS: "rhs",
  KEYS: "keys",
  GOOD_DELIVERY_TYPES: "good_delivery_types",
  GOOD_DELIVERY_PARTICIPANT_STATES: "good_delivery_participant_states",
  GOOD_DELIVERY_EVENTS: "good_delivery_events",
  GOOD_DELIVERY_PARTICIPANTS: "good_delivery_participants",
  SPORT_EVENTS: "sport_events",
  DISCIPLINES: "disciplines",
  DISCIPLINE_TYPES: "discipline_types",
  SPORT_DOCUMENTS: "sport_documents",
  SPORT_DOCUMENT_TYPES: "sport_document_types",
  SPORT_GALLERIES: "sport_galleries",
  SPORT_GALLERY_ELEMENTS: "sport_gallery_elements",
  SONS: "sons",
  SON_DOCUMENTS: "son_documents",
  PERSONAL_DOCUMENT_TYPES: "personal_document_types",
  PERSONAL_DOCUMENTS: "personal_documents",
  INDETS: "indets",
  CAMPUSES: "campuses",
  BUS_STOPS: "bus_stops",
  EVENT_PARTICIPANTS: "event_participants",
  EVENT_TYPES: "event_types",
  WEEKLY_FEES: "weekly_fees",
  COMPANY_FORMS: "company_forms",
  COMPANY_FORM_QUESTIONS: "company_form_questions",
  COMPANY_FORM_CAMPAIGNS: "company_form_campaigns",
  COMPANY_FORM_ENTRIES: "company_form_entries",
  COMPANY_FORM_QUESTION_TYPES: "company_form_question_types",
  SEND_NOTIFICATIONS: "send_notifications",
  NOTIFICATIONS: "notifications",
  LOGS: "logs",
  STATISTICS: "statistics",
  FILES: "files",
  IMGS: "imgs",
  COMUNICATIONS: "comunications",
  ASSEMBLY_MEMBERS: "assembly_members",
  OTHER_ASSEMBLY_MEMBERS: "other_assembly_members",
  SECTIONS: "sections",
  MAPS: "maps",
  PERMISSIONS: "permissions",
  API_KEYS: "api_keys",
} as const;

export type ResourceValue = (typeof Resource)[keyof typeof Resource];

/**
 * V2 user profile response.
 * Backend: app/presentation/schemas/user.py (V2)
 * All fields use snake_case matching the backend response.
 */
export interface UserProfileV2 {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_phone: string | null;
  personal_phone: string | null;
  address: string | null;
  rfc: string | null;
  company_uuid: string | null;
  company_name: string | null;
  avatar_url: string | null;
  user_type: number | null;
  date_of_birth: string | null;
  sex: string | null;
  curp: string | null;
  nss: string | null;
  other_email: string | null;
  charge: string | null;
  civil_state_id: number | null;
  scholarship_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileV2Request {
  email?: string;
  mobile_phone?: string;
  personal_phone?: string;
  address?: string;
  other_email?: string;
  avatar_url?: string;
  new_password?: string;
  current_password?: string;
}

export interface ChangePasswordV2Request {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileV2Response {
  user: UserProfileV2;
  message: string;
}

/**
 * Extended profile with resolved catalog names.
 * Backend: app/presentation/schemas/user.py :: UserMeResponse (extended)
 */
export interface UserProfileV2Extended extends UserProfileV2 {
  scholarship_name?: string | null;
  civil_state_name?: string | null;
}

/**
 * Employee data from GET /users/me/employment.
 * Backend: app/presentation/schemas/user.py :: EmployeeMeResponse
 */
export interface EmployeeDataV2 {
  payroll: string | null;
  job: string | null;
  day_salary: string | null;
  entry: string | null;
  address: string | null;
  city_text: string | null;
  street_address: string | null;
  state_name: string | null;
  paternal_last: string | null;
  maternal_last: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Company data from GET /users/me/company.
 * Backend: app/presentation/schemas/user.py :: CompanyMeResponse
 */
export interface CompanyDataV2 {
  uuid: string | null;
  name: string | null;
  address: string | null;
  country: string | null;
  phone: string | null;
  industrial_park: string | null;
  has_committee: boolean | null;
  colective_contract: string | null;
  internal_regulation: string | null;
  other_documents: string | null;
  latitude: number | null;
  longitude: number | null;
}
