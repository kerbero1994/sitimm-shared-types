/**
 * Authentication types for the SITIMM V2 auth contract.
 *
 * Used by: new_dashboard, sitimmApp
 * Backend: mini-back /api/v2 (hard cutover 9e3a4255, 2026-06-22 — V1 auth
 * routes removed). Token mechanics: app/shared/auth/jwt_service.py.
 *
 * NOTE: DualAuthPayload/AuthPayload/V2TokenData/AuthEvent below describe a
 * legacy shell↔remote micro-frontend model that new_dashboard no longer
 * implements — kept only for backwards compatibility, see @deprecated tags.
 */

/**
 * Per-backend token payload emitted to each remote.
 * Used in auth:login and auth:refresh CustomEvents.
 * @deprecated Modelo micro-frontend legacy — new_dashboard usa su slice Redux
 * `login`; ningún consumidor conocido. Se eliminará en 1.0.0.
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
 * @deprecated Modelo micro-frontend legacy — new_dashboard usa su slice Redux
 * `login`; ningún consumidor conocido. Se eliminará en 1.0.0.
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
 * @deprecated Modelo micro-frontend legacy — new_dashboard usa su slice Redux
 * `login`; ningún consumidor conocido. Se eliminará en 1.0.0.
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
 * @deprecated Modelo micro-frontend legacy — new_dashboard usa su slice Redux
 * `login`; ningún consumidor conocido. Se eliminará en 1.0.0.
 */
export type AuthEventType = "auth:login" | "auth:refresh" | "auth:logout";

/**
 * CustomEvent<AuthPayload> for login and refresh; no detail for logout.
 * @deprecated Modelo micro-frontend legacy — new_dashboard usa su slice Redux
 * `login`; ningún consumidor conocido. Se eliminará en 1.0.0.
 */
export type AuthEvent = CustomEvent<AuthPayload | null>;

// ────────────────────────────────────────────────────────────────────
// Credential login (V2)
//
// Backend: app/presentation/api/v2/auth_legacy.py (hard cutover 9e3a4255,
// 2026-06-22 — las rutas V1 de credenciales fueron ELIMINADAS).
//   POST /api/v2/users/login        (rate limit 5/min + lockout por email)
//   POST /api/v2/users/login-phone  (rate limit 3/min)
//   POST /api/v2/users/refresh      (refresh token ROTATIVO one-time-use)
//   POST /api/v2/users/logout       (Bearer access token requerido)
//
// Los TTL NO vienen en las responses — ver TOKEN_TTL.
// ────────────────────────────────────────────────────────────────────

/**
 * TTLs de tokens — contrato out-of-band con mini-back.
 * Backend: app/config.py :: ACCESS_TOKEN_EXPIRE_MINUTES=30,
 * REFRESH_TOKEN_EXPIRE_DAYS=7. Las responses de login/refresh NO incluyen
 * `expiresIn`; el FE debe programar el refresh proactivo con estas constantes.
 */
export const TOKEN_TTL = {
  /** Segundos de vida del access token (JWT, 30 min). */
  ACCESS_SECONDS: 1800,
  /** Días de vida del refresh token (UUID opaco en Redis, one-time-use). */
  REFRESH_DAYS: 7,
} as const;

/**
 * Body para POST /api/v2/users/login.
 * Backend: schemas/auth_legacy.py :: LoginRequest — el campo JSON es `pass`
 * (Pydantic `pass_` con validation_alias="pass"), NO `password`.
 */
export interface LoginV2Request {
  /** Email del usuario. Max 320 chars. */
  email: string;
  /** Password. Max 128 chars. Campo JSON literal: `pass`. */
  pass: string;
}

/**
 * Body para POST /api/v2/users/login-phone.
 * Backend: schemas/auth_legacy.py :: LoginPhoneRequest.
 */
export interface LoginPhoneV2Request {
  /** Teléfono del usuario. Max 20 chars. */
  phone: string;
  /** Password. Max 128 chars. Campo JSON literal: `pass`. */
  pass: string;
}

/**
 * Payload de login exitoso (dentro del envelope `{status, data}`).
 * Backend: auth_legacy.py :: _build_login_response.
 */
export interface LoginV2SuccessData {
  /** JWT access token (30 min — ver TOKEN_TTL). */
  accessToken: string;
  /** Refresh token opaco (UUID), rotativo one-time-use, 7 días. */
  refreshToken: string;
  /** User type numérico. Comparar con constantes UserType. */
  userType: number;
  /** UUID del usuario. */
  userUuid: string;
  /** Solo EMPLOYEE: si tiene employment activo. snake_case verbatim del BE. */
  active_employment?: boolean;
  /**
   * Solo EMPLOYEE: user type efectivo tras el downgrade a INVITADO cuando no
   * hay employment activo. Si está presente, el FE DEBE usarlo (no userType)
   * para menú/RBAC. snake_case verbatim del BE.
   */
  effective_user_type?: number;
  /** true cuando el email registrado es un RFC usado como credencial. */
  needsContactUpdate?: boolean;
  /** Razón del contact update (e.g., "rfc_as_credential"). */
  contactUpdateReason?: string;
}

/**
 * Payload cuando el usuario tiene password temporal/nula (first login).
 * NO se emite access token — el setupToken (JWT type="setup", 15 min) es lo
 * único utilizable, contra /api/v2/auth/setup + /setup/verify.
 */
