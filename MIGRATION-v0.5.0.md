# Migration Guide: @kerbero1994/shared-types v0.4.0 → v0.5.0

## Resumen de cambios

El módulo `users` fue reescrito para sincronizar con el refactor V2 de Users en mini-back. Los cambios principales:

1. **SUPER_ADMIN eliminado** del enum `UserType`
2. **Jerarquía reestructurada** — ADMIN sube de nivel 3 a 5, FINANCIAL baja de 5 a 4
3. **UserProfileV2 reescrito** — de interfaz plana snake_case a interfaz estructurada camelCase
4. **Tipos eliminados** — `UpdateProfileV2Request`, `UpdateProfileV2Response`, `UserProfileV2Extended`, `EmployeeDataV2`
5. **Tipos nuevos** — `UserBasicV2`, `EmploymentV2`, `UserMeV2Response`, `FieldPermissions`, `FIELD_GROUPS`, etc.
6. **Convención de naming** — V2 types ahora usan camelCase (coincide con aliases de Pydantic en el BE)

---

## Módulos NO afectados

Los siguientes módulos **no cambiaron** — no requieren migración:
- `consultations`, `events`, `companies`, `bulletins`
- `endpoints`, `socket-events`, `validation`, `locales`, `feature-flags`
- `common`, `auth`

---

## Tabla de tipos: viejo → nuevo

| Eliminado (v0.4.0) | Reemplazo (v0.5.0) | Notas |
|--------------------|--------------------|-------|
| `UserProfileV2` (plano, snake_case) | `UserProfileV2` (camelCase, sin uuid/email/timestamps) | Campos renombrados, ver tabla abajo |
| `UserProfileV2Extended` | Eliminado — usar `UserMeV2Response` | Los nombres resueltos vienen del BE |
| `EmployeeDataV2` | `EmploymentV2` | Campos reducidos a 4 (companyName, job, daySalary, entryDate) |
| `UpdateProfileV2Request` | `UserProfileUpdateV2` | Ahora incluye todos los campos editables |
| `UpdateProfileV2Response` | `UserMeV2Response` | El PATCH ahora retorna la respuesta completa |
| `UserType.SUPER_ADMIN` | `DEPRECATED_SUPER_ADMIN_ID` | Constante para backward compat |

### Tipos nuevos

| Tipo | Propósito |
|------|-----------|
| `UserBasicV2` | id, uuid, email, userType — datos de la tabla User |
| `EmploymentV2` | companyName, job, daySalary, entryDate |
| `UserMeV2Response` | Respuesta completa de GET /api/v2/users/me (user + profile + employment + fieldPermissions) |
| `FieldPermissionState` | `"editable" \| "readonly" \| "hidden"` |
| `FieldPermissions` | `Record<ProfileFieldName, FieldPermissionState>` |
| `ProfileFieldName` | Union type de los 21 campos controlados |
| `PROFILE_FIELDS` | Array const con los 21 nombres de campo |
| `FIELD_GROUPS` | Agrupación semántica: CONTACT, PERSONAL, SINDICAL, ADDRESS, STATS, LABOR, SINDICAL_META |
| `USER_TYPE_ORDER` | Lista ordenada de UserTypeValue (lowest → highest) |
| `resolveUserType()` | Convierte int de DB a UserTypeValue con compat SUPER_ADMIN |
| `DEPRECATED_SUPER_ADMIN_ID` | `72468` — para migración de datos legacy |

---

## Campos de UserProfileV2: viejo → nuevo

