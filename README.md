# Playwright Test Automation Environment

A modern, production-grade automated testing framework built with [Playwright](https://playwright.dev/) and TypeScript, following the **Page Object Model (POM)** pattern.

---

## 📁 Project Architecture

```
Automated Testing/
├── .github/
│   └── workflows/
│       └── playwright.yml        # Continuous Integration (GitHub Actions)
├── src/
│   ├── fixtures/
│   │   └── testFixture.ts        # Custom Playwright test runner & fixture injection
│   ├── pages/
│   │   ├── BasePage.ts           # Reusable base page methods (navigation, waits, locators)
│   │   └── TodoPage.ts           # Page Object Model for TodoMVC application
│   └── utils/
│       └── testHelpers.ts        # Dynamic test data generators and wait utilities
├── tests/
│   ├── api/
│   │   └── api-example.spec.ts   # Playwright native API tests (GET, POST, status validation)
│   └── e2e/
│       └── todo.spec.ts          # End-to-end tests using Page Object Model
├── .env                          # Active local environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore configurations
├── package.json                  # NPM dependencies & test execution scripts
├── playwright.config.ts          # Multi-browser matrix, timeouts, reporters & settings
├── tsconfig.json                 # TypeScript compiler configuration & path aliases
└── README.md                     # Documentation & usage guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

Download Chromium, Firefox, and WebKit browser binaries:

```bash
npx playwright install
```

---

## 🧪 Running Tests

| Script | Command | Description |
| :--- | :--- | :--- |
| **All Tests** | `npm test` | Run all test suites across all configured browser projects |
| **Headed Mode** | `npm run test:headed` | Run tests with browser windows visually visible |
| **UI Mode** | `npm run test:ui` | Interactive GUI runner with time-travel debugging and watch mode |
| **Debug Mode** | `npm run test:debug` | Step through tests using Playwright Inspector |
| **Chromium Only** | `npm run test:chromium` | Run tests on Chromium / Google Chrome |
| **Firefox Only** | `npm run test:firefox` | Run tests on Mozilla Firefox |
| **WebKit (Safari)** | `npm run test:webkit` | Run tests on WebKit (Apple Safari) |
| **Mobile Viewports** | `npm run test:mobile` | Run tests on simulated Mobile Chrome (Pixel 7) & Mobile Safari (iPhone 14) |
| **E2E Tests Only** | `npm run test:e2e` | Run only the end-to-end test suite |
| **API Tests Only** | `npm run test:api` | Run only API tests |
| **Show HTML Report** | `npm run test:report` | Open the interactive HTML test report in browser |
| **Code Generator** | `npm run codegen` | Record browser interactions and auto-generate test code |

---

## 🧩 Page Object Model (POM) Design

Test logic is separated cleanly from UI structure:

1. **`BasePage.ts`**: Implements reusable actions like navigating, waiting for visibility, clicking, typing, and taking screenshots.
2. **`TodoPage.ts`**: Subclasses `BasePage` and encapsulates locators and user actions specifically for the target application.
3. **`testFixture.ts`**: Extends `@playwright/test` to automatically instantiate and inject page objects into test cases without redundant boilerplate:

```typescript
import { test, expect } from '../../src/fixtures/testFixture';

test('my test', async ({ todoPage }) => {
  await todoPage.addTodo('Buy groceries');
  await expect(todoPage.todoItems).toHaveCount(1);
});
```

---

## 📊 Viewing Reports & Traces

After test runs, an interactive HTML report is generated in `playwright-report/`:

```bash
npm run test:report
```

Failed tests automatically capture:
- **Screenshots** (`test-results/`)
- **Execution Traces** (DOM snapshots, network calls, console logs)
- **Video Recordings**

---

## 🤖 CI / CD Integration

GitHub Actions workflow is preconfigured in `.github/workflows/playwright.yml`. On every push and pull request, tests are executed in a containerized environment, and test artifacts are automatically uploaded.
