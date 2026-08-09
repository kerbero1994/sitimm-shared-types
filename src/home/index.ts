/**
 * Home CMS V2 types.
 *
 * Backend: app/presentation/schemas/home_v2.py (+ router app/presentation/api/v2/home_v2.py)
 *
 * The Home page is a FIXED set of 9 sections stored as DB rows. Each section
 * splits its payload into two parallel JSONB trees:
 *
 * - **Content** — non-translatable structure (image refs, hrefs, icon names,
 *   stat values, stable item ids). Edited via PATCH `content`.
 * - **Text** — translatable strings, same tree shape, stored per-lang.
 *   Edited in Spanish via PATCH `text_es`; the other 7 locales are
 *   machine-translated asynchronously (Celery `home.translate_section`).
 *
 * The PUBLIC read returns the two trees MERGED (text injected into structure,
 * list items aligned by stable `id`) with every image slot resolved to a
 * final URL — see `HomeSectionPublicV2`.
 *
 * Fase 1 (2026-06): only `hero_carousel`, `about`, `programs` accept content
 * edits (the keys with defined shapes). The other 6 sections exist as rows —
 * toggle/reorder works — but PATCH `content`/`text_es` returns
 * 409 `not_editable_yet` until Fase 2 adds their shapes.
 */

import type { LocaleCode } from "../locales";

/**
 * The 9 fixed section keys, in default render order (seed positions 0-8).
 * Mirrors the `HomeSection_key_values` CHECK constraint.
 * `hero_carousel` is ONE section: the hero copy + the carousel slides render
 * as a single visual component on the Home page.
 */
export const HOME_SECTION_KEYS = [
  "hero_carousel",
  "about",
  "programs",
  "discounts",
  "social_proof",
  "mvv",
  "callout",
  "app_download",
  "org",
] as const;

/** One of the 9 fixed Home section keys. */
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

/**
 * Keys whose content/text shapes exist and accept PATCH `content`/`text_es`.
 * After Fase 2 all 9 sections are editable. Mirrors `EDITABLE_KEYS` on the
 * backend (the BE enables PATCH for these keys in lockstep).
 */
export const EDITABLE_HOME_SECTION_KEYS = [
  "hero_carousel",
  "about",
  "programs",
  "discounts",
  "social_proof",
  "mvv",
  "callout",
  "app_download",
  "org",
] as const;

/** An editable section key (all 9 after Fase 2). */
export type EditableHomeSectionKey = (typeof EDITABLE_HOME_SECTION_KEYS)[number];

/**
 * Provenance of the text served for a section in a given lang.
 * - `human`    — editorial copy (es always; other langs only via future human override).
 * - `machine`  — auto-translated by the Celery pipeline.
 * - `fallback` — requested lang had no row; Spanish text was served instead.
 */
export type HomeTranslationSource = "human" | "machine" | "fallback";

/**
 * A media slot as STORED / sent in admin payloads. Exactly ONE of the two
 * fields must be non-null (backend XOR validator):
 * - `file_uuid`     — uploaded `File` row (via POST /files/upload); the public
 *                     read resolves it to a presigned URL.
 * - `external_url`  — legacy CDN URL passthrough (https only, HttpUrl-validated).
 */
export interface HomeImageRef {
  /** UUID of an uploaded File row. Null when `external_url` is used. */
  file_uuid: string | null;
  /** Absolute https URL served as-is. Null when `file_uuid` is used. */
  external_url: string | null;
}

/**
 * A media slot as it appears in the PUBLIC read: the backend collapses
 * `HomeImageRef` into a final URL (presigned for `file_uuid`, passthrough
 * for `external_url`). `url` is null when the referenced File is missing
 * or storage presigning failed (degrade-to-null, never a 500).
 */
export interface HomeResolvedImage {
  /** Final image URL, or null when unresolvable. */
  url: string | null;
}