| Campo viejo (snake_case) | Campo nuevo (camelCase) | Notas |
|--------------------------|------------------------|-------|
| `uuid` | **Movido a `UserBasicV2.uuid`** | Ya no está en profile |
| `email` | **Movido a `UserBasicV2.email`** | Ya no está en profile |
| `first_name` | `name` | Renombrado |
| `last_name` | `lastNames` | Renombrado |
| `date_of_birth` | `dateOfBirth` | snake → camel |
| `rfc` | `rfc` | Sin cambio |
| `curp` | `curp` | Sin cambio |
| `nss` | `nss` | Sin cambio |
| `personal_phone` | `personalPhone` | snake → camel |
| `mobile_phone` | `mobilePhone` | snake → camel |
| `other_email` | `otherMail` | Renombrado |
| `avatar_url` | `profilePic` | Renombrado |
| `charge` | `charge` | Sin cambio |
| `address` | `address` | Sin cambio |
| `sex` | `sex` | Sin cambio |
| `civil_state_id` | `civilStateId` | snake → camel |
| `scholarship_id` | `scholarshipId` | snake → camel |
| `company_uuid` | **Eliminado** | Viene en EmploymentV2/CompanyDataV2 |
| `company_name` | **Eliminado** | Viene en EmploymentV2.companyName |
| `user_type` | **Movido a `UserBasicV2.userType`** | Ya no está en profile |
| `created_at` | **Eliminado** | No se expone en V2 |
| `updated_at` | **Eliminado** | No se expone en V2 |
| — (nuevo) | `paternalLast` | Nuevo campo |
| — (nuevo) | `maternalLast` | Nuevo campo |
| — (nuevo) | `title` | Nuevo campo |
| — (nuevo) | `city` | Nuevo campo |
| — (nuevo) | `affiliationDate` | Nuevo campo |

### Campos de CompanyDataV2: snake_case → camelCase

| Campo viejo | Campo nuevo |
|-------------|-------------|
| `industrial_park` | `industrialPark` |
| `has_committee` | `hasCommittee` |
| `colective_contract` | `colectiveContract` |
| `internal_regulation` | `internalRegulation` |
| `other_documents` | `otherDocuments` |

### Campos de ChangePasswordV2Request: snake_case → camelCase

| Campo viejo | Campo nuevo |
|-------------|-------------|
| `current_password` | `currentPassword` |
| `new_password` | `newPassword` |

---

# Migración por Repo

---

## 1. sitimmApp (React Native / Expo)

### Impacto: ALTO — 3 archivos principales + 1 pantalla completa

### Paso 1: Actualizar dependencia

```bash
npm install @kerbero1994/shared-types@0.5.0
```

### Paso 2: Reescribir `src/api/v2/types.ts`

**Archivo**: `src/api/v2/types.ts`

Reemplazar las re-exportaciones de users:

```typescript
// ❌ ANTES (v0.4.0)
export type {
  ChangePasswordV2Request,
  CompanyDataV2,
  EmployeeDataV2,
  UpdateProfileV2Request,
  UpdateProfileV2Response,
  UserProfileV2,
  UserProfileV2Extended,
} from "@kerbero1994/shared-types/users";

// ✅ DESPUÉS (v0.5.0)
export type {
  ChangePasswordV2Request,
  CompanyDataV2,
  EmploymentV2,
  UserBasicV2,
  UserMeV2Response,
  UserProfileUpdateV2,
  UserProfileV2,
} from "@kerbero1994/shared-types/users";

export {
  FIELD_GROUPS,
  PROFILE_FIELDS,
} from "@kerbero1994/shared-types/users";

export type {
  FieldPermissions,
  FieldPermissionState,
  ProfileFieldName,
} from "@kerbero1994/shared-types/users";
```

### Paso 3: Reescribir `src/api/v2/profileApiV2.ts`

**Archivo**: `src/api/v2/profileApiV2.ts`

Cambios clave:
- `getProfileV2` ahora retorna `UserMeV2Response` (no `UserProfileV2Extended`)
- Ya NO necesita 3 queries separadas — el BE retorna todo en un solo endpoint GET /api/v2/users/me
- `getEmploymentV2` y `getCompanyV2` pueden simplificarse o eliminarse si el BE ya incluye employment en la respuesta unificada
- `updateProfileV2` cambia:
  - Request type: `UpdateProfileV2Request` → `UserProfileUpdateV2`
  - Response: ya no es `UpdateProfileV2Response` con `{ user, message }` — ajustar al nuevo response shape
- `changePasswordV2` — el body ahora usa camelCase:
  - `current_password` → `currentPassword`
  - `new_password` → `newPassword`

**Decisión arquitectónica**: El BE ahora retorna `user + profile + employment + fieldPermissions` en un solo GET. La app puede:
- **Opción A**: Un solo query `getProfileV2` que retorna `UserMeV2Response` y la UI destructura lo que necesita
- **Opción B**: Mantener queries separados si los endpoints employment/company siguen existiendo por separado

Recomendación: **Opción A** — simplifica el código y reduce requests.

### Paso 4: Reescribir `src/screens/Profile/ProfileScreenV2.tsx`

