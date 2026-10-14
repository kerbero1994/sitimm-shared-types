import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS } from "../src/endpoints";

/**
 * Paths relativos (sin /api/v2) — los consumidores agregan el prefijo vía su
 * base URL / smart routing. Congelados contra los routers reales de mini-back
 * (auth_legacy.py, auth_setup.py, social_auth.py, auth_reset_v2.py, auth_contact.py).
 */
describe("V2_ENDPOINTS auth (contrato post-cutover 9e3a4255)", () => {
  it.each([
    ["AUTH_LOGIN", "/users/login"],
    ["AUTH_LOGIN_PHONE", "/users/login-phone"],
    ["AUTH_REFRESH", "/users/refresh"],
    ["AUTH_LOGOUT", "/users/logout"],
    ["AUTH_SETUP", "/auth/setup"],
    ["AUTH_SETUP_VERIFY", "/auth/setup/verify"],
    ["AUTH_FORGOT_PASSWORD", "/auth/forgot-password"],
    ["AUTH_VERIFY_RESET", "/auth/verify-reset"],
    ["AUTH_RESET_PASSWORD", "/auth/reset-password"],
    ["AUTH_SOCIAL_LOGIN", "/auth/social"],
    ["AUTH_SOCIAL_GUEST", "/auth/social/guest"],
    ["AUTH_SOCIAL_ACCOUNTS", "/auth/social/accounts"],
    ["AUTH_CONTACT_INIT", "/auth/contact/init"],
    ["AUTH_CONTACT_CONFIRM_IDENTITY", "/auth/contact/confirm-identity"],
    ["AUTH_CONTACT_CONFIRM_NEW", "/auth/contact/confirm-new"],
    // SITIMM-1277: auth_signup.py, auth_reauth_v2.py, users_v2.py
    ["AUTH_OTP_REQUEST", "/auth/otp/request"],
    ["AUTH_OTP_VERIFY", "/auth/otp/verify"],
    ["AUTH_EMPLOYEE_CLAIM", "/auth/employee/claim"],
    ["AUTH_GUEST", "/auth/guest"],
    ["AUTH_REAUTH", "/auth/reauth"],
    ["USERS_ME_DELETE", "/users/me"],
    ["USERS_ME_RESTORE", "/users/me/restore"],
  ] as const)("%s = %s", (key, path) => {
    expect(V2_ENDPOINTS[key]).toBe(path);
  });
});
