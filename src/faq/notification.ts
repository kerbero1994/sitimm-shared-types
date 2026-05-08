import type { UUID } from "./blocks";
import type { FAQLocaleCode } from "./translation";

export type FAQNotificationType = "faq_article_published";

export interface FAQNotificationDataV2 {
  type: FAQNotificationType;
  article_uuid: UUID;
  article_slug: string;
  category_uuid: UUID;
  category_name: string;
  locale: FAQLocaleCode;
  /** "sitimm://faq/articles/{slug}" (RN scheme) or "/faq/{slug}" (web). */
  deep_link: string;
}

export interface FAQNotificationPayloadV2 {
  notification: { title: string; body: string };
  data: FAQNotificationDataV2;
}
