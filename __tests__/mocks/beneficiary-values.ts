export function beneficiaryValueRows(counts: Record<string, number>) {
  return Object.entries(counts).map(([key, value]) => ({ value, category: { key } }));
}
