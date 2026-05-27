/**
 * Ask (chatbot RAG) types.
 *
 * Backend: `app/presentation/schemas/ask.py` +
 * `app/application/services/ask/system_prompts.py` (mini-back).
 *
 * The Ask surface is V1-only — there is no V2 router today. It powers the
 * public chatbot endpoint used by `sitimmApp` and `Sitimm-web`:
 *
 *   POST /api/v1/ask         → AskRequest → AskResponse
 *   POST /api/v1/ask/stream  → AskRequest → SSE (chunk + done events)
 *   POST /api/chat           → LegacyChatRequest → AskResponse  (legacy shim)
 *
 * Wire conventions:
 * - Pydantic uses snake_case for most fields, but the public Ask schema
 *   keeps `userType` in camelCase to match the original sitimm-api-proxy
 *   contract — TS mirrors that exactly.
 * - Public endpoints; no JWT. Optional `x-sitimm-key` header for service-
 *   to-service auth and per-key rate limits.
 * - Errors come back as `{ detail: string }` or
 *   `{ detail: { error: string, code: string } }` (profanity block).
 */

// ─────────────────────────────────────────────────────────────────────
// Constants + literal unions
// ─────────────────────────────────────────────────────────────────────

/**
 * Languages accepted by the Ask system prompt and canonical knowledge.
 * Backend: `SUPPORTED_LANGUAGES` in
 * `app/application/services/ask/system_prompts.py`.
 *
 * The server normalises any unsupported / missing value to `"es"`.
 */
export const ASK_SUPPORTED_LANGUAGES = [
  "es",
  "en",
  "zh",
  "ko",
  "ja",
  "hi",
  "fr",
  "de",
] as const;
export type AskSupportedLanguage = (typeof ASK_SUPPORTED_LANGUAGES)[number];

/**
 * Caller-type bucket. Used by the moderation strike store to apply a
 * stricter / softer strike budget — `guest` carries the tightest budget,
 * `advisor` the loosest. The Ask schema literal is intentionally kept
 * separate from the broader user-role enum (auth/users module) so the
 * two surfaces can evolve independently.
 */
export const ASK_USER_TYPES = ["guest", "affiliate", "advisor"] as const;
export type AskUserType = (typeof ASK_USER_TYPES)[number];

/**
 * Which layer produced the answer. The orchestrator additionally tracks
 * `"cache"` internally, but the wire format always reports the original
 * `source` (a cached canonical answer reports `"canonical"`, not
 * `"cache"`).
 */
export const ASK_SOURCES = [
  "canonical",
  "rag",
  "fallback",
  "greeting",
] as const;
export type AskSource = (typeof ASK_SOURCES)[number];

/**
 * Role kinds accepted on the legacy `POST /api/chat` shim.
 */
export const ASK_LEGACY_CHAT_ROLES = ["user", "assistant", "system"] as const;
export type AskLegacyChatRole = (typeof ASK_LEGACY_CHAT_ROLES)[number];

// ─────────────────────────────────────────────────────────────────────
// Request / response shapes
// ─────────────────────────────────────────────────────────────────────

/**
 * `POST /api/v1/ask` and `POST /api/v1/ask/stream` request body.
 * Backend: `AskRequest` in `app/presentation/schemas/ask.py`.
 *
 * Both `lang` and `lng` are accepted — `lng` was shipped by an older
 * mobile build. The server normalises `lang ?? lng` to a supported code
 * and rewrites the body so downstream services only see `lang`.
 */
export interface AskRequest {
  /** User question. 1..2000 chars; trimmed and truncated server-side. */
  q: string;
  /** Preferred language. Server falls back to `"es"` when unknown / null. */
  lang?: AskSupportedLanguage | null;
  /** Legacy alias for `lang`. Prefer `lang` on new clients. */
  lng?: AskSupportedLanguage | null;
  /** Caller bucket. Defaults to `"guest"` server-side when omitted. */
  userType?: AskUserType;
}

/**
 * `POST /api/v1/ask` and `POST /api/chat` success body.
 * Backend: `AskResponse`.
 *
 * Response headers carry `X-Cache: HIT | MISS` and (on `/api/chat` only)
 * `X-API-Version: legacy`. Headers are not modelled here.
 */
export interface AskResponse {
  answer: string;
  source: AskSource;
}

/**
 * One message in the legacy `/api/chat` payload. The server picks the most
 * recent `role: "user"` message as the question for the pipeline.
 * Backend: `_LegacyChatMessage`.
 */
export interface AskLegacyChatMessage {
  role: AskLegacyChatRole;
  content: string;
}

/**
 * `POST /api/chat` legacy request body.
 * Backend: `LegacyChatRequest`.
 */
export interface AskLegacyChatRequest {
  /** At least one message required. */
  messages: AskLegacyChatMessage[];
  /** Optional language; same `lang ?? lng` normalisation rules apply. */
  lang?: AskSupportedLanguage | null;
  lng?: AskSupportedLanguage | null;
}

// ─────────────────────────────────────────────────────────────────────
// Server-Sent Events (`POST /api/v1/ask/stream`)
// ─────────────────────────────────────────────────────────────────────

/**
 * SSE chunk event — one piece of streamed answer text.
 *
 * Canonical / cached / greeting answers arrive as a single `chunk` event
 * followed by `done`. RAG answers stream token-by-token: many chunks
 * then a single terminal `done`.
 */
export interface AskStreamChunkEvent {
  type: "chunk";
  content: string;
  source: AskSource;
}

/**
 * SSE terminal event. Exactly one is emitted per stream. The `source`
 * field reports the answer's final layer; FE uses this to log analytics
 * and decide whether to show "powered by AI" footer (only for `"rag"`).
 */
export interface AskStreamDoneEvent {
  type: "done";
  source: AskSource;
}

/**
 * Tagged-union of every SSE event payload the stream emits. Each event
 * arrives as a JSON payload on its own `data:` line:
 *
 * ```
 * data: { "type": "chunk", "content": "...", "source": "rag" }
 *
 * data: { "type": "done", "source": "rag" }
 * ```
 */
export type AskStreamEvent = AskStreamChunkEvent | AskStreamDoneEvent;
