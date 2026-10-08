import { describe, expect, it } from "vitest";

import type { SocialLoginRequest, SocialLoginResponse } from "../src/auth";

describe("SocialLoginRequest (SITIMM-1055)", () => {
  it("lleva el nombre que Apple da sólo en el primer inicio de sesión", () => {
    const req: SocialLoginRequest = {
      provider: "apple",
      id_token: "eyJhbGciOi.apple",
      givenName: "María José",
      familyName: "López Pérez",
    };
    const google: SocialLoginRequest = { provider: "google", id_token: "eyJhbGciOi.google" };
    expect(req.givenName).toBe("María José");
    expect(google.familyName).toBeUndefined();
  });
});

/**
 * social/verify respondió su último 200 el 2026-06-22 (login redesign PR
 * #100): hoy es un stub 410 GONE. El camino needs_verification ahora puentea
 * al onboarding unificado (session_id = signup_token) o a social/guest.
 */
describe("SocialLoginResponse (contrato post-cutover)", () => {
  it("incluye los campos nuevos del login redesign", () => {
    const res: SocialLoginResponse = {
      status: "needs_verification",
      token: null,
      refreshToken: null,
      user_uuid: null,
      user_type: null,
      session_id: "sess-1",
      social_email: "a@b.mx",
      social_name: "Ana",
      needsContactUpdate: null,
      contactUpdateReason: null,
      isFirstLogin: true,
      googlePhotoUrl: "https://lh3.example/photo.jpg",
    };
    expect(res.isFirstLogin).toBe(true);
    expect(res.googlePhotoUrl).toContain("https://");
  });
});
