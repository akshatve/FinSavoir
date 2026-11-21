const isMissing = (num) => num === null || num === undefined || Number.isNaN(num);

export function formatNumber(num) {
  if (isMissing(num)) return "N/A";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + "M";
  return num.toLocaleString();
}

// Share prices and per-share amounts: "$123.45".
export function formatCurrency(num) {
  if (isMissing(num)) return "N/A";
  return (num < 0 ? "-$" : "$") + Math.abs(num).toFixed(2);
}

// Company-sized amounts (market cap, revenue): "$2.95T", "$412.30M".
export function formatLargeCurrency(num) {
  if (isMissing(num)) return "N/A";
  const abs = Math.abs(num);
  if (abs < 1e6) return formatCurrency(num);
  return (num < 0 ? "-$" : "$") + formatNumber(abs);
}

// Fractions to percentages: 0.1234 -> "12.34%".
export function formatPercent(num) {
  if (isMissing(num)) return "N/A";
  return (num * 100).toFixed(2) + "%";
}
