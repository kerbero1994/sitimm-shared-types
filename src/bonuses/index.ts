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
  /**
   * On-demand responsive variant bundle (avif/webp + blurhash) for singleton
   * media (logo/cover), same wire shape as `magazines.coverVariants` /
   * `programs.ImageVariants`. v0.86.0+. `null` for gallery items, non-image
   * media, or when on-demand transforms are not configured — the FE then falls
   * back to the flat `url`.
   * Backend: bonus_v2.py :: BonusV2MediaResponse.urlVariants (JSONB).
   */
  urlVariants?: import("../programs").ImageVariants | null;
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
 *          bonus_serializers.py :: _serialize_bonus (actual wire shape)
 *
 * ``translation`` carries the locale-specific overrides selected by ?lang=,
 * or null when no translation exists for that locale.
 * ``logoUrl`` and ``coverUrl`` are flattened from the ``media`` list by the
 * service layer for fast client rendering.
 * ``city`` is always emitted (CityId is NOT NULL; ``_city_dict`` always returns
 * an object), though its ``name`` may be null when no city relation is loaded.
 *
 * NOTE: ``phone`` is intentionally NOT on this response — the serializer omits
 * it (PII threat model, see BA1) and only accepts it on the create/update
 * request input. ``notifyOnPublish`` is a write-only admin intent flag (fires an
 * FCM on publish) and is never echoed back on any response — it lives only on
 * BonusV2CreateInput / BonusV2UpdateInput.
 */
export interface BonusV2 {
  id: number;
  uuid: string;
  BonusCategoryId: number;
  CityId: number;
  city: BonusV2CityRef;
  business: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  /**
   * On-demand variant bundles (avif/webp + blurhash) for the logo/cover,
   * derived by the BE from the cover/logo media's urlVariants (SITIMM-19).
   * v0.87.0+. `null` until on-demand is active → FE falls back to the flat URL.
   */
  coverVariants?: import("../programs").ImageVariants | null;
  logoVariants?: import("../programs").ImageVariants | null;
}

/**
 * Lightweight BonusV2 row for list endpoints.
 * Backend: bonus_v2.py :: BonusV2ListItemResponse
 *          bonus_serializers.py :: _serialize_list_item (actual wire shape)
 *
 * Excludes subcategories, amenities, paymentMethods, and translation.
 * Media is flattened to primary logo/cover URLs for fast rendering.
 * ``city`` is always emitted (``_city_dict`` always returns an object), though
 * its ``name`` may be null when no city relation is loaded.
 *
 * NOTE: ``phone`` is intentionally NOT on this surface (PII, see BA1) and
 * ``updatedAt`` is not emitted by the list serializer — both were removed.
 */
