export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatRps(value: number): string {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 1)}M/s`;
  }
  if (value >= 10_000) {
    return `${formatNumber(value / 1_000, 1)}k/s`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 2)}k/s`;
  }
  return `${formatNumber(value, 0)}/s`;
}

export function formatMs(value: number): string {
  if (value >= 1000) {
    return `${formatNumber(value / 1000, 2)}s`;
  }
  if (value >= 100) {
    return `${formatNumber(value, 0)}ms`;
  }
  return `${formatNumber(value, 1)}ms`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatSeconds(value: number): string {
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
