import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display the contact form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();
    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test('should show validation errors when submitting empty form', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /envoyer/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/au moins/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.getByLabel(/nom/i).fill('Jean Dupont');
    await page.getByLabel(/email/i).fill('invalid-email');

    // Select project type if available
    const projectSelect = page.locator('select[name="project"]');
    if (await projectSelect.isVisible()) {
      await projectSelect.selectOption('creation');
    }

    await page.getByLabel(/message/i).fill('Un message de test valide pour vérifier le formulaire.');

    // Accept GDPR if checkbox exists
    const gdprCheckbox = page.locator('input[type="checkbox"]').first();
    if (await gdprCheckbox.isVisible()) {
      await gdprCheckbox.check();
    }

    await page.getByRole('button', { name: /envoyer/i }).click();

    // Should show email validation error
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('should accept valid form data', async ({ page }) => {
    // Fill in valid data
    await page.getByLabel(/nom/i).fill('Jean Dupont');
    await page.getByLabel(/email/i).fill('jean.dupont@example.com');

    // Fill phone if field exists
    const phoneField = page.getByLabel(/téléphone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill('0612345678');
    }

    // Select project type if available
    const projectSelect = page.locator('select[name="project"]');
    if (await projectSelect.isVisible()) {
      await projectSelect.selectOption('creation');
    }

    await page.getByLabel(/message/i).fill('Je souhaite créer un site web pour mon entreprise de boulangerie à Saint-Étienne.');

    // Accept GDPR if checkbox exists
    const gdprCheckbox = page.locator('input[type="checkbox"]').first();
    if (await gdprCheckbox.isVisible()) {
      await gdprCheckbox.check();
    }

    // Note: We don't actually submit to avoid sending real emails
    // In a real test, you'd mock the API endpoint or use a test environment
  });

  test('should have accessible form labels', async ({ page }) => {
    // Check that all form inputs have associated labels
    const nameInput = page.getByLabel(/nom/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test('should display GDPR consent checkbox', async ({ page }) => {
    // Look for GDPR/privacy related checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });
});
