import { expect, type Page } from '@playwright/test';

export const ADMIN_DOCUMENT_ID = '11111111';
export const ADMIN_NAME = 'Ana Admin';
export const ADMIN_EMAIL = 'admin@gurisesunidos.test';
export const COORDINATOR_DOCUMENT_ID = '22222222';

export const DESKTOP = { width: 1440, height: 900 };
export const MOBILE = { width: 390, height: 844 };

export const NO_SESSION = { cookies: [], origins: [] };

export function seedPassword() {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    throw new Error('SEED_USER_PASSWORD environment variable is required');
  }
  return password;
}

export async function login(page: Page, documentId: string, password = seedPassword()) {
  await page.goto('/login');
  await page.getByLabel('Cédula').fill(documentId);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

export async function loginAs(page: Page, documentId: string) {
  await login(page, documentId);
  await expect(page).toHaveURL('/dashboard/projects');
}
