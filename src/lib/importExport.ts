import { validateWorkspace } from "../domain/schema";
import type { Workspace } from "../domain/types";
export function parseWorkspace(text: string): Workspace {
  if (text.length > 5_000_000)
    throw new Error(
      "This file is too large. Choose a Mira JSON export smaller than 5 MB.",
    );
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This is not valid JSON. Choose a Mira workspace export.");
  }
  if (
    value &&
    typeof value === "object" &&
    "schemaVersion" in value &&
    value.schemaVersion !== 1
  ) {
    throw new Error(
      "This export uses an unsupported format version. Choose a Mira version 1 workspace.",
    );
  }
  const parsed = validateWorkspace(value);
  if (!parsed.success) throw new Error(parsed.errors.slice(0, 4).join(" "));
  return parsed.data;
}
export function exportWorkspace(state: Workspace): string {
  const parsed = validateWorkspace(state);
  if (!parsed.success) throw new Error(parsed.errors.join(" "));
  return JSON.stringify(parsed.data, null, 2);
}
