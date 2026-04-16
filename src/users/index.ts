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
 *
 * Hierarchy (low → high):
 * INVITADO(0) → EMPLOYEE(1) → HR(2) → ADVISOR(3) → sub-admins(4) → ADMIN(5) → MANAGER(6)
 */
export const UserType = {
  /** 41726 — Guest/pre-employee. Created via Social Login before activation. Hierarchy: 0. */
  INVITADO: 41726,
  /** 63974 — Standard employee. Can create consultations, participate in events. Hierarchy: 1. */
  EMPLOYEE: 63974,
  /** 23648 — HR specialist. Manages employees per company. Hierarchy: 2. */
  HR: 23648,
  /** 48235 — Advisor. Handles consultations, can chat with affiliates. Hierarchy: 3. */
  ADVISOR: 48235,
  /** 81493 — Full administrator. Manages all entities. Hierarchy: 5. */
  ADMIN: 81493,
  /** 31847 — Sub-admin for communications (CMS, bulletins). Hierarchy: 4. */
  ADMIN_COMMUNICATION: 31847,
  /** 29563 — Sub-admin for employee management. Hierarchy: 4. */
  ADMIN_EMPLOYEES: 29563,
  /** 85672 — Sub-admin for finance (weekly fees, bonuses). Hierarchy: 4. */
  FINANCIAL: 85672,
  /** 45298 — Supreme authority. Absorbs deprecated SUPER_ADMIN. Hierarchy: 6. */
  MANAGER: 45298,
} as const;

export type UserTypeValue = (typeof UserType)[keyof typeof UserType];

/**
 * @deprecated SUPER_ADMIN was removed in V2. DB rows with this ID map to MANAGER.
 * Use only for backward-compat migration logic (e.g., menuRoles, tokens).
 */
export const DEPRECATED_SUPER_ADMIN_ID = 72468 as const;

/**
 * V2 hierarchy levels (0 = guest, 6 = supreme).
 * Backend: app/domain/enums/user_types.py :: _HIERARCHY
 *
 * Sub-admins (ADMIN_COMMUNICATION, ADMIN_EMPLOYEES, FINANCIAL) share level 4.
 * Use `hasAtLeast()` to check hierarchy instead of comparing directly.
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

/**
 * Check if a user type meets or exceeds a required hierarchy level.
 * Backend: app/domain/enums/user_types.py :: UserType.has_at_least()
 *
 * @example
 * ```ts
 * hasAtLeast(UserType.ADMIN, UserType.ADVISOR) // true (5 >= 3)
 * hasAtLeast(UserType.EMPLOYEE, UserType.HR)   // false (1 < 2)
 * ```
 */
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
 *
 * @example
 * ```ts
 * resolveUserType(72468) // → 45298 (UserType.MANAGER)
 * resolveUserType(81493) // → 81493 (UserType.ADMIN)
 * resolveUserType(99999) // → undefined
 * ```
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
 *
 * Used with `require_permission(resource, action)` dependency in FastAPI.
 * 92 resources covering geographic, user, company, content, voting, and admin domains.
 */
