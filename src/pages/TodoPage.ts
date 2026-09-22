import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type TodoFilter = 'All' | 'Active' | 'Completed';

/**
 * TodoPage implements the Page Object Model pattern for the TodoMVC application.
 */
export class TodoPage extends BasePage {
  // Locators
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly todoTitles: Locator;
  readonly todoCount: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly clearCompletedButton: Locator;
  readonly filtersContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.locator('.todo-list li');
    this.todoTitles = page.locator('.todo-list li label');
    this.todoCount = page.locator('.todo-count');
    this.toggleAllCheckbox = page.getByLabel('Mark all as complete');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.filtersContainer = page.locator('.filters');
  }

  /**
   * Navigate directly to the TodoMVC demo application
   */
  async goto(): Promise<void> {
    await this.navigate('/todomvc/#/');
  }

  /**
   * Add a single todo item
   */
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Add multiple todo items sequentially
   */
  async addTodos(items: string[]): Promise<void> {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  /**
   * Toggle a specific todo item by exact title
   */
  async toggleTodo(title: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: title });
    await todo.locator('.toggle').check();
  }

  /**
   * Remove a specific todo item by hovering and clicking the destroy button
   */
  async removeTodo(title: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: title });
    await todo.hover();
    await todo.locator('.destroy').click();
  }

  /**
   * Edit a todo item by double-clicking it
   */
  async editTodo(oldTitle: string, newTitle: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: oldTitle });
    await todo.locator('label').dblclick();
    const editInput = todo.locator('.edit');
    await editInput.fill(newTitle);
    await editInput.press('Enter');
  }

  /**
   * Filter visible todos by status ('All', 'Active', 'Completed')
   */
  async filterBy(filter: TodoFilter): Promise<void> {
    await this.filtersContainer.getByRole('link', { name: filter }).click();
  }

  /**
   * Clear all completed todo items
   */
  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  /**
   * Toggle all todos completed or active
   */
  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.check();
  }

  /**
   * Retrieve all currently visible todo titles as an array of strings
   */
  async getTodoTitles(): Promise<string[]> {
    return this.todoTitles.allTextContents();
  }
}
