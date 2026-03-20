/**
 * Company and employee types.
 *
 * Backend equivalents:
 * - Company        -> app/presentation/schemas/company.py :: CompanyResponse
 * - Employee       -> app/presentation/schemas/employee.py :: EmployeeResponse
 * - CompanyDetails -> company.py + statistics aggregation
 */

import type { BaseEntity } from "../common";

export interface Company extends BaseEntity {
  name: string;
  phone?: string;
  address?: string;
  rfc?: string;
  hasCommittee?: boolean;
  cityUuid?: string;
  stateUuid?: string;
  country?: string;
  industrialPark?: string;
  acceptanceDate?: string;
  collectiveContractUrl?: string;
}

export interface Employee extends BaseEntity {
  name: string;
  payroll?: string;
  job?: string;
  daySalary?: number;
  gender?: "M" | "F";
  birth_date?: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  address?: string;
  entry?: string;
  email?: string;
  phone?: string;
  CompanyId?: number;
}

export interface CompanyStatistics {
  noOfEmployees: number;
  meanWage?: number;
  meanAge?: number;
  maxWage?: number;
  minWage?: number;
  percentOfMen: number;
  noOfMen: number;
  percentOfWomen: number;
  noOfWomen: number;
  totalCensus?: number;
  lastCensusDate?: string;
  activeAdvisors?: number;
  noWithoutGender?: number;
  medianWage?: number;
  avgTenureMonths?: number;
}

export interface TechnicalDetail {
  uuid: string;
  contract?: string;
  delegates?: number;
  commissioners?: number;
  secretaries?: number;
  manager?: string;
  productionManager?: string;
  product?: string;
  operationStart?: string;
  clients?: string;
  lastRevision?: string;
}

export interface Benefit {
  uuid: string;
  christmasBox?: string;
  holydayBonus?: string;
  savingFund?: string;
  utilities?: string;
  vouchers?: string;
  attendanceBonus?: string;
  lunchBonus?: string;
  transportBonus?: string;
  other?: string;
}

export type CompanyContactType =
  | "ADVISOR"
  | "RH"
  | "RH_SECONDARY"
  | "GENERAL_MANAGER"
  | "PRODUCTION_MANAGER"
  | "OTHER";

export interface CompanyContact {
  id: number;
  contactType: CompanyContactType;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface DataQuality {
  rfc: number | null;
  curp: number | null;
  nss: number | null;
  address: number | null;
  salary: number | null;
  entry: number | null;
}

export interface CensusHistoryEntry {
  year: number;
  quarter: number;
  total: number;
  menCount: number;
  womenCount: number;
  complianceLevel: number;
  accuracyScore?: number;
  createdAt: string;
}

export interface CompanyDetailsResponse {
  company: Company & {
    latitude?: number | null;
    longitude?: number | null;
    cityName?: string;
    stateName?: string;
    companyTypeName?: string;
    economicActivityName?: string;
    headquarterName?: string;
  };
  statistics?: CompanyStatistics;
  advisors?: Array<{
    Uuid: string;
    email: string;
    UserProfile: {
      name: string;
      lastNames: string;
      mobilePhone?: string;
      charge?: string;
    };
  }>;
  contacts?: CompanyContact[];
  technicalDetail?: TechnicalDetail;
  benefit?: Benefit;
  topJobs?: Array<{ job: string; count: number }>;
  dataQuality?: DataQuality;
  censusHistory?: CensusHistoryEntry[];
}
