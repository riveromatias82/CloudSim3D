interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ values, color = "#22d3ee", height = 42 }: SparklineProps) {
  if (values.length < 2) {
    return <div className="h-[42px] w-full rounded bg-slate-800/70" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="3" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
