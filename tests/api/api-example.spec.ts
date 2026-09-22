import { test, expect } from '@playwright/test';

test.describe('JSONPlaceholder API', () => {
  test('GET /posts/1 returns the expected resource', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toMatchObject({
      id: 1,
      userId: expect.any(Number),
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('GET /posts returns a non-empty collection', async ({ request }) => {
    const response = await request.get('/posts');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const posts = await response.json();

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('POST /posts creates a resource', async ({ request }) => {
    const newPost = {
      title: 'Automated Testing with Playwright',
      body: 'API testing with Playwright',
      userId: 1,
    };

    const response = await request.post('/posts', { data: newPost });

    expect(response.status()).toBe(201);
    await expect(response).toBeOK();

    const body = await response.json();

    expect(body).toMatchObject({
      ...newPost,
      id: expect.any(Number),
    });
  });

  test('GET /posts/999999 returns 404 for a missing resource', async ({ request }) => {
    const response = await request.get('/posts/999999');

    expect(response.status()).toBe(404);
  });
});
