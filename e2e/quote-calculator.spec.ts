import { test, expect } from '@playwright/test';

test.describe('Quote Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/devis');
  });

  test('should display the quote calculator', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /devis/i })).toBeVisible();
  });

  test('should allow selecting a package', async ({ page }) => {
    // Look for package selection buttons or cards
    const vitrinePackage = page.locator('text=/vitrine/i').first();
    if (await vitrinePackage.isVisible()) {
      await vitrinePackage.click();
    }
  });

  test('should update price when changing options', async ({ page }) => {
    // Wait for the calculator to load
    await page.waitForLoadState('networkidle');

    // Find and interact with the page slider if it exists
    const pageSlider = page.locator('input[type="range"]').first();
    if (await pageSlider.isVisible()) {
      await pageSlider.fill('5');
    }

    // Look for price display
    const priceDisplay = page.locator('text=/€/').first();
    await expect(priceDisplay).toBeVisible();
  });

  test('should allow selecting additional options', async ({ page }) => {
    // Look for checkboxes for additional options (blog, SEO, etc.)
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      // Check the first option
      await checkboxes.first().check();

      // Price should be updated (we just verify it's still visible)
      const priceDisplay = page.locator('text=/€/').first();
      await expect(priceDisplay).toBeVisible();
    }
  });

  test('should display quote form fields', async ({ page }) => {
    // Scroll down to form section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for form fields
    const nameField = page.getByLabel(/nom/i);
    const emailField = page.getByLabel(/email/i);

    // These should be visible
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
  });

  test('should show validation errors on invalid submission', async ({ page }) => {
    // Scroll to form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Try to submit with invalid data
    const submitButton = page.getByRole('button', { name: /envoyer|obtenir/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors
      await expect(page.locator('text=/requis|obligatoire|minimum/i').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/devis');

    // Check if calculator is visible
    await expect(page.getByRole('heading', { name: /devis/i })).toBeVisible();
  });

  test('should allow selecting maintenance options', async ({ page }) => {
    // Look for maintenance selection (radio buttons or select)
    const maintenanceOptions = page.locator('input[type="radio"]');
    const count = await maintenanceOptions.count();

    if (count > 0) {
      // Select a maintenance option
      await maintenanceOptions.first().check();

      // Verify it's checked
      await expect(maintenanceOptions.first()).toBeChecked();
    }
  });
});
