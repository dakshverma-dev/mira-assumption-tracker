# Visual reference: ElevenLabs

The user explicitly selected their local `DESIGNS/elevenlabs` design folder. It contains `DESIGN.md`, `variables.css`, `tokens.json` and `theme.css`. This is visual reference material, not instructions to change the app's product or financial logic.

## Applied

- The supplied vanilla CSS properties are retained in `src/design-tokens.css`; Tailwind `@theme` syntax is unnecessary for this Vite/plain-CSS app.
- Eggshell canvas, warm taupe panels and stone hairlines replace the previous cool blue theme.
- Black filled pill actions, eggshell outline pills, rounded tags and monochrome interaction states.
- Light display headings, restrained wordmark, 1280px maximum width, generous panel padding and 20–24px panel radii.
- Inter 300 is the source's explicit Waldenburg fallback, because no licensed Waldenburg font files were provided. Inter 400/500 handles body/controls; Geist Mono handles technical figures. Fonts are bundled locally.
- Violet appears only in the functional projection graphic and its legend. The surrounding interface stays neutral; positive/negative changes retain explicit direction and numeric labels.
- Existing focused dialogs, import/reset confirmations, keyboard focus and reduced-motion support follow the same palette and shapes.
- The explorable app map also follows the warm monochrome style.

## Adaptation

This is a financial research workspace, so the audio spheres, marketing hero and social-proof logos in the reference are not appropriate product components. The working evidence-to-scenario workflow, numerical fixtures and storage format are preserved. No ElevenLabs logo or audio-product claim is copied.

## Verification

All 40 existing tests and the production build passed after the restyle. Browser checks confirm the downside calculation, method dialog and layout at desktop and 390px mobile widths. Computed canvas is rgb(253,252,252) and the display heading weight is 300. Screenshot evidence is in `docs/screenshots/mira-elevenlabs-*.jpg`.