export interface LoginV2SetupData {
  /** JWT de setup (type="setup", 15 min TTL). */
  setupToken: string;
  /** Discriminador del branch. */
  requiresSetup: true;
  /** User type numérico. */
  userType: number;
  /** UUID del usuario. */
  userUuid: string;
  needsContactUpdate?: boolean;
  contactUpdateReason?: string;
}

/**
 * Response de POST /api/v2/users/login y /login-phone.
 * Envelope legacy `{status, data}` de response_builder.success_response.
 * Discriminar con `"requiresSetup" in data`.
 */
export interface LoginV2Response {
  status: "success";
  data: LoginV2SuccessData | LoginV2SetupData;
}

/**
 * Body para POST /api/v2/users/refresh.
 * Backend: auth_legacy.py :: RefreshRequest (alias refreshToken).
 * El refresh token es one-time-use: el BE lo consume atómicamente (GETDEL)
 * y emite un par nuevo — el FE DEBE persistir el refreshToken de la response.
 */
export interface RefreshV2Request {
  refreshToken: string;
}

/** Response de POST /api/v2/users/refresh. Sin expiresIn — ver TOKEN_TTL. */
export interface RefreshV2Response {
  status: "success";
  data: {
    accessToken: string;
    refreshToken: string;
    userUuid: string;
  };
}

/**
 * Body para POST /api/v2/users/logout. Requiere Bearer access token.
 * Blacklistea el access token y revoca el refresh token.
 */
export interface LogoutV2Request {
  refreshToken: string;
}

// ────────────────────────────────────────────────────────────────────
// Account setup — first login (V2)
//
// Backend: app/presentation/api/v2/auth_setup.py + schemas/auth_setup.py.
// Authorization: Bearer <setupToken> (JWT type="setup"), NO access token.
//   POST /api/v2/auth/setup         → dispara OTP al contacto elegido
//   POST /api/v2/auth/setup/verify  → OTP correcto → tokens de sesión
// ────────────────────────────────────────────────────────────────────

/**
 * Body para POST /api/v2/auth/setup.
 * Constraint BE (model_validator): al menos uno de email/phone requerido.
 */
export interface SetupInitV2Request {
  /** Password nueva. 8–128 chars. */
  password: string;
  /** Email de contacto. Max 320 chars. */
  email?: string;
  /** Teléfono de contacto. Max 20 chars. */
  phone?: string;
}

/** Body para POST /api/v2/auth/setup/verify. */
export interface SetupVerifyV2Request {
  /** OTP de 6 dígitos. */
  otpCode: string;
}

/** Response de POST /api/v2/auth/setup/verify — sesión completa. */
export interface SetupVerifyV2Response {
  status: "success";
  data: {
    accessToken: string;
    refreshToken: string;
    userType: number;
    userUuid: string;
  };
}

// -- Social Auth --

/** OAuth provider. Backend: social_auth.py :: SocialLoginRequest.provider */
export type SocialProvider = "google" | "apple";

/** Social login status. Backend: social_auth.py :: SocialLoginResponse.status */
export type SocialLoginStatus = "authenticated" | "needs_verification" | "requires_setup";

/**
 * Request body for POST /api/v2/auth/social (sin sufijo "/login"; V2 desde el cutover 9e3a4255).
 * Backend: social_auth.py :: SocialLoginRequest
 */
export interface SocialLoginRequest {
  /** OAuth provider. */
  provider: SocialProvider;
  /** ID token from the provider (Google/Apple). Min 10 chars. */
  id_token: string;
}

/**
 * Response de POST /api/v2/auth/social. FLAT — sin envelope {status,data}.
 * Backend: schemas/social_auth.py :: SocialLoginResponse (serializado
 * by-alias: needsContactUpdate, isFirstLogin, googlePhotoUrl, refreshToken).
 *
 * Flow:
 * - "authenticated" → usuario existente (cuenta vinculada o email match).
 *   `token` es el access JWT. Login completo.
 * - "requires_setup" → usuario existente con password temporal/nula.
 *   `token` es el setupToken → /api/v2/auth/setup.
 * - "needs_verification" → usuario desconocido. `session_id` (TTL 10 min)
 *   sirve como signup_token del onboarding unificado
 *   (/auth/employee/match + /auth/employee/claim) o para /auth/social/guest.
 *   El viejo /auth/social/verify por RFC es 410 GONE.
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
  /** true en el primer login social del usuario. Alias BE: isFirstLogin. */
  isFirstLogin?: boolean | null;
  /** URL de la foto de perfil de Google (claim `picture`). Solo Google. */
  googlePhotoUrl?: string | null;
}

/**
 * Request body for POST /api/v2/auth/social/verify.
 * Links a social login to an existing employee via RFC.
 * Backend: social_auth.py :: VerifyIdentityRequest
 * @deprecated El endpoint /auth/social/verify responde 410 GONE desde el
 * login redesign (2026-06-22). Usar el onboarding unificado
 * (employee/match + employee/claim) o GuestLoginRequest. Se eliminará en 1.0.0.
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
 * @deprecated El endpoint /auth/social/verify responde 410 GONE desde el
 * login redesign (2026-06-22). Usar el onboarding unificado
 * (employee/match + employee/claim) o GuestLoginRequest. Se eliminará en 1.0.0.
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
