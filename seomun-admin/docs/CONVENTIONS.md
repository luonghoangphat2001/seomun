# Seomun Admin Conventions

This document defines the architectural and organizational conventions for the Seomun Admin project. Its purpose is to give every contributor a single, consistent baseline for project structure, ownership, naming, and dependency boundaries.

## 1. Objectives

- Keep the codebase easy to read, review, and onboard into.
- Separate application composition, business domains, shared UI, and shared utilities clearly.
- Avoid ad hoc folder structures, naming styles, and import patterns.
- Prefer consistency over cleverness.

## 2. Architecture Overview

The project is organized into the following layers:

- `src/app`: application composition, router, providers, navigation, app-level layout, and route wiring
- `src/features`: domain and business modules
- `src/components`: shared reusable UI with no feature-specific business ownership
- `src/config`: application-wide configuration
- `src/constants`: shared application-wide constants
- `src/enums`: shared application-wide enums
- `src/hooks`: shared hooks not owned by a single feature
- `src/lib`: infrastructure and framework-level helpers
- `src/stores`: true cross-feature global state
- `src/types`: shared application-wide types
- `src/utils`: pure utilities with no business logic

Core principles:

- `app` composes the application.
- `features` own business logic.
- `components` own reusable shared UI only.
- If something belongs to a single feature, keep it inside that feature first.

## 3. Folder Ownership

### `src/app`

Owns:

- route definitions and route guards
- providers and bootstrap
- app shell and app-level layout
- navigation configuration
- route-level helpers
- i18n setup

Must not contain:

- feature API modules
- feature schemas
- feature query hooks
- feature business components
- feature business transforms

### `src/features/<feature>`

Each feature is an independent business module.

A feature may contain:

- `api/`
- `components/`
- `constants/`
- `enums/`
- `hooks/`
- `pages/`
- `schemas/`
- `types/`
- `utils/`
- `index.ts`

Only create folders when needed, but once a pattern is used it should stay consistent across features.

By default, the following belong inside the feature:

- business logic
- feature-specific components
- feature-specific constants
- feature-specific enums
- feature-specific types
- feature-specific mocks

### Large Features with Multiple Subdomains

If several menu items belong to the same domain, organize them as sub-features under one feature.

Example:

```text
src/features/system-content/
  banners/
  notices/
  faqs/
  popups/
  index.ts
```

Each sub-feature may expose its own `index.ts` as a public API.

### `src/components`

Owns shared reusable UI only:

- `components/ui`: primitives and base UI
- `components/shared`: shared building blocks used across multiple features

Must not contain:

- app-level layout
- feature-specific business components
- components with hidden domain rules

### `src/lib`

Owns infrastructure and framework-level concerns, such as:

- API client
- query client setup
- auth helpers
- adapters for third-party libraries

Business logic does not belong in `lib`.

### `src/constants`, `src/enums`, `src/types`

These folders only contain application-wide shared artifacts.

If a constant, enum, or type belongs to a specific domain, keep it inside that feature.

## 4. Import Boundaries

These are the most important rules in the project.

### Rule 1: Features must not import from `app`

`src/features/**/*` must not import from `@/app/**`.

### Rule 2: `app` may only use features through their public APIs

`src/app/**/*` may only import features through:

```ts
@/features/<feature>
```

or, for sub-features:

```ts
@/features/<feature>/<sub-feature>
```

Direct imports into internal feature modules are not allowed.

Disallowed examples:

```ts
@/features/<feature>/api/**
@/features/<feature>/components/**
@/features/<feature>/pages/**
@/features/<feature>/schemas/**
@/features/<feature>/types/**
@/features/<feature>/enums/**
@/features/<feature>/constants/**
@/features/<feature>/utils/**
```

### Rule 3: Feature-to-feature imports must also go through public APIs

If one feature uses another feature, it must import through:

```ts
@/features/<feature>
```

or:

```ts
@/features/<feature>/<sub-feature>
```

Direct imports into another feature's internals are not allowed.

### Rule 4: Shared layers must not depend upward on `app` or feature internals

The following folders must not import business internals from features, and by default must not import from `app`:

- `src/components`
- `src/hooks`
- `src/lib`
- `src/utils`
- `src/types`
- `src/enums`
- `src/constants`

### Rule 5: Do not bypass boundaries for convenience

If a consumer needs something that is not exported yet, update the relevant `index.ts`. Do not import an internal file directly just because it is faster.

## 5. Feature Public APIs

Every feature must expose an `index.ts`.

