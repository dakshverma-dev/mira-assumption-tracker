import { validateWorkspace } from "../domain/schema";
import type { Workspace } from "../domain/types";
export const STORAGE_KEY = "mira-assumption-tracker:v1";
export type StorageLike = Pick<Storage, "getItem" | "setItem">;
export type SaveResult = { success: true } | { success: false; error: string };
export function saveWorkspace(
  state: Workspace,
  storage?: StorageLike,
): SaveResult {
  const validated = validateWorkspace(state);
  if (!validated.success)
    return { success: false, error: validated.errors.join(" ") };
  try {
    (storage ?? window.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(validated.data),
    );
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Could not save on this device. Your work is still here; export JSON to keep a copy.",
    };
  }
}
export function loadWorkspace(storage?: StorageLike): {
  state: Workspace | null;
  error: string | null;
  recovery: boolean;
} {
  try {
    const raw = (storage ?? window.localStorage).getItem(STORAGE_KEY);
    if (raw === null) return { state: null, error: null, recovery: false };
    const parsed = validateWorkspace(JSON.parse(raw));
    if (!parsed.success)
      return {
        state: null,
        error:
          "The saved workspace could not be read. It has been preserved. Import a backup or explicitly load the Aster example to replace it.",
        recovery: true,
      };
    return { state: parsed.data, error: null, recovery: false };
  } catch {
    return {
      state: null,
      error:
        "Could not read saved data. Any existing record is preserved. Export your work or import a valid backup.",
      recovery: true,
    };
  }
}
