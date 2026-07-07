/** Compact large integers, e.g. 1_425_887_337 → "1.43B". */
export function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}

/** Group-separated integer, e.g. 1425887337 → "1,425,887,337". */
export function formatInteger(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** US-dollar amount with thousands separators, e.g. 76330 → "$76,330". */
export function formatUsd(num: number): string {
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/** Percentage with one decimal, e.g. 91.8 → "91.8%". */
export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

/** Ordinal suffix for a rank, e.g. 1 → "1st", 23 → "23rd". */
export function formatOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
