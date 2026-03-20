# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

`@sitimm/shared-types` is the single source of truth for TypeScript types shared across the SITIMM ecosystem. It is published to GitHub Packages and consumed by sitimmApp, Sitimm-web, and new_dashboard.

## Commands

```bash
npm run build        # Build with tsup (CJS + ESM + .d.ts)
npm run typecheck    # tsc --noEmit
```

## Rules

- **Types only** — no runtime logic, no side effects, no dependencies
- **Exception**: `users/index.ts` exports `UserType`, `Action`, `Resource` as const objects + `hasAtLeast()` helper — these are the only runtime values allowed
- **Snake_case for V2 types** — matches backend JSON responses (e.g., `created_at`, `user_uuid`)
- **CamelCase for V1 types** — matches legacy Sequelize-style responses (e.g., `createdAt`, `CompanyId`)
- **JSDoc every interface** — include a comment mapping to the backend Pydantic schema path
- **Semantic versioning** — breaking field removal/rename = major, new field = minor, JSDoc fix = patch
- **No default exports** — always use named exports

## Structure

```
src/
├── common/        # ApiResponse, PaginatedResponse, BaseEntity, ApiError
├── users/         # UserType, permissions (Action, Resource), UserProfileV2
├── auth/          # AuthPayload, DualAuthPayload, V2TokenData, LoginV2
├── consultations/ # ConsultationV2, messages, bilateral close, socket events
├── events/        # EventParticipantV2, registration types
├── companies/     # Company, Employee, CompanyDetails, statistics
├── bulletins/     # BulletinV2
└── index.ts       # Barrel re-export
```

## Adding a New Module

1. Create `src/{module}/index.ts`
2. Add JSDoc mapping each type to its backend equivalent
3. Add entry to `tsup.config.ts` entry array
4. Add export map entry to `package.json` exports
5. Re-export from `src/index.ts`
6. Run `npm run build && npm run typecheck`
7. Bump version in `package.json`

## Ecosystem

| Repo | Consumes via |
|------|-------------|
| sitimmApp | `npm install @sitimm/shared-types` |
| Sitimm-web | `npm install @sitimm/shared-types` |
| new_dashboard | `pnpm add @sitimm/shared-types` |
| mini-back | Validates Pydantic schemas match these types |
