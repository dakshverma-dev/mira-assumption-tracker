---
doc: spec
status: draft
execution: delegated
---

# Mira — Technical Spec

## How This Works, In Plain Language

React renders a single local workspace. Pure functions validate and calculate the financial scenarios. Only valid workspace data reaches browser storage. JSON export is the portable backup. There is no server, model call or credential to configure.

## The Core Journey Through the System

`createAster` → validated Workspace → assumption selection by ID → evidence form → validated update → 300ms storage write. Separate numeric scenario drafts feed `calculateScenario`; invalid inputs suppress results. Saving adds an immutable snapshot. Import parses and validates before confirmation and an atomic storage replacement.

## Stack

- React and TypeScript: component UI and typed domain records. https://react.dev/
- Vite: static development and production build. https://vite.dev/
- Zod: strict data and reference validation. https://zod.dev/
- Vitest: meaningful domain/storage regression tests. https://vitest.dev/
- Plain CSS, lucide-react icons and locally bundled open-source fonts. Dependency versions pinned by npm and package-lock; exact versions recorded after installation.

## Where It Runs and How Someone Tries It

Node v22.19.0, npm 11.14.0. `npm ci`, `npm run dev -- --host 127.0.0.1`, open the displayed localhost URL. `npm test`, `npm run build`, `npm run preview`. Static output `dist`. Optional Vercel hosting; a deployment does not replace the required demo video/public source repository.

## Look and Feel

User-supplied ElevenLabs reference now governs the visuals. `src/design-tokens.css` preserves its CSS properties: eggshell #fdfcfc, taupe #f5f3f1, stone #ebe8e4, ink #000000, graphite #44403b, smoke #777169 and ash #a59f97. Violet #0447ff is used only inside the projection SVG and its line legend. Buttons and all interface controls remain monochrome. Inter 300 is the documented substitute for unavailable Waldenburg; body and controls use Inter 400/500, with Geist Mono 400 for technical figures. Locally bundled font packages replace the earlier fonts. 1280px maximum width, 32px desktop column gap, 20–24px feature-panel radii and fully rounded buttons/tags. Mobile stacks at 940px; narrower screens use two-by-two assumption selectors. Dash/solid chart differentiation, directional labels, reduced motion and keyboard focus remain.

## Components

### Workspace and Thesis

`src/App.tsx` owns the valid workspace and local drafts; focused dialogs handle edits. Implements `prd.md > Thesis` and persistence states.

### Assumptions and Evidence

Stable ID-based selection filters evidence. Atomic form save uses `validateWorkspace`. Implements `prd.md > Assumptions` and `Evidence`.

### Scenario Projection

`src/components/Projection.tsx` renders an accessible SVG of yearly operating profit; a table-like legend exposes final values. Calculation is pure and independent of UI. Implements `prd.md > Scenario and Export`.

## Data Model

`Workspace`: schemaVersion 1, sample flag, thesis, four distinct typed assumptions, evidence[], scenarios[]. All IDs unique; references point to existing records. Rates are decimal fractions. Dates are real YYYY-MM-DD calendar dates; timestamps UTC ISO strings. Assumptions optionally carry reviewOn. Saved scenarios contain their own base snapshot and validated recomputable result; editing current baseline cannot rewrite history. Stored under `mira-assumption-tracker:v1`.

## File Structure

```
src/
  App.tsx                    # workspace, editors and interactions
  main.tsx                   # entry and local fonts
  styles.css                 # responsive visual system
  domain/types.ts            # exported domain contracts
  domain/schema.ts           # structural/semantic validation
  domain/calculate.ts        # pure scenario arithmetic
  demo/aster.ts              # labelled fictional fixture
  lib/storage.ts             # guarded local load/save
  lib/importExport.ts        # validated transfer
  components/Projection.tsx  # accessible profit chart
tests/                       # numeric, import and storage checks
devpost/                     # substantive planning and app map
docs/                        # factual build/demo/acceptance records
```

## External Services and Dependencies

No runtime API. Fonts and icons bundled locally. npm used for dependency installation only. A public repository/static deployment may be created for this fresh project under the user's direction to complete the entry. No paid service required.

## Important Failure Modes

- Storage unavailable → visible error, keep in-memory data and allow export.
- Corrupt saved JSON → preserve it, disable automatic overwrite, offer explicit reset/import.
- Invalid import → list useful errors and preserve current workspace; storage failure cancels replacement.
- Bad number/overflow → reject with an explanation; no misleading output.

## What Was Simplified and Why

One local workspace and deterministic calculations keep the evidence-to-assumption loop reproducible. Classifications and review decisions remain human judgments. Optional reminders do not contact market services.

## Decisions and Open Issues

Implementation choices derive from the supplied brief and explicit delegation. No learner uncertainty was supplied and none is invented. Planning documents remain draft because individual review has not occurred; the user explicitly directed execution without further questions. This deviation from the skill's interview/review workflow is disclosed in the build log rather than represented as a completed curriculum interview.
