import { test, expect } from '@playwright/test';

test.describe('Conditional API Fetching', () => {
  // Login sebelum setiap test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login'); // Sesuaikan route login jika berbeda
    // Isi form login sebagai admin
    await page.fill('input[name="kode"]', 'admin'); 
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    // Tunggu redirect ke dashboard admin
    await page.waitForURL('**/admin**'); 
  });

  test('Data Siswa page fetches data conditionally based on tabs', async ({ page }) => {
    let sdRequestCount = 0;
    let smpRequestCount = 0;
    let smkRequestCount = 0;

    // Intercept requests
    await page.route('**/api/siswa-sd', async route => {
      sdRequestCount++;
      await route.continue();
    });
    await page.route('**/api/siswa-smp', async route => {
      smpRequestCount++;
      await route.continue();
    });
    await page.route('**/api/siswa-smk', async route => {
      smkRequestCount++;
      await route.continue();
    });

    // 1. Navigate to Data Siswa page
    await page.goto('/admin/Data_Siswa');

    // 2. Default tab is SD. Expect SD request, but NO SMP/SMK requests.
    // Wait a bit for potential fetches
    await page.waitForTimeout(2000); 
    
    expect(sdRequestCount).toBeGreaterThan(0);
    expect(smpRequestCount).toBe(0);
    expect(smkRequestCount).toBe(0);

    // 3. Click SMP Tab
    await page.click('button:has-text("SMP")');
    await page.waitForTimeout(2000);

    // Expect SMP request now
    expect(smpRequestCount).toBeGreaterThan(0);
    // SMK should still be 0
    expect(smkRequestCount).toBe(0);

    // 4. Click SD Tab again
    const currentSdCount = sdRequestCount;
    await page.click('button:has-text("SD")');
    await page.waitForTimeout(2000);

    // Expect NO new SD requests (caching)
    expect(sdRequestCount).toBe(currentSdCount);
  });

  test('Data Guru page fetches data conditionally based on tabs', async ({ page }) => {
    let sdRequestCount = 0;
    let smpRequestCount = 0;

    await page.route('**/api/guru-sd', async route => {
        sdRequestCount++;
        await route.continue();
    });
    await page.route('**/api/guru-smp', async route => {
        smpRequestCount++;
        await route.continue();
    });

    await page.goto('/admin/Data_Guru');
    await page.waitForTimeout(2000);

    // Default SD
    expect(sdRequestCount).toBeGreaterThan(0);
    expect(smpRequestCount).toBe(0);

    // Switch to SMP
    await page.click('button:has-text("SMP")');
    await page.waitForTimeout(2000);

    expect(smpRequestCount).toBeGreaterThan(0);
  });
});
