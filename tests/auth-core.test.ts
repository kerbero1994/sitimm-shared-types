import { describe, expect, it } from "vitest";

import { TOKEN_TTL } from "../src/auth";
import type {
  LoginV2Request,
  LoginV2Response,
  LoginV2SetupData,
  LoginV2SuccessData,
  LogoutV2Request,
  RefreshV2Request,
  RefreshV2Response,
  SetupInitV2Request,
  SetupVerifyV2Request,
  SetupVerifyV2Response,
} from "../src/auth";

/**
 * El BE (auth_legacy.py) NO devuelve expiresIn en login/refresh — los TTL
 * son out-of-band. Estas constantes son el único lugar donde el FE puede
 * conocerlos. Cambiarlas sin cambiar mini-back = refresh prematuro o sesión
 * muerta silenciosa.
 */
describe("TOKEN_TTL (contrato out-of-band con mini-back)", () => {
  it("access token dura 30 minutos", () => {
    expect(TOKEN_TTL.ACCESS_SECONDS).toBe(1800);
  });
  it("refresh token dura 7 días", () => {
    expect(TOKEN_TTL.REFRESH_DAYS).toBe(7);
  });
});

describe("Login/Refresh/Logout/Setup V2 shapes (compile-time)", () => {
  it("LoginV2Request usa el campo `pass` (alias Pydantic), no `password`", () => {
    const req: LoginV2Request = { email: "a@b.mx", pass: "secret" };
    expect(req.pass).toBe("secret");
  });

  it("LoginV2Response success trae tokens camelCase sin expiresIn", () => {
    const data: LoginV2SuccessData = {
      accessToken: "jwt",
      refreshToken: "opaque-uuid",
      userType: 63974,
      userUuid: "u-1",
    };
    const res: LoginV2Response = { status: "success", data };
    expect(res.data).toHaveProperty("accessToken");
  });

  it("LoginV2Response setup branch trae setupToken y requiresSetup", () => {
    const data: LoginV2SetupData = {
      setupToken: "jwt-setup",
      requiresSetup: true,
      userType: 63974,
      userUuid: "u-1",
    };
    const res: LoginV2Response = { status: "success", data };
    expect((res.data as LoginV2SetupData).requiresSetup).toBe(true);
  });

  it("Refresh y Logout usan refreshToken en el body", () => {
    const refresh: RefreshV2Request = { refreshToken: "opaque-uuid" };
    const logout: LogoutV2Request = { refreshToken: "opaque-uuid" };
    const refreshRes: RefreshV2Response = {
      status: "success",
      data: { accessToken: "jwt2", refreshToken: "opaque-2", userUuid: "u-1" },
    };
    expect([refresh.refreshToken, logout.refreshToken]).toContain("opaque-uuid");
    expect(refreshRes.data.refreshToken).toBe("opaque-2");
  });

  it("Setup init exige password y al menos un contacto (constraint documentado)", () => {
    const init: SetupInitV2Request = { password: "12345678", email: "a@b.mx" };
    const verify: SetupVerifyV2Request = { otpCode: "123456" };
    const verifyRes: SetupVerifyV2Response = {
      status: "success",
      data: { accessToken: "jwt", refreshToken: "r", userType: 63974, userUuid: "u-1" },
    };
    expect(init.password.length).toBeGreaterThanOrEqual(8);
    expect(verify.otpCode).toHaveLength(6);
    expect(verifyRes.data.userType).toBe(63974);
  });
});
