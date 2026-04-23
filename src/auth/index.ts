/**
 * Authentication types for the dual-backend auth system.
 *
 * Used by: new_dashboard (Shell -> Remotes), sitimmApp (V2 auth)
 * Backend: mini-back JWT system (app/shared/auth/jwt_service.py)
 *
 * Auth flow:
 * 1. Shell authenticates against V1 and/or V2 backend
 * 2. Stores DualAuthPayload in localStorage key "sitimm-dual-auth"
 * 3. Remotes hydrate from localStorage on module load (hydrateFromDualAuth)
 * 4. Token refresh emits auth:refresh CustomEvent on window
 */

/**
 * Per-backend token payload emitted to each remote.
 * Used in auth:login and auth:refresh CustomEvents.
 */
export interface AuthPayload {
  /** JWT access token (V1 or V2 format). */
  token: string;
  /** User UUID — consistent across V1 and V2. */
  userUuid: string;
  /** Stringified numeric user type (e.g., "63974" for EMPLOYEE). */
  userType: string;
  /** Which backend this token authenticates against. */
  backend: "v1" | "v2";
  /** User email. */
  email?: string;
  /** Companies the user belongs to (array of {uuid, name, ...}). */
  companies?: Array<{ uuid: string; name: string; [key: string]: unknown }>;
  /** Raw user profile data (shape varies by backend). */
  userProfile?: Record<string, unknown> | null;
}

/**
 * V2-specific token data (refresh token system).
 * Backend: mini-back JWT returns access + refresh token pair.
 */
export interface V2TokenData {
  /** Short-lived JWT access token. */
  accessToken: string;
  /** Long-lived refresh token for obtaining new access tokens. */
  refreshToken: string;
  /** Seconds until the access token expires (e.g., 3600 for 1 hour). */
  expiresIn: number;
}

/**
 * Dual auth result stored in shell after login.
 * Persisted in localStorage key "sitimm-dual-auth".
 * Each remote reads this on bootstrap to hydrate its Redux store.
 */
export interface DualAuthPayload {
  /** User UUID. */
  userUuid: string;
  /** Stringified numeric user type. */
  userType: string;
  /** User email. */
  email: string;
  /** Companies the user belongs to. */
  companies: Array<{ uuid: string; name: string; [key: string]: unknown }>;
  /** Raw profile data. */
  userProfile: Record<string, unknown> | null;
  /** V1 JWT token. Null if V1 auth failed or not attempted. */
  v1Token: string | null;
  /** V2 JWT access token. Null if V2 auth not available. */
  v2Token: string | null;
  /** V2 refresh token. Null if V2 auth not available. */
  v2RefreshToken: string | null;
  /** Unix timestamp (ms) when V2 access token expires. Null if V2 unavailable. */
  v2ExpiresAt: number | null;
  /** Which backend is the primary API source. Determines which remote loads. */
  primaryBackend: "v1" | "v2";
}

/**
 * Events the shell emits on `window` for auth lifecycle.
 * Remotes subscribe to these via `window.addEventListener()`.
 */
export type AuthEventType = "auth:login" | "auth:refresh" | "auth:logout";

/** CustomEvent<AuthPayload> for login and refresh; no detail for logout. */
export type AuthEvent = CustomEvent<AuthPayload | null>;

/**
 * Login request to V2 backend.
 * Backend: POST /api/v2/auth/login
 */
export interface LoginV2Request {
  /** User email. */
  email: string;
  /** User password. Min 6, max 100 chars. */
  password: string;
}

/**
 * Login response from V2 backend.
 * Backend: POST /api/v2/auth/login response.
 *
 * Note: This response uses snake_case (raw backend format).
 * The shell transforms it into DualAuthPayload (camelCase).
 */
export interface LoginV2Response {
  /** JWT access token. */
  access_token: string;
  /** JWT refresh token. */
  refresh_token: string;
  /** Seconds until access token expires. */
  expires_in: number;
  /** Basic user info. */
  user: {
    /** User UUID. */
    uuid: string;
    /** User email. */
    email: string;
    /** Numeric user type code. Compare with UserType constants. */
    user_type: number;
    /** First name(s). */
    first_name: string;
    /** Surname(s). */
    last_name: string;
  };
}

// -- Social Auth --

/** OAuth provider. Backend: social_auth.py :: SocialLoginRequest.provider */
export type SocialProvider = "google" | "apple";

/** Social login status. Backend: social_auth.py :: SocialLoginResponse.status */
export type SocialLoginStatus = "authenticated" | "needs_verification" | "requires_setup";

/**
 * Request body for POST /api/v2/auth/social/login.
 * Backend: social_auth.py :: SocialLoginRequest
 */
export interface SocialLoginRequest {
  /** OAuth provider. */
  provider: SocialProvider;
  /** ID token from the provider (Google/Apple). Min 10 chars. */
  id_token: string;
}

/**
 * Response from POST /api/v2/auth/social/login.
 * Backend: social_auth.py :: SocialLoginResponse
 *
 * Flow:
 * - "authenticated" → returning user, token is a full JWT. Login complete.
 * - "needs_verification" → new user, call /auth/social/verify with session_id + RFC.
 * - "requires_setup" → user exists but needs additional setup.
 */