/** A stat badge's non-translatable half (value stays as-authored, e.g. "70,000+"). */
export interface HomeStatContent {
  /** Stable id linking this stat to its translatable label. */
  id: string;
  /** Icon name (FE icon registry, e.g. "groups"). */
  icon: string | null;
  /** Display value — NOT translated (numbers/figures). */
  value: string;
}

/** A stat badge's translatable half. */
export interface HomeStatText {
  /** Stable id matching `HomeStatContent.id`. */
  id: string;
  /** Translated label (e.g. "Afiliados"). */
  label: string;
}

/** A card's non-translatable half: id + image (mvv mission/vision/values). */
export interface HomeCardContent {
  /** Stable id linking this card to its text. */
  id: string;
  image: HomeImageRef;
}

/** A card's translatable half. */
export interface HomeCardText {
  /** Stable id matching `HomeCardContent.id`. */
  id: string;
  title: string;
  description: string;
  image_alt: string;
}

/** A benefit row's non-translatable half: id + icon (app_download). */
export interface HomeBenefitContent {
  /** Stable id linking this benefit to its text. */
  id: string;
  /** Icon name (FE icon registry). */
  icon: string;
}

/** A benefit row's translatable half. */
export interface HomeBenefitText {
  /** Stable id matching `HomeBenefitContent.id`. */
  id: string;
  title: string;
  description: string;
}

/** Three-part split title (leading / accent / trailing) used by about + programs headings. */
export interface HomeSplitTitle {
  leading: string;
  accent: string;
  trailing?: string | null;
}

// ── hero_carousel ────────────────────────────────────────────────────────────

/** hero_carousel → hero block, non-translatable structure. */
export interface HomeHeroContent {
  primary_cta_href: string;
  primary_cta_icon?: string | null;
  secondary_cta_href: string;
  highlight_href: string;
  highlight_image: HomeImageRef;
  stats: HomeStatContent[];
}

/** hero_carousel → one slide, non-translatable structure. */
export interface HomeSlideContent {
  /** Stable id aligning this slide with its text. */
  id: string;
  /** Slide link target. Null = non-clickable slide. */
  href: string | null;
  image: HomeImageRef;
}

/** hero_carousel structural tree (PATCH `content` shape). Backend: HeroCarouselContent. */
export interface HeroCarouselContentV2 {
  hero: HomeHeroContent;
  slides: HomeSlideContent[];
  /**
   * How many curated slides the carousel serves (SITIMM-582).
   *
   * Lives on the section rather than in a settings table so it is editable at
   * runtime through the PATCH this same shape describes. Absent on rows seeded
   * before the field existed — the backend falls back to 12.
   *
   * Range 1–24, enforced on write. Exceeding it while enabling a featured item
   * returns 409 `featured_limit_reached`.
   */
  max_slides?: number;
}

/** hero_carousel → hero highlight card, translatable. */
export interface HomeHighlightText {
  title: string;
  heading: string;
  description: string;
  link_label: string;
}

/** hero_carousel → hero block, translatable. */
export interface HomeHeroText {
  title: string;
  subtitle: string;
  description: string;
  primary_cta_label: string;
  secondary_cta_label: string;
  highlight: HomeHighlightText;
  highlight_image_alt: string;
  stats: HomeStatText[];
}

/** hero_carousel → one slide, translatable. */
export interface HomeSlideText {
  /** Stable id matching `HomeSlideContent.id`. */
  id: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  link_label?: string | null;
  image_alt: string;
}

/** hero_carousel text tree (PATCH `text_es` shape). Backend: HeroCarouselText. */
export interface HeroCarouselTextV2 {
  hero: HomeHeroText;
  slides: HomeSlideText[];
}

// ── about ────────────────────────────────────────────────────────────────────

/** about structural tree (PATCH `content` shape). Backend: AboutContent. */
export interface AboutContentV2 {
  cta_href?: string | null;
  image: HomeImageRef;
  stats?: HomeStatContent[] | null;
}

