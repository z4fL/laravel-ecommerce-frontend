# AGENTS.md

## Purpose

This repository contains the frontend application for the REST API E-Commerce project.

The frontend is an independent client application. The Laravel backend is an external system and must not be inspected, modified, or used as an implementation reference.

## Scope

Work exclusively within this frontend repository.

Do not:

- inspect the Laravel backend repository
- modify backend files
- infer backend implementation details from Laravel source code
- depend on backend models, controllers, routes, or internal services
- invent API behavior that is not defined by the API contract

The API contract is the boundary between the frontend and backend.

## API Contract

`docs/api-docs.yaml` is the single source of truth for backend API integration.

Use the contract to determine:

- available endpoints
- HTTP methods
- path parameters
- query parameters
- request bodies
- response schemas
- HTTP status codes
- authentication requirements
- validation constraints
- API operation identifiers

Do not assume undocumented endpoints, fields, parameters, response structures, or business behavior.

If the frontend requires information that is not defined by the API contract, report the missing contract information instead of guessing.

## Generated API Code

`src/generated/` is generated exclusively by Orval.

Treat the entire `src/generated/` directory as read-only.

Agents may:

- read generated files
- import generated types
- import generated API functions
- import generated TanStack Query hooks

Agents must not:

- edit generated files
- create files inside `src/generated/`
- delete generated files
- rename generated files
- patch generated code manually

If generated code needs to change, modify the OpenAPI contract
or Orval configuration as appropriate, then regenerate:

```bash
pnpm run api:generate
pnpm run typecheck
```

Never modify generated output directly.

## Server State

Use TanStack Query for server state.

Server state includes data retrieved from the backend such as:

- products
- categories
- tags
- cart
- orders
- shipping addresses
- stores
- user profile
- payment related data

Do not introduce a second server-state management solution.

Use the generated Orval query hooks where applicable.

## Client State

Prefer React local state for local UI state.

Do not introduce Zustand or another global state library unless a concrete requirement justifies shared client state that cannot be handled cleanly with local state or existing application mechanisms.

Do not store server state in a client-state store.

## Architecture

Prefer feature-based organization for domain-specific frontend code.

Expected high-level structure:

```text
src/
├── app/
├── generated/        # Orval generated code
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── shipping/
│   ├── stores/
│   └── profile/
├── components/       # Shared UI components
└── lib/              # Shared infrastructure
```

Do not create additional architectural layers without a clear technical reason.

Prefer simple solutions over unnecessary abstractions.

## API Integration

Do not call backend endpoints directly from arbitrary UI components when an existing generated API function or query hook is available.

Keep API concerns separate from presentation concerns.

The expected flow is:

```text
React UI
   ↓
Feature logic
   ↓
Generated Orval API / TanStack Query
   ↓
HTTP API
   ↓
Backend
```

Do not duplicate request logic across components.

## TypeScript

Use TypeScript strictly.

Prefer types generated from the OpenAPI contract.

Do not manually recreate API schemas that already exist in generated code.

Avoid `any` unless there is a documented technical reason.

Do not suppress TypeScript errors merely to make the build pass.

## UI and Design

The UI should be developed using the Impeccable skill when the UI implementation phase begins.

Impeccable is responsible for frontend design and UX decisions, not backend API behavior.

UI implementation must consume the existing API integration layer rather than creating ad hoc API calls.

Do not change API behavior to accommodate a UI design. If the API contract cannot support a required UI behavior, report the limitation.

## Validation

After modifying frontend code, run:

```bash
pnpm run typecheck
```

After modifying or extending the API contract:

```bash
pnpm run api:generate
pnpm run typecheck
```

Do not consider a task complete while TypeScript errors remain.

## API Contract Changes

Do not modify `docs/api-docs.yaml` merely to make frontend implementation easier.

If the existing API contract is insufficient, clearly report:

1. what frontend requirement cannot be implemented
2. which part of the contract is missing or insufficient
3. what contract change would be required

The frontend must adapt to the API contract unless an explicit contract change is approved.

## Dependencies

Avoid adding dependencies without a concrete requirement.

Before introducing a new library, consider whether the existing stack already provides the required capability.

Prioritize:

1. Correctness
2. Maintainability
3. Simplicity
4. Accessibility
5. Performance
6. Developer Experience

Avoid premature abstraction and overengineering.