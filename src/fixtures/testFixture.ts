import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

type CustomFixtures = {
  todoPage: TodoPage;
};

/**
 * Extended test runner with custom fixtures.
 * Automatically initializes and provides the TodoPage instance.
 */
export const test = base.extend<CustomFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect };
