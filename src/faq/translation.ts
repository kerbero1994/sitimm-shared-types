/**
 * Locale codes supported by FAQ V2 (and the wider SITIMM ecosystem).
 *
 * Backend: app/infrastructure/database/models/faq_article_translation.py LOCALE_VALUES
 */
export const FAQ_LOCALE_CODES = [
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "ja",
  "ko",
  "zh",
] as const;

export type FAQLocaleCode = (typeof FAQ_LOCALE_CODES)[number];
