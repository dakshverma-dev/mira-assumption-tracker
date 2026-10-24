import {
  DRIVER_KEYS,
  type Drivers,
  type Overrides,
  type ScenarioResult,
} from "./types";

export function validateDrivers(value: Drivers): void {
  for (const key of DRIVER_KEYS)
    if (!Number.isFinite(value[key]))
      throw new Error("Enter a finite number for every assumption.");
  if (value.revenueNow <= 0)
    throw new Error("Revenue must be greater than zero.");
  if (!Number.isInteger(value.years) || value.years < 1 || value.years > 10)
    throw new Error("Time horizon must be a whole number from 1 to 10.");
  if (value.growthRate <= -1 || value.growthRate > 1)
    throw new Error("Growth must be greater than −100% and no more than 100%.");
  if (value.operatingMargin < 0 || value.operatingMargin > 1)
    throw new Error("Margin must be between 0% and 100%.");
}

export function profitAt(drivers: Drivers, year: number): number {
  return (
    drivers.revenueNow *
    (1 + drivers.growthRate) ** year *
    drivers.operatingMargin
  );
}

export function calculateScenario(
  base: Drivers,
  overrides: Overrides = {},
): ScenarioResult {
  const next = { ...base };
  for (const key of Object.keys(overrides)) {
    if (!DRIVER_KEYS.includes(key as keyof Drivers))
      throw new Error(`Unknown scenario driver: ${key}.`);
    next[key as keyof Drivers] = overrides[key as keyof Drivers] as number;
  }
  validateDrivers(base);
  validateDrivers(next);
  const baseProfit = profitAt(base, base.years);
  const scenarioProfit = profitAt(next, next.years);
  const absoluteChange = scenarioProfit - baseProfit;
  const percentageChange =
    baseProfit === 0 ? null : (absoluteChange / baseProfit) * 100;
  if (
    ![baseProfit, scenarioProfit, absoluteChange].every(Number.isFinite) ||
    (percentageChange !== null && !Number.isFinite(percentageChange))
  ) {
    throw new Error(
      "These values exceed the supported calculation range. Use a smaller revenue.",
    );
  }
  return { baseProfit, scenarioProfit, absoluteChange, percentageChange };
}
