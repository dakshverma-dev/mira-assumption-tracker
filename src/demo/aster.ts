import { DRIVER_KEYS, DRIVER_META, type Workspace } from "../domain/types";

export function createAster(): Workspace {
  const now = new Date().toISOString();
  const thesisId = crypto.randomUUID();
  const values = {
    revenueNow: 100,
    years: 5,
    growthRate: 0.1,
    operatingMargin: 0.2,
  };
  const rationales = {
    revenueNow:
      "Annual revenue of £100 million is the starting point for this fictional example.",
    years:
      "A five-year horizon makes the compounding effect of the assumptions visible.",
    growthRate:
      "Repeat orders and specialist packaging demand could support 10% annual revenue growth.",
    operatingMargin:
      "Repeat orders support production planning and could help preserve a 20% operating margin.",
  };
  const assumptions = DRIVER_KEYS.map((driverKey) => ({
    id: crypto.randomUUID(),
    thesisId,
    driverKey,
    value: values[driverKey],
    unit: DRIVER_META[driverKey].unit,
    rationale: rationales[driverKey],
    reviewCondition:
      driverKey === "operatingMargin"
        ? "Review the margin assumption if there is credible evidence of sustained discounting."
        : "Revisit this assumption when new evidence changes the original reasoning.",
  }));
  return {
    schemaVersion: 1,
    isSample: true,
    thesis: {
      id: thesisId,
      companyName: "Aster Products",
      text: "Aster can grow revenue while preserving its operating margin because repeat orders support production planning.",
      createdAt: now,
      updatedAt: now,
    },
    assumptions,
    evidence: [
      {
        isFictional: true,
        id: crypto.randomUUID(),
        assumptionId: assumptions.find(
          (a) => a.driverKey === "operatingMargin",
        )!.id,
        sourceTitle: "New product pricing review",
        sourceUrl: "",
        observedOn: "2026-10-20",
        excerpt:
          "An analyst note says the company may need to discount a new product line.",
        kind: "contradicts",
        explanation:
          "Pricing pressure could reduce the operating margin, even if revenue continues to grow.",
      },
    ],
    scenarios: [],
    currentOverrides: {},
  };
}
