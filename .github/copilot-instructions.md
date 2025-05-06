GitHub Copilot Instructions

These instructions are designed to help GitHub Copilot provide relevant and accurate suggestions based on this project’s structure and conventions.

⸻

🧱 Project Structure & Clean Architecture

This project follows Clean Architecture principles and is organized as follows:

src/
• application/: Contains business logic.
• use-cases/: Each use case has its own folder and file (e.g., CreateExpense.ts, GetGroupsByUser.ts).
• errors/: Custom application errors.
• domain/: Entities and repository interfaces.
• entities/: Plain TypeScript classes or value objects (e.g., Expense.ts, User.ts, Group.ts).
• repositories/: Interfaces for repositories (e.g., UserRepository.ts, ExpenseRepository.ts).
• value-objects/: Domain-specific enums or strong types (e.g., Currency.ts, GroupType.ts).
• infrastructure/database/:
• models/: TypeORM entity definitions (e.g., UserModel.ts).
• repositories/: TypeORM-based implementations of domain interfaces.
• services/: AuthService and others tied to infrastructure.
• interfaces/http/:
• controllers/: Handles HTTP requests (e.g., UserController.ts).
• routes/: Express routers.
• validators/: DTO validations using class-validator.
• utils/: Shared utilities for HTTP layer.
• shared/: Helpers, logs, or generic functions.
• types/: Global or cross-cutting types.
• config/: Initialization (e.g., express.ts, database.ts, di.ts).
• tests/:
• unit/: One file per use case.
• integration/: Uses a TestEnvironment singleton with DB transactions.

⸻

✅ Best Practices

Naming
• Use PascalCase for types, classes, enums.
• Use camelCase for variables and functions.
• File names match the class or use case (e.g., CreateGroup.ts, GroupModel.ts).

Use Cases
• Each use case must:
• Receive typed Input and return typed Output.
• Be placed under src/application/use-cases/<entity>/.

Entities
• Domain entities should use constructor injection via a Props object (e.g., UserProps, ExpenseProps).
• createdAt and updatedAt should be readonly when not passed from external sources.

DTOs
• Validation is done using class-validator decorators.
• Add explicit error messages.
• Only data transformation/validation logic allowed.

⸻

🔄 Testing

Unit Tests
• One test file per use case under tests/unit/application/use-cases/<entity>.
• Follows AAA structure (Arrange, Act, Assert).

Integration Tests
• Use the shared TestEnvironment class.
• Each test:
• Starts a transaction (queryRunner.startTransaction()),
• Rolls back after test (queryRunner.rollbackTransaction()),
• Uses /register and /login to get a test user and JWT.

CLI

Run tests:

yarn test # all tests
yarn test:unit # only unit
yarn test:integration # only integration

⸻

🔧 Other Details
• Express App is initialized via initExpress() inside src/config/express.ts.
• Dependency injection is managed in src/config/di.ts.
• AuthService uses a JWT_SECRET from .env and must be defined during test and deploy.

⸻

🤖 Copilot Tips
• Use TestEnvironment for any integration test helpers.
• Always return BaseResponse.success or BaseResponse.error from controllers.
• Avoid direct use of models in use cases — use repositories instead.
• Use Currency and GroupType enums where appropriate.
• Validate DTOs using validateDTO(dtoClass, data) helper.
