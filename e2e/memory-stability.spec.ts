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

test.describe('Memory stability under continuous routing', () => {
  test('10 minutes routing without memory >10% increase', async ({ page, browserName }) => {
    test.slow(); // allow long-running
    await mockUser(page, 'Perpus');

    const client = await page.context().newCDPSession(page);
    // Simulate low-end device via CPU throttling
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.goto(BASE + '/perpustakaan');
    const getHeap = async () => {
      const metrics = await client.send('Performance.getMetrics');
      const jsHeapTotal = metrics.metrics.find(m => m.name === 'JSHeapTotalSize')?.value || 0;
      const jsHeapUsed = metrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
      return { jsHeapTotal, jsHeapUsed };
    };

    const baseline = await getHeap();
    const start = Date.now();
    let iterations = 0;

    while (Date.now() - start < 10 * 60 * 1000) {
      // Navigate across key pages
      await page.goto(BASE + '/perpustakaan');
      await page.goto(BASE + '/admin_perpus');
      await page.goto(BASE + '/perpustakaan/Daftar_Buku');
      await page.goto(BASE + '/perpustakaan/kunjungan');
      iterations += 4;

      // Sample heap
      const current = await getHeap();
      const increase = (current.jsHeapUsed - baseline.jsHeapUsed) / (baseline.jsHeapUsed || 1);
      expect(increase).toBeLessThan(0.1);
    }

    expect(iterations).toBeGreaterThan(50);
  });
});
