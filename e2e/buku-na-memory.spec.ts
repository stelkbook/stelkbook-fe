import { test, expect, Page } from '@playwright/test';

test.describe('Buku NA Memory Stability', () => {
  test('should load Buku NA without OOM and remain stable', async ({ page }) => {
    // Navigate to the reported crash page
    await page.goto('http://localhost:3000/lainnya/Buku_NA?id=9');
    
    // Wait for the book content to load
    await page.waitForSelector('h2.text-lg.font-bold', { timeout: 30000 });
    
    // Check if PageFlipBook is rendered (it's dynamic, so it might take a moment)
    // The loading text should disappear and the viewer should appear
    await expect(page.getByText('Memuat viewer...')).not.toBeVisible({ timeout: 15000 });
    
    // Perform some navigation back and forth to test memory stability
    for (let i = 0; i < 5; i++) {
      console.log(`Iteration ${i + 1}: Navigating back and forth`);
      
      // Navigate to /lainnya
      await page.click('button:has-text("Kembali")');
      await page.waitForURL('**/lainnya');
      
      // Navigate back to the book detail
      await page.goto('http://localhost:3000/lainnya/Buku_NA?id=9');
      await page.waitForSelector('h2.text-lg.font-bold');
    }
    
    // Final check for the book title
    const title = await page.textContent('h2.text-lg.font-bold');
    expect(title).toBeTruthy();
    console.log(`Loaded book title: ${title}`);
  });
});
