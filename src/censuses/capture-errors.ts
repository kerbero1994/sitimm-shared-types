/**
 * SITIMM-383 — Census capture-error contract (mini-back ↔ frontends).
 *
 * Backend sources:
 *  - Preview: `CensusValidationPreviewResponse.capture_errors` (snake_case) —
 *    shown to the human BEFORE submit so they can react to every problem.
 *  - Census detail: `show_census` → `census.captureErrors` (camelCase) —
 *    persisted on confirm and permanently visible on the company's censuses.
 *
 * Both carry the same `CaptureErrors` payload.
 */

/** One capture problem, anchored to the source file. */
export interface CaptureErrorItem {
  /** Rule code, e.g. "salary_scale_weekly_suspect", "curp_checkdigit_invalid". */
  codigo: string;
  /** Human field/column name: "salario" | "curp" | "identidad" | "general" | ... */
  columna: string;
  /** Source-file row number (1-based; null when not row-anchored). */
  fila: number | null;
  /** Employee name as captured (may be ""). */
  nombre: string;
  /** Optional human detail message. */
  detalle: string | null;
}

/** Consolidated capture-problem list for one census run. */
export interface CaptureErrors {
  /** FULL problem count (the list below may be capped). */
  total: number;
  /** True when `items` was truncated (cap 800). */
  truncated: boolean;
  items: CaptureErrorItem[];
}