If a large feature contains sub-features with their own external surface, each sub-feature should also expose an `index.ts`.

The `index.ts` file is the public API for that feature or sub-feature. External consumers must import through that file only.

Example:

```text
src/features/system-content/notices/
  api/
    notice.api.ts
    notice.query.ts
  pages/
    NoticeListPage.tsx
  schemas/
    notice-list-search.schema.ts
  types/
    notice.type.ts
  index.ts
```

```ts
// src/features/system-content/notices/index.ts
export { NoticeListPage } from './pages/NoticeListPage';
export { useNoticesQuery } from './api/notice.query';
export { noticeListSearchSchema } from './schemas/notice-list-search.schema';
export type { Notice } from './types/notice.type';
```

Correct:

```ts
import { NoticeListPage } from '@/features/system-content/notices';
```

Incorrect:

```ts
import { NoticeListPage } from '@/features/system-content/notices/pages/NoticeListPage';
import { useNoticesQuery } from '@/features/system-content/notices/api/notice.query';
```

Rules for `index.ts`:

- use relative exports
- do not re-import from the feature's own alias
- export only what is intentionally public

## 6. Route Conventions

Files in `src/app/routes` must stay thin.

Routes should only contain:

- TanStack Router path declarations
- `validateSearch`
- `loader` or query prefetching
- `beforeLoad` when needed
- `head`
- rendering of the page entry component

Routes must not contain:

- table column definitions
- long form submission flows
- long mutation side effects
- complex business transforms
- payload mapping
- mock data
- large UI branching logic

Routes orchestrate. Long-lived business logic belongs in the feature.

## 7. Feature Structure Convention

The project standard is:

- use `pages`
- do not use `screens`
- large domains may be split into sub-features

Example:

```text
src/features/permissions/
  api/
    permission.api.ts
    permission.service.ts
    permission.query.ts
    permission.request.ts
    permission.response.ts
    index.ts
  components/
    PermissionColumns.tsx
    PermissionForm.tsx
    PermissionSearchFilter.tsx
  constants/
    permission.constants.ts
  enums/
    permission.enum.ts
  pages/
    PermissionListPage.tsx
    PermissionCreatePage.tsx
    PermissionEditPage.tsx
  schemas/
    permission-form.schema.ts
    permission-list-search.schema.ts
  types/
    permission.type.ts
  index.ts
```

## 8. Data Fetching Convention

TanStack Query is the standard.

Inside `features/<feature>/api`:

- `*.api.ts`: raw API calls; exported raw API functions must end with `API` (for example, `getPermissionsAPI`)
- `*.service.ts`: payload mapping, response normalization, API composition, and feature-level mock switching
- `*.query.ts`: query keys, query options, and hooks
- `*.request.ts`: request types; request payload types must end with `REQ`
- `*.response.ts`: response types; response payload types must end with `RESP`

Rules:

- pages and components should not call APIs directly if the feature already exposes query hooks
- query hooks should call `*.service.ts`, not `*.api.ts` or mock modules directly
- query keys must follow the feature standard
- mock data is temporary and must stay in `features/<feature>/mocks`
- mock on/off switching should live in `*.service.ts` with a feature-level flag such as `USE_<FEATURE>_MOCK`

## 9. Form Convention

The standard form stack is `react-hook-form` + `zod`.

Rules:

- schemas are the source of truth
- schemas belong in `schemas/`
- field names across schema, form UI, and payload must map clearly
- do not spread transformations across many child components
- payload mapping should usually live in `*.service.ts` when it is tied to request or response shapes

## 10. State Management Convention

State priority order:

- URL state
- server state
- local component state
- global store

Use Zustand only when state is truly cross-feature or must outlive a page or component lifecycle.

Do not use global state for:

- single-form state
- page-local modal state
- local filter state
- temporary UI state

For list/filter screens, prefer route `searchParams` (URL state) over local-only filter state so links are shareable and browser back/forward restores filter context.

## 11. Enum, Type, and Constant Convention

### Enums

- use `string enum`
- do not use numeric enums
- enum names use `PascalCase`
- enum members use `UPPER_SNAKE_CASE`
- enum string values use `UPPER_SNAKE_CASE`
- feature-owned enums live in `enums/`
- shared application-wide enums live in `src/enums`
- do not rely on lowercase enum values for labels, i18n keys, or search params; use explicit mapping/helper functions when display or wire values differ

Example:

```ts
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}
```

Feature example:

```text
src/features/orders/enums/order.enum.ts
```

A single feature may group related enums into one file when the set is small.

### Types

