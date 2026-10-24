---
doc: checklist
status: draft
execution: delegated
---

# Build Checklist

Build mode: fast; autonomous implementation explicitly requested. Human reviews are not marked complete on the user's behalf.

Checked slices below mean implemented and mechanically verified by the agent. They do not assert completed learner checks. Implementation commits: `fb14a7d` and `c8afeca`.

## Slices

- [x] **1. Inspect the thesis and compare two valid profit scenarios**
      Becomes usable: A running Aster workspace with baseline, scenario inputs and projected profit.
      Why now: Proves the distinctive financial loop before ancillary interactions.
      PRD ref: `prd.md > The Core Journey`, `Scenario and Export`
      Spec ref: `spec.md > Scenario Projection`, `Data Model`
      Build: Scaffold fresh app, implement domain validation/calculations/sample and responsive comparison UI.
      Verify (mechanical): Fixture/boundary tests, typecheck and production build; exercise controls in browser.
      Learner check: Change growth to 6% and margin to 17%; inspect £22.75m against £32.21m.
      Commit: `Build transparent operating-profit workspace`

- [x] **2. Attach evidence and preserve a thesis across sessions**
      Becomes usable: Thesis, baseline and evidence editors; dated reviews; valid local persistence; independent snapshots.
      Why now: Connects a belief to observable evidence and a durable decision record.
      PRD ref: `prd.md > Thesis`, `Assumptions`, `Evidence`
      Spec ref: `spec.md > Workspace and Thesis`, `Assumptions and Evidence`
      Build: Focused accessible editors, ID links, 300ms autosave and immutable scenario save.
      Verify (mechanical): Browser add/edit/filter/refresh, snapshot/base independence and storage-failure tests.
      Learner check: Attach a contrary analyst note to margin and reload.
      Commit: `Connect evidence and persist research decisions`

- [x] **3. Transfer, recover and demonstrate the final workspace**
      Becomes usable: Validated JSON transfer, confirmed reset/import, corruption recovery and reviewer docs.
      Why now: Protects user work and makes the complete demo reproducible.
      PRD ref: `prd.md > States and Boundaries`, `Acceptance Criteria`
      Spec ref: `spec.md > Important Failure Modes`, `Where It Runs and How Someone Tries It`
      Build: Validated import/export, recovery states, app map and technical docs.
      Verify (mechanical): Invalid-import and round-trip tests, browser journeys, responsive screenshots, clean install/build.
      Learner check: Export and import the workspace; try a malformed file and inspect preservation.
      Commit: `Finish portable workspace and reviewer demonstration`

## Hands-on Checkpoints

- [ ] Human exploration not yet performed; user requested uninterrupted implementation.

## Final Review

- [ ] Human final review pending; agent verification recorded separately in docs/acceptance.md.

## Code Tour and App Map

- [x] App map generated, browser-loaded and verified against finished code; references are factual. Opening in the code panel was queued.
- [ ] Personal learning reflection not supplied; no learning activity claimed.

## Revisions

- User explicitly delegated decisions and requested no further questions. Planning/review gates are not treated as performed interviews or human approval; implementation proceeds under that direct instruction.
- The first code commit integrated the small local workflow more broadly than the planned first slice. The following checkpoint added the acceptance suite, provenance labels, font notices, technical documentation and browser evidence. Actual commit names/history take precedence over the initial planned messages.
- User supplied the ElevenLabs design reference. Applied its warm monochrome tokens, display/body typography, pill controls and panel geometry; updated the plans and app map. Existing tests/build and responsive browser checks passed; no domain or storage contract changed.
