import { expect, test } from '@playwright/test';

import { ADMIN_DOCUMENT_ID, COORDINATOR_DOCUMENT_ID, NO_SESSION, login, loginAs } from './helpers';

test.use({ storageState: NO_SESSION });

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/management/users');

  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
});

test('rejects wrong credentials', async ({ page }) => {
  await login(page, ADMIN_DOCUMENT_ID, 'not-the-seeded-password');

  await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('rejects a malformed document id', async ({ page }) => {
  await login(page, '123');

  await expect(page.getByText(/Ingresá una cédula uruguaya válida/)).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('logs in as admin and lands on the projects dashboard', async ({ page }) => {
  await loginAs(page, ADMIN_DOCUMENT_ID);

  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeVisible();
});

test('blocks non admin users from the users management page', async ({ page }) => {
  await loginAs(page, COORDINATOR_DOCUMENT_ID);
  await page.goto('/management/users');

  await expect(page).toHaveURL('/dashboard/projects');
});
