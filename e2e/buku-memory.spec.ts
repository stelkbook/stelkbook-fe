import { test, expect, Page, Route } from '@playwright/test';

const BASE = 'http://localhost:3000';
const API_BASE = 'http://127.0.0.1:8000/api';

async function mockBookRoutes(page: Page) {
  // Role user endpoint
  await page.route(`${API_BASE}/user`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, username: 'tester', role: 'Guru', email: 't@example.com' }),
    });
  });
  await page.addInitScript(() => localStorage.setItem('auth_token', 'test'));

  // Buku detail endpoints for different roles
  await page.route(`${API_BASE}/books/guru/1`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        judul: 'Contoh Buku Guru',
        penerbit: 'Penerbit A',
        penulis: 'Penulis A',
        tahun: '2024',
        kategori: 'Kelas X',
        ISBN: '1234567890',
        isi: '/assets/pdfs/MTK-OLM.pdf',
        cover: '/assets/default-cover.png',
      }),
    });
  });
  await page.route(`${API_BASE}/books-perpus/1`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        judul: 'Contoh Buku Perpus',
        penerbit: 'Penerbit B',
        penulis: 'Penulis B',
        tahun: '2024',
        kategori: 'Kelas XI',
        ISBN: '0987654321',
        isi: '/assets/pdfs/MTK-OLM.pdf',
        cover: '/assets/default-cover.png',
      }),
    });
  });
  await page.route(`${API_BASE}/books/siswa/1`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        judul: 'Contoh Buku Siswa',
        penerbit: 'Penerbit C',
        penulis: 'Penulis C',
        tahun: '2024',
        kategori: 'Kelas VIII',
        ISBN: '1122334455',
        isi: '/assets/pdfs/MTK-OLM.pdf',
        cover: '/assets/default-cover.png',
      }),
    });
  });
}

test.describe('Buku pages memory stability', () => {
  test('navigate buku pages across roles without memory growth >10%', async ({ page }) => {
    await mockBookRoutes(page);
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    const getHeap = async () => {
      const metrics = await client.send('Performance.getMetrics');
      const jsHeapUsed = metrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
      return jsHeapUsed;
    };

    // Start at guru book page
    await page.goto(BASE + '/homepage_guru/Buku?id=1');
    const baseline = await getHeap();

    // Iterate through buku pages for different roles
    for (let i = 0; i < 20; i++) {
      await page.goto(BASE + '/homepage_guru/Buku?id=1'); // guru
      await page.goto(BASE + '/kelasI/Buku?id=1');        // siswa SD
      await page.goto(BASE + '/kelasXI_perpus/buku11?id=1'); // perpus XI
      const current = await getHeap();
      const increase = (current - baseline) / (baseline || 1);
      expect(increase).toBeLessThan(0.1);
    }
  });
});
