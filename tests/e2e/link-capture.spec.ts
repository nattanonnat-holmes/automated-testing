import { test, expect } from '@playwright/test';
import { locateAndCaptureLink } from '../../src/utils/linkCaptureHelper';

test.describe('Link Locator & Visual Capture Test Suite', () => {
  // อ่านค่า PROD_URL จาก .env หรือใช้ default
  const prodUrl = process.env.PROD_URL || 'https://playwright.dev';

  test.beforeEach(async ({ page }) => {
    // กำหนด timeout สำหรับเว็บภายนอกที่อาจโหลดช้า
    test.setTimeout(60_000);
    // 1. เข้าสู่หน้าเว็บเป้าหมาย (PROD_URL)
    await page.goto(prodUrl, { waitUntil: 'domcontentloaded' });
  });

  test('[TC-NAV-001] ควรค้นหา Link ปลายทางตาม URL (href) ระบุตำแหน่ง และ Capture ปุ่มที่ต้องกด', async ({ page }, testInfo) => {
    // ตัวอย่าง Link ปลายทางที่ต้องการค้นหาในหน้า (เช่น ลิงก์ที่พาไป GitHub หรือ Docs)
    const targetLinkHref = 'https://opsd.mod.go.th/getdoc/e1af272c-c3e0-4c31-8ef4-2a1ebb0c2bc7/คมอการเปลยนรหสผาน-(5).aspx';

    // 2. ให้ระบบค้นหาว่า Link นี้อยู่ตรงส่วนไหนของหน้า, ทำการไฮไลท์ และ Capture ทั้งตัวปุ่มและบริบทหน้าจอ
    const result = await locateAndCaptureLink(
      page,
      { href: targetLinkHref },
      {
        filenamePrefix: 'link-by-href',
        highlightColor: '#ff0055', // กรอบสีชมพูสะท้อนแสง
      },
      testInfo
    );

    // 3. ตรวจสอบว่าพบ Element จริง และได้พิกัดบนหน้าจอ
    expect(result.boundingBox).not.toBeNull();
    console.log(`\n📍 [พบ Link เป้าหมาย]`);
    console.log(`- ข้อความบน Element: "${result.text}"`);
    console.log(`- ปลายทาง (href): ${result.href}`);
    console.log(`- พิกัด X, Y: (${result.boundingBox?.x}, ${result.boundingBox?.y})`);
    console.log(`- ขนาด กว้างxสูง: ${result.boundingBox?.width} x ${result.boundingBox?.height} px`);
    console.log(`- บันทึกรูปปุ่มที่: ${result.elementScreenshotPath}`);
    console.log(`- บันทึกรูปบริบทหน้าจอที่: ${result.contextScreenshotPath}\n`);

    // 4. ตรวจสอบว่าปุ่มสามารถมองเห็นและกดได้
    await expect(result.locator).toBeVisible();
  });

  test('[TC-NAV-002] ควรค้นหา Link ตามข้อความ (Text / Name) ระบุตำแหน่ง และ Capture ปุ่มที่ต้องกด', async ({ page }, testInfo) => {
    // ข้อความบนปุ่มหรือลิงก์ที่ต้องการค้นหา (เช่น 'คู่มือการเปลี่ยนรหัสผ่าน' หรือ 'Get started')
    const targetText = prodUrl.includes('playwright.dev') ? 'Get started' : 'คู่มือการเปลี่ยนรหัสผ่าน';

    // ค้นหาตำแหน่งและ Capture
    const result = await locateAndCaptureLink(
      page,
      { text: targetText },
      {
        filenamePrefix: 'link-by-text',
        highlightColor: '#00d26a', // กรอบสีเขียวสะท้อนแสง
      },
      testInfo
    );

    expect(result.boundingBox).not.toBeNull();
    console.log(`\n📍 [พบปุ่มตามข้อความ "${targetText}"]`);
    console.log(`- ปลายทาง (href): ${result.href}`);
    console.log(`- พิกัด X, Y: (${result.boundingBox?.x}, ${result.boundingBox?.y})`);
    console.log(`- รูปภาพปุ่ม: ${result.elementScreenshotPath}\n`);

    await expect(result.locator).toBeVisible();
  });
});
