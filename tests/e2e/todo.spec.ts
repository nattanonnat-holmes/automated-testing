import { test, expect } from '../../src/fixtures/testFixture';
import { generateUniqueTitle } from '../../src/utils/testHelpers';

test.describe('TodoMVC - End-to-End Test Suite', () => {

  test('should allow adding new items to the todo list', async ({ todoPage }) => {
    const item1 = 'Write Playwright automated tests';
    const item2 = 'Configure CI/CD pipeline';

    await todoPage.addTodo(item1);
    await todoPage.addTodo(item2);

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
    const initialText = 'Original Task Name';
    const updatedText = 'Updated Task Name';

    await todoPage.addTodo(initialText);
    await todoPage.editTodo(initialText, updatedText);

    await expect(todoPage.todoTitles).toHaveText([updatedText]);
  });

  test('should allow deleting a todo item', async ({ todoPage }) => {
    const task1 = 'Keep this task';
    const task2 = 'Delete this task';

    await todoPage.addTodos([task1, task2]);
    await expect(todoPage.todoItems).toHaveCount(2);

    await todoPage.removeTodo(task2);

    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoTitles).toHaveText([task1]);
  });

  test('should correctly filter active and completed items', async ({ todoPage }) => {
    const activeTask = 'Active item';
    const completedTask = 'Completed item';

    await todoPage.addTodos([activeTask, completedTask]);
    await todoPage.toggleTodo(completedTask);

    // Filter Active
    await todoPage.filterBy('Active');
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoTitles).toHaveText([activeTask]);

    // Filter Completed
    await todoPage.filterBy('Completed');
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoTitles).toHaveText([completedTask]);

    // Back to All
    await todoPage.filterBy('All');
    await expect(todoPage.todoItems).toHaveCount(2);
  });

  test('should clear completed items when button is clicked', async ({ todoPage }) => {
    await todoPage.addTodos(['Task 1', 'Task 2', 'Task 3']);
    await todoPage.toggleTodo('Task 2');

    await todoPage.clearCompleted();

    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoTitles).toHaveText(['Task 1', 'Task 3']);
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });
});
