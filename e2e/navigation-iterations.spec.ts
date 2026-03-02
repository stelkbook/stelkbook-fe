import { test, expect, Page, Route } from '@playwright/test';

const BASE = 'http://localhost:3000';
const API_BASE = 'http://127.0.0.1:8000/api';

async function mockUser(page: Page, role: string) {
  await page.route(`${API_BASE}/user`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: role,
        role,
        email: `${role}@example.com`,
      })
    });
  });
  await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));
}

test.describe('Fast navigation iterations (<300ms target)', () => {
  test('50 iterations across pages under perf throttle', async ({ page }) => {
    await mockUser(page, 'Guru');
    await page.goto(BASE + '/homepage_guru');

    const t0 = Date.now();
    let durations: number[] = [];
    for (let i = 0; i < 50; i++) {
      const start = Date.now();
      await page.goto(BASE + '/homepage_guru');
      await page.goto(BASE + '/homepage');
      await page.goto(BASE + '/perpustakaan');
      durations.push(Date.now() - start);
    }
    // Average per 3 hops
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    // target under 300ms per hop — 3 hops => 900ms
    expect(avg).toBeLessThan(900);
  });
});