/** about text tree (PATCH `text_es` shape). Backend: AboutText. */
export interface AboutTextV2 {
  eyebrow?: string | null;
  title: HomeSplitTitle;
  /** At least one paragraph required. */
  paragraphs: string[];
  cta_label?: string | null;
  stats?: HomeStatText[] | null;
  image_alt: string;
  image_badge_label?: string | null;
}

// ── programs (the Home strip, not the /programas catalog) ───────────────────

/** programs → one item, non-translatable structure. */
export interface HomeProgramItemContent {
  /** Stable id aligning this item with its text. */
  id: string;
  icon?: string | null;
  href?: string | null;
  badge?: string | null;
  image?: HomeImageRef | null;
}

/** programs structural tree (PATCH `content` shape). Backend: ProgramsContent. */
export interface ProgramsContentV2 {
  items: HomeProgramItemContent[];
}

/** programs → one item, translatable. */
export interface HomeProgramItemText {
  /** Stable id matching `HomeProgramItemContent.id`. */
  id: string;
  title: string;
  description?: string | null;
}

/** programs text tree (PATCH `text_es` shape). Backend: ProgramsText. */
export interface ProgramsTextV2 {
  eyebrow?: string | null;
  title?: HomeSplitTitle | null;
  description?: string | null;
  know_more_label?: string | null;
  items: HomeProgramItemText[];
}

// ── discounts ────────────────────────────────────────────────────────────────

/** discounts structural tree (PATCH `content`). Backend: DiscountsContent. */
export interface DiscountsContentV2 {
  logo_image: HomeImageRef;
  stats: HomeStatContent[];
  cta_href: string;
}

/** discounts text tree (PATCH `text_es`). Backend: DiscountsText. */
export interface DiscountsTextV2 {
  top_badge: string;
  title: HomeSplitTitle;
  subtitle: string;
  /** Bold/brand fragment rendered inside the subtitle. */
  subtitle_brand: string;
  cta_label: string;
  stats: HomeStatText[];
}

// ── social_proof ─────────────────────────────────────────────────────────────

/** social_proof structural tree (PATCH `content`). Backend: SocialProofContent. */
export interface SocialProofContentV2 {
  /** Stats have no icon; `value` like "70,000+" is parsed by CountUp. */
  stats: HomeStatContent[];
}

/** social_proof text tree (PATCH `text_es`). Backend: SocialProofText. */
export interface SocialProofTextV2 {
  title: HomeSplitTitle;
  stats: HomeStatText[];
}

// ── mvv (mission / vision / values) ──────────────────────────────────────────

/** mvv structural tree (PATCH `content`). Backend: MvvContent. */
export interface MvvContentV2 {
  cards: HomeCardContent[];
}

/** mvv text tree (PATCH `text_es`). Backend: MvvText. */
export interface MvvTextV2 {
  title: HomeSplitTitle;
  cards: HomeCardText[];
}

// ── callout (join-SITIMM CTA) ────────────────────────────────────────────────

/** callout structural tree (PATCH `content`). Backend: CalloutContent. */
export interface CalloutContentV2 {
  cta_href: string;
}

/** callout text tree (PATCH `text_es`). Backend: CalloutText. */
export interface CalloutTextV2 {
  title: HomeSplitTitle;
  description: string;
  cta_label: string;
}

// ── app_download ─────────────────────────────────────────────────────────────

/** app_download structural tree (PATCH `content`). Backend: AppDownloadContent. */
export interface AppDownloadContentV2 {
  phone_image: HomeImageRef;
  app_store_url: string;
  play_store_url: string;
  qr_appstore: HomeImageRef;
  qr_playstore: HomeImageRef;
  benefits: HomeBenefitContent[];
}

/** app_download text tree (PATCH `text_es`). Backend: AppDownloadText. */
export interface AppDownloadTextV2 {
  badge: string;
  title: string;
  subtitle: string;
  benefits: HomeBenefitText[];
  phone_alt: string;
  qr_appstore_alt: string;
  qr_playstore_alt: string;
}

