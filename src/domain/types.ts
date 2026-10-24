export const DRIVER_KEYS = [
  "revenueNow",
  "years",
  "growthRate",
  "operatingMargin",
] as const;
export type DriverKey = (typeof DRIVER_KEYS)[number];
export type Drivers = Record<DriverKey, number>;
export type Overrides = Partial<Drivers>;
export const KINDS = [
  "supports",
  "contradicts",
  "mixed",
  "insufficient",
] as const;
export type EvidenceKind = (typeof KINDS)[number];
export type ScenarioResult = {
  baseProfit: number;
  scenarioProfit: number;
  absoluteChange: number;
  percentageChange: number | null;
};
export type Thesis = {
  id: string;
  companyName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};
export type Assumption = {
  id: string;
  thesisId: string;
  driverKey: DriverKey;
  value: number;
  unit: string;
  rationale: string;
  reviewCondition: string;
  reviewOn?: string;
};
export type Evidence = {
  id: string;
  assumptionId: string;
  sourceTitle: string;
  sourceUrl: string;
  observedOn: string;
  excerpt: string;
  kind: EvidenceKind;
  explanation: string;
};
export type Scenario = {
  id: string;
  thesisId: string;
  name: string;
  base: Drivers;
  overrides: Overrides;
  result: ScenarioResult;
  savedAt: string;
};
export type Workspace = {
  schemaVersion: 1;
  isSample: boolean;
  thesis: Thesis;
  assumptions: Assumption[];
  evidence: Evidence[];
  scenarios: Scenario[];
  currentOverrides: Overrides;
};
export const DRIVER_META: Record<
  DriverKey,
  { label: string; short: string; unit: string; suffix: string }
> = {
  revenueNow: {
    label: "Revenue now",
    short: "Revenue",
    unit: "GBP millions",
    suffix: "m",
  },
  years: {
    label: "Time horizon",
    short: "Horizon",
    unit: "years",
    suffix: " yrs",
  },
  growthRate: {
    label: "Annual growth",
    short: "Growth",
    unit: "decimal",
    suffix: "%",
  },
  operatingMargin: {
    label: "Operating margin",
    short: "Margin",
    unit: "decimal",
    suffix: "%",
  },
};
export function toDisplay(key: DriverKey, value: number): number {
  return key === "growthRate" || key === "operatingMargin"
    ? Number((value * 100).toPrecision(12))
    : value;
}
export function fromDisplay(key: DriverKey, value: number): number {
  return key === "growthRate" || key === "operatingMargin"
    ? value / 100
    : value;
}
export function getDrivers(assumptions: Assumption[]): Drivers {
  return Object.fromEntries(
    assumptions.map((a) => [a.driverKey, a.value]),
  ) as Drivers;
}
