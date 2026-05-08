import type { UUID } from "./blocks";

export const FAQ_RESOURCE_KINDS = [
  "video_youtube",
  "video_vimeo",
  "pdf",
  "image",
  "infographic",
  "document_drive",
  "official_link",
  "external_form",
] as const;

export type FAQResourceKind = (typeof FAQ_RESOURCE_KINDS)[number];

export const FAQ_RESOURCE_ENRICHMENT_STATUSES = ["ok", "failed", "manual"] as const;
export type FAQResourceEnrichmentStatus = (typeof FAQ_RESOURCE_ENRICHMENT_STATUSES)[number];

export interface FAQResourceV2 {
  uuid: UUID;
  article_uuid: UUID;
  kind: FAQResourceKind;
  url: string;
  provider_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  title: string | null;
  caption: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  enrichment_status: FAQResourceEnrichmentStatus;
  enrichment_error: string | null;
  createdAt: string;
  updatedAt: string;
}