// ── org (section-level; rosters stay in the FE's local JSON) ──────────────────

/** org → one structure row, non-translatable. Opens the matching roster modal. */
export interface HomeOrgRowContent {
  /** Stable id aligning this row with its text. */
  id: string;
  icon: string;
  /** Which local roster modal this row opens. */
  modal_type: "executives" | "companies" | "advisors";
}

/** org structural tree (PATCH `content`). Backend: OrgContent. */
export interface OrgContentV2 {
  rows: HomeOrgRowContent[];
  /** Downloadable structure PDF. */
  doc: HomeImageRef;
}

/** org → one row, translatable. */
export interface OrgRowText {
  /** Stable id matching `HomeOrgRowContent.id`. */
  id: string;
  title: string;
  description: string;
  /** Count badge label, e.g. "35 integrantes". */
  metric: string;
}

/** org text tree (PATCH `text_es`). Backend: OrgText. */
export interface OrgTextV2 {
  title: HomeSplitTitle;
  description: string;
  rows: OrgRowText[];
}

/** Any structural tree — the PATCH `content` union (all 9 sections). */
export type HomeSectionContentV2 =
  | HeroCarouselContentV2
  | AboutContentV2
  | ProgramsContentV2
  | DiscountsContentV2
  | SocialProofContentV2
  | MvvContentV2
  | CalloutContentV2
  | AppDownloadContentV2
  | OrgContentV2;

/** Any text tree — the PATCH `text_es` union (all 9 sections). */
export type HomeSectionTextV2 =
  | HeroCarouselTextV2
  | AboutTextV2
  | ProgramsTextV2
  | DiscountsTextV2
  | SocialProofTextV2
  | MvvTextV2
  | CalloutTextV2
  | AppDownloadTextV2
  | OrgTextV2;

// ── public read (merged + image-resolved) ────────────────────────────────────

/**
 * hero_carousel as served by the PUBLIC read: structure + text merged,
 * image refs resolved. Slides keep content order; text matched by `id`.
 */
export interface HeroCarouselPublicV2 {
  hero: {
    primary_cta_href: string;
    primary_cta_icon?: string | null;
    secondary_cta_href: string;
    highlight_href: string;
    highlight_image: HomeResolvedImage;
    stats: Array<{ id: string; icon: string | null; value: string; label: string }>;
    title: string;
    subtitle: string;
    description: string;
    primary_cta_label: string;
    secondary_cta_label: string;
    highlight: HomeHighlightText;
    highlight_image_alt: string;
  };
  /**
   * The carousel slides. Since SITIMM-582 these are RESOLVED CURATION rows,
   * not the hand-written list — see `HomeFeaturedSlidePublicV2`, which is the
   * one description of this payload rather than a second copy that can drift.
   *
   * The differences from the shape this used to declare are not cosmetic, and
   * each one is a crash or a wrong render if a consumer assumes otherwise:
   *
   * - **`image` can be NULL.** An entity with no cover — an event or gallery
   *   uploaded without one — resolves to a slide with no image at all. The
   *   previous non-nullable declaration is why `slide.image.url` type-checked
   *   and then threw at runtime.
   * - **`title` can be null**, when the referenced content is gone.
   * - `subject_type`, `image_variants` and `meta` ride along.
   */
  slides: HomeFeaturedSlidePublicV2[];
}

/** about as served by the PUBLIC read (merged + image-resolved). */
export interface AboutPublicV2 {
  cta_href?: string | null;
  image: HomeResolvedImage;
  stats?: Array<{ id: string; icon: string | null; value: string; label: string }> | null;
  eyebrow?: string | null;
  title: HomeSplitTitle;
  paragraphs: string[];
  cta_label?: string | null;
  image_alt: string;
  image_badge_label?: string | null;
}

