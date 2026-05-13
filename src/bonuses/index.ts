/**
 * Bonus V2 types — commercial discounts/benefits for union members.
 *
 * Backend: app/presentation/schemas/bonus_v2.py
 *          app/presentation/api/v2/bonuses_v2.py
 *
 * Response fields: camelCase matching JSON output (Pydantic model_config
 * populate_by_name=True).
 *
 * Public reads (no auth): list, categories, amenities, payment-methods, detail.
 * Admin writes (bonuses:create/update/delete): CRUD + media + translations + catalogs.
 */

// ── Enums ─────────────────────────────────────────────────────────────────

/**
 * Discount type.
 * Backend: BonusDiscountType (PostgreSQL enum bonus_discount_type).
 */
export type BonusDiscountType = "percentage" | "fixed" | "special" | "variable";

/**
 * Badge label shown on a bonus card.
 * Backend: BonusBadge (PostgreSQL enum bonus_badge).
 */
export type BonusBadge = "featured" | "new" | "popular";

/**
 * Kind of media asset attached to a bonus.
 * Backend: BonusMediaKind (PostgreSQL enum bonus_media_kind).
 */
export type BonusMediaKind = "logo" | "cover" | "gallery";

// ── Catalog Types ─────────────────────────────────────────────────────────

/**
 * BonusCategory catalog row.
 * Backend: bonus_v2.py :: BonusCategoryResponse
 */
export interface BonusCategory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  iconName: string;
  colorHex: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * BonusSubcategory catalog row.
 * Backend: bonus_v2.py :: BonusSubcategoryResponse
 */
