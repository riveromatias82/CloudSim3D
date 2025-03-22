export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function saturate(value: number): number {
  return clamp(value, 0, 1);
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function weightedAverage(values: Array<{ value: number; weight: number }>): number {
  let totalWeight = 0;
  let totalValue = 0;

  for (const item of values) {
    if (item.weight <= 0) {
      continue;
    }
    totalWeight += item.weight;
    totalValue += item.value * item.weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return totalValue / totalWeight;
}
