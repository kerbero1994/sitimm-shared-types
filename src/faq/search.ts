import type { UUID } from "./blocks";
import type { FAQCategoryRefV2 } from "./category";
import type { FAQLocaleCode } from "./translation";

export interface FAQSearchHitV2 {
  uuid: UUID;
  slug: string;
  title: string;
  summary: string;
  /** ts_headline output with <mark>...</mark>. */
  snippet: string;
  category: FAQCategoryRefV2;
  rank: number;
  matched_via: "tsvector" | "trigram_fallback";
}

export interface FAQSearchResponseV2 {
  query: string;
  locale: FAQLocaleCode;
  results: FAQSearchHitV2[];
  total: number;
}

export interface FAQSearchSuggestItemV2 {
  slug: string;
  title: string;
}
