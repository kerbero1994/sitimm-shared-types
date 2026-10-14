/**
 * Fixture de tests/login-contracts.test.ts: la compila tsc, no vitest. Cada payload tiene la
 * forma exacta que arma mini-back origin/main @ 3ac62753; los @ts-expect-error fijan los
 * casings que confunden a los consumidores. Si un negativo deja de fallar, tsc avisa.
 */
import type {
  EmployeeClaimV2ErrorCode,
  EmployeeClaimV2Request,
  EmployeeClaimV2Response,
  GuestSignupV2Response,
  ReauthSocialV2Request,
  ReauthV2Request,
  ReauthV2Response,
  SignupOtpV2Request,
  SignupOtpV2Response,
  SignupOtpVerifyV2Response,
  SitimmClient,
  SocialAccountListResponse,
  SocialLoginRequest,
} from "../../src/auth";
import type { V2Response } from "../../src/common";
import type { DeleteAccountV2Response, RestoreAccountV2Response } from "../../src/users";

// auth_signup.py :: otp_request · otp_verify · employee_claim (_issue_tokens) · guest_signup
export const otpReq: SignupOtpV2Request = { channel: "whatsapp", target: "33 1234 5678" };
export const otpRes: V2Response<SignupOtpV2Response> = {
  status: "success",
  data: { session_id: "s", channel_used: "whatsapp", expires_in: 300 },
};
export const verifyRes: V2Response<SignupOtpVerifyV2Response> = {
  status: "success",
  data: { signup_token: "t", verified_target: "+523312345678", channel: "whatsapp", expires_in: 900 },
};
export const claimReq: EmployeeClaimV2Request = { claim_token: "c", accept_legal: true, password: "Abcdef12", phone: null };
export const claimRes: V2Response<EmployeeClaimV2Response> = {
  status: "success",
  data: { token: "a", refresh_token: "r", user_uuid: "u", user_type: 63974, company_name: "ACME" },
};
export const guestRes: V2Response<GuestSignupV2Response> = {
  status: "success",
  data: { status: "authenticated", token: "a", refresh_token: "r", user_uuid: "u", user_type: 41726 },
};
export const claimCode: EmployeeClaimV2ErrorCode = "email_already_registered";

// auth_reauth_v2.py :: ReauthRequest · reauth
export const reauthPassword: ReauthV2Request = { password: "x" };
export const reauthSocial: ReauthV2Request = { provider: "apple", idToken: "tok", nonce: "raw" };
export const reauthRes: V2Response<ReauthV2Response> = { status: "success", data: { reauthToken: "j", expiresIn: 300 } };

// users_v2.py :: delete_me · restore_me — social_auth.py :: list_social_accounts · /auth/social
export const deleteRes: V2Response<DeleteAccountV2Response> = { status: "success", data: { purgeAfter: null } };
export const restoreRes: V2Response<RestoreAccountV2Response> = { status: "success", data: { accountStatus: "active" } };
export const accounts: SocialAccountListResponse = { accounts: [], hasPassword: false };
export const social: SocialLoginRequest = { provider: "google", id_token: "0123456789", nonce: "raw" };
export const client: SitimmClient = "dashboard";

// Negativos: cada línea DEBE fallar.
// @ts-expect-error user_type es número en el wire, no string
export const n1: EmployeeClaimV2Response = { token: "a", refresh_token: "r", user_uuid: "u", user_type: "63974", company_name: "x" };
// @ts-expect-error en claim y guest es refresh_token (snake_case), no refreshToken
export const n2: GuestSignupV2Response = { status: "authenticated", token: "a", refreshToken: "r", user_uuid: "u", user_type: 41726 };
// @ts-expect-error hasPassword es obligatorio
export const n3: SocialAccountListResponse = { accounts: [] };
// @ts-expect-error el reauth social lleva idToken, no id_token
export const n4: ReauthSocialV2Request = { provider: "google", id_token: "t" };
// @ts-expect-error cliente desconocido
export const n5: SitimmClient = "admin";