export interface BonusV2ListItem {
  id: number;
  uuid: string;
  BonusCategoryId: number;
  CityId: number;
  city: BonusV2CityRef;
  business: string;
  address?: string | null;
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
  // Resolved relations (lightweight)
  category: BonusCategory;
  logoUrl: string | null;
  coverUrl: string | null;
  /**
   * On-demand variant bundles for the grid card (SITIMM-19). Emitted by the BE
   * list serializer from the cover/logo media's urlVariants. v0.87.0+. `null`
   * until on-demand is active → FE falls back to the flat coverUrl/logoUrl.
   */
  coverVariants?: import("../programs").ImageVariants | null;
  logoVariants?: import("../programs").ImageVariants | null;
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
 */
export interface BonusV2ListResponse {
  bonuses: BonusV2ListItem[];
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
 * Data payload of POST /api/v2/bonuses (create bonus).
 * Full envelope: { status: "success", data: BonusV2DetailResponse }
 *
 * Create and update both return the full detail shape, so this is an alias of
 * BonusV2DetailResponse — kept named for call-site clarity.
 */
export type BonusV2CreateResponse = BonusV2DetailResponse;

/**
 * Data payload of PATCH /api/v2/bonuses/{uuid} (update bonus).
 * Full envelope: { status: "success", data: BonusV2DetailResponse }
 */
export type BonusV2UpdateResponse = BonusV2DetailResponse;

/**
 * Data payload of DELETE /api/v2/bonuses/{uuid} (cascade soft-delete).
 * Full envelope: { status: "success", data: BonusV2DeleteResponse }
 * Backend: bonus_admin_routes.py :: delete_bonus →
 *          success_response({"deleted": True, "uuid": str(uuid)})
 */
export interface BonusV2DeleteResponse {
  deleted: boolean;
  uuid: string;
}

/**
 * Data payload of DELETE on any bonus catalog row
 * (category / subcategory / amenity / payment-method).
 * Full envelope: { status: "success", data: BonusCatalogDeleteResponse }
 * Backend: bonus_catalog_routes.py :: delete_category / delete_subcategory /
 *          delete_amenity / delete_payment_method →
 *          success_response({"deleted": True, "id": <id>})
 */
export interface BonusCatalogDeleteResponse {
  deleted: boolean;
  id: number;
}

/**
 * Data payload of DELETE /api/v2/bonuses/{uuid}/media/{media_uuid} and
 * DELETE /api/v2/bonuses/{uuid}/translations/{locale}.
 * Full envelope: { status: "success", data: BonusDeletedResponse }
 * Backend: bonus_media_routes.py :: delete_media and
 *          bonus_translation_routes.py :: delete_translation →
 *          success_response({"deleted": True})
 */
export interface BonusDeletedResponse {
  deleted: boolean;
}

/**
 * Data payload of POST /api/v2/bonuses/categories (create category).
 * Full envelope: { status: "success", data: BonusCategoryCreateResponse }
 * Backend: bonus_catalog_routes.py :: create_category / update_category →
 *          success_response({"category": <serialized>})
 */
export interface BonusCategoryCreateResponse {
  category: BonusCategory;
}

/**
 * Data payload of POST /api/v2/bonuses/subcategories (create subcategory).
 * Full envelope: { status: "success", data: BonusSubcategoryCreateResponse }
 * Backend: bonus_catalog_routes.py :: create_subcategory / update_subcategory →
 *          success_response({"subcategory": <serialized>})
 */
export interface BonusSubcategoryCreateResponse {
  subcategory: BonusSubcategory;
}

/**
 * Data payload of POST /api/v2/bonuses/amenities (create amenity).
 * Full envelope: { status: "success", data: BonusAmenityCreateResponse }
 * Backend: bonus_catalog_routes.py :: create_amenity / update_amenity →
 *          success_response({"amenity": <serialized>})
 */
export interface BonusAmenityCreateResponse {
  amenity: BonusAmenity;
}

/**
 * Data payload of POST /api/v2/bonuses/payment-methods (create payment method).
 * Full envelope: { status: "success", data: BonusPaymentMethodCreateResponse }
 * Backend: bonus_catalog_routes.py :: create_payment_method /
 *          update_payment_method →
 *          success_response({"paymentMethod": <serialized>})
 */
export interface BonusPaymentMethodCreateResponse {
  paymentMethod: BonusPaymentMethod;
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
  /** POST → BonusV2DetailResponse (alias BonusV2CreateResponse). Requires bonuses:create. */
  CREATE: "/api/v2/bonuses",
  /** PATCH → BonusV2DetailResponse (alias BonusV2UpdateResponse). Requires bonuses:update. */
  UPDATE: "/api/v2/bonuses/{uuid}",
  /** DELETE → BonusV2DeleteResponse ({ deleted, uuid }). Requires bonuses:delete. Soft delete. */
  DELETE: "/api/v2/bonuses/{uuid}",
  /** POST multipart/form-data → BonusV2MediaResponse. Requires bonuses:update. */
  MEDIA_UPLOAD: "/api/v2/bonuses/{uuid}/media",
  /** DELETE → BonusDeletedResponse ({ deleted }). Requires bonuses:update. */
  MEDIA_DELETE: "/api/v2/bonuses/{uuid}/media/{media_uuid}",
  /** PUT → BonusTranslationResponse. Requires bonuses:update. */
  TRANSLATION_UPSERT: "/api/v2/bonuses/{uuid}/translations/{locale}",
  /** DELETE → BonusDeletedResponse ({ deleted }). Requires bonuses:update. */
  TRANSLATION_DELETE: "/api/v2/bonuses/{uuid}/translations/{locale}",
} as const;

export type BonusesV2Endpoint =
  (typeof BONUSES_V2_ENDPOINTS)[keyof typeof BONUSES_V2_ENDPOINTS];
