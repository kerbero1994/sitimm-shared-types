/**
 * User types, permissions, field permissions, and profile types.
 *
 * Backend equivalents:
 * - UserType          -> app/domain/enums/user_types.py :: UserType(IntEnum)
 * - Action            -> app/domain/enums/permissions.py :: Action(StrEnum)
 * - Resource          -> app/domain/enums/permissions.py :: Resource(StrEnum)
 * - FieldPermissions  -> app/application/services/field_permissions.py
 * - UserBasicV2       -> app/presentation/schemas/user_v2.py :: UserBasicV2
 * - UserProfileV2     -> app/presentation/schemas/user_v2.py :: UserProfileV2
 * - EmploymentV2      -> app/presentation/schemas/user_v2.py :: EmploymentV2
 * - UserMeV2Response  -> app/presentation/schemas/user_v2.py :: UserMeV2Response
 */

// ============================================================
// User Types & Hierarchy
// ============================================================

/**
 * Production user type IDs matching mini-back IntEnum.
 * Backend: app/domain/enums/user_types.py :: UserType
 *
 * V2 changes: SUPER_ADMIN eliminated (maps to MANAGER for backward compat).
 * ADMIN now sits above sub-admins (ADMIN_COMMUNICATION, ADMIN_EMPLOYEES, FINANCIAL).
 */
export const UserType = {
  INVITADO: 41726,
  EMPLOYEE: 63974,
  HR: 23648,
  ADVISOR: 48235,
  ADMIN: 81493,
  ADMIN_COMMUNICATION: 31847,
  ADMIN_EMPLOYEES: 29563,
  FINANCIAL: 85672,
  MANAGER: 45298,
} as const;

export type UserTypeValue = (typeof UserType)[keyof typeof UserType];

/**
 * @deprecated SUPER_ADMIN was removed in V2. DB rows with this ID map to MANAGER.
 * Use only for backward-compat migration logic.
 */
export const DEPRECATED_SUPER_ADMIN_ID = 72468 as const;

/**
 * V2 hierarchy levels (0 = guest, 6 = supreme).
 * Backend: app/domain/enums/user_types.py :: _HIERARCHY
 *
 * Key V2 changes vs V1:
 * - ADMIN moved from 3 -> 5 (now above sub-admins)
 * - FINANCIAL moved from 5 -> 4 (now peer of other sub-admins)
 * - SUPER_ADMIN removed (was level 4)
 * - All levels shifted: INVITADO is now 0 (was -1)
 */
export const USER_TYPE_HIERARCHY: Record<UserTypeValue, number> = {
  [UserType.INVITADO]: 0,
  [UserType.EMPLOYEE]: 1,
  [UserType.HR]: 2,
  [UserType.ADVISOR]: 3,
  [UserType.ADMIN_COMMUNICATION]: 4,
  [UserType.ADMIN_EMPLOYEES]: 4,
  [UserType.FINANCIAL]: 4,
  [UserType.ADMIN]: 5,
  [UserType.MANAGER]: 6,
};

/**
 * Ordered list of user types from lowest to highest hierarchy.
 * Backend: app/domain/enums/user_types.py :: UserType.hierarchy_order()
 */
export const USER_TYPE_ORDER: readonly UserTypeValue[] = [
  UserType.INVITADO,
  UserType.EMPLOYEE,
  UserType.HR,
  UserType.ADVISOR,
  UserType.ADMIN_COMMUNICATION,
  UserType.ADMIN_EMPLOYEES,
  UserType.FINANCIAL,
  UserType.ADMIN,
  UserType.MANAGER,
];

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
 * Resolve a raw DB integer to a UserTypeValue, handling SUPER_ADMIN backward compat.
 * Returns undefined for unknown values.
 */
export function resolveUserType(value: number | null | undefined): UserTypeValue | undefined {
  if (value == null) return undefined;
  if (value === DEPRECATED_SUPER_ADMIN_ID) return UserType.MANAGER;
  const valid = new Set<number>(Object.values(UserType));
  return valid.has(value) ? (value as UserTypeValue) : undefined;
}

// ============================================================
// Permissions (Action + Resource)
// ============================================================

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
 * Controllable resources — matches production entities.
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
  COMPANY_CONTACTS: "company_contacts",
  COMPANY_TECHNICAL_DETAILS: "company_technical_details",
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

// ============================================================
// Field Permissions System
// ============================================================

/** Permission state for a profile field */
export type FieldPermissionState = "editable" | "readonly" | "hidden";

/**
 * All profile fields tracked by the field permissions system.
 * camelCase — matches BE aliases and API JSON response.
 * Backend: app/application/services/field_permissions.py :: _ALL_FIELDS
 */
