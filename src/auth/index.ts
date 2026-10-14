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
  /**
   * Apple only (SITIMM-1055): Apple gives the name to the app on the first sign-in only, never in
   * the ID token. Send it from the credential when present. Trimmed; max
   * `FIELD_LIMITS.NAME_MAX` (100) or 422. Names a new account only; ignored for Google, when the
   * token has a name, for an existing account, and on `POST /social/accounts`.
   */
  givenName?: string | null;
  /** Apple only (SITIMM-1055): same rules as `givenName`. */
  familyName?: string | null;
  /**
   * @since 2.21.0 — contrato de SITIMM-1275 (BE #7 de ORCHESTRATION-login §3), aún sin servir
   * en mini-back al publicar 2.21.0. Hasta su despliegue el BE ignora el campo (Pydantic
   * descarta claves desconocidas).
   *
   * Valor CRUDO del nonce que el cliente generó para este inicio de sesión. Si viene, el
   * `id_token` debe traerlo en su claim `nonce`, o 401:
   * - Google: el claim es este mismo valor crudo (es el que se le pasa a GIS).
   * - Apple: el BE compara el sha256 en hex de este valor con el claim (a Apple JS se le pasa
   *   el sha256 hex; aquí va el crudo).
   * Sin `nonce` el BE se comporta como hoy: los builds de la app que no lo mandan siguen igual.
   * `SocialLinkV2Request` lo hereda; la spec sólo lo pide en `/auth/social` y en el reauth
   * social (`ReauthSocialV2Request.nonce`).
   */
  nonce?: string;
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
  /** SITIMM-657 — `true` sólo cuando `status="requires_setup"`; `null` en el resto.
   *  El backend lo emite SIEMPRE (por-alias, valor `null` cuando no aplica), no es
   *  opcional. Rutea a la pantalla de setup cuando es `true`; no caigas al camino de
   *  `authenticated`, que abortaría sin refresh token. */
  requiresSetup: boolean | null;
  /** SITIMM-657 — el MISMO JWT que `token` cuando `status="requires_setup"` (type="setup",
   *  15 min); `null` en el resto. Es lo que exige `/api/v2/auth/setup`. Emitido siempre. */
  setupToken: string | null;
  /** `true` en el primer login social del usuario. Emitido siempre; `null` cuando no aplica. */
  isFirstLogin: boolean | null;
  /** URL de la foto de perfil de Google (claim `picture`). Sólo Google — SIEMPRE `null` con
   *  Apple. Emitido siempre. */
  googlePhotoUrl: string | null;
}

/**
 * Body de POST /api/v2/auth/social/accounts: ligar Google/Apple con la sesión abierta
 * (SITIMM-955). Access token requerido.
 * Respuesta: `SocialAccountListResponse` (plana), la misma que el GET.
 * Es idempotente si esa cuenta del proveedor ya es de quien llama.
 * Errores (`detail`):
 * - 401 `Authentication failed`: el proveedor rechazó el `id_token`.
 * - 401 `reauth_required`: el `reauthToken` falta, ya se usó, caducó o es de otro.
 * - 409 `social_account_taken`: esa cuenta del proveedor es de otro usuario.
 * - 409 `provider_already_linked`: quien llama ya tiene otra cuenta de ese proveedor.
 */
