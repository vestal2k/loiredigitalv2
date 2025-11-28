import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Loire Digital/);
  });

  test('should display the main navigation', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation links
    await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.locator('h1')).toContainText('Loire Digital');
  });

  test('should navigate to services section when clicking services link', async ({ page }) => {
    await page.goto('/');

    // Click on Services link
    await page.getByRole('link', { name: 'Services' }).click();

    // Check if we're on the services section
    await expect(page.url()).toContain('#services');
  });

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto('/');

    // Find and click a CTA button (e.g., "Devis gratuit")
    const ctaButton = page.getByRole('link', { name: /devis gratuit/i }).first();
    await expect(ctaButton).toBeVisible();

    // Click should navigate to contact or quote page
    await ctaButton.click();
    await expect(page.url()).toMatch(/(contact|devis)/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if page loads and is visible
    await expect(page.locator('h1')).toBeVisible();
  });
});
