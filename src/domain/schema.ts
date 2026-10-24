import { z } from "zod";
import { calculateScenario, validateDrivers } from "./calculate";
import {
  DRIVER_KEYS,
  DRIVER_META,
  KINDS,
  getDrivers,
  type Workspace,
} from "./types";

const id = z.string().min(1).max(200);
const text = z.string().trim().min(1).max(4000);
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const parsed = new Date(`${v}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v
    );
  }, "Enter a real calendar date.");
const drivers = z
  .object({
    revenueNow: z.number().finite().positive(),
    years: z.number().int().min(1).max(10),
    growthRate: z.number().finite().gt(-1).max(1),
    operatingMargin: z.number().finite().min(0).max(1),
  })
  .strict();
const overrides = drivers.partial();
const result = z
  .object({
    baseProfit: z.number().finite(),
    scenarioProfit: z.number().finite(),
    absoluteChange: z.number().finite(),
    percentageChange: z.number().finite().nullable(),
  })
  .strict();
export const evidenceSchema = z
  .object({
    id,
    assumptionId: id,
    sourceTitle: text.max(200),
    sourceUrl: z
      .string()
      .max(2000)
      .refine((v) => {
        if (!v) return true;
        try {
          return ["https:", "http:"].includes(new URL(v).protocol);
        } catch {
          return false;
        }
      }, "Use an http:// or https:// source URL, or leave it blank for a note."),
    observedOn: dateOnly,
    excerpt: text,
    kind: z.enum(KINDS),
    explanation: text,
  })
  .strict();
const workspaceSchema = z
  .object({
    schemaVersion: z.literal(1),
    isSample: z.boolean(),
    thesis: z
      .object({
        id,
        companyName: text.max(100),
        text: text.max(2000),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      })
      .strict(),
    assumptions: z
      .array(
        z
          .object({
            id,
            thesisId: id,
            driverKey: z.enum(DRIVER_KEYS),
            value: z.number().finite(),
            unit: z.string(),
            rationale: text,
            reviewCondition: z.string().max(4000),
            reviewOn: dateOnly.optional(),
          })
          .strict(),
      )
      .length(4),
    evidence: z.array(evidenceSchema).max(1000),
    scenarios: z
      .array(
        z
          .object({
            id,
            thesisId: id,
            name: text.max(100),
            base: drivers,
            overrides,
            result,
            savedAt: z.string().datetime(),
          })
          .strict(),
      )
      .max(1000),
    currentOverrides: overrides.default({}),
  })
  .strict()
  .superRefine((state, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    const keys = state.assumptions.map((a) => a.driverKey);
    if (new Set(keys).size !== 4)
      issue("Provide exactly one assumption for each of the four drivers.");
    const ids = [
      state.thesis.id,
      ...state.assumptions.map((a) => a.id),
      ...state.evidence.map((e) => e.id),
      ...state.scenarios.map((s) => s.id),
    ];
    if (new Set(ids).size !== ids.length)
      issue("Every record must have a unique ID.");
    const assumptionIds = new Set(state.assumptions.map((a) => a.id));
    for (const a of state.assumptions) {
      if (a.thesisId !== state.thesis.id)
        issue("An assumption links to a missing thesis.");
      if (a.unit !== DRIVER_META[a.driverKey].unit)
        issue(`Incorrect unit for ${a.driverKey}.`);
    }
    for (const e of state.evidence)
      if (!assumptionIds.has(e.assumptionId))
        issue("Evidence links to a missing assumption.");
    try {
      validateDrivers(getDrivers(state.assumptions));
      calculateScenario(getDrivers(state.assumptions), state.currentOverrides);
    } catch (e) {
      issue(e instanceof Error ? e.message : "Invalid assumptions.");
    }
    for (const s of state.scenarios) {
      if (s.thesisId !== state.thesis.id)
        issue("A scenario links to a missing thesis.");
      try {
        const expected = calculateScenario(s.base, s.overrides);
        for (const key of [
          "baseProfit",
          "scenarioProfit",
          "absoluteChange",
          "percentageChange",
        ] as const) {
          const a = expected[key],
            b = s.result[key];
          if (
            a === null || b === null
              ? a !== b
              : Math.abs(a - b) > Math.max(1, Math.abs(a)) * 1e-9
          )
            issue("A saved scenario result does not match its inputs.");
        }
      } catch {
        issue("A saved scenario contains invalid numeric inputs.");
      }
    }
  });

export function validateWorkspace(
  input: unknown,
): { success: true; data: Workspace } | { success: false; errors: string[] } {
  const parsed = workspaceSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      errors: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "Workspace"}: ${i.message}`,
      ),
    };
  return { success: true, data: parsed.data };
}
