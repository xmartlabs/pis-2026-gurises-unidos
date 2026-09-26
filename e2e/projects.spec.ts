import { expect, test, type Page } from '@playwright/test';

import {
  E2E_ACTIVE_PROJECT,
  E2E_CLOSED_PROJECT,
  E2E_DEPARTMENT,
  E2E_PROJECTS,
} from '../prisma/e2e-fixtures';
import { COORDINATOR_NAME, DESKTOP } from './helpers';

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

  const cards = projectCards(page);
  await expect(cards).toHaveCount(E2E_PROJECTS.length);

  const first = cards.first();
  await expect(first.getByRole('heading', { level: 2 })).toHaveText(E2E_ACTIVE_PROJECT.name);
  await expect(first).toHaveAttribute('href', /^\/dashboard\/projects\/\d+$/);
  await expect(first.getByText('Territorio')).toBeVisible();
  await expect(first.getByText(E2E_DEPARTMENT)).toBeVisible();
});

test('filters projects by status', async ({ page }) => {
  const tabs = page.getByRole('tablist', { name: 'Filtrar por estado' });
  const cards = projectCards(page);

  await tabs.getByRole('tab', { name: 'Activos' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos activos' })).toBeVisible();
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading', { level: 2 })).toHaveText(E2E_ACTIVE_PROJECT.name);

  await tabs.getByRole('tab', { name: 'Cerrados' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Proyectos cerrados' })).toBeVisible();
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading', { level: 2 })).toHaveText(E2E_CLOSED_PROJECT.name);
});

test('opens the project detail from the list', async ({ page }) => {
  await projectCards(page).filter({ hasText: E2E_ACTIVE_PROJECT.name }).click();

  await expect(page).toHaveURL(/\/dashboard\/projects\/\d+$/);
  await expect(
    page.getByRole('heading', { level: 1, name: E2E_ACTIVE_PROJECT.name })
  ).toBeVisible();
  await expect(page.getByText(`Coordinador/a: ${COORDINATOR_NAME}`)).toBeVisible();
});