- feature-owned types live in `types/`
- shared application-wide types live in `src/types`

Example:

```text
src/features/orders/types/order.type.ts
```

### Constants

- feature-owned constants live in `constants/`
- shared application-wide constants live in `src/constants`

Example:

```text
src/features/orders/constants/order.constants.ts
```

### Ownership Rule for Reuse

Do not promote something to shared just because it is reused.

If `OrderStatus` belongs to the orders domain and another feature needs it, that feature may import it through the public API of `orders`. The concept still belongs to `orders` unless it has genuinely become application-wide.

## 12. Naming Convention

### Folders

- always use `kebab-case`

Examples:

- `system-content`
- `system-logs`
- `app-input`

### Components

- use `PascalCase`
- page entry components must end with `Page`
- do not mix `Screen`, `View`, and `Container` for the same role

Examples:

- `PermissionListPage`
- `AppSidebar`
- `NoticeForm`

### Hooks

- use `useXxx`

Examples:

- `usePermissionsQuery`
- `useOrderFilters`

### Types, Interfaces, and Enums

- use `PascalCase`
- choose names that describe the domain clearly
- avoid vague names such as `Data`, `Item`, or `Info`

### File Naming

Project standard:

- folders: `kebab-case`
- component and page files: `PascalCase`
- non-component files: `kebab-case`

Examples:

- `pages/PermissionListPage.tsx`
- `api/permission.query.ts`
- `schemas/permission-form.schema.ts`
- `enums/permission.enum.ts`
- `types/permission.type.ts`

## 13. Shared Component Convention

Shared components must be:

- genuinely reusable
- free of domain-specific business logic
- explicit in their API

Promote something to shared only when:

- it is used in at least two places, or
- it is clearly a foundational primitive

If a component is used by a single feature, keep it in that feature.

## 14. i18n Convention

- new features should use i18n for user-facing text
- do not hardcode strings in screens that already follow the multilingual approach
- navigation, page titles, labels, and messages should use translation keys
- do not import locale JSON files directly into feature screens
- update locale keys directly in `src/app/i18n/locales/en.json` and `src/app/i18n/locales/ko.json`
- do not rely on generated i18n key workflows for feature delivery
- before adding a new key, check shared keys first (`common.action.*`, `common.message.*`, `table.empty`) and reuse when semantics match
- feature-specific keys must be namespaced by module (for example `page.customers.*`) to prevent cross-module key conflicts

## 15. Import Style and Code Style

- prefer absolute imports through `@/`
- use `import type` for type-only imports
- do not leave unused imports
- do not keep dead code or stale comments in files
- follow the repository's ESLint and Prettier setup

## 16. Component Code Organization Convention

Component files must follow a consistent internal structure for readability and maintainability. This ensures every developer knows where to find and place code within a component.

### Required Order of Code Sections

1. **Imports** — all import statements at the top
2. **Type Definitions** — component props interfaces, internal types
3. **Variables** — const declarations outside of hooks and state
4. **Hooks** — `useQuery`, `useForm`, `useContext`, custom hooks, etc. (in order of use)
5. **State** — `useState` declarations (group related state together)
6. **Functions** — event handlers, utility functions, transformers (in logical order of use)
7. **useEffect** — side effect hooks (must be placed before JSX return)
8. **JSX Return** — component markup

### Organization with Comments

Use visual section separators to make boundaries clear:

```tsx
import { useEffect, useState } from 'react';

type ComponentProps = {
  initialValue?: string;
  onSubmit: (value: string) => void;
};

export function MyComponent({ initialValue, onSubmit }: ComponentProps) {
  // ============================================================================
  // Variables
  // ============================================================================
  const isValid = initialValue && initialValue.length > 0;

  // ============================================================================
  // Hooks
  // ============================================================================
  const { data, isLoading } = useQuery(...);

  // ============================================================================
  // State
  // ============================================================================
  const [value, setValue] = useState<string>(initialValue ?? '');
  const [errors, setErrors] = useState<string[]>([]);

  // ============================================================================
  // Functions
  // ============================================================================
  const handleChange = (newValue: string) => {
    setValue(newValue);
    setErrors([]);
  };

  const handleSubmit = () => {
    if (!isValid) {
      setErrors(['Value is required']);
      return;
    }
    onSubmit(value);
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}
```

### Why This Order Matters

