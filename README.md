# @kerbero1994/shared-types

Shared TypeScript types and constants for the SITIMM ecosystem. V2 features only.

## Install

```bash
# sitimmApp / Sitimm-web
npm install @kerbero1994/shared-types

# new_dashboard
pnpm add -w @kerbero1994/shared-types
```

## Usage

```typescript
// Import specific modules (recommended):
import { UserType, UserProfileV2 } from "@kerbero1994/shared-types/users";
import { ConsultationV2 } from "@kerbero1994/shared-types/consultations";
import { V2_ENDPOINTS, endpoint } from "@kerbero1994/shared-types/endpoints";
import { RFC_PATTERN, FIELD_LIMITS } from "@kerbero1994/shared-types/validation";
```

## Modules

| Module | Description |
|--------|-------------|
| `common` | ApiResponse, PaginatedResponse, V2Response, BaseEntity, PAGINATION_DEFAULTS |
| `users` | UserType, permissions, UserProfileV2, EmployeeDataV2, CompanyDataV2 |
| `auth` | AuthPayload, DualAuthPayload, V2TokenData, LoginV2, MenuItem |
| `consultations` | ConsultationV2, messages, bilateral close, CONSULTATION_STATES, socket payloads |
| `events` | EventParticipantV2, registration request/response types |
| `companies` | Company, Employee, CompanyDetails, statistics |
| `bulletins` | BulletinV2, list request/response types |
| `endpoints` | V1_PUBLIC_ENDPOINTS, V2_ENDPOINTS, endpoint() helper |
| `socket-events` | SERVER_EVENTS, CLIENT_EVENTS, STATE_CHANGE_EVENTS, SOCKET_CONFIG |
| `validation` | RFC_PATTERN, CURP_PATTERN, PHONE_MX_PATTERN, FIELD_LIMITS, cleanDigits() |
| `locales` | LOCALE_CODES, LOCALE_NATIVE_NAMES, LOCALE_FLAGS, DEFAULT_LOCALE |
| `feature-flags` | CONFIGCAT_FLAGS |
| `media` | MediaV2, MediaAdminV2, GalleryMediaV2, TagV2, media search + attach types (DAM F1) |
| `collections` | CollectionV2, CollectionGalleryV2, attach/reorder + paginated list types (DAM F2a) |
| `magazines` | MagazineV2, MagazineDetailV2, MagazineAuthorV2, TableOfContentsEntry, sort/category enums |
| `headquarters` | HeadquarterDetail, create/update requests, HQMetricsSummary, AllHQMetricsResponse |
| `advisor-assignments` | AssignRequest, UnassignRequest, AdvisorAssignmentInfo, AssignResponse |
| `campuses` | CampusV2, AccessMode, create/update requests, EventCampusV2 |
| `benefits` | BenefitCategory, BenefitCatalogItem, NormalizedBenefit, ContractVersion |
| `bonuses` | BonusDiscountType, BonusBadge, BonusCategory, BonusSubcategory, BonusAmenity |
| `programs` | ProgramCurrentLang, SubProgramCurrentLang, ImageVariants, GalleryV2 |
| `galleries` | GalleryEntityType, GalleryVisibility, GalleryAudience, moderation + scan status |
| `faq` | FAQCategoryV2, FAQCategoryTreeResponse, callout/image-align enums |
| `home` | HOME_SECTION_KEYS, EditableHomeSectionKey, HomeTranslationSource, HomeImageRef |
| `notifications` | ContentNotificationType, AnnouncementNotification, TopicBroadcastRequest, NOTIFICATION_DATA_KEYS |
| `notificationsContent` | `POST /api/v1/notifications/content` — manual admin announcement broadcast |
| `audience-templates` | AudienceTemplateV2, list response, create/update requests |
| `censuses` | Barrel: `stats` + `statistics-v2` + `reports` (CSV upload, report jobs) |
| `censusStats` | V1 stored stats + V2 on-demand statistics / municipalities / map endpoints |
| `emailCensusIngestion` | IMAP → census automation: pending files, processing logs, sender trust |
| `blogPosts` | Blogs V2: BLOG_LOCALES, BlogPostStatus, list filters, FCM topics |
| `engagement` | Engagement bounded context: subject types, reaction kinds (shared by blog/magazine/events) |
| `ask` | Chatbot RAG (V1-only): supported languages, user types, sources |
