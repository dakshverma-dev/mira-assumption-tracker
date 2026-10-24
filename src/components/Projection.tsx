import { profitAt } from "../domain/calculate";
import type { Drivers } from "../domain/types";

export function Projection({
  base,
  scenario,
}: {
  base: Drivers;
  scenario: Drivers;
}) {
  const steps = Math.max(base.years, scenario.years);
  const basePoints = Array.from({ length: base.years + 1 }, (_, year) =>
    profitAt(base, year),
  );
  const scenarioPoints = Array.from({ length: scenario.years + 1 }, (_, year) =>
    profitAt(scenario, year),
  );
  const max = Math.max(...basePoints, ...scenarioPoints, 1);
  const x = (i: number) => 38 + (i / steps) * 254;
  const y = (v: number) => 137 - (v / max) * (112 / 1.18);
  const path = (points: number[]) =>
    points.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg
      className="projection"
      viewBox="0 0 320 166"
      role="img"
      aria-label={`Operating profit projection: base year ${base.years} £${basePoints.at(-1)!.toFixed(2)} million; scenario year ${scenario.years} £${scenarioPoints.at(-1)!.toFixed(2)} million.`}
    >
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1="38"
            x2="296"
            y1={y(max * f)}
            y2={y(max * f)}
            stroke="#e7edf6"
            strokeDasharray="3 4"
          />
          <text x="29" y={y(max * f) + 3} textAnchor="end">
            {Math.round(max * f)}
          </text>
        </g>
      ))}
      <path
        d={`${path(scenarioPoints)} L${x(scenario.years)},137 L38,137 Z`}
        fill="#315de8"
        fillOpacity="0.055"
      />
      <path
        d={path(basePoints)}
        fill="none"
        stroke="#99a7bd"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <path
        d={path(scenarioPoints)}
        fill="none"
        stroke="#315de8"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle
        cx={x(scenario.years)}
        cy={y(scenarioPoints.at(-1)!)}
        r="4.5"
        fill="#315de8"
        stroke="white"
        strokeWidth="2"
      />
      <text x="38" y="158">
        Today
      </text>
      <text x="294" y="158" textAnchor="end">
        Year {steps}
      </text>
    </svg>
  );
}
