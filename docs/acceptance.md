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

## Final build and publication checks

- Committed implementation `c8afeca` extracted with `git archive` into a fresh temporary directory. `npm ci`, all 40 tests and the production build passed there without relying on the development node_modules.
- Public GitHub repository verified through an unauthenticated GitHub API request: public visibility, MIT licence and default branch `codex/mira`.
- Latest Vercel preview: `dpl_691eLjCYhjHYwbowCuUcntEKYZjv`, target preview, status Ready. Loaded through its scoped share link in a fresh browser origin, without signing in.
- Deployed browser checks: edit company/thesis, preserve seeded fictional evidence labels after changing the company, cancel reset without losing changes, explicitly reset to Aster, and reproduce the downside fixture.
- Final desktop screenshot and 390px mobile screenshot captured from the latest preview. Mobile document width 376px did not exceed the measured viewport 391px.
- Local explorable app map loaded successfully and displayed its code paths and expandable steps.

## ElevenLabs design revision

The user explicitly selected their supplied ElevenLabs reference. The app now uses its eggshell/taupe/stone tokens, black pill buttons, 20–24px panels, Inter Light display substitute and Geist Mono figures. The projection is the only chromatic product graphic. The code map also follows the warm monochrome direction.

All 40 existing tests passed after the TSX/CSS/font changes; production build passed. Browser checks verified the formula dialog, working section navigation, retained downside result and saved records, computed eggshell canvas and 300 heading weight. Layout was checked at 320px, 390px, 768px and 1440px requested viewport widths without horizontal overflow in the corresponding observations. Updated screenshot evidence: `mira-elevenlabs-desktop.jpg`, `mira-elevenlabs-mobile.jpg` and `mira-elevenlabs-method.jpg`.

Design revision `78aecdc` deployed as preview `dpl_Eufb71P48CaMctTB9SAVx5Af7gjY`, status Ready. Its share link loaded without sign-in. Deployed downside fixture remains £22.75m versus £32.21m; computed canvas rgb(253,252,252), headline weight 300 and primary-button radius 9999px. No browser error logs were reported. Desktop/mobile screenshots were refreshed from this deployed revision. The local-file browser policy prevented reloading the user's open app-map tab; its source file was updated, but no claim of a browser refresh of that file is made.