- **Imports first**: Standard practice
- **Types before code**: Makes props and internal types immediately visible
- **Variables early**: Context setters can be used in hook setup and state defaults
- **Hooks before state**: Some hooks generate state defaults, so dependencies are clear
- **State before functions**: Functions often reference state
- **Functions before effects**: Effects may call functions
- **Effects before JSX**: Effects must be registered before render to avoid stale dependencies
- **JSX last**: Readers can quickly understand what the component renders

### When to Deviate

- For very simple components (no state, no effects, no handlers), the section structure can be condensed
- Keep section comments even in condensed components for clarity if the file is likely to grow

### Export Style

- Named exports for components
- Keep component export at the top level (not nested inside other functions)

Example:

```tsx
export function MyComponent() {
  // component code
}

// NOT: export const MyComponent = () => { ... }
```

## 17. Enum and Export Pattern Convention

### Enums in Shared Folders

When an enum is used across multiple domains or is application-wide:

- Place it in `src/enums/`
- Use `string` enums with `UPPER_SNAKE_CASE` values, not numeric or lowercase values
- If the enum has metadata (labels, descriptions), create a companion constant

Example:

```ts
// src/enums/status.enum.ts
export enum Status {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const STATUS_LABELS = {
  [Status.PENDING]: 'Pending',
  [Status.COMPLETED]: 'Completed',
  [Status.FAILED]: 'Failed',
} satisfies Record<Status, string>;
```

### Enums in Feature Folders

When an enum belongs to a specific domain:

- Place it in `src/features/<feature>/enums/`
- Follow the same pattern as shared enums
- Export through the feature's `index.ts`
- If an existing feature still has lowercase enum values, treat it as legacy compatibility until that feature is explicitly refactored.

### Feature Export Patterns

Each feature's `index.ts` must balance simplicity with explicit API control:

- **Use `export * from './api'`** for API modules (simplifies re-exports of query functions, types, and utilities)
- **Use named exports** for pages and components (explicit public API, prevents accidental exports)
- **Use named exports** for schemas and types that are part of the feature contract

Example:

```ts
// src/features/orders/index.ts
export { OrderListPage } from './pages/OrderListPage';
export { OrderForm } from './components/OrderForm';
export { orderListSearchSchema } from './schemas/order-list-search.schema';
export type { Order } from './types/order.type';
export * from './api'; // exports all query hooks, API functions, types
export * from './enums'; // exports enums and type definitions
```

Correct imports:

```ts
import { OrderListPage, Order, useOrdersQuery } from '@/features/orders';
```

Do NOT reach into internals:

```ts
// ❌ Incorrect
import { useOrdersQuery } from '@/features/orders/api/order.query';
import { OrderListPage } from '@/features/orders/pages/OrderListPage';
```

Before merge, the standard quality gates must pass:

- `yarn lint`
- `yarn check-types`
- `yarn prettier`

## 16. Error, Loading, and Empty States

Any page that fetches data or submits a form must account for:

- loading state
- empty state
- error state
- success feedback when a mutation changes data

Do not leave a page blank or fail silently.

## 17. Adding a New Feature

Minimum checklist:

1. Create `src/features/<feature>`.
2. Create `index.ts` for the public API.
3. Use `pages/`, not `screens/`.
4. If data fetching is required, follow the `api/service/query/request/response` pattern.
5. If forms are involved, create `schemas/`.
6. Place feature-owned types, enums, and constants inside the feature.
7. Add the route under `src/app/routes`.
8. Ensure `app` imports only through the feature or sub-feature public API.
9. Add loading, empty, and error states where applicable.
10. Add i18n keys for user-facing text.

## 18. Definition of Done

A task is only done when:

- folder ownership is correct
- import boundaries are preserved
- naming follows the convention
- routes stay thin
- business logic stays in the feature
- lint and type checks pass
- loading, empty, and error states are handled where needed
- no unnecessary TODOs or dead code remain
- tests are added or updated when logic changes carry risk

## 19. Code Review Priority

Review in this order:

1. boundary violations
2. folder ownership problems
3. business logic leaking into route, app, or shared layers
4. misuse of feature public APIs
5. naming inconsistencies
6. incorrect query, form, service, or state patterns
7. duplication, dead code, or maintainability risks

## 20. Summary

If contributors remember only a few rules, remember these:

- `app` composes, `features` own business logic
- use `pages`, not `screens`
- `app` may only import features through public APIs
- features may only use other features through public APIs
- `index.ts` is the public API of a feature or sub-feature
- data mapping and response normalization should live in `*.service.ts`
- folders are `kebab-case`, component/page files are `PascalCase`, non-component files are `kebab-case`
- feature-owned enums, constants, and types stay inside the feature first
