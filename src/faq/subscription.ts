import type { UUID } from "./blocks";

export interface UserFAQSubscriptionV2 {
  category_uuid: UUID;
  category_name: string;
  subscribed_at: string;
}
