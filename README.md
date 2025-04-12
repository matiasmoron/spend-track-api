# 💸 Spend Track API

A RESTful API built with **Node.js + TypeScript** for managing shared expenses between people. Ideal for splitting costs in trips, households, couples, or other contexts.

> Inspired by Splitwise but with a modern, extensible, and well-tested architecture.

---

## ✨ Features

- User registration and authentication (JWT-based)
- Group creation with predefined types ("trip", "house", etc.)
- Unequal expense splitting
- View debts and payments between members
- Group-level multi-currency support (coming soon)
- Notifications and group invitations (coming soon)

---

## 🌐 Tech Stack

- **Node.js + Express**
- **TypeScript**
- **TypeORM** (PostgreSQL)
- **Jest** (unit and integration tests)
- **Prettier + ESLint** (StandardJS-based)
- **GitHub Actions** for CI

---

## 🏢 Project Architecture

The project follows **Clean Architecture** principles, separating responsibilities into clear layers:

```
src/
├── application/          # Use cases and custom errors
│   └── use-cases/
│       ├── user/
│       └── group/
├── domain/               # Entities and repository contracts
│   ├── entities/
│   └── repositories/
├── infrastructure/       # DB connection and real implementations
│   ├── database/
│   │   ├── models/
│   │   └── repositories/
├── interfaces/           # Entry/exit interfaces (HTTP layer)
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── config/               # App configuration and DI
│   └── di.ts
├── app.ts                # Express setup
└── index.ts              # App entry point
```

---

## 🚀 Getting Started

### 1. Clone and install:
```bash
git clone https://github.com/your-username/spend-track-api.git
cd spend-track-api
yarn install
```

### 2. Environment variables
Create a `.env` file with the following content:

```env
JWT_SECRET=yourSuperSecretJWTKey
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=spent_track
```

> PostgreSQL is used as the default DB engine.

### 3. Create the database and apply migrations (if needed)

### 4. Start the app in dev mode:
```bash
yarn dev
```

---

## 🔧 Available Scripts

```bash
yarn dev              # Start server with ts-node-dev
yarn build            # Compile the project

yarn lint             # Run ESLint
yarn format           # Run Prettier

yarn test             # Run all tests
yarn test:unit        # Run unit tests only
yarn test:integration # Run integration tests only
```

---

## 📊 Testing

Tests are split into:
- **Unit tests**: each use case is tested in isolation
- **Integration tests**: test endpoints with Express + real DB + JWT auth

Directory structure:
```
tests/
├── unit/
├── integration/
│   ├── groups/
│   └── users/
└── shared/           # Test helpers and environment
```

Integration tests use DB transactions + rollback for clean state.

---

## 🙌 Contributing

This project is under active development. Pull requests, ideas and improvements are welcome!

---

## 🚀 Roadmap

- [x] Group and user creation
- [ ] Expenses with multiple payers
- [ ] Notifications and invitations
- [ ] Group dashboard and balances
- [ ] API exports and integrations

---

## ✨ Author
**Matías Morón**

---

> 📊 If you like this project, feel free to star it or share it!