/** programs as served by the PUBLIC read (merged + image-resolved). */
export interface ProgramsPublicV2 {
  items: Array<{
    id: string;
    icon?: string | null;
    href?: string | null;
    badge?: string | null;
    image?: HomeResolvedImage | null;
    title: string;
    description?: string | null;
  }>;
  eyebrow?: string | null;
  title?: HomeSplitTitle | null;
  description?: string | null;
  know_more_label?: string | null;
}

/** One flattened stat in the public read (content `value` + text `label` merged by id). */
interface HomePublicStat {
  id: string;
  icon: string | null;
  value: string;
  label: string;
}

/** discounts as served by the PUBLIC read (merged + image-resolved). */
export interface DiscountsPublicV2 {
  logo_image: HomeResolvedImage;
  stats: HomePublicStat[];
  cta_href: string;
  top_badge: string;
  title: HomeSplitTitle;
  subtitle: string;
  subtitle_brand: string;
  cta_label: string;
}

/** social_proof as served by the PUBLIC read (merged). */
export interface SocialProofPublicV2 {
  stats: HomePublicStat[];
  title: HomeSplitTitle;
}

/** mvv as served by the PUBLIC read (merged + image-resolved). */
export interface MvvPublicV2 {
  cards: Array<{
    id: string;
    image: HomeResolvedImage;
    title: string;
    description: string;
    image_alt: string;
  }>;
  title: HomeSplitTitle;
}

/** callout as served by the PUBLIC read (merged). */
export interface CalloutPublicV2 {
  cta_href: string;
  title: HomeSplitTitle;
  description: string;
  cta_label: string;
}

/** app_download as served by the PUBLIC read (merged + image-resolved). */
export interface AppDownloadPublicV2 {
  phone_image: HomeResolvedImage;
  app_store_url: string;
  play_store_url: string;
  qr_appstore: HomeResolvedImage;
  qr_playstore: HomeResolvedImage;
  benefits: Array<{ id: string; icon: string; title: string; description: string }>;
  badge: string;
  title: string;
  subtitle: string;
  phone_alt: string;
  qr_appstore_alt: string;
  qr_playstore_alt: string;
}

/** org as served by the PUBLIC read (merged + image-resolved; rosters NOT included). */
export interface OrgPublicV2 {
  rows: Array<{
    id: string;
    icon: string;
    modal_type: "executives" | "companies" | "advisors";
    title: string;
    description: string;
    metric: string;
  }>;
  doc: HomeResolvedImage;
  title: HomeSplitTitle;
  description: string;
}

/** Common fields of every section item in the public read. */
interface HomeSectionPublicBase {
  /** Section position on the page (0-based; payload is already sorted by it). */
  position: number;
  /** Always true in the public read (disabled sections are filtered server-side). */
  enabled: boolean;
  /** ISO-8601 datetime of the last section update. */
  updatedAt: string | null;
  /** Provenance of the text served for the requested lang. */
  translationSource: HomeTranslationSource;
}

/**
 * One section in the PUBLIC read — discriminated union on `key`. All 9 sections
 * now serve typed content (Fase 2 completed the 6 remaining shapes). A section
 * whose row was never seeded still degrades safely: the FE adapter returns null
 * and the static V1 render is used.
 */
export type HomeSectionPublicV2 =
  | (HomeSectionPublicBase & { key: "hero_carousel"; content: HeroCarouselPublicV2 })
  | (HomeSectionPublicBase & { key: "about"; content: AboutPublicV2 })
  | (HomeSectionPublicBase & { key: "programs"; content: ProgramsPublicV2 })
  | (HomeSectionPublicBase & { key: "discounts"; content: DiscountsPublicV2 })
  | (HomeSectionPublicBase & { key: "social_proof"; content: SocialProofPublicV2 })
  | (HomeSectionPublicBase & { key: "mvv"; content: MvvPublicV2 })
  | (HomeSectionPublicBase & { key: "callout"; content: CalloutPublicV2 })
  | (HomeSectionPublicBase & { key: "app_download"; content: AppDownloadPublicV2 })
  | (HomeSectionPublicBase & { key: "org"; content: OrgPublicV2 });

