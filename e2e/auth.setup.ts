import { test as setup } from '@playwright/test';

import { ADMIN_DOCUMENT_ID, loginAs } from './helpers';

const ADMIN_STATE = 'e2e/.auth/admin.json';

setup('authenticates as the seeded admin', async ({ page }) => {
  await loginAs(page, ADMIN_DOCUMENT_ID);
  await page.context().storageState({ path: ADMIN_STATE });
});
