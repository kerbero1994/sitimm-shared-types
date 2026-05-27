/**
 * Ask (chatbot RAG) endpoint paths.
 *
 * Backend: `app/presentation/api/v1/ask.py` (mini-back). All three routes
 * are V1-only — there is no `/api/v2/ask` surface today.
 *
 * Auth: public. Optional `x-sitimm-key` header for service-to-service
 * traffic raises the per-key rate limit ceiling.
 */

export const ASK_ENDPOINTS = {
  /** POST → Body: AskRequest. Returns AskResponse. Status 200. Public. */
  ASK: "/api/v1/ask",
  /** POST → Body: AskRequest. Returns text/event-stream (AskStreamEvent). Status 200. Public. */
  ASK_STREAM: "/api/v1/ask/stream",
  /** POST → Body: AskLegacyChatRequest. Returns AskResponse. Status 200. Public (legacy shim). */
  LEGACY_CHAT: "/api/chat",
} as const;

export type AskEndpointKey = keyof typeof ASK_ENDPOINTS;
export type AskEndpoint = (typeof ASK_ENDPOINTS)[AskEndpointKey];
