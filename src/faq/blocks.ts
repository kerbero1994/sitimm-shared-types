/**
 * FAQ block discriminated union — mirrors backend Pydantic schema 1:1.
 *
 * Backend: app/presentation/schemas/v2/faq/blocks.py FAQBlock
 *
 * 14 block types. Discriminator = `type` literal. Add `<UnknownBlock>`
 * fallback in renderers (RN/web/dashboard) for forward-compat when BE
 * adds new types.
 */

export type FAQBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "quote"
  | "callout"
  | "video"
  | "image"
  | "pdf_card"
  | "table"
  | "glossary_term"
  | "related_cta"
  | "consultation_cta"
  | "legal_disclaimer"
  | "divider";

export type UUID = string;

export interface ParagraphBlock {
  type: "paragraph";
  text_md: string;
}

export interface HeadingBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
}

export interface ListBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

export interface QuoteBlock {
  type: "quote";
  text: string;
  source?: string | null;
  source_url?: string | null;
}

export type CalloutVariant = "info" | "warning" | "tip" | "legal" | "success";

export interface CalloutBlock {
  type: "callout";
  variant: CalloutVariant;
  text_md: string;
  title?: string | null;
}

export interface VideoBlock {
  type: "video";
  resource_uuid: UUID;
  autoplay: boolean;
  caption?: string | null;
}

export type ImageAlign = "left" | "center" | "right" | "full";

export interface ImageBlock {
  type: "image";
  resource_uuid: UUID;
  alt: string;
  caption?: string | null;
  align: ImageAlign;
}

export interface PdfCardBlock {
  type: "pdf_card";
  resource_uuid: UUID;
  show_preview: boolean;
}

export interface TableBlock {
  type: "table";
  headers: string[];
  rows: string[][];
  caption?: string | null;
}

export interface GlossaryTermResolved {
  uuid: UUID;
  display_term: string;
  definition_md: string;
  related_article_uuids: UUID[];
}

export interface GlossaryTermBlock {
  type: "glossary_term";
  term: string;
  resolved?: GlossaryTermResolved;
}

export interface FAQArticleSummaryRef {
  uuid: UUID;
  slug: string;
  title: string;
  summary: string;
}

export interface RelatedCtaResolved {
  target: FAQArticleSummaryRef;
}

export interface RelatedCtaBlock {
  type: "related_cta";
  target_faq_uuid: UUID;
  label?: string | null;
  resolved?: RelatedCtaResolved;
}

export type ConsultationType = "IMSS" | "INFONAVIT" | "AFORE" | "FONACOT" | "GENERAL";

export interface ConsultationCtaBlock {
  type: "consultation_cta";
  consultation_type: ConsultationType;
  label?: string | null;
}

export interface LegalDisclaimerBlock {
  type: "legal_disclaimer";
  text_md: string;
  severity: "info" | "warning";
}

export interface DividerBlock {
  type: "divider";
}

export type FAQBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | CalloutBlock
  | VideoBlock
  | ImageBlock
  | PdfCardBlock
  | TableBlock
  | GlossaryTermBlock
  | RelatedCtaBlock
  | ConsultationCtaBlock
  | LegalDisclaimerBlock
  | DividerBlock;

/**
 * Type guard helper — narrows a generic FAQBlock to the specific subtype.
 */
export const isFAQBlockType = <T extends FAQBlockType>(
  block: FAQBlock,
  type: T,
): block is Extract<FAQBlock, { type: T }> => block.type === type;
