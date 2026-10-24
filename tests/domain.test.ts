import { describe, expect, it } from "vitest";
import { calculateScenario } from "../src/domain/calculate";
import { validateWorkspace } from "../src/domain/schema";
import { getDrivers, type Drivers } from "../src/domain/types";
import { createAster } from "../src/demo/aster";
import { exportWorkspace, parseWorkspace } from "../src/lib/importExport";
import {
  loadWorkspace,
  saveWorkspace,
  STORAGE_KEY,
  type StorageLike,
} from "../src/lib/storage";

const base: Drivers = {
  revenueNow: 100,
  years: 5,
  growthRate: 0.1,
  operatingMargin: 0.2,
};
function memoryStore(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("transparent scenario arithmetic", () => {
  it("matches the exact Aster base and downside fixtures", () => {
    const result = calculateScenario(base, {
      growthRate: 0.06,
      operatingMargin: 0.17,
    });
    expect(result.baseProfit).toBeCloseTo(32.2102, 9);
    expect(result.scenarioProfit).toBeCloseTo(22.7498348192, 9);
    expect(result.absoluteChange).toBeCloseTo(-9.4603651808, 9);
    expect(result.percentageChange).toBeCloseTo(-29.370712, 5);
    expect(base.growthRate).toBe(0.1);
    expect(base.operatingMargin).toBe(0.2);
  });
  it("returns null percentage when base profit is zero", () => {
    const result = calculateScenario(
      { ...base, operatingMargin: 0 },
      { operatingMargin: 0.17 },
    );
    expect(result.baseProfit).toBe(0);
    expect(result.percentageChange).toBeNull();
    expect(result.absoluteChange).toBeGreaterThan(0);
  });
  it("supports zero scenario margin, negative growth and boundary horizons", () => {
    expect(
      calculateScenario(base, { operatingMargin: 0 }).percentageChange,
    ).toBe(-100);
    expect(
      calculateScenario(base, { growthRate: -0.5, years: 1 }).scenarioProfit,
    ).toBe(10);
    expect(
      calculateScenario(base, { years: 10, growthRate: 1, operatingMargin: 1 })
        .scenarioProfit,
    ).toBe(102400);
  });
  it.each([
    { revenueNow: 0 },
    { revenueNow: -1 },
    { revenueNow: Infinity },
    { years: 0 },
    { years: 11 },
    { years: 2.5 },
    { growthRate: -1 },
    { growthRate: 1.01 },
    { growthRate: NaN },
    { operatingMargin: -0.01 },
    { operatingMargin: 1.01 },
  ])("rejects invalid inputs %j", (overrides) => {
    expect(() => calculateScenario(base, overrides)).toThrow();
  });
  it("rejects unknown drivers instead of trusting an imported override", () => {
    const invalid = JSON.parse('{"surprise": 12}');
    expect(() => calculateScenario(base, invalid)).toThrow(
      "Unknown scenario driver",
    );
  });
  it("rejects overflow instead of returning Infinity", () => {
    expect(() =>
      calculateScenario({
        ...base,
        revenueNow: Number.MAX_VALUE,
        growthRate: 1,
      }),
    ).toThrow("calculation range");
  });
});

describe("portable, linked research records", () => {
  it("accepts the labelled sample and keeps notes without a URL", () => {
    const sample = createAster();
    expect(validateWorkspace(sample).success).toBe(true);
    expect(sample.evidence[0].sourceUrl).toBe("");
  });
  it("round-trips the thesis, linked evidence, saved scenario and overrides", () => {
    const sample = createAster();
    const drivers = getDrivers(sample.assumptions);
    const overrides = { growthRate: 0.06, operatingMargin: 0.17 };
    sample.currentOverrides = overrides;
    sample.scenarios.push({
      id: crypto.randomUUID(),
      thesisId: sample.thesis.id,
      name: "Downside",
      base: { ...drivers },
      overrides: { ...overrides },
      result: calculateScenario(drivers, overrides),
      savedAt: new Date().toISOString(),
    });
    const imported = parseWorkspace(exportWorkspace(sample));
    expect(imported).toEqual(sample);
    sample.assumptions.find((a) => a.driverKey === "growthRate")!.value = 0.15;
    expect(sample.scenarios[0].base.growthRate).toBe(0.1);
    expect(sample.scenarios[0].result.baseProfit).toBeCloseTo(32.2102);
    expect(validateWorkspace(sample).success).toBe(true);
  });
  it("keeps evidence linked when a company label changes", () => {
    const sample = createAster();
    sample.thesis.companyName = "Renamed company";
    sample.isSample = false;
    expect(validateWorkspace(sample).success).toBe(true);
    expect(sample.evidence[0].isFictional).toBe(true);
    expect(
      sample.assumptions.some((a) => a.id === sample.evidence[0].assumptionId),
    ).toBe(true);
  });
  it.each(["{oops", '{"schemaVersion":2}', "null", "[]"])(
    "rejects malformed or unsupported workspace %s",
    (input) => {
      expect(() => parseWorkspace(input)).toThrow();
    },
  );
  it("rejects dangling evidence references", () => {
    const sample = createAster();
    sample.evidence[0].assumptionId = "missing";
    expect(validateWorkspace(sample).success).toBe(false);
  });
  it("rejects duplicate IDs across record types", () => {
    const sample = createAster();
    sample.evidence[0].id = sample.thesis.id;
    expect(validateWorkspace(sample).success).toBe(false);
  });
  it("rejects duplicated driver types", () => {
    const sample = createAster();
    sample.assumptions[0].driverKey = "years";
    sample.assumptions[0].unit = "years";
    expect(validateWorkspace(sample).success).toBe(false);
  });
  it.each(["2026-02-30", "2026-13-01", "2026-2-01"])(
    "rejects invalid calendar date %s",
    (observedOn) => {
      const sample = createAster();
      sample.evidence[0].observedOn = observedOn;
      expect(validateWorkspace(sample).success).toBe(false);
    },
  );
  it("accepts a leap-day observation", () => {
    const sample = createAster();
    sample.evidence[0].observedOn = "2024-02-29";
    expect(validateWorkspace(sample).success).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,hi", "file:///private"])(
    "rejects executable/non-web source URL %s",
    (sourceUrl) => {
      const sample = createAster();
      sample.evidence[0].sourceUrl = sourceUrl;
      expect(validateWorkspace(sample).success).toBe(false);
    },
  );
  it("rejects a tampered scenario result", () => {
    const sample = createAster();
    const drivers = getDrivers(sample.assumptions);
    sample.scenarios.push({
      id: crypto.randomUUID(),
      thesisId: sample.thesis.id,
      name: "Wrong",
      base: drivers,
      overrides: {},
      result: { ...calculateScenario(drivers), scenarioProfit: 999 },
      savedAt: new Date().toISOString(),
    });
    expect(validateWorkspace(sample).success).toBe(false);
  });
  it("rejects unexpected properties and oversize imports", () => {
    expect(validateWorkspace({ ...createAster(), unsafe: true }).success).toBe(
      false,
    );
    expect(() => parseWorkspace(" ".repeat(5_000_001))).toThrow("too large");
  });
});

describe("storage preserves valid work", () => {
  it("saves and restores the same valid record", () => {
    const storage = memoryStore(),
      sample = createAster();
    expect(saveWorkspace(sample, storage).success).toBe(true);
    expect(loadWorkspace(storage)).toEqual({
      state: sample,
      error: null,
      recovery: false,
    });
  });
  it("does not overwrite a valid record with invalid state", () => {
    const storage = memoryStore(),
      sample = createAster();
    saveWorkspace(sample, storage);
    const before = storage.getItem(STORAGE_KEY);
    sample.assumptions[0].value = -1;
    expect(saveWorkspace(sample, storage).success).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe(before);
  });
  it("preserves corrupt saved JSON and enters recovery mode", () => {
    const storage = memoryStore();
    storage.setItem(STORAGE_KEY, "{broken");
    expect(loadWorkspace(storage).recovery).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBe("{broken");
  });
  it("handles unavailable/quota-limited storage without mutating current state", () => {
    const sample = createAster(),
      before = structuredClone(sample);
    const unavailable: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(saveWorkspace(sample, unavailable).success).toBe(false);
    expect(loadWorkspace(unavailable).recovery).toBe(true);
    expect(sample).toEqual(before);
  });
  it("distinguishes a new visitor from a corrupt record", () => {
    expect(loadWorkspace(memoryStore())).toEqual({
      state: null,
      error: null,
      recovery: false,
    });
  });
});