export const Resource = {
  // -- Geographic --
  CITIES: "cities",
  COUNTRIES: "countries",
  STATES: "states",
  LOCALPLACES: "localplaces",
  // -- Users --
  USERS: "users",
  USER_PROFILES: "user_profiles",
  USER_PERMISSIONS: "user_permissions",
  // -- Companies --
  COMPANIES: "companies",
  HEADQUARTERS: "headquarters",
  INDUSTRIAL_PARKS: "industrial_parks",
  COMPANY_ADMINS: "company_admins",
  EMPLOYEES: "employees",
  CENSUS: "census",
  UPLOAD_CENSUS: "upload_census",
  EMPLOYEE_MANAGEMENT: "employee_management",
  // -- Consultations --
  CONSULTATIONS: "consultations",
  CONSULTATION_TYPES: "consultation_types",
  CONSULTATION_STATES: "consultation_states",
  // -- Content --
  BLOGPOSTS: "blogposts",
  MAGAZINES: "magazines",
  PAGES: "pages",
  PROGRAMS: "programs",
  EVENTS: "events",
  BONUSES: "bonuses",
  FREQUENT_QAS: "frequent_qas",
  BULLETINS: "bulletins",
  BULLETINS_GENERAL: "bulletins_general",
  // -- Voting --
  CANDIDATE_WORKSHEETS: "candidate_worksheets",
  BOLETUS: "boletus",
  CANDIDATE_POSITIONS: "candidate_positions",
  VOTES: "votes",
  ELECTION_SESSIONS: "election_sessions",
  CANDIDATES: "candidates",
  ELECTIONS: "elections",
  ELECTION_DEVICES: "election_devices",
  // -- HR --
  RHS: "rhs",
  KEYS: "keys",
  // -- Good Delivery --
  GOOD_DELIVERY_TYPES: "good_delivery_types",
  GOOD_DELIVERY_PARTICIPANT_STATES: "good_delivery_participant_states",
  GOOD_DELIVERY_EVENTS: "good_delivery_events",
  GOOD_DELIVERY_PARTICIPANTS: "good_delivery_participants",
  // -- Sports --
  SPORT_EVENTS: "sport_events",
  DISCIPLINES: "disciplines",
  DISCIPLINE_TYPES: "discipline_types",
  SPORT_DOCUMENTS: "sport_documents",
  SPORT_DOCUMENT_TYPES: "sport_document_types",
  SPORT_GALLERIES: "sport_galleries",
  SPORT_GALLERY_ELEMENTS: "sport_gallery_elements",
  // -- Family --
  SONS: "sons",
  SON_DOCUMENTS: "son_documents",
  // -- Documents --
  PERSONAL_DOCUMENT_TYPES: "personal_document_types",
  PERSONAL_DOCUMENTS: "personal_documents",
  INDETS: "indets",
  // -- Events --
  CAMPUSES: "campuses",
  BUS_STOPS: "bus_stops",
  EVENT_PARTICIPANTS: "event_participants",
  EVENT_TYPES: "event_types",
  // -- Finance --
  WEEKLY_FEES: "weekly_fees",
  // -- Forms --
  COMPANY_FORMS: "company_forms",
  COMPANY_FORM_QUESTIONS: "company_form_questions",
  COMPANY_FORM_CAMPAIGNS: "company_form_campaigns",
  COMPANY_FORM_ENTRIES: "company_form_entries",
  COMPANY_FORM_QUESTION_TYPES: "company_form_question_types",
  // -- Company Details --
  COMPANY_CONTACTS: "company_contacts",
  COMPANY_TECHNICAL_DETAILS: "company_technical_details",
  // -- Admin --
  SEND_NOTIFICATIONS: "send_notifications",
  NOTIFICATIONS: "notifications",
  LOGS: "logs",
  STATISTICS: "statistics",
  FILES: "files",
  IMGS: "imgs",
  COMUNICATIONS: "comunications",
  // -- Assembly --
  ASSEMBLY_MEMBERS: "assembly_members",
  OTHER_ASSEMBLY_MEMBERS: "other_assembly_members",
  SECTIONS: "sections",
  MAPS: "maps",
  // -- System --
  PERMISSIONS: "permissions",
  API_KEYS: "api_keys",
} as const;

export type ResourceValue = (typeof Resource)[keyof typeof Resource];

// ============================================================
// Field Permissions System
// ============================================================

/**
 * Permission state for a profile field.
 * - `"editable"` — User can read and write this field.
 * - `"readonly"` — User can read but not write (server returns 403 on write attempt).
 * - `"hidden"` — User cannot access this field at all.
 */
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
 *
 * @example
 * ```json
 * { "id": 123, "uuid": "abc-def-...", "email": "user@company.com", "userType": 63974 }
 * ```
 */
export interface UserBasicV2 {
  /** Numeric user ID (primary key). */
  id: number;
  /** User UUID — primary identifier for API operations. */
  uuid: string;
  /** User email. Null for users created without email (e.g., census import). */
  email: string | null;
  /** Numeric user type code. Compare with UserType constants. */
  userType: number;
}

/**
 * User profile fields (20 fields).
 * Backend: app/presentation/schemas/user_v2.py :: UserProfileV2
 *
 * All fields are nullable — profiles can be partially filled.
 * Deprecated fields NOT exposed: `isFatherAlive`, `titleType`.
 *
 * @example
 * ```json
 * {
 *   "name": "Juan",
 *   "lastNames": "Pérez García",
 *   "dateOfBirth": "1990-05-15T00:00:00Z",
 *   "sex": "M",
 *   "rfc": "PEGJ900515ABC",
 *   "mobilePhone": "3312345678"
 * }
 * ```
 */
export interface UserProfileV2 {
  /** First name(s). */
  name: string | null;
  /** Full surname(s) (may contain both paternal + maternal). */
  lastNames: string | null;
  /** Paternal surname (split from lastNames). */
  paternalLast: string | null;
  /** Maternal surname (split from lastNames). */
  maternalLast: string | null;
  /** ISO-8601 date of birth. Format: "YYYY-MM-DDT00:00:00Z". */
  dateOfBirth: string | null;
  /** Biological sex. Allowed values: "M" (male), "F" (female). */
  sex: string | null;
  /** RFC (Registro Federal de Contribuyentes). 12–13 chars. Validate with RFC_PATTERN from validation module. */
  rfc: string | null;
  /** CURP (Clave Unica de Registro de Poblacion). 18 alphanumeric chars. Validate with CURP_PATTERN. */
  curp: string | null;
  /** NSS (Numero de Seguridad Social). */
  nss: string | null;
  /** Home/landline phone number. */
  personalPhone: string | null;
  /** Mobile phone number. 10 digits for MX numbers. Validate with PHONE_MX_PATTERN. */
  mobilePhone: string | null;
  /** Alternate email address. */
  otherMail: string | null;
  /** Profile picture URL (presigned S3 URL or relative path). */
  profilePic: string | null;
  /** Medium-size profile picture URL. */
  profilePicMedium: string | null;
  /** Thumbnail profile picture URL. */
  profilePicThumb: string | null;
  /** Job title/charge within the company. */
  charge: string | null;
  /** Honorific title (e.g., "Lic.", "Ing."). */
  title: string | null;
  /** Street address. */
  address: string | null;
  /** City name. */
  city: string | null;
  /** ISO-8601 affiliation date with the union. */
  affiliationDate: string | null;
  /** Foreign key to Scholarship catalog (education level). */
  scholarshipId: number | null;
  /** Foreign key to CivilState catalog (marital status). */
  civilStateId: number | null;
}

