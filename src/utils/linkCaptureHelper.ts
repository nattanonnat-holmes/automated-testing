import { Page, Locator, TestInfo, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

export interface LinkTargetQuery {
  /** Substring or full href of the link to find (e.g. '/docs/intro' or 'https://...') */
  href?: string;
  /** Visible text or accessible name of the link (e.g. 'Get Started', 'Docs') */
  text?: string;
  /** Custom CSS/XPath selector if needed */
  selector?: string;
}

export interface CaptureResult {
  locator: Locator;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  href: string | null;
  text: string;
  elementScreenshotPath: string;
  contextScreenshotPath: string;
}

export interface CaptureOptions {
  /** Custom directory to save screenshots (defaults to 'screenshots') */
  outputDir?: string;
  /** Base filename prefix (defaults to 'link-capture') */
  filenamePrefix?: string;
  /** Outline color for visual highlight (default: '#ff0055' / neon pink) */
  highlightColor?: string;
}

function getHrefCandidates(href: string): string[] {
  const candidates = new Set<string>();
  candidates.add(href);
  try {
    const decoded = decodeURIComponent(href);
    candidates.add(decoded);
    candidates.add(encodeURI(decoded));
  } catch {}

  try {
    const parsed = new URL(href);
    const pathAndSearch = parsed.pathname + (parsed.search || '');
    candidates.add(pathAndSearch);
    candidates.add(decodeURIComponent(pathAndSearch));
    candidates.add(encodeURI(decodeURIComponent(pathAndSearch)));
    if (parsed.pathname) {
      candidates.add(parsed.pathname);
      candidates.add(decodeURIComponent(parsed.pathname));
    }
  } catch {
    // Relative path or substring
  }

  return Array.from(candidates).filter((c) => c && c.length > 0);
}

/**
 * Searches for a target link on the page, identifies its location,
 * highlights it visually, and captures screenshots of both the clickable element
 * and the surrounding page context.
 */
export async function locateAndCaptureLink(
  page: Page,
  target: LinkTargetQuery,
  options: CaptureOptions = {},
  testInfo?: TestInfo
): Promise<CaptureResult> {
  const outputDir = options.outputDir || path.resolve(process.cwd(), 'screenshots');
  const filenamePrefix = options.filenamePrefix || 'link-capture';
  const highlightColor = options.highlightColor || '#ff0055';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Resolve Locator based on query criteria
  let linkLocator: Locator;
  if (target.selector) {
    linkLocator = page.locator(target.selector).first();
  } else if (target.href && target.text) {
    const hrefCandidates = getHrefCandidates(target.href);
    const hrefSelector = hrefCandidates.map((c) => `a[href*=${JSON.stringify(c)}]`).join(', ');
    const byRole = page.getByRole('link', { name: target.text });
    const byText = page.locator(hrefSelector).filter({ hasText: target.text });
    const byImg = page.locator(hrefSelector).filter({
      has: page.locator(`img[alt*=${JSON.stringify(target.text)}], img[title*=${JSON.stringify(target.text)}]`),
    });
    linkLocator = page.locator(hrefSelector).filter({ has: byRole.or(byText).or(byImg) }).first();
  } else if (target.href) {
    const hrefCandidates = getHrefCandidates(target.href);
    const hrefSelector = hrefCandidates.map((c) => `a[href*=${JSON.stringify(c)}]`).join(', ');
    linkLocator = page.locator(hrefSelector).first();
  } else if (target.text) {
    const byRole = page.getByRole('link', { name: target.text });
    const byText = page.locator('a').filter({ hasText: target.text });
    const byImg = page.locator(`a:has(img[alt*=${JSON.stringify(target.text)}]), a:has(img[title*=${JSON.stringify(target.text)}])`);
    linkLocator = byRole.or(byText).or(byImg).first();
  } else {
    throw new Error('Please provide at least one search criteria: href, text, or selector');
  }

  // 2. Wait for element to exist and be ready
  await expect(linkLocator).toBeAttached({ timeout: 10_000 });

  // 3. Scroll the element into view so it is visible within viewport
  await linkLocator.scrollIntoViewIfNeeded();

  // 4. Retrieve position & details
  const boundingBox = await linkLocator.boundingBox();
  const href =
    (await linkLocator.getAttribute('href')) ||
    (await linkLocator.evaluate((el) => (el as HTMLAnchorElement).href).catch(() => null));

  let text = (await linkLocator.innerText()).trim();
  if (!text) {
    const imgAlt = await linkLocator.locator('img').first().getAttribute('alt').catch(() => null);
    const imgTitle = await linkLocator.locator('img').first().getAttribute('title').catch(() => null);
    const ariaLabel = await linkLocator.getAttribute('aria-label').catch(() => null);
    const linkTitle = await linkLocator.getAttribute('title').catch(() => null);
    text = (imgAlt || imgTitle || ariaLabel || linkTitle || '').trim();
  }

  // 5. Highlight the element visually with a distinct border & shadow
  await linkLocator.evaluate((el, color) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.outline = `4px solid ${color}`;
    htmlEl.style.outlineOffset = '3px';
    htmlEl.style.boxShadow = `0 0 16px ${color}`;
    htmlEl.style.transition = 'none';
  }, highlightColor);

  // Pause carousel/CSS transitions to ensure stability across all browsers (including WebKit)
  await page.evaluate(() => {
    document.querySelectorAll('.bottomjCarouselLite, #BannerBTN, ul, li').forEach((el) => {
      (el as HTMLElement).style.animation = 'none';
      (el as HTMLElement).style.transition = 'none';
    });
  }).catch(() => {});

  await page.waitForTimeout(100);

  // 6. Generate unique filenames
  const timestamp = Date.now();
  const rawTargetName = target.text || target.href || 'target';
  const safeName = rawTargetName.replace(/[^\p{L}\p{N}_-]/gu, '_').replace(/_+/g, '_').substring(0, 30);
  const elementScreenshotPath = path.join(outputDir, `${filenamePrefix}-${safeName}-element-${timestamp}.png`);
  const contextScreenshotPath = path.join(outputDir, `${filenamePrefix}-${safeName}-context-${timestamp}.png`);

  // 7. Capture:
  // a) Element capture: captures precisely the clickable button/link
  await linkLocator.screenshot({ path: elementScreenshotPath, animations: 'disabled', timeout: 10_000 }).catch(async () => {
    await linkLocator.screenshot({ path: elementScreenshotPath }).catch(() => {});
  });

  // b) Context capture: captures the full viewport showing where the link is on the page
  await page.screenshot({ path: contextScreenshotPath, fullPage: false, animations: 'disabled' });

  // 8. Attach screenshots to test report if testInfo is provided
  if (testInfo) {
    await testInfo.attach('📸 Clickable Element (ส่วนที่ต้องกด)', {
      path: elementScreenshotPath,
      contentType: 'image/png',
    });
    await testInfo.attach('🗺️ Page Context Location (ตำแหน่งในหน้าเว็บ)', {
      path: contextScreenshotPath,
      contentType: 'image/png',
    });
  }

  return {
    locator: linkLocator,
    boundingBox,
    href,
    text,
    elementScreenshotPath,
    contextScreenshotPath,
  };
}
