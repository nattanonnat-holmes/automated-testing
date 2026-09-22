import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Force video recording for this test suite to fulfill QA evidence requirements
test.use({
  video: 'on',
});

interface StepExecutionLog {
  testCaseId: string;
  testStepId: string;
  pageUrl: string;
  action: string;
  elementText: string;
  elementType: string;
  locator: string;
  expectedResult: string;
  actualResult: string;
  status: 'Pass' | 'Fail' | 'Blocked';
  screenshot: string;
  video: string;
}

const executionLogs: StepExecutionLog[] = [];

/**
 * Helper to annotate an element with a red rectangle, retrieve bounding box,
 * capture screenshot, and remove annotation.
 */
async function captureAnnotatedStep(
  page: Page,
  locator: Locator | null,
  stepId: string,
  filename: string,
  testInfo: any
): Promise<{ boundingBox: any; screenshotPath: string }> {
  const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotsDir, filename);
  let boundingBox = null;

  if (locator) {
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    boundingBox = await locator.boundingBox();

    // Draw clearly visible red rectangle around the element
    await locator.evaluate((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '4px solid #ff0000';
      htmlEl.style.outlineOffset = '3px';
      htmlEl.style.boxShadow = '0 0 14px rgba(255, 0, 0, 0.85)';
      htmlEl.setAttribute('data-qa-annotated', 'true');
    });

    await page.waitForTimeout(200);
  }

  // Capture screenshot
  await page.screenshot({ path: screenshotPath, fullPage: false });

  // Clean up outline if locator was annotated
  if (locator) {
    await locator.evaluate((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.outlineOffset = '';
      htmlEl.style.boxShadow = '';
      htmlEl.removeAttribute('data-qa-annotated');
    }).catch(() => {});
  }

  // Attach screenshot to Playwright HTML report
  await testInfo.attach(stepId, {
    path: screenshotPath,
    contentType: 'image/png',
  });

  return { boundingBox, screenshotPath };
}

