export function formatPrice(val: number): string {
  if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) {
    return '$0';
  }
  const formatted = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 6,
  }).format(val);
  return `$${formatted}`;
}
