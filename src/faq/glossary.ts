import type { UUID } from "./blocks";
import type { FAQCategoryRefV2 } from "./category";
import type { FAQLocaleCode } from "./translation";

export interface FAQGlossaryTermV2 {
  uuid: UUID;
  term: string;
  display_term: string;
  aliases: string[];
  definition_md: string;
  related_article_uuids: UUID[];
  category?: FAQCategoryRefV2 | null;
  locale: FAQLocaleCode;
  is_translation_fallback: boolean;
}
