import type { CityClimate } from "@/lib/types";

const WIDTH = 760;
const HEIGHT = 240;
const PAD = { top: 18, right: 12, bottom: 32, left: 32 };

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
  const bandPath = `${highPath} ${monthly
    .slice()
    .reverse()
    .map((month, reverseIndex) => {
      const index = monthly.length - 1 - reverseIndex;
      return `L ${x(index).toFixed(1)} ${y(month.low).toFixed(1)}`;
    })
    .join(" ")} Z`;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-primary" />
            Average high
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dashed border-muted-foreground" />
            Average low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-1 bg-border" />
            Rain
          </span>
        </div>
        <div className="flex gap-4 font-mono text-xs text-muted-foreground">
          <span>{Math.round(climate.annualSunHours).toLocaleString("en-IE")} sun hours</span>
          <span>{Math.round(climate.annualRain).toLocaleString("en-IE")} mm rain</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`Monthly climate: summer highs around ${climate.summerHigh} degrees, winter lows around ${climate.winterLow} degrees`}
      >
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
                strokeDasharray={ratio === 1 ? "0" : "2 4"}
              />
              <text
                x={PAD.left - 8}
                y={lineY + 3}
                textAnchor="end"
                fill="var(--muted-foreground)"
                fontSize="9"
                fontFamily="var(--font-plex-mono)"
              >
                {value}°
              </text>
            </g>
          );
        })}

        {monthly.map((month, index) => {
          const barHeight = (month.rain / maxRain) * 18;
          return (
            <rect
              key={`rain-${month.month}`}
              x={x(index) - 10}
              y={HEIGHT - PAD.bottom - barHeight}
              width="20"
              height={barHeight}
              fill="var(--border)"
            />
          );
        })}

        <path d={bandPath} fill="var(--muted)" opacity="0.45" />
        <path
          d={highPath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-line-draw"
        />
        <path
          d={lowPath}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {monthly.map((month, index) => (
          <g key={month.month}>
            <circle cx={x(index)} cy={y(month.high)} r="2.5" fill="var(--primary)" />
            <text
              x={x(index)}
              y={HEIGHT - 12}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="9.5"
              fontFamily="var(--font-plex-mono)"
            >
              {month.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
