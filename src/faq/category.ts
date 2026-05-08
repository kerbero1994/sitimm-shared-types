import type { UUID } from "./blocks";

export interface FAQCategoryRefV2 {
  uuid: UUID;
  slug: string;
  name: string;
  parent?: { uuid: UUID; slug: string; name: string } | null;
}

export interface FAQCategoryV2 extends FAQCategoryRefV2 {
  icon: string | null;
  color_hex: string | null;
  disclaimer_text: string | null;
  sort_order: number;
  article_count: number;
  /** Empty array if leaf or root with no children loaded. */
  children: FAQCategoryV2[];
}