export interface BonusSubcategory {
  id: number;
  uuid: string;
  BonusCategoryId: number;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * BonusAmenity catalog row.
 * Backend: bonus_v2.py :: BonusAmenityResponse
 */
export interface BonusAmenity {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
}

/**
 * BonusPaymentMethod catalog row.
 * Backend: bonus_v2.py :: BonusPaymentMethodResponse
 */
export interface BonusPaymentMethod {
  id: number;
  uuid: string;
  code: string;
  name: string;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
}

// ── Media & Translation ───────────────────────────────────────────────────

/**
 * One media asset attached to a BonusV2.
 * Backend: bonus_v2.py :: BonusV2MediaResponse
 */
export interface BonusV2Media {
  id: number;
  uuid: string;
  kind: BonusMediaKind;
  url: string;
  sortOrder: number;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
}

/**
 * i18n override row for a BonusV2, resolved for a specific locale.
 * Backend: bonus_v2.py :: BonusTranslationResponse
 */
export interface BonusTranslation {
  id: number;
  locale: string;
  business?: string | null;
  address?: string | null;
  discountText?: string | null;
  redemptionInstructions?: string | null;
  hours?: string | null;
  updatedAt: string;
}

// ── Lightweight References ────────────────────────────────────────────────

/**
 * Minimal city projection embedded inside bonus responses.
 * Backend: bonus_v2.py :: BonusCityRef
 */
export interface BonusV2CityRef {
  id: number;
  name: string | null;
}

// ── Main BonusV2 Types ────────────────────────────────────────────────────

/**
 * Full BonusV2 record — used for detail and admin views.
 * Backend: bonus_v2.py :: BonusV2Response
 *
 * ``translation`` carries the locale-specific overrides selected by ?lang=,
 * or null when no translation exists for that locale.
 * ``logoUrl`` and ``coverUrl`` are flattened from the ``media`` list by the
 * service layer for fast client rendering.
 */
export interface BonusV2 {
  id: number;
  uuid: string;
  BonusCategoryId: number;
  CityId: number;
  city: BonusV2CityRef | null;
  business: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  hours?: string | null;
  discountType: BonusDiscountType;
  discountValueMin?: number | null;
  discountValueMax?: number | null;
  discountText?: string | null;
  redemptionCode?: string | null;
  redemptionInstructions?: string | null;
  reservationUrl?: string | null;
  /** YYYY-MM-DD date string. */
  validFrom?: string | null;
  /** YYYY-MM-DD date string. */
  validUntil?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  badge: BonusBadge | null;
  notifyOnPublish: boolean;
  createdAt: string;
  updatedAt: string;
  // Resolved relations
  category: BonusCategory;
  subcategories: BonusSubcategory[];
  amenities: BonusAmenity[];
  paymentMethods: BonusPaymentMethod[];
  media: BonusV2Media[];
  translation: BonusTranslation | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

/**
 * Lightweight BonusV2 row for list endpoints.
 * Backend: bonus_v2.py :: BonusV2ListItemResponse
 *
 * Excludes subcategories, amenities, paymentMethods, and translation.
 * Media is flattened to primary logo/cover URLs for fast rendering.
 */
export interface BonusV2ListItem {
  id: number;
  uuid: string;
  BonusCategoryId: number;
  CityId: number;
  city: BonusV2CityRef | null;
  business: string;
  address?: string | null;
  phone?: string | null;
  discountType: BonusDiscountType;
  discountValueMin?: number | null;
  discountValueMax?: number | null;
  discountText?: string | null;
  /** YYYY-MM-DD date string. */
  validFrom?: string | null;
  /** YYYY-MM-DD date string. */
  validUntil?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  badge: BonusBadge | null;
  createdAt: string;
  updatedAt: string;
  // Resolved relations (lightweight)
  category: BonusCategory;
  logoUrl: string | null;
  coverUrl: string | null;
}

// ── Request Inputs ────────────────────────────────────────────────────────

/**
 * Admin — create a new BonusV2 commercial discount/benefit.
 * Backend: bonus_v2.py :: BonusV2Create
 *
 * Invariants (enforced server-side):
 * - INV-B1: discountValueMin <= discountValueMax (when both present)
 * - INV-B2: validUntil > validFrom (when both present)
 * - INV-B6: latitude and longitude both null OR both present
 * - INV-B10: discountType=percentage → values in [0, 100]
 * - INV-B11: discountType=fixed → values > 0
 */
export interface BonusV2CreateInput {
  business: string;
  BonusCategoryId: number;
  CityId: number;
  discountType: BonusDiscountType;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  hours?: string | null;
  discountValueMin?: number | null;
  discountValueMax?: number | null;
  discountText?: string | null;
  redemptionCode?: string | null;
  redemptionInstructions?: string | null;
  reservationUrl?: string | null;
  /** YYYY-MM-DD date string. */
  validFrom?: string | null;
  /** YYYY-MM-DD date string. */
  validUntil?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  badge?: BonusBadge | null;
  notifyOnPublish?: boolean;
  subcategoryIds?: number[];
  amenityIds?: number[];
  paymentMethodIds?: number[];
}

/**
 * Admin — partial update of a BonusV2. All fields optional.
 * Backend: bonus_v2.py :: BonusV2Update
 */
export type BonusV2UpdateInput = Partial<BonusV2CreateInput>;

/**
 * Admin — create a new BonusCategory.
 * Backend: bonus_v2.py :: BonusCategoryCreate
 */
export interface BonusCategoryCreateInput {
  name: string;
  /** Kebab-case (lowercase alphanumeric + hyphens). */
  slug: string;
  iconName: string;
  /** Hex color, e.g. "#d32027". */
  colorHex: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Admin — partial update of a BonusCategory.
 * Backend: bonus_v2.py :: BonusCategoryUpdate
 */
export type BonusCategoryUpdateInput = Partial<BonusCategoryCreateInput>;

/**
 * Admin — create a new BonusSubcategory.
 * Backend: bonus_v2.py :: BonusSubcategoryCreate
 */
export interface BonusSubcategoryCreateInput {
  BonusCategoryId: number;
  name: string;
  /** Kebab-case. */
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Admin — partial update of a BonusSubcategory.
 * Backend: bonus_v2.py :: BonusSubcategoryUpdate
 */
export type BonusSubcategoryUpdateInput = Partial<BonusSubcategoryCreateInput>;

/**
 * Admin — create a new BonusAmenity.
 * Backend: bonus_v2.py :: BonusAmenityCreate
 */
export interface BonusAmenityCreateInput {
  name: string;
  /** Kebab-case. */
  slug: string;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Admin — partial update of a BonusAmenity.
 * Backend: bonus_v2.py :: BonusAmenityUpdate
 */
export type BonusAmenityUpdateInput = Partial<BonusAmenityCreateInput>;

/**
 * Admin — create a new BonusPaymentMethod.
 * Backend: bonus_v2.py :: BonusPaymentMethodCreate
 */
export interface BonusPaymentMethodCreateInput {
  /** Lowercase alphanumeric + hyphens, starting with alphanumeric. */
  code: string;
  name: string;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Admin — partial update of a BonusPaymentMethod.
 * Backend: bonus_v2.py :: BonusPaymentMethodUpdate
 */
export type BonusPaymentMethodUpdateInput = Partial<BonusPaymentMethodCreateInput>;

/**
 * Admin — create or replace a translation for a (BonusV2, locale) pair.
 * Backend: bonus_v2.py :: BonusTranslationUpsert
 *
 * locale: matches ^[a-z]{2}(-[A-Z]{2})?$ (e.g. "es", "en", "en-US").
 */
export interface BonusTranslationUpsertInput {
  locale: string;
  business?: string | null;
  address?: string | null;
  discountText?: string | null;
  redemptionInstructions?: string | null;
  hours?: string | null;
}

/**
 * Query parameters for GET /api/v2/bonuses.
 * Backend: bonus_v2.py :: BonusV2ListQuery
 */
export interface BonusV2ListQuery {
  categorySlug?: string;
  cityId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
  /** Locale code for i18n overlay. Defaults to "es". */
  lang?: string;
  page?: number;
  limit?: number;
  /** One of: "sortOrder", "createdAt", "business", "-createdAt", "-sortOrder". */
  sort?: string;
}

// ── Response Wrappers ────────────────────────────────────────────────────

/**
 * Data payload of GET /api/v2/bonuses/{uuid}.
 * Full envelope: { status: "success", data: BonusV2DetailResponse }
 */
export interface BonusV2DetailResponse {
  bonus: BonusV2;
}

/**
 * Data payload of GET /api/v2/bonuses (paginated list).
 * Full envelope: { status: "success", data: BonusV2ListResponse }
 * Note: backend response field is "items", not "bonuses".
 */
export interface BonusV2ListResponse {
  items: BonusV2ListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Data payload of POST /api/v2/bonuses/{uuid}/media.
 * Full envelope: { status: "success", data: BonusV2MediaResponse }
 */
export interface BonusV2MediaResponse {
  media: BonusV2Media;
}

/**
 * Data payload of GET /api/v2/bonuses/categories.
 * Full envelope: { status: "success", data: BonusCategoryListResponse }
 */
export interface BonusCategoryListResponse {
  categories: BonusCategory[];
}

/**
 * Data payload of GET /api/v2/bonuses/categories/{slug}.
 * Full envelope: { status: "success", data: BonusCategoryDetailResponse }
 */
export interface BonusCategoryDetailResponse {
  category: BonusCategory;
  subcategories: BonusSubcategory[];
}

/**
 * Data payload of GET /api/v2/bonuses/amenities.
 * Full envelope: { status: "success", data: BonusAmenityListResponse }
 */
export interface BonusAmenityListResponse {
  amenities: BonusAmenity[];
}

/**
 * Data payload of GET /api/v2/bonuses/payment-methods.
 * Full envelope: { status: "success", data: BonusPaymentMethodListResponse }
 */
export interface BonusPaymentMethodListResponse {
  paymentMethods: BonusPaymentMethod[];
}

/**
 * Data payload of PUT /api/v2/bonuses/{uuid}/translations/{locale}.
 * Full envelope: { status: "success", data: BonusTranslationResponse }
 */
export interface BonusTranslationResponse {
  translation: BonusTranslation;
}

// ── Endpoint Constants ─────────────────────────────────────────────────────

/**
 * V2 Bonuses API endpoint path constants.
 *
 * All paths are relative (no base URL). Parameterized paths use `{param}`
 * placeholders — use the shared `endpoint()` helper from the endpoints module
 * to substitute values.
 */
export const BONUSES_V2_ENDPOINTS = {
  /** GET → paginated BonusV2ListResponse. Public, no auth. Query: BonusV2ListQuery. */
  LIST: "/api/v2/bonuses",
  /** GET → BonusV2DetailResponse. Public, no auth. Query: lang?. */
  DETAIL: "/api/v2/bonuses/{uuid}",
  /** GET → BonusCategoryListResponse. Public. Query: active_only? (default true). */
  CATEGORIES: "/api/v2/bonuses/categories",
  /** GET → BonusCategoryDetailResponse (category + subcategories). Public. */
  CATEGORY_DETAIL: "/api/v2/bonuses/categories/{slug}",
  /** GET → BonusAmenityListResponse. Public. */
  AMENITIES: "/api/v2/bonuses/amenities",
  /** GET → BonusPaymentMethodListResponse. Public. */
  PAYMENT_METHODS: "/api/v2/bonuses/payment-methods",
  /** POST → BonusV2DetailResponse. Requires bonuses:create. */
  CREATE: "/api/v2/bonuses",
  /** PATCH → BonusV2DetailResponse. Requires bonuses:update. */
  UPDATE: "/api/v2/bonuses/{uuid}",
  /** DELETE → { message }. Requires bonuses:delete. Soft delete. */
  DELETE: "/api/v2/bonuses/{uuid}",
  /** POST multipart/form-data → BonusV2MediaResponse. Requires bonuses:update. */
  MEDIA_UPLOAD: "/api/v2/bonuses/{uuid}/media",
  /** DELETE → { message }. Requires bonuses:update. */
  MEDIA_DELETE: "/api/v2/bonuses/{uuid}/media/{media_uuid}",
  /** PUT → BonusTranslationResponse. Requires bonuses:update. */
  TRANSLATION_UPSERT: "/api/v2/bonuses/{uuid}/translations/{locale}",
  /** DELETE → { message }. Requires bonuses:update. */
  TRANSLATION_DELETE: "/api/v2/bonuses/{uuid}/translations/{locale}",
} as const;

export type BonusesV2Endpoint =
  (typeof BONUSES_V2_ENDPOINTS)[keyof typeof BONUSES_V2_ENDPOINTS];