/**
 * GET /home/sections response payload.
 * Wrapped in `V2Response` → `{ status: "success", data: ListHomeSectionsV2Response }`.
 */
export interface ListHomeSectionsV2Response {
  /** Enabled sections, ordered by position. */
  sections: HomeSectionPublicV2[];
  /** Locale actually served (after `?lang=` / Accept-Language resolution; unknown → "es"). */
  lang: LocaleCode;
}

// ── admin ────────────────────────────────────────────────────────────────────

/** Per-lang translation status row (admin read). */
export interface HomeTranslationStatus {
  lang: LocaleCode;
  source: HomeTranslationSource;
  /** ISO-8601 datetime of the last translation update. */
  updatedAt: string | null;
}

/**
 * One section in the ADMIN read — raw trees, NOT merged, NOT image-resolved
 * (image slots are `HomeImageRef`). Includes disabled sections.
 */
export interface HomeSectionAdminV2 {
  key: HomeSectionKey;
  position: number;
  enabled: boolean;
  /** Whether this key accepts content edits in Fase 1. */
  editable: boolean;
  /** ISO-8601 datetime of the last section update. */
  updatedAt: string | null;
  /** Structural tree (non-translatable). `{}` for Fase-2 keys. */
  content: HomeSectionContentV2 | Record<string, never>;
  /** Spanish text tree (editorial source). Null when no es row exists (Fase-2 keys). */
  text_es: HomeSectionTextV2 | null;
  /** Per-lang translation rows that exist for this section. */
  translations: HomeTranslationStatus[];
}

/** GET /home/sections/admin response payload. Permission: content:read. */
export interface AdminListHomeSectionsV2Response {
  /** All 9 sections (incl. disabled), ordered by position. */
  sections: HomeSectionAdminV2[];
}

/**
 * PATCH /home/sections/{key} body. All fields optional, at least one required.
 * `content`/`text_es` only on Fase-1 editable keys (else 409 `not_editable_yet`);
 * `enabled`/`position` work on all 9. Lists present in BOTH trees must carry
 * identical id sets (else 422 `shape_mismatch`). A `text_es` change marks the
 * es row `source='human'` and re-enqueues machine translation for the other 7.
 */
export interface PatchHomeSectionV2Request {
  /** Structural tree replacing the section's content. Validated per-key. */
  content?: HomeSectionContentV2;
  /** Spanish text tree replacing the es translation. Validated per-key. */
  text_es?: HomeSectionTextV2;
  /** Toggle section visibility on the public Home. */
  enabled?: boolean;
  /** Render slot 0-8. Prefer the reorder endpoint for whole-page ordering. */
  position?: number;
}

/** PATCH /home/sections/{key} response payload. */
export interface PatchHomeSectionV2Response {
  key: HomeSectionKey;
  position: number;
  enabled: boolean;
  /** Persisted structural tree after the patch. */
  content: HomeSectionContentV2 | Record<string, never>;
}

/**
 * POST /home/sections/reorder body — every one of the 9 keys exactly once
 * (else 422 `invalid_order`). Index in the array becomes the position.
 */
export interface ReorderHomeSectionsV2Request {
  order: HomeSectionKey[];
}

/** POST /home/sections/reorder response payload (echo of the applied order). */
export interface ReorderHomeSectionsV2Response {
  order: HomeSectionKey[];
}

/**
 * Error `code` values returned by the Home CMS endpoints
 * (`HTTPException.detail = { code, message }`):
 * - `section_not_found` — 404, unknown `{key}`.
 * - `not_editable_yet`  — 409, content edit on a Fase-2 key.
 * - `shape_mismatch`    — 422, payload failed per-key shape or cross-tree id validation.
 * - `invalid_order`     — 422, reorder list is not the 9 keys exactly once.
 */
export type HomeCmsErrorCode =
  | "section_not_found"
  | "not_editable_yet"
  | "shape_mismatch"
  | "invalid_order";