**Archivo**: `src/screens/Profile/ProfileScreenV2.tsx`

Este es el cambio más grande. La pantalla actualmente:
1. Hace 3 queries separadas (profile, employment, company)
2. Usa snake_case para acceder a campos (`profile.first_name`, `profile.user_type`, etc.)
3. Tiene hardcoded qué campos son editables via `FIELD_V1_TO_V2` mapping
4. No usa field permissions del BE

Migración necesaria:

**a) Tipos de datos** — actualizar imports:
```typescript
// ❌ ANTES
import type { CompanyDataV2, EmployeeDataV2, UserProfileV2Extended } from "@/api/v2/types";

// ✅ DESPUÉS
import type { UserMeV2Response, EmploymentV2, CompanyDataV2 } from "@/api/v2/types";
import type { FieldPermissions } from "@/api/v2/types";
```

**b) Acceso a campos de profile** — todos cambian a camelCase:
```typescript
// ❌ ANTES                    // ✅ DESPUÉS
profile.first_name          →  profile.name
profile.last_name           →  profile.lastNames
profile.date_of_birth       →  profile.dateOfBirth
profile.user_type           →  user.userType          // ahora en UserBasicV2
profile.scholarship_name    →  ❌ eliminado (resolver en FE o nuevo endpoint)
profile.civil_state_name    →  ❌ eliminado (resolver en FE o nuevo endpoint)
profile.personal_phone      →  profile.personalPhone
profile.mobile_phone        →  profile.mobilePhone
profile.other_email         →  profile.otherMail
profile.company_name        →  employment?.companyName  // movido
```

**c) Eliminar `FIELD_V1_TO_V2` y `EditableFieldV2`** — reemplazar con fieldPermissions:
```typescript
// ❌ ANTES — hardcoded editable fields
type EditableFieldV2 = "email" | "mobile_phone" | "personal_phone" | "address" | "other_email";
const FIELD_V1_TO_V2: Record<string, EditableFieldV2> = { ... };

// ✅ DESPUÉS — dinámico basado en fieldPermissions del BE
// fieldPermissions ya dice qué campos son "editable", "readonly" o "hidden"
const isEditable = (field: ProfileFieldName) => fieldPermissions[field] === "editable";
const isVisible = (field: ProfileFieldName) => fieldPermissions[field] !== "hidden";
```

**d) `buildProfileSections()`** — reestructurar para usar fieldPermissions:
```typescript
// Usar FIELD_GROUPS para organizar las secciones
// Filtrar campos hidden, marcar editables dinámicamente
FIELD_GROUPS.PERSONAL.filter(f => isVisible(f)).map(field =>
  row(labelKey, profile[field], icon, isEditable(field) ? field : undefined)
);
```

**e) `buildEmploymentSection()`** — actualizar campos:
```typescript
// ❌ ANTES (EmployeeDataV2)     // ✅ DESPUÉS (EmploymentV2)
employment.payroll            →  ❌ no existe en EmploymentV2
employment.day_salary         →  employment.daySalary
employment.entry              →  employment.entryDate
employment.address            →  ❌ no existe en EmploymentV2
employment.city_text          →  ❌ no existe en EmploymentV2
```

**f) `buildCompanySection()`** — actualizar a camelCase:
```typescript
company.industrial_park     →  company.industrialPark
company.has_committee       →  company.hasCommittee
company.colective_contract  →  company.colectiveContract
company.internal_regulation →  company.internalRegulation
company.other_documents     →  company.otherDocuments
```

### Paso 5: Actualizar mocks

**Archivos**: `src/api/v2/mocks/profile_mock.json`, `employment_mock.json`, `company_mock.json`

Los mocks deben coincidir con los nuevos shapes. El profile mock debe incluir la estructura `UserMeV2Response`:
```json
{
  "user": { "id": 1, "uuid": "...", "email": "...", "userType": 63974 },
  "profile": { "name": "Juan", "lastNames": "Pérez", ... },
  "employment": { "companyName": "...", "job": "...", ... },
  "fieldPermissions": { "name": "readonly", "email": "editable", ... }
}
```

### Paso 6: Verificar `src/schemas/profile.ts`

