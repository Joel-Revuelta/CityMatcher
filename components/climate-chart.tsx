import type { CityClimate } from "@/lib/types";

const WIDTH = 760;
const HEIGHT = 250;
const PAD = { top: 18, right: 12, bottom: 34, left: 12 };

export function ClimateChart({ climate }: { climate: CityClimate }) {
  const { monthly } = climate;
  const highs = monthly.map((month) => month.high);
  const lows = monthly.map((month) => month.low);
  const min = Math.min(...lows) - 3;
  const max = Math.max(...highs) + 3;
  const range = Math.max(1, max - min);
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const maxRain = Math.max(1, ...monthly.map((month) => month.rain));

  const x = (index: number) =>
    PAD.left + (index / Math.max(1, monthly.length - 1)) * innerWidth;
  const y = (value: number) =>
    PAD.top + ((max - value) / range) * innerHeight;

  const highPath = monthly
    .map((month, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(month.high).toFixed(1)}`)
    .join(" ");
  const lowPath = monthly
    .map((month, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(month.low).toFixed(1)}`)
    .join(" ");
  const areaPath = `${highPath} ${monthly
    .slice()
    .reverse()
    .map((month, reverseIndex) => {
      const index = monthly.length - 1 - reverseIndex;
      return `L ${x(index).toFixed(1)} ${y(month.low).toFixed(1)}`;
    })
    .join(" ")} Z`;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Average high
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            Average low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[var(--primary)]/25" />
            Rain
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {Math.round(climate.annualSunHours).toLocaleString("en-IE")} sun hours ·{" "}
          {Math.round(climate.annualRain).toLocaleString("en-IE")} mm rain / year
        </p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`Monthly climate: summer highs around ${climate.summerHigh} degrees, winter lows around ${climate.winterLow} degrees`}
      >
        <defs>
          <linearGradient id="climate-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const lineY = PAD.top + innerHeight * ratio;
          const value = Math.round(max - range * ratio);
          return (
            <g key={ratio}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={lineY}
                y2={lineY}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={ratio === 1 ? "0" : "3 5"}
              />
              <text
                x={PAD.left}
                y={lineY - 4}
                fill="var(--muted-foreground)"
                fontSize="9"
              >
                {value}°
              </text>
            </g>
          );
        })}

        {monthly.map((month, index) => {
          const barHeight = (month.rain / maxRain) * 22;
          return (
            <rect
              key={`rain-${month.month}`}
              x={x(index) - 9}
              y={HEIGHT - PAD.bottom - barHeight}
              width="18"
              height={barHeight}
              rx="3"
              fill="var(--primary)"
              opacity="0.16"
            />
          );
        })}

        <path d={areaPath} fill="url(#climate-area)" />
        <path
          d={highPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={lowPath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {monthly.map((month, index) => (
          <g key={month.month}>
            <circle cx={x(index)} cy={y(month.high)} r="3" fill="var(--accent)" />
            <circle cx={x(index)} cy={y(month.low)} r="3" fill="var(--primary)" />
            <text
              x={x(index)}
              y={HEIGHT - 12}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="10"
            >
              {month.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