// ── featured carousel curation (SITIMM-582) ──────────────────────────────────

/**
 * The hero carousel is no longer a hand-written list of images: ANY published
 * content can be promoted into it — a gallery, an event, a programme, a blog
 * post, a general bulletin — through a curation table the backend resolves on
 * every public read.
 *
 * Backend: `app/infrastructure/database/models/home_featured.py`,
 * `app/application/services/home_featured_service.py`.
 *
 * **Backwards compatibility is structural.** A row with `subject_type` NULL IS
 * a manual slide, carrying its own title/summary/image/href — the exact shape
 * the carousel had before. Nothing had to be migrated, and the public payload
 * is unchanged, so a front end that knows nothing about this keeps working.
 *
 * Two things a consumer must not assume:
 * - **A curated row is not necessarily on the page.** It also has to be
 *   enabled, inside its window, and still publicly visible. Read `live` from
 *   the admin list rather than inferring it from `enabled`.
 * - **The order is `rank` ascending**, ties broken by insertion. It is
 *   editorial, never chronological.
 */

/**
 * Content types that can be featured. Mirrors the `subject_type_values` CHECK
 * constraint AND the backend descriptor registry — a type missing from either
 * side is a row that stores fine and renders as nothing.
 *
 * `magazine` joined in v0.122.0: the semestral issue is the item that most
 * wants promoting, and referencing it by uuid is what stops the slide going
 * stale between editions.
 */
export const FEATURED_SUBJECT_TYPES = [
  "gallery",
  "event",
  "program",
  "subprogram",
  "blog_post",
  "bulletin",
  "magazine",
] as const;

/** A featurable content type. `null` on a manual slide. */
export type FeaturedSubjectType = (typeof FEATURED_SUBJECT_TYPES)[number];

/**
 * Type-specific extras a slide may carry, for a badge or a caption. Every key
 * is optional: which ones appear depends on `subject_type` and on what the
 * underlying record actually has.
 */
export interface HomeFeaturedMeta {
  /** Events — ISO-8601 start. */
  date?: string;
  /** Events — venue. */
  place?: string;
  /** Galleries — location tag. */
  location?: string;
  /** Blog posts — estimated reading time. */
  reading_minutes?: number;
}

/**
 * A carousel slide as served by the PUBLIC read.
 *
 * The first eight fields are the shape the carousel always had, so this is
 * assignable wherever the old slide type was used. The rest are additive and
 * safe to ignore.
 */
export interface HomeFeaturedSlidePublicV2 {
  /** The curation row's uuid — stable across edits to the underlying content. */
  id: string;
  href: string | null;
  image: HomeResolvedImage | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  link_label: string | null;
  image_alt: string;
  /**
   * Which content backs this slide.
   *
   * Three states, and they are NOT interchangeable — verified against
   * production on 2026-08-08:
   * - a type string — a curated row pointing at that content;
   * - `null`        — a curated MANUAL row (nothing in the CMS backs it);
   * - **absent**    — the site has no curation rows at all, so the carousel is
   *   still serving the hand-written slides straight from the section's JSONB.
   *
   * Narrow with `slide.subject_type ?? null`, never `=== null`.
   */
  subject_type?: FeaturedSubjectType | null;
  /**
   * The backend's responsive ladder for this image, passed through opaquely.
   * Null when the editor overrode the image, or the source has no variants.
   * Prefer it over `image` where the renderer can use a srcset.
   */
  image_variants?: Record<string, unknown> | null;
  meta?: HomeFeaturedMeta | null;
}

/** What the admin list resolves from the referenced content, when it can. */
export interface HomeFeaturedResolved {
  title: string;
  href: string;
}

