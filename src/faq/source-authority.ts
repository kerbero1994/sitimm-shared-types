/**
 * Authority backing the FAQ article — drives footer "Fuente" rendering
 * and `last_reviewed_at` semantics.
 *
 * Backend: app/infrastructure/database/models/faq_article.py SOURCE_AUTHORITY_VALUES
 */
export const FAQ_SOURCE_AUTHORITIES = [
  "official_imss",
  "official_infonavit",
  "official_afore",
  "official_fonacot",
  "sitimm_legal",
  "sitimm_internal",
  "external",
] as const;

export type FAQSourceAuthority = (typeof FAQ_SOURCE_AUTHORITIES)[number];
