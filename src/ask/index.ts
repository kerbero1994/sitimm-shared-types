/**
 * Ask (chatbot RAG) — barrel re-export.
 *
 * Public chatbot endpoints (V1-only, no V2 router today). Backed by an
 * OpenAI file-search RAG pipeline with canonical-answer overrides,
 * greeting interception, per-IP / per-key rate limits, and profanity
 * moderation.
 *
 * ```ts
 * import { AskRequest, ASK_ENDPOINTS } from "@kerbero1994/shared-types";
 * // or
 * import * as Ask from "@kerbero1994/shared-types/ask";
 * ```
 */

export * from "./types";
export * from "./endpoints";
