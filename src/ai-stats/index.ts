/**
 * AI Statistics — API contract types for /api/statistics/ai/*.
 *
 * Covers the natural-language→SQL admin feature exposed in the dashboard
 * and the mobile app. All field names mirror the Pydantic/FastAPI response
 * shape exactly (snake_case); do not add camelCase variants here — the
 * backend is the source of truth and returns snake_case for this slice.
 */

// =============================================================================
// Health check — GET /api/statistics/ai/health
// =============================================================================

export interface AIHealthResponse {
  status: "healthy" | "misconfigured";
  ai_provider: string;
  model: string;
  api_key_configured: boolean;
  cache_stats: {
    cached_queries: number;
    cache_keys: string[];
  };
}

// =============================================================================
// Natural-language query — POST /api/statistics/ai/query
// =============================================================================

export interface AIQueryRequest {
  /** Natural language question; backend enforces 5–2000 chars. */
  query: string;
}

export interface AIQueryMetrics {
  generation_time_ms: number;
  execution_time_ms?: number;
  total_time_ms?: number;
  row_count?: number;
  status:
    | "success"
    | "error"
    | "forbidden"
    | "validation_failed"
    | "execution_error";
}

export type VisualizationType =
  | "table"
  | "bar_chart"
  | "pie_chart"
  | "line_chart"
  | "histogram"
  | null;

export interface AIQueryResponse {
  success: boolean;
  data: Record<string, unknown>[] | null;
  row_count: number;
  sql_executed: string;
  explanation: string;
  visualization: VisualizationType;
  source: "ai_generated" | "cached" | "error";
  error: string | null;
  metrics: AIQueryMetrics;
}

// =============================================================================
// Generate SQL only — POST /api/statistics/ai/generate-sql
// =============================================================================

export interface AIGenerateSQLRequest {
  query: string;
}

export interface AIGenerateSQLResponse {
  success: boolean;
  sql: string;
  explanation: string;
  visualization: VisualizationType;
  source: string;
  error: string | null;
  generation_time_ms: number;
}

// =============================================================================
// Example prompt catalogue — GET /api/statistics/ai/examples
// =============================================================================

export interface AIExampleCategory {
  category: string;
  queries: string[];
}

export interface AIExamplesResponse {
  examples: AIExampleCategory[];
}