export interface SocialLinkV2Request extends SocialLoginRequest {
  /** Token de un solo uso de POST /api/v2/auth/reauth (step-up). */
  reauthToken: string;
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
  /**
   * `true` si la cuenta tiene una contraseña propia que sirve para entrar (SITIMM-747). La
   * temporal del padrón o de una invitación NO cuenta (SITIMM-984): sólo abre el setup. Es la
   * misma señal con la que el BE niega desligar la última credencial: con `false`, ofrece
   * «Crear contraseña». Siempre presente, también en la respuesta del POST (ligar).
   * Backend: api/v2/social_auth.py :: list_social_accounts (474-497) y `_has_password`
   * (101-105); schemas/social_auth.py :: SocialAccountListResponse.has_password
   * (alias `hasPassword`).
   */
  hasPassword: boolean;
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
//   1. POST /api/v2/auth/forgot-password  → server sends OTP (email / WhatsApp)
//   2. POST /api/v2/auth/verify-reset     → returns short-lived reset token
//   3. POST /api/v2/auth/reset-password   → applies new password
// ────────────────────────────────────────────────────────────────────

/**
 * Body for POST /api/v2/auth/forgot-password.
 * Server resolves the contact to a user, generates a 6-digit OTP, and
 * dispatches it via email or WhatsApp depending on the contact format.
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
  /**
   * Last 4 characters of the account's RFC (exactly 4 letters/digits,
   * case-insensitive). SITIMM-971 — second factor against carrier-recycled
   * numbers: on a PHONE reset of an account that has an RFC the backend
   * requires it (when its `RESET_RFC_FACTOR_ENFORCED` switch is on); a
   * missing or wrong value answers exactly like a wrong code (400
   * "Codigo incorrecto.") and spends one attempt. Ignored on email resets
   * and on accounts without an RFC. Ask for it whenever the contact is a
   * phone, and OMIT the field when the user leaves it empty — `""` is a 422.
   */
  rfcLast4?: string;
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

// ────────────────────────────────────────────────────────────────────
// Reclamar empleo: alta (employee/match) y con sesión (users/me/claim-rfc)
//
// Backend: auth_signup.py :: employee_match · users_claim_rfc (SITIMM-954).
// Mismo match en los dos: la empresa del buscador (`GET /auth/companies`) más
// EXACTAMENTE UN identificador (422 `exactly_one_identifier_required`). 5 fallos
// por empresa y tipo de identificador en 15 min → 429 `too_many_attempts`.
// ────────────────────────────────────────────────────────────────────

/** Los identificadores del padrón con los que se reclama: manda sólo UNO. */
export interface PadronIdentifierV2 {
  /** RFC del padrón (12–13). Se compara en mayúsculas. */
  rfc?: string;
  /** CURP (18). */
  curp?: string;
  /** NSS (11 dígitos). */
  nss?: string;
}

/**
 * Body de POST /api/v2/auth/employee/match. Bearer <signup_token> (el del OTP o el
 * `session_id` de un social `needs_verification`).
 */
export interface EmployeeMatchV2Request extends PadronIdentifierV2 {
  /** `uuid` de la empresa elegida en el buscador. */
  company_uuid: string;
}

/**
 * Respuesta 200 de employee/match.
 * - Match: `claim_token` + `masked_name` → `employee/claim`.
 * - Negativo: `claim_token = null`. Si la fila ya es de una cuenta activada llega
 *   `already_claimed = true` con `masked_name`/`masked_email` (la máscara no conserva la
 *   longitud): la app ofrece «Entrar» / «Olvidé mi contraseña» en vez de crear otra cuenta.
 * - Menor de edad: 403 `age_restricted` (no cuenta como fallo).
 */
export interface EmployeeMatchV2Response {
  claim_token: string | null;
  company_name: string;
  masked_name?: string;
  /** Sólo con `already_claimed`. Ej. `"j***@g***.com"`. */
  masked_email?: string;
  already_claimed?: boolean;
  offer_recovery?: boolean;
  offer_guest?: boolean;
  /** Segundos de vida del `claim_token`. */
  expires_in?: number;
}

/**
 * Body de POST /api/v2/users/me/claim-rfc (SITIMM-954). Access token requerido.
 * Para un INVITADO, o un EMPLOYEE sin empleo vivo, que prueba con su identificador que
 * una fila del padrón es suya.
 */
export interface ClaimRfcV2Request extends PadronIdentifierV2 {
  /** `uuid` de la empresa elegida en el buscador. */
  company_uuid: string;
  /** DEBE ser `true` (400 `legal_not_accepted`). */
  accept_legal: boolean;
  /** Versión del texto legal mostrado (queda auditada). */
  legal_version: string;
}

/** Resultado de claim-rfc. Sólo `claimed` cambia algo. */
export type ClaimRfcV2Status = "claimed" | "no_match" | "already_claimed";

/**
 * Respuesta 200 de claim-rfc (dentro del envelope `{status, data}`).
 * - `claimed`: la fila del padrón ya es de quien llama; pasa a EMPLOYEE y su perfil se
 *   completa con el padrón. Conserva correo, contraseña y Google. Si la fila tenía un
 *   login de censo sin activar (`<rfc>@employee.local`), ése se da de baja. Vuelve a pedir
 *   `GET /users/me`: el access token sigue valiendo.
 * - `no_match`: ninguna fila reclamable. Cuenta como fallo.
 * - `already_claimed`: la fila es de otra cuenta activada (`masked_name`/`masked_email`).
 *   Cuenta como fallo.
 */
export interface ClaimRfcV2Response {
  status: ClaimRfcV2Status;
  company_name: string;
  /** `claimed` y `already_claimed`. */
  masked_name?: string;
  /** Sólo `already_claimed`. */
  masked_email?: string;
}

/**
 * Códigos de error de claim-rfc: llegan en `data.message` del envelope
 * `{status: "error", data: {message}}`.
 * - 400 `legal_not_accepted`
 * - 403 `age_restricted`: el padrón dice que es menor de edad.
 * - 409 `already_employed`: ya tiene un empleo vivo.
 * - 409 `claim_unavailable`: la cuenta no puede reclamar (staff, borrado pendiente), la
 *   fila cambió entre el match y el claim, o su login de censo es también el de otra fila
 *   viva. La salida es una consulta con el asesor.
 * - 422 `exactly_one_identifier_required`
 * - 429 `too_many_attempts` (5 fallos / 15 min) · `rate_limited` (por IP)
 */
export type ClaimRfcV2ErrorCode =
  | "legal_not_accepted"
  | "age_restricted"
  | "already_employed"
  | "claim_unavailable"
  | "exactly_one_identifier_required"
  | "too_many_attempts"
  | "rate_limited";

// ---------------------------------------------------------------------------
// Cambio de correo o teléfono con OTP (SITIMM-937/959)
// Backend: app/presentation/schemas/auth_contact.py · app/presentation/api/v2/auth_contact.py
// ---------------------------------------------------------------------------

/** Campo de contacto que se cambia o se agrega. Backend: `ContactField`. */
export type ContactFieldV2 = "email" | "phone";

/**
 * Canal por el que salió un código. `phone` va por WhatsApp. Backend: el
 * `method` de `_get_current_contact` / `_send_otp`.
 */
export type ContactCodeChannelV2 = "email" | "phone";

/**
 * Paso 1 · POST /api/v2/auth/contact/init. Manda un código al canal de IDENTIDAD:
 * el valor real del mismo campo o, si no lo hay (correo `@employee.local`, sin
 * teléfono verificado), el otro canal real de la cuenta. Sin ningún canal real
 * responde 400. Agregar también pide los dos códigos: saltarse la identidad
 * dejaría a un token robado cambiar el correo y resetear la contraseña.
 *
 * Backend: `ContactUpdateInitRequest`.
 */
export interface ContactInitV2Request {
  field: ContactFieldV2;
  /**
   * Correo nuevo: se guarda en minúsculas; un buzón temporal o reservado da 400.
   * Teléfono nuevo: 10 dígitos MX (espacios, `-` y `()` se ignoran); se guarda en
   * E.164. Si ya es de otra cuenta, 409.
   */
  newValue: string;
  /** Sólo administradores: cambia el contacto de otro usuario sin OTP. Si no eres admin, 403. */
  targetUserUuid?: string;
}

/**
 * Respuesta 200 de init y de confirm-identity, dentro del envelope `{status, data}`.
 * Backend: `auth_contact.py :: contact_init` / `contact_confirm_identity`.
 */
export interface ContactCodeSentV2Response {
  /** Texto del BE, en español. La app muestra el suyo traducido. */
  message: string;
  /**
   * init: el canal de identidad, que puede ser el OTRO campo (cambiar el correo
   * por WhatsApp). confirm-identity: el canal del valor nuevo.
   */
  contactMethod: ContactCodeChannelV2;
}

/**
 * Paso 2 · POST /api/v2/auth/contact/confirm-identity. Verifica el código de
 * identidad y manda otro al valor nuevo. Backend: `ContactUpdateConfirmIdentityRequest`.
 */
export interface ContactConfirmIdentityV2Request {
  /** 6 dígitos. */
  otpCode: string;
  /**
   * El mismo `newValue` que se mandó a init. Si otro init lo reemplazó, o el canal
   * de identidad cambió entre medias, 409: hay que empezar de nuevo.
   */
  newValue: string;
}

/** Paso 3 · POST /api/v2/auth/contact/confirm-new. Backend: `ContactUpdateConfirmNewRequest`. */
export interface ContactConfirmNewV2Request {
  /** 6 dígitos: el código que llegó al valor nuevo. */
  otpCode: string;
}

/**
 * Respuesta 200 de confirm-new (envelope). El cambio ya está aplicado y verificado:
 * un teléfono nuevo sirve para entrar y para recuperar la contraseña. También la da
 * init con `targetUserUuid` de admin, que aplica sin OTP.
 */
export interface ContactUpdatedV2Response {
  message: string;
  updatedField: ContactFieldV2;
}

/*
 * Errores del flujo de contacto: HTTPException con un `detail` en español, sin código.
 * Hay que decidir por el estado HTTP:
 * - 400: valor inválido o reservado; sin canal de identidad (init); no hay cambio
 *   pendiente; código incorrecto o expirado (confirm-*).
 * - 403: `targetUserUuid` sin ser admin.
 * - 409: el valor ya es de otro usuario (init y confirm-*); en confirm-identity,
 *   además, el pendiente o el canal de identidad cambió → empezar de nuevo.
 * - 429: espera de 60 s entre códigos, límite por hora o demasiados intentos.
 * - 500: no se pudo enviar el código.
 */

// ────────────────────────────────────────────────────────────────────
// Alta sin cuenta: OTP → signup_token → employee/claim o invitado
//
// Backend: app/presentation/api/v2/auth_signup.py + schemas/auth_signup.py.
//   POST /api/v2/auth/otp/request    → código al correo o por WhatsApp → session_id
//   POST /api/v2/auth/otp/verify     → session_id + código → signup_token
//   POST /api/v2/auth/employee/match → ya tipado (EmployeeMatchV2Request)
//   POST /api/v2/auth/employee/claim → claim_token + aviso legal + contraseña → sesión
//   POST /api/v2/auth/guest          → contraseña → sesión de INVITADO
// Éxito: envelope `{status: "success", data}`. Los errores llegan de DOS formas según la
// rama: `error_response` → `{status: "error", data: {message: <código>}}`, y HTTPException
// → `{detail: <string u objeto>}` sin envelope. Un 429 trae `retryAfter` (segundos) en la
// raíz y la cabecera `Retry-After`; el de slowapi (más de 30/min por IP en otp/*) llega
// como `{error, retryAfter}`.
// employee/match, employee/claim y guest piden `Authorization: Bearer <signup_token>`: el
// de otp/verify, o el `session_id` de un `/auth/social` en `needs_verification` cuando el
// proveedor dio correo. Ausente o caducado → 401 con `detail` en inglés.
// ────────────────────────────────────────────────────────────────────

/** Canal del código de alta. El de teléfono sale SÓLO por WhatsApp (sin SMS). Backend: `OtpRequestBody.channel`. */
export type SignupOtpChannelV2 = "whatsapp" | "email";

/**
 * Body de POST /api/v2/auth/otp/request. Sin sesión.
 * Backend: schemas/auth_signup.py :: OtpRequestBody (16-19) · api/v2/auth_signup.py ::
 * otp_request (308-368).
 */
export interface SignupOtpV2Request {
  channel: SignupOtpChannelV2;
  /**
   * 3–255 caracteres. Correo: se guarda en minúsculas. WhatsApp: celular MX de 10 dígitos
   * (con o sin `52`/`521` delante) o E.164 con `+` de cualquier país; espacios, `-` y `()` se
   * ignoran y se guarda en E.164. Si no se puede normalizar → 422 `invalid_phone`, antes de
   * gastar la espera entre códigos.
   */
  target: string;
}

/** Respuesta 200 de otp/request (dentro del envelope `{status, data}`). */
export interface SignupOtpV2Response {
  /** Handle opaco de la sesión del código; NO es el signup_token. Va a otp/verify. */
  session_id: string;
  /** Canal por el que salió el código: el pedido (no hay respaldo por SMS). */
  channel_used: SignupOtpChannelV2;
  /** Segundos de vida de la sesión del código (BE: 300). */
  expires_in: number;
}

/**
 * Body de POST /api/v2/auth/otp/verify. Un código incorrecto no gasta la sesión: el límite
 * es de 5 intentos por código.
 * Backend: schemas/auth_signup.py :: OtpVerifyBody (22-24) · api/v2/auth_signup.py ::
 * otp_verify (371-399).
 */
export interface SignupOtpVerifyV2Request {
  /** El `session_id` de otp/request. */
  session_id: string;
  /** El código recibido: 6 dígitos (el BE acepta 4–8 caracteres). */
  code: string;
}

/** Respuesta 200 de otp/verify (dentro del envelope `{status, data}`). */
export interface SignupOtpVerifyV2Response {
  /** Token opaco de alta (no es JWT). Bearer de employee/match, employee/claim y guest. */
  signup_token: string;
  /** El contacto verificado, normalizado (correo en minúsculas o E.164): el principal de la cuenta. */
  verified_target: string;
  channel: SignupOtpChannelV2;
  /** Segundos de vida del signup_token (BE: 900). */
  expires_in: number;
}

/**
 * Códigos estables de otp/request y otp/verify, en `data.message`:
 * - otp/request: 422 `invalid_phone` · 429 `rate_limited` (tope por IP, o tope diario global
 *   de WhatsApp) · 502 `delivery_failed` (el código no salió; no se crea sesión).
 * - otp/verify: 410 `session_expired` (la sesión del código no existe o caducó).
 * El resto de rechazos trae en `data.message` un texto en español del servicio de OTP, no un
 * código; decide por estado: otp/request 429 (60 s entre códigos o tope por hora);
 * otp/verify 410 (código caducado), 429 (5 intentos agotados: pide otro código), 400 (código
 * incorrecto). Además, 5xx si Redis cae: hoy 500, SITIMM-1270 lo pasa a 503.
 */
export type SignupOtpV2ErrorCode =
  | "invalid_phone"
  | "rate_limited"
  | "delivery_failed"
  | "session_expired";

/**
 * Body de POST /api/v2/auth/employee/claim. Bearer <signup_token>. Cierra el reclamo: la
 * fila del padrón pasa a ser la cuenta de quien llama (toma su login de censo sin activar
 * si lo tiene, SITIMM-933; si no, crea la cuenta EMPLOYEE), copia el padrón al perfil y, si
 * la sesión vino de Google/Apple, liga ese proveedor.
 * Backend: schemas/auth_signup.py :: EmployeeClaimBody (48-58) · api/v2/auth_signup.py ::
 * employee_claim (540-617).
 */
export interface EmployeeClaimV2Request {
  /** El `claim_token` de employee/match: 10 min, un solo uso, atado a este signup_token. */
  claim_token: string;
  /** DEBE ser `true` (400 `legal_not_accepted`). */
  accept_legal: boolean;
  /** Versión del texto legal mostrado (queda auditada). Omitida, el BE graba `"claim-2026-06"` (`LEGAL_CLAIM_VERSION`). */
  legal_version?: string;
  /**
   * 8–128 caracteres (fuera de rango, 422). Además 1 mayúscula, 1 minúscula, 1 dígito y que
   * no sea común; si no, 400 con `detail: {message, requirements[]}` (textos en inglés).
   */
  password: string;
  /**
   * Contacto SECUNDARIO sin verificar: el canal que NO se verificó con el código (≤ 255).
   * Uno del mismo canal que el verificado se ignora: el principal es siempre `verified_target`.
   */
  email?: string | null;
  /** Ídem `email`, para el teléfono (≤ 32). */
  phone?: string | null;
}

/**
 * Respuesta 200 de employee/claim (dentro del envelope `{status, data}`): sesión completa.
 * snake_case tal cual: aquí es `refresh_token` (en `/auth/social` es `refreshToken`).
 * Backend: api/v2/auth_signup.py :: _issue_tokens (295-305) + `company_name`.
 */
export interface EmployeeClaimV2Response {
  /** JWT de acceso (30 min, ver TOKEN_TTL). */
  token: string;
  /** Refresh token opaco, rotativo de un solo uso (7 días). */
  refresh_token: string;
  user_uuid: string;
  /** User type numérico (compáralo con `UserType`). Es número, no string. */
  user_type: number;
  /** Empresa de la fila reclamada. */
  company_name: string;
}

/**
 * Códigos de error de POST /api/v2/auth/guest:
 * - `data.message`: 410 `session_expired` (la sesión de alta caducó o ya se usó).
 * - `detail` (string): 409 `email_already_registered` · `phone_already_registered`.
 * Fuera de la unión: 400 contraseña débil o común (`detail: {message, requirements[]}`) y
 * 401 signup_token ausente o caducado.
 * Contraseña y contacto se revisan ANTES de gastar la sesión de alta (SITIMM-952): ese
 * 400/409 deja reintentar con la misma. Desde el 410 en adelante la sesión está gastada y
 * hay que volver a pedir código.
 */
export type GuestSignupV2ErrorCode =
  | "session_expired"
  | "email_already_registered"
  | "phone_already_registered";

/**
 * Códigos de error de POST /api/v2/auth/employee/claim: los de `GuestSignupV2ErrorCode` y
 * - 400 `legal_not_accepted` (`data.message`), antes de tocar la sesión.
 * - 409 `claim_unavailable` (`data.message`): el `claim_token` caducó, ya se usó o es de otro
 *   signup_token, o la fila dejó de ser reclamable. Llega con la sesión de alta ya gastada.
 */
export type EmployeeClaimV2ErrorCode =
  | GuestSignupV2ErrorCode
  | "legal_not_accepted"
  | "claim_unavailable";

/**
 * Body de POST /api/v2/auth/guest. Bearer <signup_token>. Crea una cuenta INVITADO con el
 * contacto verificado y, si la sesión vino de Google/Apple, liga ese proveedor.
 * Backend: schemas/auth_signup.py :: GuestBody (61-65) · api/v2/auth_signup.py ::
 * guest_signup (620-644).
 */
export interface GuestSignupV2Request {
  /** Mismas reglas que `EmployeeClaimV2Request.password`. */
  password: string;
  /** Contacto secundario sin verificar, como en `EmployeeClaimV2Request.email` (≤ 255). */
  email?: string | null;
  /** Ídem, para el teléfono (≤ 32). */
  phone?: string | null;
}

/** Respuesta 200 de guest: `{status: "success", data: GuestSignupV2Response}`. */
export interface GuestSignupV2Response {
  /** Siempre `"authenticated"`. Es `data.status`; el envelope trae su propio `status`. */
  status: "authenticated";
  /** JWT de acceso (30 min). */
  token: string;
  /** snake_case, como en employee/claim. */
  refresh_token: string;
  user_uuid: string;
  /** INVITADO = 41726. Número. */
  user_type: number;
}

// ────────────────────────────────────────────────────────────────────
// Reauth (step-up) — POST /api/v2/auth/reauth
//
// Backend: app/presentation/api/v2/auth_reauth_v2.py. Access token requerido; 5/min por
// cuenta. Un solo endpoint para contraseña y social. El `reauthToken` lo consumen
// DELETE /users/me (users_v2.py:755) y POST /auth/social/accounts (social_auth.py:522).
// ────────────────────────────────────────────────────────────────────

/** Reauth con la contraseña actual. Backend: `ReauthRequest.password` (min 1). */
export interface ReauthPasswordV2Request {
  /** Contraseña actual. Si viene, gana sobre los campos sociales. */
  password: string;
}

/**
 * Reauth social, para cuentas sin contraseña: un `id_token` fresco del proveedor cuya cuenta
 * esté ligada a ESTE usuario (no basta con que sea válido).
 * OJO: aquí el campo es `idToken` (alias; el BE también acepta `id_token`), no el `id_token`
 * de `SocialLoginRequest`.
 */
export interface ReauthSocialV2Request {
  provider: SocialProvider;
  idToken: string;
  /**
   * @since 2.21.0 — SITIMM-1275, aún sin servir al publicar 2.21.0 (hasta entonces se
   * ignora). Mismas reglas que `SocialLoginRequest.nonce`.
   */
  nonce?: string;
}

/**
 * Body de POST /api/v2/auth/reauth: contraseña, o `provider` + `idToken`.
 * Backend: auth_reauth_v2.py :: ReauthRequest (31-38) · reauth (41-80).
 */
export type ReauthV2Request = ReauthPasswordV2Request | ReauthSocialV2Request;

/** Respuesta 200 de reauth (dentro del envelope `{status, data}`). */
export interface ReauthV2Response {
  /** JWT de un solo uso que prueba la reauth reciente. */
  reauthToken: string;
  /** Segundos de vida (BE: 300, `REAUTH_TOKEN_EXPIRE_MINUTES` = 5). */
  expiresIn: number;
}

/**
 * Errores de reauth, en `detail` (string):
 * - 403 `invalid_password`: contraseña incorrecta, o la cuenta no tiene.
 * - 401 `invalid_id_token`: el proveedor rechazó el token, o esa cuenta del proveedor no está
 *   ligada a quien llama.
 * - 422 `password_or_social_required`: ni contraseña ni `provider` + `idToken`.
 * Además: 429 de slowapi (`{error, retryAfter}`) y 403 `account_pending_deletion` (reauth no
 * está en lo que una cuenta con borrado pendiente puede llamar).
 */
export type ReauthV2ErrorCode =
  | "invalid_password"
  | "invalid_id_token"
  | "password_or_social_required";

// ────────────────────────────────────────────────────────────────────
// Cliente que llama y puerta de staff (@since 2.21.0)
//
// Contrato de ORCHESTRATION-login §3 #5 y #6, aún sin servir en mini-back al publicar
// 2.21.0.
// ────────────────────────────────────────────────────────────────────

/**
 * @since 2.21.0 — SITIMM-1273 (BE #5). Cabecera con la que el cliente dice quién es. Con
 * ella el BE elige el correo de bienvenida (staff → dashboard, alta web → `/cuenta`, app →
 * app) y, con `dashboard`, aplica la puerta de staff (`STAFF_ONLY_ERROR_CODE`).
 *
 * NO la mandes hasta que SITIMM-1273 esté desplegado en prod: el `allow_headers` de CORS de
 * prod es una lista explícita (mini-back `bootstrap/middleware.py:292-316`) y una cabecera no
 * listada hace fallar el preflight, lo que tumba todo el auth del navegador.
 */
export const SITIMM_CLIENT_HEADER = "X-Sitimm-Client";

/**
 * @since 2.21.0 — SITIMM-1273. Valores de `SITIMM_CLIENT_HEADER`. Sin la cabecera, o con un
 * valor que no sea uno de estos, el BE asume `"app"`: los builds de la app que no la mandan
 * siguen igual.
 */
export type SitimmClient = "web" | "app" | "dashboard";

/**
 * @since 2.21.0 — SITIMM-1274 (BE #6). Código del 403 de la puerta de staff. Con
 * `X-Sitimm-Client: dashboard` y un rol efectivo que no es staff (ver `isStaffUserType` en
 * `users`; un rol vacío o desconocido tampoco lo es), el BE responde 403 `staff_only` ANTES
 * de emitir tokens en /users/login, /users/login-phone, /auth/social (rama autenticada y
 * `requires_setup`) y /auth/setup/verify, y no crea sesiones de alta (`needs_verification`,
 * /auth/social/guest). Sin la cabecera, o con `web`/`app`, nada cambia. Es defensa en
 * profundidad: la protección real sigue siendo `require_permission`.
 * En qué campo del cuerpo llega lo fija el PR del BE de SITIMM-1274, sin mergear al publicar
 * 2.21.0; lo pactado es el estado 403 con este código.
 */
export const STAFF_ONLY_ERROR_CODE = "staff_only";
