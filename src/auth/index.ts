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
