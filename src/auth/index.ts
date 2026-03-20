/**
 * Authentication types for the dual-backend auth system.
 *
 * Used by: new_dashboard (Shell -> Remotes), sitimmApp (V2 auth)
 * Backend: mini-back JWT system (app/shared/auth/jwt_service.py)
 */

/** Per-backend token payload emitted to each remote */
export interface AuthPayload {
  token: string;
  userUuid: string;
  userType: string;
  /** "v1" | "v2" — which backend this token authenticates against */
  backend: "v1" | "v2";
  email?: string;
  companies?: Array<{ uuid: string; name: string; [key: string]: unknown }>;
  userProfile?: Record<string, unknown> | null;
}

/** V2-specific token data (refresh token system) */
export interface V2TokenData {
  accessToken: string;
  refreshToken: string;
  /** seconds until access token expires */
  expiresIn: number;
}

/** Dual auth result stored in shell after login */
export interface DualAuthPayload {
  userUuid: string;
  userType: string;
  email: string;
  companies: Array<{ uuid: string; name: string; [key: string]: unknown }>;
  userProfile: Record<string, unknown> | null;
  v1Token: string | null;
  v2Token: string | null;
  v2RefreshToken: string | null;
  v2ExpiresAt: number | null;
  primaryBackend: "v1" | "v2";
}

/** Events the shell emits on `window` */
export type AuthEventType = "auth:login" | "auth:refresh" | "auth:logout";

/** CustomEvent<AuthPayload> for login and refresh; no detail for logout */
export type AuthEvent = CustomEvent<AuthPayload | null>;

/** Login request to V2 backend */
export interface LoginV2Request {
  email: string;
  password: string;
}

/** Login response from V2 backend */
export interface LoginV2Response {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    uuid: string;
    email: string;
    user_type: number;
    first_name: string;
    last_name: string;
  };
}

/** Menu item descriptor — shell menu config (dashboard only) */
export interface MenuItem {
  id: string;
  label: string;
  labelKey: string;
  icon: string;
  remote: "v1" | "v2";
  path: string;
  roles?: number[];
  devOnly?: boolean;
}
