import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { COMPANY_NOTIFICATIONS_ENDPOINTS, MAX_COMPANIES_PER_SEND } from "../src/notificationsContent";
import { history, preview, previewRequest, sendRequest, sendResponse } from "./fixtures/company-notifications-contract";

/** Las llaves de cable (alias) de `company_notifications_v2.py` en mini-back `efb85505`, en orden. */
const BE_KEYS = {
  previewRequest: ["companyUuids"],
  sendRequest: ["companyUuids", "idempotencyKey", "title", "body"],
  audience: ["uuid", "name", "people"],
  preview: ["companies", "companyCount", "totalPeople"],
  result: ["companyUuid", "companyName", "status", "messageId", "code", "reason"],
  sendResponse: ["uuid", "createdAt", "sent", "failed", "pending", "results"],
  historyItem: ["uuid", "title", "body", "actor", "createdAt", "sent", "failed", "pending", "results"],
  history: ["items", "total", "page", "pageSize", "hasNext"],
};

/**
 * Vitest transpila sin chequear tipos, así que la fixture del aviso a empresas (SITIMM-1537) la
 * compila tsc: un campo mal escrito o un negativo que deja de fallar la rompe.
 */
describe("aviso a empresas por su canal (SITIMM-1537)", () => {
  it("la fixture compila sin diagnósticos", () => {
    const program = ts.createProgram([resolve(__dirname, "fixtures/company-notifications-contract.ts")], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
    expect(diagnostics).toEqual([]);
  });

  it("cada forma tiene las llaves del BE, ni una más ni una menos", () => {
    expect(Object.keys(previewRequest)).toEqual(BE_KEYS.previewRequest);
    expect(Object.keys(sendRequest)).toEqual(BE_KEYS.sendRequest);
    expect(Object.keys(preview.companies[0])).toEqual(BE_KEYS.audience);
    expect(Object.keys(preview)).toEqual(BE_KEYS.preview);
    for (const r of [...sendResponse.results, ...history.items[1].results]) {
      expect(Object.keys(r)).toEqual(BE_KEYS.result);
    }
    expect(Object.keys(sendResponse)).toEqual(BE_KEYS.sendResponse);
    for (const item of history.items) expect(Object.keys(item)).toEqual(BE_KEYS.historyItem);
    expect(Object.keys(history)).toEqual(BE_KEYS.history);
  });

  it("los conteos cuadran con las filas", () => {
    expect(preview.totalPeople).toBe(preview.companies.reduce((n, c) => n + c.people, 0));
    expect(preview.companyCount).toBe(preview.companies.length);
    for (const s of [sendResponse, ...history.items]) {
      for (const status of ["sent", "failed", "pending"] as const) {
        expect(s[status]).toBe(s.results.filter((r) => r.status === status).length);
      }
    }
  });

  it("un enviado trae id de FCM y no código; un fallido, código y no id; un pendiente, ninguno", () => {
    for (const r of [...sendResponse.results, ...history.items[1].results]) {
      expect(r.messageId !== null).toBe(r.status === "sent");
      expect(r.code !== null).toBe(r.status === "failed");
    }
  });

  it("las rutas y el tope son los del BE", () => {
    expect(COMPANY_NOTIFICATIONS_ENDPOINTS).toEqual({
      PREVIEW: "/api/v2/notifications/companies/preview",
      SEND: "/api/v2/notifications/companies/send",
      HISTORY: "/api/v2/notifications/companies/history",
    });
    expect(MAX_COMPANIES_PER_SEND).toBe(50);
  });
});
