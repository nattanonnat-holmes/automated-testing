import { Page, Locator } from '@playwright/test';

/**
 * BasePage encapsulates common Playwright browser interactions
 * and provides reusable utilities for all child page objects.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL path relative to the baseURL or absolute URL
   */
  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get current page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for a locator to be visible
   */
  async waitForVisible(locator: Locator, timeoutMs: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  /**
   * Safely click an element with auto-waiting
   */
  async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Clear and fill text input
   */
  async fillText(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  /**
   * Take screenshot of the current page
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
