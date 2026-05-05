import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/features',
  '/specs',
  '/waitlist',
  '/quickstart',
  '/manual',
  '/faq',
  '/legal',
  '/blog',
  '/blog/hello-arcadia',
  '/thank-you',
  '/404',
];

for (const route of ROUTES) {
  test(`${route} returns OK with an <h1>`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res, `no response from ${route}`).not.toBeNull();
    expect(res!.status(), `bad status from ${route}`).toBeLessThan(500);
    await expect(page.locator('h1')).toBeVisible();
  });

  test(`${route} has og tags and a canonical link`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
}
