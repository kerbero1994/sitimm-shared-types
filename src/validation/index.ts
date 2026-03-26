/**
 * Validation patterns for Mexican identity and contact fields.
 *
 * Backend equivalents:
 * - RFC     -> app/domain/value_objects/rfc.py
 * - CURP    -> app/domain/value_objects/curp.py
 * - Phone   -> app/shared/utils/data_normalizer.py
 *
 * These regex patterns are the shared source of truth.
 * Frontend Zod/Yup schemas should reference these instead of hardcoding.
 *
 * @example
 * ```ts
 * import { RFC_PATTERN, CURP_PATTERN, PHONE_MX_PATTERN } from "@kerbero1994/shared-types/validation";
 *
 * const isValidRfc = RFC_PATTERN.test(value);
 * const isValidCurp = CURP_PATTERN.test(value);
 * const cleanPhone = cleanDigits(rawPhone);
 * const isValidPhone = PHONE_MX_PATTERN.test(cleanPhone);
 * ```
 */

/**
 * RFC (Registro Federal de Contribuyentes) — Mexican tax ID.
 * 3–4 uppercase letters + 6 digits + 3 alphanumeric check chars.
 * Total: 12 chars (persona moral) or 13 chars (persona fisica).
 *
 * @example "PEGJ900515ABC" (13 chars, persona fisica)
 */
export const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2}[0-9A]$/;

/**
 * CURP (Clave Unica de Registro de Poblacion) — Mexican national ID.
 * Exactly 18 uppercase alphanumeric characters.
 *
 * @example "PEGJ900515HJCRNS09"
 */
export const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

/**
 * Mexican phone number — exactly 10 digits (no country code, no separators).
 * Apply `cleanDigits()` first to strip formatting.
 *
 * @example "3312345678"
 */
export const PHONE_MX_PATTERN = /^\d{10}$/;

/**
 * International phone — allows +, digits, spaces, hyphens, and parentheses.
 * More permissive than PHONE_MX_PATTERN for international numbers.
 *
 * @example "+52 (33) 1234-5678"
 */
export const PHONE_INTL_PATTERN = /^\+?[\d\s\-()]+$/;

/**
 * Mexican postal code — exactly 5 digits.
 *
 * @example "44100"
 */
export const POSTAL_CODE_MX_PATTERN = /^\d{5}$/;

/**
 * Minimum number of digits required in a phone number after stripping non-numeric chars.
 * Used as a sanity check before applying PHONE_MX_PATTERN or PHONE_INTL_PATTERN.
 */
export const MIN_PHONE_DIGITS = 7;

/**
 * Strip all non-digit characters from a string.
 * Use before validating phone numbers with PHONE_MX_PATTERN.
 *
 * @example cleanDigits("+52 (33) 1234-5678") → "523312345678"
 */
export const cleanDigits = (value: string): string => value.replace(/\D/g, "");

// -- Field length constraints --

/**
 * Field length limits used across validation schemas.
 * Backend: Pydantic Field(min_length=..., max_length=...) constraints.
 *
 * Use these in Zod/Yup schemas instead of hardcoding numbers:
 * ```ts
 * z.string().min(FIELD_LIMITS.NAME_MIN).max(FIELD_LIMITS.NAME_MAX)
 * ```
 */
export const FIELD_LIMITS = {
  /** Minimum characters for a first/last name. */
  NAME_MIN: 1,
  /** Maximum characters for a first/last name. */
  NAME_MAX: 100,
  /** Minimum characters for a full name (first + last). */
  FULL_NAME_MIN: 3,
  /** Maximum characters for a full name. */
  FULL_NAME_MAX: 120,
  /** Maximum characters for an email address. */
  EMAIL_MAX: 100,
  /** Minimum password length. Backend: min_length=6. */
  PASSWORD_MIN: 6,
  /** Maximum password length. Backend: max_length=100. */
  PASSWORD_MAX: 100,
  /** Maximum characters for a general description field. Backend: max_length=2000. */
  DESCRIPTION_MAX: 2000,
  /** Maximum characters for a full address. */
  ADDRESS_MAX: 300,
  /** Maximum characters for a street name. */
  STREET_MAX: 200,
  /** Maximum characters for a neighborhood (colonia) name. */
  COLONIA_MAX: 120,
  /** Maximum characters for a city name. */
  CITY_MAX: 100,
  /** Maximum characters for a company name. Backend: max_length=200. */
  COMPANY_NAME_MAX: 200,
  /** Minimum valid age in years (for date-of-birth validation). Backend: 14 years. */
  AGE_MIN: 14,
  /** Maximum valid age in years (for date-of-birth validation). Backend: 110 years. */
  AGE_MAX: 110,
} as const;

// -- Mexican catalog enums --

/**
 * Marital status options matching backend catalog.
 * Used in profile forms for civilStateId selection.
 */
export const MARITAL_STATUS = [
  "soltero",
  "casado",
  "union_libre",
  "divorciado",
  "viudo",
] as const;

export type MaritalStatus = (typeof MARITAL_STATUS)[number];

/**
 * Education level options matching backend catalog.
 * Used in profile forms for scholarshipId selection.
 */
export const EDUCATION_LEVEL = [
  "primaria",
  "secundaria",
  "preparatoria",
  "universidad",
  "posgrado",
  "otro",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVEL)[number];
