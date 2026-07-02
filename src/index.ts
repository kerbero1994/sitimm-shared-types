export * from "./common";
export * from "./users";
export * from "./auth";
export * from "./consultations";
export * from "./events";
export * from "./companies";
export * from "./bulletins";
export * from "./endpoints";
export * from "./socket-events";
export * from "./validation";
export * from "./locales";
export * from "./feature-flags";
export * from "./magazines";
export * from "./headquarters";
export * from "./advisor-assignments";
export * from "./censuses";
export * from "./campuses";
export * from "./benefits";
export * from "./ai-stats";
export * from "./notifications";
export * from "./programs";
// NOTE: not a plain `export * from "./galleries"` — `GalleryItemV2` /
// `GalleryV2` collide with the (deprecated, differently-shaped) same-named
// types already exported by `./programs` above (two genuinely different
// backend contracts that happen to share a name — see the `@deprecated`
// JSDoc on programs/index.ts's `GalleryItemV2`/`GalleryV2`). A bare
// `export *` here fails the DTS build with TS2308 ("already exported a
// member"). Every other galleries export is re-exported below; import
// `GalleryItemV2`/`GalleryV2` for the shared Gallery V2 feature directly
// from `@kerbero1994/shared-types/galleries`.
export type {
  GalleryEntityType,
  GalleryVisibility,
  GalleryAudience,
  GalleryModerationStatus,
  GalleryLang,
  GalleryTranslationSource,
  GalleryItemV2CreateInput,
  GalleryItemV2UpdateInput,
  GalleryV2CreateInput,
  GalleryV2UpdateInput,
  GalleryV2ListResponse,
  GalleryAssignmentV2CreateInput,
  GalleryAssignmentV2,
  EntityGalleriesV2Response,
  ReorderGalleryItemsRequest,
  ReorderGalleryItemsResponse,
  GalleryV2ActionResponse,
  GalleryItemV2Public,
  GalleryV2Public,
  GalleryV2PublicListResponse,
  GalleryV2PublicDetail,
  EntityGalleriesV2PublicResponse,
  GalleryTranslationBodyV2,
  GalleryTranslationResponseV2,
  GalleryTranslationsListResponse,
  GalleryItemTranslationBodyV2,
  GalleryItemTranslationResponseV2,
  GalleryItemTranslationsListResponse,
  GalleryV2ErrorCode,
} from "./galleries";
export * from "./faq";
export * from "./bonuses";
export * from "./blogPosts";
export * from "./engagement";
export * from "./ask";
export * from "./censusStats";
export * from "./emailCensusIngestion";
export * from "./notificationsContent";
export * from "./home";
