# Changelog

## 0.54.0 (2026-05-08)

### Added — FAQ V2 module

- `faq/blocks` — 14-type discriminated union (`FAQBlock`)
- `faq/article` — `FAQArticleV2`, `FAQArticleSummaryV2`, `FAQArticleRevisionV2`, `FAQCitationV2`
- `faq/category` — `FAQCategoryV2`, `FAQCategoryRefV2`
- `faq/resource` — `FAQResourceV2` + `FAQResourceKind`, `FAQResourceEnrichmentStatus`
- `faq/glossary` — `FAQGlossaryTermV2`
- `faq/translation` — `FAQ_LOCALE_CODES`, `FAQLocaleCode`
- `faq/search` — `FAQSearchHitV2`, `FAQSearchResponseV2`, `FAQSearchSuggestItemV2`
- `faq/notification` — `FAQNotificationPayloadV2`, `FAQNotificationDataV2`
- `faq/bookmark`, `faq/subscription`, `faq/feedback`
- `faq/errors` — `FAQ_ERROR_CODES` (24 codes), `FAQErrorCode`, `FAQErrorPayload`
- `faq/source-authority` — `FAQ_SOURCE_AUTHORITIES`, `FAQSourceAuthority`
- `faq/limits` — `FAQ_LIMITS`
- `endpoints` — `FAQ_V2_ENDPOINTS` constant added

Backend spec: `docs/superpowers/specs/2026-05-08-faq-v2-design.md` (mini-back).

### Tooling

- Added `vitest@^1.6.1` as devDependency for unit tests.
- Added `"test": "vitest run"` script to package.json.
