'use server';

import { getReferenceYear } from '@/lib/metrics/queries';
import { getPublicProjectsPage } from '@/lib/projects/public-projects';

export async function loadPublicProjectsPage(page: number) {
  const year = await getReferenceYear();
  return getPublicProjectsPage(year, String(page));
}