/**
 * Employment data from Employee table.
 * Backend: app/presentation/schemas/user_v2.py :: EmploymentV2
 */
export interface EmploymentV2 {
  /** Name of the company the employee belongs to. */
  companyName: string | null;
  /** Job title within the company. */
  job: string | null;
  /** Daily salary in MXN. */
  daySalary: number | null;
  /** ISO-8601 date when the employee was hired. */
  entryDate: string | null;
}

/**
 * Full response from GET /api/v2/users/me.
 * Backend: app/presentation/schemas/user_v2.py :: UserMeV2Response
 *
 * The fieldPermissions map tells the FE which fields to render as
 * editable inputs, readonly text, or hidden — per user type.
 *
 * @example
 * ```json
 * {
 *   "user": { "id": 1, "uuid": "...", "email": "...", "userType": 63974 },
 *   "profile": { "name": "Juan", "lastNames": "Pérez", ... },
 *   "employment": { "companyName": "ACME", "job": "Operador", ... },
 *   "fieldPermissions": { "name": "editable", "rfc": "readonly", "affiliationDate": "hidden" }
 * }
 * ```
 */
export interface UserMeV2Response {
  /** Basic user info (id, uuid, email, userType). */
  user: UserBasicV2;
  /** Full profile fields (all nullable). */
  profile: UserProfileV2;
  /** Employment data. Null if user has no Employee record. */
  employment: EmploymentV2 | null;
  /** Per-field permission map for rendering forms. */
  fieldPermissions: FieldPermissions;
}

/**
 * Request body for PATCH /api/v2/users/me — partial profile update.
 * Backend: app/presentation/schemas/user_v2.py :: UserProfileUpdateV2
 *
 * Only include fields marked "editable" in fieldPermissions.
 * Server returns 403 if a non-editable field is included.
 * All fields are optional (partial update).
 */
export interface UserProfileUpdateV2 {
  /** First name(s). */
  name?: string;
  /** Full surname(s). */
  lastNames?: string;
  /** Paternal surname. */
  paternalLast?: string;
  /** Maternal surname. */
  maternalLast?: string;
  /** ISO-8601 date of birth. */
  dateOfBirth?: string;
  /** "M" or "F". */
  sex?: string;
  /** RFC. Validated with RFC_PATTERN on the backend. 12–13 chars. */
  rfc?: string;
  /** CURP. 18 alphanumeric chars. */
  curp?: string;
  /** NSS. */
  nss?: string;
  /** Home phone. */
  personalPhone?: string;
  /** Mobile phone. 10 digits for MX. */
  mobilePhone?: string;
  /** Alternate email. */
  otherMail?: string;
  /** Street address. */
  address?: string;
  /** City name. */
  city?: string;
  /** Scholarship catalog ID. */
  scholarshipId?: number;
  /** Civil state catalog ID. */
  civilStateId?: number;
}

/** Password change request — separate from profile update. */
export interface ChangePasswordV2Request {
  /** Current password for verification. */
  currentPassword: string;
  /** New password. Min 6, max 100 chars (FIELD_LIMITS.PASSWORD_MIN/MAX). */
  newPassword: string;
}

/**
 * Request body for POST /api/v2/users/me/avatar.
 * Upload profile picture via staged file UUID.
 * Backend: app/presentation/schemas/user_v2.py :: AvatarUploadRequest
 */
export interface AvatarUploadRequest {
  /** UUID of the staged file to use as avatar. Must be valid UUID v4. */
  fileUuid: string;
}

/**
 * Response after avatar upload/change/delete.
 * Backend: app/presentation/schemas/user_v2.py :: AvatarV2Response
 */
export interface AvatarV2Response {
  /** Full-size profile picture URL. Null if avatar was deleted. */
  profilePic: string | null;
  /** Medium-size profile picture URL. Null if avatar was deleted. */
  profilePicMedium: string | null;
  /** Thumbnail profile picture URL. Null if avatar was deleted. */
  profilePicThumb: string | null;
}

/**
 * Company data from GET /users/me/company.
 * Backend: app/presentation/schemas/user.py :: CompanyMeResponse
 */
export interface CompanyDataV2 {
  /** Company UUID. */
  uuid: string | null;
  /** Company name. Max 255 chars. */
  name: string | null;
  /** Company address. Max 500 chars. */
  address: string | null;
  /** Company phone. Max 255 chars. */
  phone: string | null;
  /** Whether the company has a union committee. */
  hasCommittee: boolean | null;
  /** GPS latitude. Range: -90 to 90. */
  latitude: number | null;
  /** GPS longitude. Range: -180 to 180. */
  longitude: number | null;
}
