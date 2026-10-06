import { describe, expect, it } from "vitest";

import type {
  ContactCodeSentV2Response,
  ContactConfirmIdentityV2Request,
  ContactConfirmNewV2Request,
  ContactInitV2Request,
  ContactUpdatedV2Response,
} from "../src/auth";

/**
 * Cambio de correo o teléfono con OTP (SITIMM-937/959), congelado contra
 * mini-back `auth_contact.py`: tres pasos y dos códigos, el de identidad y el
 * del valor nuevo. Los campos van en camelCase, como los manda el backend.
 */
describe("contrato de cambio de contacto", () => {
  it("init → identidad por el otro canal → valor nuevo", () => {
    const init: ContactInitV2Request = { field: "email", newValue: "nuevo@gmail.com" };
    // Cuenta sólo-teléfono: el código de identidad sale por WhatsApp.
    const sent: ContactCodeSentV2Response = { message: "…", contactMethod: "phone" };
    const identity: ContactConfirmIdentityV2Request = {
      otpCode: "123456",
      newValue: init.newValue,
    };
    const confirm: ContactConfirmNewV2Request = { otpCode: "654321" };
    const done: ContactUpdatedV2Response = { message: "…", updatedField: "email" };

    expect(sent.contactMethod).toBe("phone");
    expect(identity.newValue).toBe(init.newValue);
    expect(confirm.otpCode).toHaveLength(6);
    expect(done.updatedField).toBe(init.field);
  });
});
