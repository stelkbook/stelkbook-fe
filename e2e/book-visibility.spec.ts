import { test, expect } from '@playwright/test';

// Daftar halaman yang mewakili berbagai bagian aplikasi (Siswa, Guru, Perpustakaan)
const pagesToCheck = [
  // '/kelasI/Buku', // Memerlukan ID dinamis, di-skip untuk testing statis
  '/homepage_guru/KelasGuru/Matematika_X',
  '/perpustakaan/Buku_X_perpus/Sejarah_X_perpus' 
];

// 5 Ukuran Layar yang diminta untuk diuji
const viewports = [
  { width: 360, height: 640, name: 'Mobile Small (360px)' },
  { width: 414, height: 896, name: 'Mobile Large (414px)' },
  { width: 768, height: 1024, name: 'Tablet (768px)' },
  { width: 1366, height: 768, name: 'Laptop (1366px)' },
  { width: 1920, height: 1080, name: 'Desktop (1920px)' },
];

for (const pageUrl of pagesToCheck) {
  test.describe(`Verifikasi Tampilan Buku di ${pageUrl}`, () => {
    for (const viewport of viewports) {
      test(`harus menampilkan buku pada ${viewport.name}`, async ({ page }) => {
        // 1. Set viewport size
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // 2. Buka halaman
        await page.goto(pageUrl);
        
        // 3. Verifikasi Container Buku (.book-wrapper)
        // Container ini dikelola oleh PageFlipBook2 dan harus memiliki width > 0
        const bookWrapper = page.locator('.book-wrapper');
        await expect(bookWrapper).toBeVisible({ timeout: 30000 });

        // Periksa dimensi bounding box
        const box = await bookWrapper.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
            console.log(`Viewport: ${viewport.name}, Box Width: ${box.width}, Box Height: ${box.height}`);
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
            
            // Verifikasi bahwa width tidak 'tergencet' (misal < 50px)
            // Pada mobile, width harusnya mendekati viewport width (minus padding)
            // Pada desktop, width menyesuaikan layout
            expect(box.width).toBeGreaterThan(50);
        }

        // 4. Verifikasi Canvas (Render PDF)
        // Memastikan PDF benar-benar dirender ke dalam canvas
        const canvas = page.locator('canvas').first();
        await expect(canvas).toBeVisible({ timeout: 30000 }); // PDF load mungkin butuh waktu
      });
    }
  });
}
