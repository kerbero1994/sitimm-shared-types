/**
 * Fixture de tests/census-history-contract.test.ts: la compila tsc, no vitest. El payload tiene la
 * forma exacta que arma mini-back origin/main @ 6b562500 (users_census_history_v2.py ::
 * _census_history, datos sintéticos); los @ts-expect-error fijan lo que no viaja.
 */
import type { V2Response } from "../../src/common";
import type { CensusHistoryEntry } from "../../src";
import type { UserCensusHistoryData, UserCensusHistoryEntry } from "../../src/users";

export const history: V2Response<UserCensusHistoryData> = {
  status: "success",
  data: {
    User: {
      Employees: [
        {
          Company: { name: "EMPRESA EJEMPLO S.A. DE C.V." },
          createdAt: "2026-03-04T00:00:00",
          censusId: 3,
          censusUuid: "0b9c3c1e-5a52-4d6b-9a77-3f0d2f7b9e11",
          year: 2026,
          quarter: 1,
          totalEmployees: 125,
          payroll: "N-1",
          job: "Operador",
          daySalary: "315.81",
          entry: "2023-06-01T00:00:00",
          address: null,
        },
        {
          Company: { name: null },
          createdAt: null,
          censusId: 2,
          censusUuid: null,
          year: null,
          quarter: null,
          totalEmployees: null,
          payroll: null,
          job: null,
          daySalary: null,
          entry: null,
          address: null,
        },
      ],
    },
  },
};

// An employee row with no account: no history.
export const empty: UserCensusHistoryData = { User: { Employees: [] } };

// The census file is a pointer to the whole census: it does not come out (SITIMM-1472, review round 1).
// @ts-expect-error fileUrl is not part of the entry
export const withFile: UserCensusHistoryEntry = { ...history.data.User.Employees[0], fileUrl: "staging/abc123" };

// The salary is a decimal as a string, never a number.
// @ts-expect-error daySalary is a string
export const numericSalary: UserCensusHistoryEntry = { ...history.data.User.Employees[0], daySalary: 315.81 };

// The root `CensusHistoryEntry` is still the company's census trend, not this one.
// @ts-expect-error a person's entry is not a company trend point
export const notTheCompanyOne: CensusHistoryEntry = history.data.User.Employees[0];
