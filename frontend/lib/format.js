export function formatNumber(num) {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toLocaleString();
}

export function formatCurrency(num) {
  if (num === null || num === undefined) return "N/A";
  return "$" + num.toFixed(2);
}

export function formatPercent(num) {
  if (num === null || num === undefined) return "N/A";
  return (num * 100).toFixed(2) + "%";
}