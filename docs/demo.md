# Reproduce the working demo

Start using the README commands. A new browser origin loads the fictional sample automatically. **Load Aster example** asks before replacing existing work. Export first if needed.

## Product actions to record

This is a factual recording checklist, not supplied narration or submission copy.

1. Show the fictional Aster thesis and select Margin. Inspect its original 20%, rationale and review condition.
2. Add a clearly fictional analyst note with a source title, observation date, excerpt, classification and explanation. A URL is optional.
3. Enter scenario growth 6% and margin 17%, or use Try downside example. Show £22.75m versus £32.21m, −29.37% and −£9.46m. Point to the unchanged baseline.
4. Save a scenario. Show its historical inputs, refresh, then export JSON.
5. Import the export and show the confirmation. Optionally reject `tests/fixtures/invalid-workspace.json` to demonstrate preservation.
6. Show the substantive planning files and their honest draft/delegated status.

The live Devpost page requires a **1–3 minute** working demonstration video. A working deployment does not replace that requirement. A video has not been recorded or uploaded by this build step.

## Expected fixture

Revenue £100m; horizon 5 years; original growth 10%, margin 20%; downside growth 6%, margin 17%.

- Exact base profit: 32.2102 million GBP.
- Exact downside profit: 22.7498348192 million GBP.
- Exact absolute change: −9.4603651808 million GBP.

The chart applies the selected margin throughout each projected horizon. It does not model an individual-year margin path.

## Transfer and recovery

The storage key is `mira-assumption-tracker:v1`. The valid current overrides are persisted; unfinished invalid numeric drafts are not. A corrupt record is preserved and autosave paused until explicit import/reset. Import writes a validated replacement only when storage succeeds. A downloaded backup is not uploaded to a server; parsing runs inside the app.
