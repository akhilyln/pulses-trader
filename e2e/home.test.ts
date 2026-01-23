import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Vijaya Ambica Enterprises|Pulses Trader/);
});

test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for some key text
    await expect(page.getByText(/Vijaya Ambica Enterprises/i)).toBeVisible();
    await expect(page.getByText(/Trading Since 1970/i)).toBeVisible();
});
