# Mira Assumption Tracker

A local research workspace for an investor's thesis, its financial assumptions, linked evidence and a transparent operating-profit scenario. Aster Products and every seeded observation are fictional.

## Try the core loop

1. Open the app. First visit loads Aster Products.
2. Select **Margin** and read its rationale and contrary analyst note.
3. Add evidence: source title, date, observation, classification and your explanation. The URL is optional; entries without one are labelled analyst notes.
4. Click **Try downside example**, or enter growth **6%** and margin **17%**.
5. Compare **£22.75m** with the **£32.21m** base case: **−29.37%** and **−£9.46m**. The original assumptions remain unchanged.
6. **Save scenario**, refresh, then **Export JSON**. Importing the file validates it and asks before replacement.

## Run locally

Verified with **Node 22.19.0**, **npm 11.14.0**, Windows/PowerShell. Node 22.12+ within the 22.x line is required. No API keys, account or database are needed.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the localhost URL Vite prints (normally `http://127.0.0.1:5173`).

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

The production build is in `dist/`. All dependencies are pinned in `package-lock.json`. Main versions: React 19.3.1, TypeScript 7.0.2, Vite 8.3.5, Zod 4.6.7 and Vitest 5.0.5.

## What works

- Edit the thesis and four original assumptions, preserving a separate scenario.
- Filter evidence by stable assumption ID; add and edit records, including sources and your own interpretation.
- Record an assumption's rationale, review condition and optional review date.
- Compare base/scenario profit with accessible chart labels and a visible formula.
- Save independent historical snapshots, including their original inputs.
- Autosave validated work after 300ms, with save/error status and a page-leave flush.
- Export and import validated JSON; reject future versions, dangling references and mismatched saved results.
- Preserve unreadable saved data in recovery mode instead of silently replacing it.
- Use the same workflow on mobile or with the keyboard.

## Calculation

`revenueNow × (1 + growthRate)^years × operatingMargin`

Revenue and profit are GBP millions; stored rates are decimals. Display rounds to two decimals. Zero base profit yields an absolute change and an unavailable percentage, not division by zero. The chart applies each case's margin throughout its own horizon.

## Project map

| Path | Responsibility |
| --- | --- |
| `src/domain/calculate.ts` | Pure arithmetic and numerical bounds |
| `src/domain/schema.ts` | Strict schema, IDs, dates and semantic validation |
| `src/demo/aster.ts` | Clearly fictional Aster fixture |
| `src/App.tsx` | Local workspace, scenario controls and transfer |
| `src/components/Editors.tsx` | Thesis, baseline and evidence dialogs |
| `src/components/Projection.tsx` | Accessible profit projection |
| `src/lib/storage.ts` | Guarded local persistence and recovery |
| `src/lib/importExport.ts` | Validated JSON boundary |
| `tests/domain.test.ts` | 40 arithmetic, schema and persistence checks |

## Planning and evidence

The official [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics) was installed in this fresh project. Planning follows its scope/PRD/spec/checklist structure. The user explicitly delegated decisions and requested implementation without further interviews. The documents disclose that deviation and remain marked **draft**, not falsely labelled individually reviewed or approved.

- [Scope](devpost/scope.md)
- [Product requirements](devpost/prd.md)
- [Technical specification](devpost/spec.md)
- [Build checklist](devpost/checklist.md)
- [Interactive code map](devpost/app-map.html)
- [Actual verification](docs/acceptance.md)
- [Reproduction and demo mechanics](docs/demo.md)
- [Build provenance](docs/build-log.md)
- [Submission record](docs/submission-record.md)

The personal learner profile, credentials and installed skill directories are excluded from version control and deployments. This does not make chat content private from an AI provider.

## Limits and data handling

This is one local workspace per browser origin. There is no sync, collaboration, account recovery, market-data feed or automatic evidence verdict. Clearing browser data loses local work; export a backup. Storage availability depends on the browser. Concurrent tabs are not a collaborative editing system.

Review dates are reminders only. No investment advice, valuation or return calculation is provided. A source URL does not verify a claim. Saved scenarios are historical snapshots, not forecasts validated against market data.

## Licence

Fresh application code: [MIT](LICENSE). Dependency/font notices: [Third-party notices](docs/third-party-notices.md). No previous application code was incorporated.