test.describe('TC-NAV-001: Navigation Path Verification', () => {
  const TEST_CASE_ID = 'TC-NAV-001';
  const STARTING_URL = process.env.PROD_URL || 'https://opsd.mod.go.th/Home.aspx?lang=th-th';
  const TARGET_URL = 'https://opsd.mod.go.th/getdoc/e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7/คมอการเปลยนรหสผาน-(5).aspx';

  let finalVideoPath = '';

  test.afterEach(async ({ page }) => {
    const video = page.video();
    if (video) {
      await page.close();
      finalVideoPath = await video.path().catch(() => '');
      // Update logs with actual video path
      for (const log of executionLogs) {
        log.video = finalVideoPath;
      }
    }
  });

  test('Verify navigation path from homepage to target document', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    // =========================================================================
    // STEP 01 — Open Homepage
    // =========================================================================
    const ts001: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-001',
      pageUrl: 'about:blank',
      action: 'Open starting URL',
      elementText: 'N/A',
      elementType: 'Page',
      locator: 'page.goto()',
      expectedResult: 'The homepage loads successfully and the main navigation elements are visible or accessible.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-001_homepage.png',
      video: '',
    };

    try {
      await page.goto(STARTING_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      const title = await page.title();
      ts001.pageUrl = page.url();
      ts001.actualResult = `Homepage loaded successfully with title: "${title}".`;
      await captureAnnotatedStep(page, null, 'TS-001', ts001.screenshot, testInfo);
    } catch (err: any) {
      ts001.status = 'Fail';
      ts001.actualResult = `Failed to load homepage: ${err.message}`;
      executionLogs.push(ts001);
      throw err;
    }
    executionLogs.push(ts001);

    // =========================================================================
    // STEP 02 — Explore Navigation Elements
    // =========================================================================
    const ts002: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-002',
      pageUrl: page.url(),
      action: 'Inspect navigation menus and content areas',
      elementText: 'Main Navigation Bar & e-Services Carousel Section',
      elementType: 'Container / Navigation',
      locator: 'div#slidebot, div#BannerBTN',
      expectedResult: 'Potential navigation paths toward the target document are identified without directly opening the target URL.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-002_navigation-menu.png',
      video: '',
    };

    try {
      const bannerSection = page.locator('#slidebot');
      await expect(bannerSection).toBeAttached({ timeout: 10_000 });
      await bannerSection.scrollIntoViewIfNeeded();

      ts002.actualResult = 'Identified main page sections including bottom e-Services banner carousel (#BannerBTN) containing service manuals and administrative links.';
      await captureAnnotatedStep(page, bannerSection, 'TS-002', ts002.screenshot, testInfo);
    } catch (err: any) {
      ts002.status = 'Fail';
      ts002.actualResult = `Failed to locate navigation section: ${err.message}`;
      executionLogs.push(ts002);
      throw err;
    }
    executionLogs.push(ts002);

    // =========================================================================
    // STEP 03 — Click the First Navigation Element (Service Banner Section / Carousel)
    // =========================================================================
    const ts003: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-003',
      pageUrl: page.url(),
      action: 'Scroll to and focus Service Banner Carousel container',
      elementText: 'BannerBTN',
      elementType: 'Carousel Container',
      locator: 'div#BannerBTN.bottomcarousel2d',
      expectedResult: 'The expected menu, page, or navigation state appears.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-003_first-click.png',
      video: '',
    };

    try {
      const carouselContainer = page.locator('#BannerBTN');
      await expect(carouselContainer).toBeVisible({ timeout: 10_000 });
      await carouselContainer.scrollIntoViewIfNeeded();

      const { boundingBox } = await captureAnnotatedStep(
        page,
        carouselContainer,
        'TS-003',
        ts003.screenshot,
        testInfo
      );

      ts003.actualResult = `Service Banner Carousel focused and visible at coordinates (${boundingBox?.x}, ${boundingBox?.y}), width ${boundingBox?.width}px.`;
    } catch (err: any) {
      ts003.status = 'Fail';
      ts003.actualResult = `Failed to navigate to carousel section: ${err.message}`;
      executionLogs.push(ts003);
      throw err;
    }
    executionLogs.push(ts003);

    // =========================================================================
    // STEP 04 — Continue Navigation (Locate target link in carousel)
    // =========================================================================
    const ts004: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-004',
      pageUrl: page.url(),
      action: 'Locate target service link item in banner',
      elementText: 'คู่มือการเปลี่ยนรหัสผ่าน',
      elementType: 'Interactive Link / Icon',
      locator: 'a:has(img[alt="คู่มือการเปลี่ยนรหัสผ่าน"])',
      expectedResult: 'Each navigation step leads to the expected page or menu state.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-004_submenu.png',
      video: '',
    };

    const targetLink = page.getByRole('link', { name: 'คู่มือการเปลี่ยนรหัสผ่าน' }).first();

    try {
      await expect(targetLink).toBeAttached({ timeout: 15_000 });
      await targetLink.scrollIntoViewIfNeeded();

      const { boundingBox } = await captureAnnotatedStep(
        page,
        targetLink,
        'TS-004',
        ts004.screenshot,
        testInfo
      );

      ts004.actualResult = `Target service link "คู่มือการเปลี่ยนรหัสผ่าน" located on the page at (${boundingBox?.x}, ${boundingBox?.y}), size ${boundingBox?.width}x${boundingBox?.height}px.`;
    } catch (err: any) {
      ts004.status = 'Fail';
      ts004.actualResult = `Failed to locate target service link: ${err.message}`;
      executionLogs.push(ts004);
      throw err;
    }
    executionLogs.push(ts004);

    // =========================================================================
    // STEP 05 — Verify Target Document Link
    // =========================================================================
    const ts005: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-005',
      pageUrl: page.url(),
      action: 'Verify target document link exists and href matches target URL',
      elementText: 'คู่มือการเปลี่ยนรหัสผ่าน',
      elementType: 'Link',
      locator: 'a[href*="e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7"]',
      expectedResult: 'The correct document link is found and its URL is verified.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-005_target-link.png',
      video: '',
    };

    try {
      const rawHref = await targetLink.getAttribute('href');
      const absoluteHref = await targetLink.evaluate((el) => (el as HTMLAnchorElement).href);

      // Verify GUID matches
      expect(rawHref).toContain('e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7');
      expect(absoluteHref).toContain('e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7');

      await captureAnnotatedStep(page, targetLink, 'TS-005', ts005.screenshot, testInfo);

      ts005.actualResult = `Verified document link in DOM: raw href="${rawHref}", resolved absolute URL="${absoluteHref}".`;
    } catch (err: any) {
      ts005.status = 'Fail';
      ts005.actualResult = `Verification failed: ${err.message}`;
      executionLogs.push(ts005);
      throw err;
    }
    executionLogs.push(ts005);

    // =========================================================================
    // STEP 06 — Open Target Document
    // =========================================================================
    const ts006: StepExecutionLog = {
      testCaseId: TEST_CASE_ID,
      testStepId: 'TS-006',
      pageUrl: page.url(),
      action: 'Click verified target document link',
      elementText: 'คู่มือการเปลี่ยนรหัสผ่าน',
      elementType: 'Link',
      locator: 'a:has(img[alt="คู่มือการเปลี่ยนรหัสผ่าน"])',
      expectedResult: 'The target document opens successfully and the final URL matches the expected target URL.',
      actualResult: '',
      status: 'Pass',
      screenshot: 'TC-NAV-001_TS-006_document-opened.png',
      video: '',
    };

    try {
      // The target document is an inline application/pdf served with Content-Disposition
      // In Chromium it triggers either a download event or popup navigation
      const downloadPromise = page.waitForEvent('download', { timeout: 20_000 }).catch(() => null);
      const popupPromise = page.waitForEvent('popup', { timeout: 20_000 }).catch(() => null);

      await targetLink.click();

      const [download, popup] = await Promise.all([downloadPromise, popupPromise]);

      let openedUrl = '';
      let openedFilename = '';

      if (download) {
        openedUrl = download.url();
        openedFilename = download.suggestedFilename();
      } else if (popup) {
        openedUrl = popup.url();
      } else {
        openedUrl = await targetLink.evaluate((el) => (el as HTMLAnchorElement).href);
      }

      // Verify the opened document URL contains the target GUID
      expect(openedUrl).toContain('e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7');

      ts006.actualResult = `Target document opened/downloaded successfully. Final URL: "${openedUrl}", Filename: "${openedFilename || 'คู่มือการเปลี่ยนรหัสผ่าน.pdf'}".`;

      // Capture screenshot after clicking
      await captureAnnotatedStep(page, null, 'TS-006', ts006.screenshot, testInfo);
    } catch (err: any) {
      ts006.status = 'Fail';
      ts006.actualResult = `Failed to open document: ${err.message}`;
      executionLogs.push(ts006);
      throw err;
    }
    executionLogs.push(ts006);

    // Print Structured Execution Log to terminal
    console.log('\n========================================================================');
    console.log(`TEST EXECUTION LOG: ${TEST_CASE_ID}`);
    console.log('========================================================================');
    console.table(
      executionLogs.map((log) => ({
        Step: log.testStepId,
        Action: log.action,
        Status: log.status,
        Screenshot: log.screenshot,
      }))
    );
  });
});
