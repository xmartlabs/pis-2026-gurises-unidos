const STATS_COLUMNS_CLASSES: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export function getStatsColumnsClass(count: number) {
  if (count <= 4) return STATS_COLUMNS_CLASSES[Math.max(count, 1)];
  return count === 5 || count % 3 === 0 ? STATS_COLUMNS_CLASSES[3] : STATS_COLUMNS_CLASSES[4];
}
