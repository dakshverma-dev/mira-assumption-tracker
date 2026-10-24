---
doc: prd
status: draft
execution: delegated
---

# Mira — Product Requirements

Source: `scope.md > The Core Loop` and the supplied Mira brief. Implementation choices below are agent-selected under explicit user delegation, not attributed interview answers.

## The Core Journey

1. Arrive at a labelled fictional Aster Products workspace with its thesis and baseline drivers.
2. Select operating margin and inspect its rationale, review condition and linked contrary evidence.
3. Add or edit evidence, including a source title, optional HTTP(S) URL, real observation date, note, classification and explanation.
4. Edit scenario growth and margin, seeing the original values and the changing projected operating profit together. A chart traces both cases across the horizon.
5. Save an immutable scenario snapshot; refresh, export JSON and import it back without losing links.

## Screens and Layout

One route `/`, maximum 1040px content width. Header: Mira identity, local save status, import/export actions. Thesis across the top. Desktop two-column body: assumptions and linked evidence on the left; scenario and saved snapshots on the right. Mobile stacks the columns. A labelled thesis editor and an evidence dialog provide focused editing. All controls have accessible names and visible focus.

## Look and Feel

White background, dark navy text, restrained royal blue primary actions, subtle cool gray rules. DM Sans headings, Manrope body and DM Mono financial labels, served locally from font packages. Signature: a live base/scenario projection chart that follows the actual calculation. No fabricated statistics, gradients or decorative dashboard widgets.

## Features and Behavior

### Thesis

Company name: 1–100 characters; thesis: 1–2000 characters. Explicit save updates `updatedAt`. First visit loads Aster automatically. Reloading Aster requires confirmation. A custom thesis is labelled a personal workspace rather than falsely labelled fictional.

### Assumptions

Four drivers: revenue now in GBP millions (>0), horizon integer 1–10, growth (-100%,100%], margin [0%,100%]. Selectors filter evidence by stable assumption ID. An edit form saves valid baseline numbers atomically and keeps scenario overrides separate. Every driver has a rationale and review condition; optional review date is a reminder, not monitoring.

### Evidence

Kinds: supports, contradicts, mixed, insufficient. Source title, observation date, note and analyst explanation are required; source URL is optional. A record without a URL is visibly an analyst note, not a verified fact. Existing entries can be edited without losing their assumption link. Empty evidence offers an add action.

### Scenario and Export

Growth and margin controls update immediately and preserve the baseline. Display base profit, scenario profit, absolute and relative changes. At zero base profit show percentage change unavailable. Invalid or empty numeric fields suppress misleading chart/results and explain the error. Reset removes overrides. Saving stores an independent timestamped snapshot of baseline, overrides and result. Saved scenarios remain historical when baseline changes. Export includes the whole validated workspace. Import validates schema version, numerical bounds, unique IDs, linked IDs, dates and calculated results, then asks before replacement. Cancel and rejection preserve existing state.

## States and Boundaries

- Autosave after 300ms: Saving, Saved on this device, or Could not save. Invalid forms never replace valid stored records.
- Corrupt stored JSON remains preserved and displays a recovery action; it is not silently overwritten by sample data.
- Storage denial/quota leaves current work usable and exportable.
- Different visitors have independent browser storage. No user data is sent to a server.
- Fictional data remains clearly labelled; imported workspaces retain their sample flag.

## Acceptance Criteria

- Numeric fixtures: 32.2102 and 22.7498348192; delta -9.4603651808, approximately -29.370712%.
- Scenario changes do not mutate baseline; percentage-point change is described correctly.
- Blank, non-finite and out-of-range numbers show usable errors, never NaN/Infinity.
- Evidence survives edits and remains attached by ID; notes need no source URL.
- Save/refresh/export/import preserve valid linked records and independent scenario snapshots.
- Malformed JSON, future schema versions, dangling links and invalid dates/results are rejected without replacement.
- Keyboard operation, mobile layout and production build work.

## What We're Building

Only the four sections above, local persistence, sample/reset and transparent calculations. A live static demo and factual technical docs help reviewers try it.

## Deferred From the POC

Accounts, multi-company portfolios, shared links and live evidence ingestion.

## Non-Goals

No investment advice, valuation engine, return forecast, runtime AI or unverified financial claims.

## Open Questions

No technical blocker. Personal submission copy, survey answers and actual learner review remain human activities; no completed interview or learning claim will be fabricated.
