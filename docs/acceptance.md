# Verification record

Date: **25 October 2026 (IST)**. Initial implementation commit: `fb14a7d`. Final refinements are recorded in Git history. Environment: Windows, Node 22.19.0, npm 11.14.0, Vite development server and Codex in-app browser.

## Automated checks

`npm test`: **40 passed, 0 failed**. Covers exact base/downside fixtures, zero-base percentage, zero scenario margin, negative growth, horizon/rate bounds, non-finite numbers, unknown overrides, overflow, valid and malformed exports, future versions, duplicate IDs, missing references, invalid dates, unsafe URLs, tampered saved results, historical baseline preservation, corrupt storage and unavailable/quota-limited storage.

`npm run build`: TypeScript compilation and optimized Vite production build passed. Exact dependency versions are locked. No vulnerabilities were reported during dependency installation.

## Browser observations

| Case | Actual observation |
| --- | --- |
| Fresh visitor | Aster thesis, four original assumptions and one labelled contrary analyst note loaded. |
| Downside | Growth 6%, margin 17% produced £22.75m; original 10%/20% base showed £32.21m; delta −29.37%, −£9.46m. |
| Empty scenario field | Output/chart hidden, usable error shown and Save scenario disabled. |
| Save snapshot | Historical Scenario 1 retained its own £32.21m original base. |
| Add evidence | A second fictional analyst note appeared under margin with its classification, date and explanation. |
| Refresh | Both notes, the saved snapshot and current 6%/17% overrides survived reload. |
| Zero base margin | Displayed Percentage unavailable and absolute +£22.75m; previous snapshot still retained £32.21m original base. |
| Dated review | Review date 28 Oct 2026 appeared after saving. An initial date-event issue was found and repaired before verification. |
| JSON export | Actual downloaded file parsed as version 1, Aster Products, two evidence records and one saved scenario; reviewOn retained. |
| Invalid import | Version 2 fixture rejected; existing two notes and snapshot remained visible. |
| Valid import | Preview showed company/counts before confirmation; replacement restored the exported workspace. |
| Mobile | 390×844 viewport tested; columns stacked, assumption tiles readable, document width did not exceed viewport. |

Storage corruption/quota are verified through injected storage adapters in automated tests, not claimed as browser permission changes. Human exploration and learning reflection have not been performed on the user's behalf. Planning status remains draft under explicit implementation delegation.
