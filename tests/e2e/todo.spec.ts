import { test, expect } from '../../src/fixtures/testFixture';
import { generateUniqueTitle } from '../../src/utils/testHelpers';

test.describe('TodoMVC - End-to-End Test Suite', () => {
  test('@smoke should allow adding new items to the todo list', async ({ todoPage }) => {
    const item1 = generateUniqueTitle('todo');
    const item2 = generateUniqueTitle('todo');

    await todoPage.addTodos([item1, item2]);

    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoTitles).toHaveText([item1, item2]);
    await expect(todoPage.todoCount).toContainText('2 items left');
  });

  test('should allow marking an item as completed', async ({ todoPage }) => {
    const task = generateUniqueTitle('e2e-task');

    await todoPage.addTodo(task);
    await todoPage.toggleTodo(task);

    const item = todoPage.todoItems.filter({ hasText: task });
    await expect(item).toHaveClass(/completed/);
    await expect(todoPage.todoCount).toContainText('0 items left');
  });

  test('should allow editing an existing todo item', async ({ todoPage }) => {
    const initialText = generateUniqueTitle('original');
    const updatedText = generateUniqueTitle('updated');

    await todoPage.addTodo(initialText);
    await todoPage.editTodo(initialText, updatedText);

    await expect(todoPage.todoTitles).toHaveText([updatedText]);
  });

  test('should allow deleting a todo item', async ({ todoPage }) => {
    const task1 = generateUniqueTitle('keep');
    const task2 = generateUniqueTitle('delete');

    await todoPage.addTodos([task1, task2]);
    await todoPage.removeTodo(task2);

    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoTitles).toHaveText([task1]);
  });

  test('should correctly filter active and completed items', async ({ todoPage }) => {
    const activeTask = generateUniqueTitle('active');
    const completedTask = generateUniqueTitle('completed');

    await todoPage.addTodos([activeTask, completedTask]);
    await todoPage.toggleTodo(completedTask);

    await todoPage.filterBy('Active');
    await expect(todoPage.todoTitles).toHaveText([activeTask]);

    await todoPage.filterBy('Completed');
    await expect(todoPage.todoTitles).toHaveText([completedTask]);

    await todoPage.filterBy('All');
    await expect(todoPage.todoItems).toHaveCount(2);
  });

  test('should clear completed items when button is clicked', async ({ todoPage }) => {
    const tasks = [
      generateUniqueTitle('task'),
      generateUniqueTitle('task'),
      generateUniqueTitle('task'),
    ];

    await todoPage.addTodos(tasks);
    await todoPage.toggleTodo(tasks[1]);
    await todoPage.clearCompleted();

    await expect(todoPage.todoTitles).toHaveText([tasks[0], tasks[2]]);
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('should toggle all todo items', async ({ todoPage }) => {
    await todoPage.addTodos([
      generateUniqueTitle('task'),
      generateUniqueTitle('task'),
      generateUniqueTitle('task'),
    ]);

    await todoPage.toggleAll();

    await expect(todoPage.todoCount).toContainText('0 items left');
    await expect(todoPage.todoItems.nth(0)).toHaveClass(/completed/);
    await expect(todoPage.todoItems.nth(1)).toHaveClass(/completed/);
    await expect(todoPage.todoItems.nth(2)).toHaveClass(/completed/);
  });

  test('should preserve todos after page reload', async ({ todoPage, page }) => {
    const task = generateUniqueTitle('persist');

    await todoPage.addTodo(task);
    await page.reload();

    await expect(todoPage.todoTitles).toHaveText([task]);
  });
});
