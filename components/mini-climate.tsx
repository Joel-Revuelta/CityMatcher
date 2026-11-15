import type { CityClimate } from "@/lib/types";

export function MiniClimate({
  climate,
  width = 110,
  height = 30,
  className,
}: {
  climate: CityClimate;
  width?: number;
  height?: number;
  className?: string;
}) {
  const highs = climate.monthly.map((month) => month.high);
  const lows = climate.monthly.map((month) => month.low);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = Math.max(1, max - min);
  const pad = 3;

  const path = (values: number[]) =>
    values
      .map((value, index) => {
        const x = pad + (index / (values.length - 1)) * (width - pad * 2);
        const y = pad + ((max - value) / range) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path
        d={path(highs)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path(lows)}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth="1"
        strokeDasharray="2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