export interface SocialLoginResponse {
  /** Login status determining next step. */
  status: SocialLoginStatus;
  /** JWT access token. Only present when status="authenticated". */
  token: string | null;
  /** JWT refresh token. Only present when status="authenticated". */
  refreshToken: string | null;
  /** User UUID. Only present when status="authenticated". */
  user_uuid: string | null;
  /** Numeric user type. Only present when status="authenticated". */
  user_type: number | null;
  /** Temporary session ID. Only present when status="needs_verification". */
  session_id: string | null;
  /** Email from the OAuth provider. Shown in verification screen. */
  social_email: string | null;
  /** Name from the OAuth provider. */
  social_name: string | null;
  /** Whether the user needs to update contact info. */
  needsContactUpdate: boolean | null;
  /** Reason why contact update is needed. */
  contactUpdateReason: string | null;
}

/**
 * Request body for POST /api/v2/auth/social/verify.
 * Links a social login to an existing employee via RFC.
 * Backend: social_auth.py :: VerifyIdentityRequest
 */
export interface VerifyIdentityRequest {
  /** Temporary session ID from SocialLoginResponse. */
  session_id: string;
  /** Employee RFC. 10–13 chars. */
  rfc: string;
}

/**
 * Response from POST /api/v2/auth/social/verify.
 * Backend: social_auth.py :: VerifyIdentityResponse
 */
export interface VerifyIdentityResponse {
  /** JWT access token. */
  token: string;
  /** JWT refresh token. */
  refreshToken: string | null;
  /** User UUID. */
  user_uuid: string;
  /** Employee UUID. */
  employee_uuid: string;
  /** Company name the employee belongs to. */
  company_name: string;
  /** Whether the user still needs additional setup. */
  requires_setup: boolean;
  /** Whether the user needs to update contact info. */
  needsContactUpdate: boolean | null;
  /** Reason why contact update is needed. */
  contactUpdateReason: string | null;
}

/**
 * Request body for POST /api/v2/auth/social/guest.
 * Creates a guest (INVITADO) account from a social session.
 * Backend: social_auth.py :: GuestLoginRequest
 */
export interface GuestLoginRequest {
  /** Temporary session ID from SocialLoginResponse. */
  session_id: string;
}

/**
 * Response from POST /api/v2/auth/social/guest.
 * Backend: social_auth.py :: GuestLoginResponse
 */
export interface GuestLoginResponse {
  /** Always "authenticated". */
  status: "authenticated";
  /** JWT access token. */
  token: string;
  /** JWT refresh token. */
  refreshToken: string | null;
  /** User UUID. */
  user_uuid: string;
  /** Numeric user type (INVITADO = 41726). */
  user_type: number;
}

/**
 * Social account linked to a user.
 * Backend: social_auth.py :: SocialAccountInfo
 */
export interface SocialAccountInfo {
  /** OAuth provider name. */
  provider: string;
  /** Email from the provider. Null if not provided. */
  email: string | null;
  /** ISO-8601 datetime when the account was linked. */
  createdAt: string;
}

/**
 * Response from GET /api/v2/auth/social/accounts.
 * Backend: social_auth.py :: SocialAccountListResponse
 */
export interface SocialAccountListResponse {
  /** Array of linked social accounts. */
  accounts: SocialAccountInfo[];
}

/**
 * Menu item descriptor — shell menu config (dashboard only).
 * Used by Shell to build the sidebar navigation.
 */
export interface MenuItem {
  /** Unique menu item ID (e.g., "consultas", "empresas"). */
  id: string;
  /** Display label (fallback if i18n key not found). */
  label: string;
  /** i18n translation key for the label. */
  labelKey: string;
  /** MUI icon name (resolved at runtime). */
  icon: string;
  /** Which remote app handles this route. */
  remote: "v1" | "v2";
  /** Route path (e.g., "/Consultas", "/Empresas"). */
  path: string;
  /** User type IDs that can see this menu item. Omit for all roles. */
  roles?: number[];
  /** If true, only visible in development mode. */
  devOnly?: boolean;
}

// ────────────────────────────────────────────────────────────────────
// Password reset (V2)
//
// Backend: app/presentation/schemas/auth_reset_v2.py
// Three-step OTP flow for users who cannot log in:
//   1. POST /api/v2/auth/forgot-password  → server emails/SMS OTP
//   2. POST /api/v2/auth/verify-reset     → returns short-lived reset token
//   3. POST /api/v2/auth/reset-password   → applies new password
// ────────────────────────────────────────────────────────────────────

/**
 * Body for POST /api/v2/auth/forgot-password.
 * Server resolves the contact to a user, generates a 6-digit OTP, and
 * dispatches it via email or SMS depending on the contact format.
 */
export interface ForgotPasswordV2Request {
  /** Email address or phone number of the account to recover. */
  contact: string;
}

/**
 * Body for POST /api/v2/auth/verify-reset.
 * Exchanges a valid OTP for a short-lived reset token.
 */
export interface VerifyResetV2Request {
  /** Same email / phone used in forgot-password. */
  contact: string;
  /** 6-digit OTP code. */
  code: string;
}

/**
 * Successful verify-reset response (unwrapped from `success_response()`).
 * The reset token is a JWT with `type="reset"` and 10-minute TTL.
 */
export interface VerifyResetV2Response {
  /** Short-lived JWT reset token (10-minute TTL, type="reset"). */
  resetToken: string;
}

/**
 * Body for POST /api/v2/auth/reset-password.
 * Applies the new password using the reset token from verify-reset.
 * The reset token must also be sent in the `Authorization: Bearer` header.
 */
export interface ResetPasswordV2Request {
  /** JWT reset token from verify-reset. Also sent in the Authorization header. */
  resetToken: string;
  /** New password. 8+ chars, 1 uppercase, 1 lowercase, 1 digit. */
  newPassword: string;
}
