import { listProjectFilterOptions, listProjects } from '@/lib/projects/list';
import { parseProjectFilters } from '@/lib/validation/project-filters';

async function show(raw: Record<string, string>) {
  const { items, total } = await listProjects(parseProjectFilters(raw));
  console.log(JSON.stringify(raw), '→ total', total);
  for (const p of items) console.log('  ', p.id, p.name, p.beneficiaries.map((b) => b.year));
}

async function main() {
  const { years } = await listProjectFilterOptions();
  console.log('years', years);
  await show({});
  for (const year of years) await show({ beneficiaryYear: String(year) });
  await show({ beneficiaryYear: '2020' })
  await show({ beneficiaryYear: '1500' });
  process.exit(0);
}

main();
