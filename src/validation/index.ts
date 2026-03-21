/**
 * Validation patterns for Mexican identity and contact fields.
 *
 * Backend equivalents:
 * - RFC     -> app/domain/value_objects/rfc.py
 * - CURP    -> app/domain/value_objects/curp.py
 * - Phone   -> app/shared/utils/data_normalizer.py
 *
 * These regex patterns are the shared source of truth.
 * Frontend Zod schemas should reference these instead of hardcoding.
 */

/** RFC (Registro Federal de Contribuyentes) -- 12 or 13 chars */
export const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

/** CURP (Clave Unica de Registro de Poblacion) -- 18 alphanumeric chars */
export const CURP_PATTERN = /^[A-Z0-9]{18}$/;

/** Mexican phone number -- exactly 10 digits */
export const PHONE_MX_PATTERN = /^\d{10}$/;

/** International phone -- allows +, digits, spaces, hyphens, parens */
export const PHONE_INTL_PATTERN = /^\+?[\d\s\-()]+$/;

/** Mexican postal code -- exactly 5 digits */
export const POSTAL_CODE_MX_PATTERN = /^\d{5}$/;

/** Minimum phone digits after stripping non-numeric chars */
export const MIN_PHONE_DIGITS = 7;

/** Strip non-digit characters from a phone string */
export const cleanDigits = (value: string): string => value.replace(/\D/g, "");

// -- Field length constraints --

export const FIELD_LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  FULL_NAME_MIN: 3,
  FULL_NAME_MAX: 120,
  EMAIL_MAX: 100,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 100,
  DESCRIPTION_MAX: 2000,
  ADDRESS_MAX: 300,
  STREET_MAX: 200,
  COLONIA_MAX: 120,
  CITY_MAX: 100,
  COMPANY_NAME_MAX: 200,
  AGE_MIN: 15,
  AGE_MAX: 120,
} as const;

// -- Mexican catalog enums --

export const MARITAL_STATUS = [
  "soltero",
  "casado",
  "union_libre",
  "divorciado",
  "viudo",
] as const;

export type MaritalStatus = (typeof MARITAL_STATUS)[number];

export const EDUCATION_LEVEL = [
  "primaria",
  "secundaria",
  "preparatoria",
  "universidad",
  "posgrado",
  "otro",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVEL)[number];
