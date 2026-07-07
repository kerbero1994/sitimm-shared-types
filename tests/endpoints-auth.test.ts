import { describe, expect, it } from "vitest";

import { V2_ENDPOINTS } from "../src/endpoints";

/**
 * Paths relativos (sin /api/v2) — los consumidores agregan el prefijo vía su
 * base URL / smart routing. Congelados contra los routers reales de mini-back
 * (auth_legacy.py, auth_setup.py, social_auth.py, auth_reset_v2.py).
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
  ] as const)("%s = %s", (key, path) => {
    expect(V2_ENDPOINTS[key]).toBe(path);
  });
});
