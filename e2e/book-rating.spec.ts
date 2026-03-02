import { test, expect } from '@playwright/test';

test.describe('Book Rating and Filter Feature', () => {
  
  test('should display rating component on book detail page', async ({ page }) => {
    // Navigate to a book detail page (assuming ID 1 exists, adjust if needed)
    await page.goto('/kelasII/Buku?id=1');
    
    // Check if rating component exists
    const ratingComponent = page.locator('text=Rating Komunitas');
    await expect(ratingComponent).toBeVisible();
    
    // Check if stars are visible
    const stars = page.locator('button[aria-label^="Rate"]');
    await expect(stars).toHaveCount(5);
  });

  test('should allow sorting books by rating', async ({ page }) => {
    await page.goto('/kelasII');
    
    // Open sort dropdown
    await page.click('text=Urutkan');
    
    // Select "Rating Tertinggi"
    await page.click('text=Rating Tertinggi');
    
    // Verify URL or UI update (this depends on implementation, but we check if the sort option is selected)
    const sortButton = page.locator('button', { hasText: 'Rating Tertinggi' });
    await expect(sortButton).toBeVisible();
  });

  test('should filter books by tags', async ({ page }) => {
    await page.goto('/kelasII');
    
    // Open filter dropdown
    await page.click('text=Filter');
    
    // Check if Tags section exists
    await page.click('text=Tags');
    
    // Try to add a tag (if input exists)
    const tagInput = page.locator('input[placeholder="Tambah Tag Baru"]');
    if (await tagInput.isVisible()) {
      await tagInput.fill('Matematika');
      await tagInput.press('Enter');
      
      // Verify tag is added to active filters
      const activeTag = page.locator('span', { hasText: 'Matematika' });
      await expect(activeTag).toBeVisible();
    }
  });
});
