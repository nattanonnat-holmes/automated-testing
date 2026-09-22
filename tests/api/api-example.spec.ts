import { test, expect } from '@playwright/test';

test.describe('Playwright API Testing Examples', () => {
  const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

  test('GET /posts/1 - should return single post with status 200', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/posts/1`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('title');
    expect(typeof body.title).toBe('string');
  });

  test('POST /posts - should successfully create a resource with status 201', async ({ request }) => {
    const newPost = {
      title: 'Automated Testing with Playwright',
      body: 'Playwright supports both UI and API level testing natively.',
      userId: 1,
    };

    const response = await request.post(`${API_BASE_URL}/posts`, {
      data: newPost,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.title).toBe(newPost.title);
    expect(body.body).toBe(newPost.body);
    expect(body.userId).toBe(newPost.userId);
    expect(body).toHaveProperty('id');
  });

  test('GET /posts - should return a non-empty list of items', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/posts`);
    expect(response.ok()).toBeTruthy();

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });
});
