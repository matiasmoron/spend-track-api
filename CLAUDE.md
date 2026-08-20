# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Spend Track API — a Node.js/TypeScript REST API for tracking shared expenses (Splitwise-like: groups, unequal splits, debts/payments, invitations). Built with Express, TypeORM (PostgreSQL), JWT auth.

The owner works primarily in frontend (Angular) and is now taking over backend maintenance solo on this project, so prefer explicit, well-reasoned explanations over assumed backend familiarity when something is non-obvious.

## Commands

```bash
yarn dev                # Dev server with hot reload (ts-node-dev)
yarn build               # Compile TypeScript to dist/
yarn start               # Run compiled build (dist/src/index.js)

yarn check-types         # Type-check without emitting (tsc --noEmit)
yarn lint                # ESLint
yarn lint:fix             # ESLint with autofix
yarn format               # Prettier write
yarn format:check         # Prettier check only

yarn test                 # Type-check tests + run full Jest suite
yarn test:unit            # Unit tests only (tests/unit)
yarn test:integration      # Integration tests only (tests/integration), --detectOpenHandles
```

Run a single test file: `npx jest tests/unit/application/use-cases/expense/createExpense.test.ts`
Run a single test by name: `npx jest -t "test name"`

Path aliases (used in both src and tests): `@/*` → `src/*`, `@tests/*` → `tests/*`.

## Architecture

Clean Architecture with four layers, dependencies point inward (interfaces → application → domain; infrastructure implements domain contracts):

- `src/domain/` — Entities (immutable, constructed from a `Props` interface) and repository **interfaces** (contracts only, no implementation).
- `src/application/use-cases/` — One file per use case, business logic orchestration. Use cases are plain functions that take an input DTO plus their dependencies as a parameter object (not injected via a class), which is what makes them easy to unit test with mocked repos: `createExpense(input, { expenseRepository, userGroupRepository })`.
- `src/infrastructure/database/` — TypeORM models/`repositories/` (concrete implementations of the domain repository interfaces) and `services/` (e.g. `AuthService`).
- `src/interfaces/http/` — `controllers/`, `routes/`, `middlewares/`, `validators/` (class-validator DTOs), `utils/` (e.g. `BaseResponse`).
- `src/config/di.ts` — Central manual DI container. All repositories/services are singleton instances created in `initInstances()` and exported as `let` bindings; `initDI()` also boots the DB connection. Controllers import what they need directly from here, e.g. `import { userRepository, authService } from '../../../config/di'`.

### Conventions to follow

- **Controllers** always follow: validate DTO → call use case with its dependencies → `BaseResponse.success(res, result, statusCode?)` → catch and `next(error)`. Never handle errors inline beyond that.
- **Errors**: never throw raw `Error`. Use `AppError` (maps to HTTP status automatically); the global `errorHandler` middleware turns it into the standardized JSON error response.
- **Entities**: immutable, all fields `readonly`, constructed from a `*Props` interface — don't add setters or mutate after construction.
- **Auth**: `authenticateJWT` middleware populates `req.user` on `AuthenticatedRequest` (`{ id, email }`). Token logic lives in `AuthService` (`src/infrastructure/database/services/AuthService.ts`).
- **Expense splitting invariant**: `ExpenseParticipant` amounts are signed — positive = amount paid by that user, negative = that user's share. Validation must ensure `sum(paidBy) === sum(splits) === expense.total`, and every user referenced in `paidBy`/`splits` must belong to the group.
- **Value objects/enums**: domain constraints (e.g. `Currency`, `GroupType`) are TypeScript enums under `src/domain/value-objects/`, not string unions — extend there rather than introducing ad-hoc string types.
- TypeORM `synchronize` mode is enabled, so schema changes come from editing the models in `src/infrastructure/database/models/`, not hand-written migrations.

### Testing

- Unit tests (`tests/unit/`) mock repositories and test use cases in isolation.
- Integration tests (`tests/integration/`) hit real HTTP endpoints via `tests/integration/shared/TestServer.ts` (singleton test server) against a real DB with JWT auth, using transactions + rollback for isolation.

## Workflow: closing out a task (commit proposal)

When the user says something like "todo listo", "todo correcto", "listo", or "ok, todo bien" (or an equivalent signal that they're done reviewing/testing what was implemented), treat it as the cue to ask for confirmation before acting — e.g. "¿Confirmás que analice los cambios y te pase los mensajes de commit con los archivos correspondientes a cada uno?"

If the user confirms, then:

1. Review all pending changes (`git status`, `git diff` for working tree and staged).
2. Verify the changes are coherent with the task discussed in the conversation — not just that they compile, but that they actually address the requirement.
3. Group the changed files into separate, logical commits (don't bundle unrelated changes into one giant commit).
4. For each proposed commit, state:
   - The files that belong in it
   - The commit message, following this repo's Conventional Commits convention (check `git log` for exact style, e.g. `feat(events): add transgression query screen with filters and pagination`)
5. Do not run the commits yourself — only present the proposal so the user can review and commit manually.

If something looks incorrect, incomplete, or inconsistent with the task during this review, flag it before proposing commits.
