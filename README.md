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
