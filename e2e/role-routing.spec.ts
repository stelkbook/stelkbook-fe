import { test, expect, Page, Route } from '@playwright/test';

const BASE = 'http://localhost:3000';
const API_BASE = 'http://127.0.0.1:8000/api';

async function mockUserRoute(page: Page, role: string) {
  await page.route(`${API_BASE}/user`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: role,
        role,
        email: `${role}@example.com`,
      }),
    });
  });
}

test.describe('Role-based routing and navigation', () => {
  test('admin login routes to /admin', async ({ page }) => {
    await mockUserRoute(page, 'Admin');
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));
    await page.goto(BASE + '/homepage');
    await page.waitForURL('**/admin', { timeout: 5000 });
    expect(page.url()).toContain('/admin');
  });

  test('perpus login routes to /perpustakaan', async ({ page }) => {
    await mockUserRoute(page, 'Perpus');
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));
    await page.goto(BASE + '/homepage');
    await page.waitForURL('**/perpustakaan', { timeout: 5000 });
    expect(page.url()).toContain('/perpustakaan');
  });

  test('guru login routes to /homepage_guru', async ({ page }) => {
    await mockUserRoute(page, 'Guru');
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));
    await page.goto(BASE + '/homepage');
    await page.waitForURL('**/homepage_guru', { timeout: 5000 });
    expect(page.url()).toContain('/homepage_guru');
  });

  test('siswa login routes to /homepage', async ({ page }) => {
    await mockUserRoute(page, 'Siswa');
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));
    await page.goto(BASE + '/homepage');
    await page.waitForURL('**/homepage', { timeout: 5000 });
    expect(page.url()).toContain('/homepage');
  });
});