export const PROFILE_FIELDS = [
  "name",
  "lastNames",
  "paternalLast",
  "maternalLast",
  "dateOfBirth",
  "sex",
  "rfc",
  "curp",
  "nss",
  "personalPhone",
  "mobilePhone",
  "email",
  "otherMail",
  "profilePic",
  "address",
  "city",
  "charge",
  "title",
  "scholarshipId",
  "civilStateId",
  "affiliationDate",
] as const;

export type ProfileFieldName = (typeof PROFILE_FIELDS)[number];

/**
 * Field permission map returned by GET /api/v2/users/me → fieldPermissions.
 * Maps each profile field to its permission state for the current user type.
 * Backend: app/application/services/field_permissions.py :: get_field_permissions()
 */
export type FieldPermissions = Record<ProfileFieldName, FieldPermissionState>;

/**
 * Semantic field groups — mirrors BE categories for building form sections.
 * Backend: app/application/services/field_permissions.py :: _CONTACT, _PERSONAL, etc.
 */
export const FIELD_GROUPS = {
  /** Contact fields — editable by everyone */
  CONTACT: ["personalPhone", "mobilePhone", "email", "otherMail", "profilePic"] as const,
  /** Personal identity fields */
  PERSONAL: ["name", "lastNames", "paternalLast", "maternalLast", "dateOfBirth", "sex"] as const,
  /** Census/sindical fields (RFC, CURP, NSS) */
  SINDICAL: ["rfc", "curp", "nss"] as const,
  /** Address fields */
  ADDRESS: ["address", "city"] as const,
  /** Demographic stats fields */
  STATS: ["scholarshipId", "civilStateId"] as const,
  /** Labor fields */
  LABOR: ["charge", "title"] as const,
  /** Sindical metadata */
  SINDICAL_META: ["affiliationDate"] as const,
} as const;

// ============================================================
// V2 User Schemas (match mini-back Pydantic schemas, camelCase aliases)
// ============================================================

/**
 * Basic user info from User table.
 * Backend: app/presentation/schemas/user_v2.py :: UserBasicV2
 */
export interface UserBasicV2 {
  id: number;
  uuid: string;
  email: string | null;
  userType: number;
}

/**
 * User profile fields (19 fields + name split).
 * Backend: app/presentation/schemas/user_v2.py :: UserProfileV2
 *
 * Deprecated fields NOT exposed: isFatherAlive, titleType.
 */
export interface UserProfileV2 {
  name: string | null;
  lastNames: string | null;
  paternalLast: string | null;
  maternalLast: string | null;
  dateOfBirth: string | null;
  sex: string | null;
  rfc: string | null;
  curp: string | null;
  nss: string | null;
  personalPhone: string | null;
  mobilePhone: string | null;
  otherMail: string | null;
  profilePic: string | null;
  charge: string | null;
  title: string | null;
  address: string | null;
  city: string | null;
  affiliationDate: string | null;
  scholarshipId: number | null;
  civilStateId: number | null;
}

/**
 * Employment data from Employee table.
 * Backend: app/presentation/schemas/user_v2.py :: EmploymentV2
 */
export interface EmploymentV2 {
  companyName: string | null;
  job: string | null;
  daySalary: number | null;
  entryDate: string | null;
}

/**
 * Full response from GET /api/v2/users/me.
 * Backend: app/presentation/schemas/user_v2.py :: UserMeV2Response
 *
 * The fieldPermissions map tells the FE which fields to render as
 * editable inputs, readonly text, or hidden — per user type.
 */
export interface UserMeV2Response {
  user: UserBasicV2;
  profile: UserProfileV2;
  employment: EmploymentV2 | null;
  fieldPermissions: FieldPermissions;
}

/**
 * PATCH /api/v2/users/me — partial profile update.
 * Backend: app/presentation/schemas/user_v2.py :: UserProfileUpdateV2
 *
 * Only fields marked "editable" in fieldPermissions can be submitted.
 * Server returns 403 if a non-editable field is included.
 */
export interface UserProfileUpdateV2 {
  name?: string;
  lastNames?: string;
  paternalLast?: string;
  maternalLast?: string;
  dateOfBirth?: string;
  sex?: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  personalPhone?: string;
  mobilePhone?: string;
  otherMail?: string;
  profilePic?: string;
  address?: string;
  city?: string;
  scholarshipId?: number;
  civilStateId?: number;
}

/** Password change request — separate from profile update */
export interface ChangePasswordV2Request {
  currentPassword: string;
  newPassword: string;
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
  industrialPark: string | null;
  hasCommittee: boolean | null;
  colectiveContract: string | null;
  internalRegulation: string | null;
  otherDocuments: string | null;
  latitude: number | null;
  longitude: number | null;
}
