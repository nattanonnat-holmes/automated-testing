import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type TodoFilter = 'All' | 'Active' | 'Completed';

export class TodoPage extends BasePage {
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
    this.todoTitles = this.todoItems.getByRole('label');
    this.todoCount = page.locator('.todo-count');
    this.toggleAllCheckbox = page.getByLabel('Mark all as complete');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.filtersContainer = page.locator('.filters');
  }

  async goto(): Promise<void> {
    await this.navigate('/todomvc/#/');
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(items: string[]): Promise<void> {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  async toggleTodo(title: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: title });
    await todo.getByRole('checkbox').check();
  }

  async removeTodo(title: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: title });
    await todo.hover();
    await todo.getByRole('button', { name: /delete|destroy/i }).click();
  }

  async editTodo(oldTitle: string, newTitle: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: oldTitle });
    await todo.getByRole('label').dblclick();
    const editInput = todo.getByRole('textbox');
    await editInput.fill(newTitle);
    await editInput.press('Enter');
  }

  async filterBy(filter: TodoFilter): Promise<void> {
    await this.filtersContainer.getByRole('link', { name: filter }).click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.check();
  }

  async getTodoTitles(): Promise<string[]> {
    return this.todoTitles.allTextContents();
  }
}
