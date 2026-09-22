# Playwright Test Automation Environment

A Playwright + TypeScript automation framework demonstrating Page Object Model, custom fixtures, API testing, cross-browser execution, test tagging, and CI/CD integration.

## Architecture

```
.
├── .github/workflows/playwright.yml
├── src/
│   ├── api/PostsApi.ts
│   ├── fixtures/
│   │   ├── apiFixture.ts
│   │   └── testFixture.ts
│   ├── pages/
│   │   ├── BasePage.ts
│   │   └── TodoPage.ts
│   └── utils/testHelpers.ts
├── tests/
│   ├── api/api-example.spec.ts
│   └── e2e/todo.spec.ts
├── .env.example
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Test Strategy

| Layer | Scope | Execution |
|---|---|---|
| API | HTTP contract, status codes, response shape, negative cases | `npm run test:api` |
| E2E | Critical user journeys and UI behaviour | `npm run test:e2e` |
| Smoke | Tagged critical-path tests | `npm run test:smoke` |
| Type safety | TypeScript compilation | `npm run test:typecheck` |

### Current coverage

**E2E**
- Create multiple todos
- Complete a todo
- Edit a todo
- Delete a todo
- Active / Completed / All filters
- Clear completed
- Toggle all
- Persistence after reload

**API**
- GET single resource
- GET collection
- POST resource
- 404 negative case

## Locator Strategy

Prefer:
1. Role / accessible name
2. Label / placeholder
3. Text where appropriate
4. Stable test IDs when available
5. CSS selectors only when the application exposes no better contract

Keep selectors inside Page Objects. Test cases should describe behaviour, not DOM implementation.

## POM & Fixtures

Page Objects encapsulate locators and user actions. Fixtures own object creation and lifecycle. Tests consume fixtures rather than constructing page objects repeatedly.

## API Design

API tests use a typed `PostsApi` client and a custom fixture. API tests call relative paths and receive the environment's `API_BASE_URL`.

## Test Design Principles

- Test behaviour, not implementation details.
- Keep tests independent and deterministic.
- Prefer Playwright auto-waiting and web-first assertions.
- Avoid arbitrary `waitForTimeout` / `sleep`.
- Generate unique data when the application state can persist.
- Use positive and negative scenarios.
- Keep API and browser execution separate.

## Commands

```bash
npm install
npx playwright install
npm run test:typecheck
npm test
npm run test:e2e
npm run test:api
npm run test:smoke
npm run test:report
```

## CI

GitHub Actions runs installation, type checking, API tests, and browser E2E tests. Reports and failure artifacts are uploaded for diagnosis.
