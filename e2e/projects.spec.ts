import { expect, test, type Page } from '@playwright/test';

import { DESKTOP } from './helpers';

test.use({ viewport: DESKTOP });

function projectCards(page: Page) {
  return page.getByRole('link').filter({ has: page.getByRole('heading', { level: 2 }) });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard/projects');
});

test('lists the seeded projects', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo proyecto' })).toBeVisible();

  const first = projectCards(page).first();
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute('href', /^\/dashboard\/projects\/\d+$/);
  await expect(first.getByText('Territorio')).toBeVisible();
});

test('filters projects by status', async ({ page }) => {
  const tabs = page.getByRole('tablist', { name: 'Filtrar por estado' });

  await tabs.getByRole('tab', { name: 'Activos' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos activos' })).toBeVisible();
  await expect(projectCards(page).getByText('Cerrado')).toHaveCount(0);

  await tabs.getByRole('tab', { name: 'Cerrados' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos cerrados' })).toBeVisible();
  await expect(projectCards(page).getByText('Activo')).toHaveCount(0);
});

test('opens the project detail from the list', async ({ page }) => {
  const first = projectCards(page).first();
  const name = await first.getByRole('heading', { level: 2 }).innerText();

  await first.click();

  await expect(page).toHaveURL(/\/dashboard\/projects\/\d+$/);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(page.getByText('Coordinador/a:')).toBeVisible();
});
