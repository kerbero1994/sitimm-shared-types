import type { FAQBlock, UUID } from "./blocks";
import type { FAQCategoryRefV2 } from "./category";
import type { FAQResourceV2 } from "./resource";
import type { FAQSourceAuthority } from "./source-authority";
import type { FAQLocaleCode } from "./translation";

export interface FAQCitationV2 {
  name: string;
  url: string;
  /** ISO 8601. */
  accessed_at: string;
  dof_publication?: string | null;
}

export interface FAQArticleV2 {
  uuid: UUID;
  slug: string;
  category: FAQCategoryRefV2;
  title: string;
  summary: string;
  body_blocks: FAQBlock[];
  tags: string[];
  related_uuids: UUID[];
  citations: FAQCitationV2[];
  legal_notice: string | null;
  source_authority: FAQSourceAuthority;
  is_pinned: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  resources: FAQResourceV2[];
  last_reviewed_at: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Locale of `title`/`summary`/`body_blocks` actually returned. */
  locale: FAQLocaleCode;
  /** True if server fell back to es because requested locale was missing/stale. */
  is_translation_fallback: boolean;
}

export interface FAQArticleSummaryV2 {
  uuid: UUID;
  slug: string;
  title: string;
  summary: string;
  category: FAQCategoryRefV2;
  tags: string[];
  is_pinned: boolean;
  publishedAt: string;
  locale: FAQLocaleCode;
  is_translation_fallback: boolean;
}

export interface FAQArticleRevisionV2 {
  uuid: UUID;
  article_uuid: UUID;
  user: { uuid: UUID; firstName: string; lastName: string };
  diff_summary: string | null;
  createdAt: string;
}
