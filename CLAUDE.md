# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

`@kerbero1994/shared-types` is the single source of truth for TypeScript types AND shared constants across the SITIMM ecosystem. Published to GitHub Packages. Consumed by sitimmApp, Sitimm-web, and new_dashboard.

**Scope: V2 features only.** V1 legacy code keeps its own local types/constants. This package serves the mini-back (FastAPI) API contract and all V2 frontend features.

## Commands

```bash
npm run build        # Build with tsup (CJS + ESM + .d.ts)
npm run typecheck    # tsc --noEmit
```

## Rules

- **Types + const objects only** — no complex runtime logic, no side effects, no dependencies
- **Runtime values allowed**: `as const` objects, regex patterns, helper functions like `cleanDigits()` and `hasAtLeast()`
- **Snake_case for V2 types** — matches backend JSON responses (e.g., `created_at`, `user_uuid`)
- **CamelCase for V1 types** — matches legacy Sequelize-style responses (e.g., `createdAt`, `CompanyId`)
- **JSDoc every interface** — include a comment mapping to the backend Pydantic schema path
- **Semantic versioning** — breaking field removal/rename = major, new field/module = minor, JSDoc fix = patch
- **No default exports** — always use named exports
- **V2 only** — do NOT add V1-specific types here. V1 types stay local in each repo

## Structure

```
src/
├── common/         # ApiResponse, PaginatedResponse, BaseEntity, PAGINATION_DEFAULTS
├── users/          # UserType, permissions (Action, Resource), UserProfileV2
├── auth/           # AuthPayload, DualAuthPayload, V2TokenData, LoginV2
├── consultations/  # ConsultationV2, messages, bilateral close, CONSULTATION_STATES
├── events/         # EventParticipantV2, registration types
├── companies/      # Company, Employee, CompanyDetails, statistics
├── bulletins/      # BulletinV2
├── endpoints/      # V1_PUBLIC_ENDPOINTS, V2_ENDPOINTS (path constants)
├── socket-events/  # SERVER_EVENTS, CLIENT_EVENTS, STATE_CHANGE_EVENTS
├── validation/     # RFC_PATTERN, CURP_PATTERN, FIELD_LIMITS, cleanDigits()
├── locales/        # LOCALE_CODES, LOCALE_NATIVE_NAMES, LOCALE_FLAGS
├── feature-flags/  # CONFIGCAT_FLAGS
└── index.ts        # Barrel re-export
```

## Adding a New Module

1. Create `src/{module}/index.ts`
2. Add JSDoc mapping each type to its backend equivalent
3. Add entry to `tsup.config.ts` entry array
4. Add export map entry to `package.json` exports
5. Re-export from `src/index.ts`
6. Run `npm run build && npm run typecheck`
7. Bump version in `package.json`

## Publish Workflow

1. `npm run build && npm run typecheck`
2. Bump version in `package.json`
3. `npm publish`
4. `git add -A && git commit -m "feat: description"`
5. `git tag vX.Y.Z && git push && git push --tags`
6. Notify consumer repos to update: `npm install @kerbero1994/shared-types@latest` (or `pnpm add -w`)

## Ecosystem

| Repo | Consumes via |
|------|-------------|
| sitimmApp | `npm install @kerbero1994/shared-types` |
| Sitimm-web | `npm install @kerbero1994/shared-types` |
| new_dashboard | `pnpm add -w @kerbero1994/shared-types` |
| mini-back | Source of truth — Pydantic schemas define the contract |
