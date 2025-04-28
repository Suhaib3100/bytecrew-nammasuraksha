/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format market cap in billions or trillions
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(2)}T`;
  }
  return `$${marketCap.toFixed(2)}B`;
}

/**
 * Format percentage with + sign for positive values
 */
export function formatPercent(percent: number): string {
  return (percent > 0 ? "+" : "") + percent.toFixed(2) + "%";
}