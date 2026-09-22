/**
 * Utility functions and test data generators for Playwright test suite.
 */

/**
 * Generate a random unique string with a prefix (useful for dynamic test data)
 */
export function generateUniqueTitle(prefix: string = 'task'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Sleep helper for explicit waits when debugging
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