**Sin cambios necesarios** — este archivo usa `@kerbero1994/shared-types/validation` (no afectado) y sus campos de schema ya usan camelCase (`name`, `lastNames`, `personalPhone`, `mobilePhone`). Sin embargo, verificar que `passwordChangeSchema` use `currentPassword`/`newPassword` (ya lo hace).

### Archivos NO afectados en sitimmApp

Estos archivos importan de módulos que no cambiaron:
- `src/api/common/publicEndpoints.ts` — usa `endpoints` (sin cambios)
- `src/services/socketService.ts` — usa `socket-events` (sin cambios)
- `src/schemas/consultation.ts` — usa `validation` (sin cambios)
- `src/schemas/events.ts` — usa `validation` (sin cambios)
- `src/screens/EventsRegister/GuestInfo.tsx` — usa `validation` (sin cambios)
- `src/screens/ConsultationsCreate/utils.ts` — usa `validation` (sin cambios)
- `src/featureFlags/*.ts` — usa `feature-flags` (sin cambios)
- `src/i18n/languageDetector.ts` — usa `locales` (sin cambios)

---

## 2. new_dashboard (React / Vite / MUI)

### Impacto: MEDIO — 1 archivo principal

### Paso 1: Actualizar dependencia

```bash
pnpm add -w @kerbero1994/shared-types@0.5.0
```

### Paso 2: Reescribir `src/services/features/userProfile.types.ts`

**Archivo**: `src/services/features/userProfile.types.ts`

```typescript
// ❌ ANTES
import type { UpdateProfileV2Request, UserProfileV2 } from "@kerbero1994/shared-types/users";
export interface UserMeProfileRaw extends UserProfileV2 { ... }
export interface UserSelfUpdateRequest extends UpdateProfileV2Request { ... }

// ✅ DESPUÉS
import type { UserProfileUpdateV2, UserProfileV2, UserMeV2Response } from "@kerbero1994/shared-types/users";
// UserProfileV2 cambió de shape — revisar todos los campos que extiende UserMeProfileRaw
// UpdateProfileV2Request → UserProfileUpdateV2
```

Los campos que `UserMeProfileRaw` extienda de `UserProfileV2` ahora son camelCase. Revisar que las extensiones locales coincidan.

### Paso 3: Actualizar `src/services/features/userProfile.api.ts`

Endpoints siguen usando `V2_ENDPOINTS` (sin cambios en el módulo endpoints), pero los tipos de response/request cambiaron. Ajustar los genéricos de RTK Query.

### Archivos NO afectados en new_dashboard

- `src/services/features/consultations.api.ts` — usa `endpoints` (sin cambios)
- `src/services/features/consultations.types.ts` — usa `consultations` (sin cambios)
- `src/i18n.ts` — usa `locales` (sin cambios)
- `src/Views/consultations/hooks/useConsultationSocket.ts` — usa `socket-events` + `consultations` (sin cambios)

---

## 3. Sitimm-web (Next.js)

### Impacto: NINGUNO

Sitimm-web **no importa nada del módulo `users`**. Solo usa:
- `locales` — sin cambios
- `validation` — sin cambios

Solo necesita actualizar la dependencia para estar en sync:
```bash
npm install @kerbero1994/shared-types@0.5.0
```

---

## Checklist de migración

### sitimmApp
- [ ] `npm install @kerbero1994/shared-types@0.5.0`
- [ ] Reescribir `src/api/v2/types.ts` — re-exportaciones de users
- [ ] Reescribir `src/api/v2/profileApiV2.ts` — queries, tipos, response shapes
- [ ] Reescribir `src/screens/Profile/ProfileScreenV2.tsx` — camelCase fields + fieldPermissions
- [ ] Actualizar mocks en `src/api/v2/mocks/`
- [ ] Verificar `src/schemas/profile.ts` (probablemente sin cambios)
- [ ] `npx tsc --noEmit` — sin errores nuevos
- [ ] Actualizar `docs/v2/users/types.md` y `CHANGELOG.md`

### new_dashboard
- [ ] `pnpm add -w @kerbero1994/shared-types@0.5.0`
- [ ] Actualizar `src/services/features/userProfile.types.ts`
- [ ] Actualizar `src/services/features/userProfile.api.ts`
- [ ] Typecheck
- [ ] Actualizar docs si existen

### Sitimm-web
- [ ] `npm install @kerbero1994/shared-types@0.5.0`
- [ ] Verificar build (no debería romper nada)