/** One curation row, as returned by `GET /home/featured`. */
export interface HomeFeaturedItemV2 {
  uuid: string;
  /** `null` = manual slide; the `override_*` fields ARE its content. */
  subject_type: FeaturedSubjectType | null;
  subject_uuid: string | null;
  /** Editorial order, ascending. Ties break on insertion order. */
  rank: number;
  enabled: boolean;
  /** ISO-8601. Null = already live. */
  starts_at: string | null;
  /** ISO-8601. Null = no expiry set by hand. */
  ends_at: string | null;
  override_title: string | null;
  override_summary: string | null;
  override_image: HomeImageRef | null;
  override_href: string | null;
  /**
   * Whether this row is on the home page RIGHT NOW.
   *
   * `enabled` is the editor's intent; `live` is the outcome. A row is enabled
   * and NOT live when its window has not opened, its event has passed (events
   * expire on their own 24h after `end_date ?? event_date`), or its content was
   * unpublished. Surface this — it is the difference between "I promoted it"
   * and "people can see it".
   */
  live: boolean;
  /** Title/href resolved from the referenced content. Null when not resolvable. */
  resolved: HomeFeaturedResolved | null;
}

/** `GET /home/featured` payload. */
export interface HomeFeaturedItemsV2Response {
  items: HomeFeaturedItemV2[];
  /** The configured ceiling, so a UI can show "8 / 12" without a second call. */
  max_slides: number;
  enabled_count: number;
}

/**
 * Body for `POST /home/featured` and `PUT /home/featured/{uuid}`.
 *
 * PUT is a FULL REPLACE, not a patch: send every field you want kept. That is
 * deliberate — it removes the "is an absent field the same as null" question a
 * partial update has to answer for all ten of them.
 *
 * Rules enforced on write (422 unless noted):
 * - `subject_type` and `subject_uuid` are set TOGETHER or neither.
 * - A manual slide (neither set) MUST carry `override_title`.
 * - `ends_at` must be after `starts_at`.
 * - Featuring the same content twice → 409 `already_featured`.
 * - Enabling past `max_slides` → 409 `featured_limit_reached`.
 */
export interface HomeFeaturedItemV2Request {
  subject_type?: FeaturedSubjectType | null;
  subject_uuid?: string | null;
  rank?: number;
  enabled?: boolean;
  /** ISO-8601 with an OFFSET. A naive datetime is rejected. */
  starts_at?: string | null;
  ends_at?: string | null;
  /** Max 200 chars. Overrides the content's own title where set. */
  override_title?: string | null;
  /** Max 500 chars. */
  override_summary?: string | null;
  override_image?: HomeImageRef | null;
  /**
   * Where the slide points. Required in practice for a manual slide, and the
   * whole point of the legacy case: a promoted item that is not CMS content and
   * lives on another site.
   *
   * Validated as an allowlist of exactly two shapes — an internal path starting
   * with `/`, or an absolute `http(s)` URL. Rejected: `javascript:`, `data:`,
   * protocol-relative `//host`, backslashes and control characters (a browser
   * reads `/\host` as off-site), and URLs carrying credentials
   * (`https://sitimm.org@evil.example` resolves to evil.example).
   */
  override_href?: string | null;
}

/**
 * Body for `POST /home/featured/reorder`.
 *
 * Must list EVERY featured uuid exactly once — a partial, duplicated or unknown
 * list is rejected whole (422 `invalid_order`) rather than applied in part,
 * because an order that silently skips a row is an order nobody asked for.
 */
export interface HomeFeaturedReorderV2Request {
  /** Every uuid, in the order slides should appear. `rank` becomes the index. */
  order: string[];
}

/**
 * Error `code` values specific to the featured endpoints.
 * - `featured_not_found`     — 404, unknown uuid on PUT. (DELETE is idempotent.)
 * - `featured_limit_reached` — 409, enabling would exceed `max_slides`.
 * - `already_featured`       — 409, that content already has a row.
 * - `invalid_order`          — 422, reorder list does not match the rows.
 * - `featured_invalid`       — 422, other write rejection.
 */
export type HomeFeaturedErrorCode =
  | "featured_not_found"
  | "featured_limit_reached"
  | "already_featured"
  | "invalid_order"
  | "featured_invalid";
