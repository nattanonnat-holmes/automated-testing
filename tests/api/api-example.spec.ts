import { test, expect } from '../../src/fixtures/apiFixture';

test.describe('Posts API', () => {
  test('@smoke GET /posts/1 returns the expected resource', async ({ postsApi }) => {
    const response = await postsApi.getById(1);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toMatchObject({
      id: 1,
      userId: expect.any(Number),
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('GET /posts returns a non-empty collection', async ({ postsApi }) => {
    const response = await postsApi.getAll();

    await expect(response).toBeOK();
    const posts = await response.json();

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('POST /posts creates a resource', async ({ postsApi }) => {
    const newPost = {
      title: 'Automated Testing with Playwright',
      body: 'API testing with Playwright',
      userId: 1,
    };

    const response = await postsApi.create(newPost);

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body).toMatchObject({
      ...newPost,
      id: expect.any(Number),
    });
  });

  test('GET /posts/999999 returns 404 for a missing resource', async ({ postsApi }) => {
    const response = await postsApi.getById(999999);

    expect(response.status()).toBe(404);
  });
});
