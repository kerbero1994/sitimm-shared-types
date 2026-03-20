# @sitimm/shared-types

Shared TypeScript types for the SITIMM ecosystem.

## Install

```bash
npm install @sitimm/shared-types
```

## Usage

```typescript
import { ApiResponse, UserType, ConsultationV2 } from "@sitimm/shared-types";

// Or import specific modules:
import { UserType, Action, Resource } from "@sitimm/shared-types/users";
import { ConsultationV2 } from "@sitimm/shared-types/consultations";
```

## Modules

| Module | Description |
|--------|-------------|
| `common` | ApiResponse, PaginatedResponse, BaseEntity, ApiError |
| `users` | UserType, permissions (Action, Resource), UserProfileV2 |
| `auth` | AuthPayload, DualAuthPayload, V2TokenData, LoginV2 |
| `consultations` | ConsultationV2, messages, bilateral close, socket events |
| `events` | EventParticipantV2, registration types |
| `companies` | Company, Employee, CompanyDetails, statistics |
| `bulletins` | BulletinV2, list types |
