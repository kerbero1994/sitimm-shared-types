/**
 * Supported locales for the SITIMM ecosystem.
 *
 * Single source of truth for language codes, display names, and flags.
 * Not all repos support all locales — each repo filters by its own needs.
 *
 * | Repo | Locales |
 * |------|---------|
 * | sitimmApp | All 8 |
 * | Sitimm-web | All 8 |
 * | new_dashboard | 2 (es, en) |
 */

/** All supported locale codes. */
export const LOCALE_CODES = [
  "es", "en", "fr", "de", "ja", "ko", "zh", "hi",
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

/** Default locale — Spanish (Mexico). */
export const DEFAULT_LOCALE: LocaleCode = "es";

/** English names for each locale (for developer/admin UIs). */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  es: "Spanish",
  en: "English",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  hi: "Hindi",
};

/** Native names for each locale (for language selector UIs). */
export const LOCALE_NATIVE_NAMES: Record<LocaleCode, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  hi: "हिन्दी",
};

/** Flag emoji for each locale (for visual language selectors). */
export const LOCALE_FLAGS: Record<LocaleCode, string> = {
  es: "🇲🇽",
  en: "🇺🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  hi: "🇮🇳",
};

// -- Country catalog --
export * from "./countries";
