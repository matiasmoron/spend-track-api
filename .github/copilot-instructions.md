# Spend Track API - AI Coding Assistant Instructions

## Architecture Overview

This is a **Clean Architecture** expense-sharing API built with Node.js/TypeScript, following Splitwise-like functionality. The architecture enforces strict separation of concerns across layers:

- **Domain Layer** (`src/domain/`): Pure business entities and repository contracts
- **Application Layer** (`src/application/`): Use cases and business logic orchestration
- **Infrastructure Layer** (`src/infrastructure/`): Database models, implementations, and external services
- **Interface Layer** (`src/interfaces/`): HTTP controllers, DTOs, middleware, and routes

## Critical Patterns & Conventions

### Dependency Injection & Service Location

- **All repositories and services are singleton instances** exported from `src/config/di.ts`
- Controllers import dependencies directly: `import { userRepository, authService } from '../../../config/di'`
- Use cases receive dependencies as parameters for testability: `createExpense(input, { expenseRepository, userGroupRepository })`

### Entity Design Pattern

Entities use **immutable constructor pattern** with props interfaces:

```typescript
export class Expense {
  readonly id: number;
  readonly groupId: number;
  // ... other readonly properties

  constructor(props: ExpenseProps) {
    this.id = props.id;
    // ... assign all props
  }
}
```

### Controller Pattern

All controllers follow this exact structure:

```typescript
async methodName(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = await validateDTO(SomeDTO, req.body);
    const result = await useCase(dto, { repository1, repository2 });
    BaseResponse.success(res, result, statusCode?);
  } catch (error) {
    next(error);
  }
}
```

### Error Handling Strategy

- **AppError class** for all business logic errors with automatic HTTP status mapping
- Global **errorHandler middleware** transforms AppError to standardized JSON responses
- **Never throw raw Error objects** - always use AppError with appropriate status codes
- Critical validation: `validateDTO()` with class-validator DTOs for all request bodies

### Expense Splitting Business Logic

**ExpenseParticipant** stores both payments and splits:

- **Positive amounts** = money paid by user
- **Negative amounts** = user's share of the expense
- Total validation: `sum(paidBy) === sum(splits) === expense.total`
- User validation: All users in paidBy/splits arrays must belong to the group

## Development Workflows

### Running the Application

```bash
yarn dev              # Development with hot reload (ts-node-dev)
yarn build && yarn start  # Production build and run
```

### Database Connection

- Uses **TypeORM with PostgreSQL**
- Database config in `src/infrastructure/database/DataSource.ts` with SSL support for Render deployment
- **Synchronize mode enabled** - schema auto-generated from models
- Connection string format: `postgresql://user:pass@host.oregon-postgres.render.com/db`

### Testing Strategy

- **Unit tests**: Test use cases in isolation with mocked repositories
- **Integration tests**: Full HTTP endpoint testing with real DB + JWT auth
- Test database transactions with automatic rollback for clean state
- Run tests: `yarn test:unit` or `yarn test:integration`

### Key Files to Understand

- `src/config/di.ts` - Central dependency registration
- `src/application/use-cases/expense/CreateExpense.ts` - Complex business logic example
- `src/interfaces/http/controllers/` - Controller pattern examples
- `src/infrastructure/database/models/` - TypeORM entity definitions
- `tests/integration/shared/TestServer.ts` - Test server singleton pattern

## Authentication & Authorization

- **JWT-based authentication** with middleware `authenticateJWT`
- **AuthenticatedRequest** interface extends Express Request with `user: { id, email }`
- Protected routes automatically have `req.user` available
- Auth service handles token generation/validation in `src/infrastructure/database/services/AuthService.ts`

## API Response Standardization

All responses use **BaseResponse utility**:

```typescript
BaseResponse.success(res, data, statusCode?)  // Success responses
BaseResponse.error(res, errorData, statusCode) // Error responses (handled by errorHandler)
```

## Value Objects & Enums

- **Currency enum**: Limited to `ARS` and `USD` - extend in `src/domain/value-objects/Currency.ts`
- **GroupType enum**: Predefined group categories
- Use TypeScript enums for domain constraints, not string unions
