/**
 * Supported locales for the SITIMM ecosystem.
 *
 * Single source of truth for language codes, display names, and flags.
 * Not all repos support all locales -- each repo filters by its own needs.
 *
 * sitimmApp: 8 locales
 * Sitimm-web: 8 locales
 * new_dashboard: 2 locales (es, en)
 */

export const LOCALE_CODES = [
  "es", "en", "fr", "de", "ja", "ko", "zh", "hi",
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

export const DEFAULT_LOCALE: LocaleCode = "es";

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
