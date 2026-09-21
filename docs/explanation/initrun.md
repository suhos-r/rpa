# Setup Step (Internal)

File: `Workflows/InitRun.xaml`. Runs once at the very start. Gets everything ready.

- **Generate run id** — Make a name from today's date and time, like `20250918-120000`.
- **Ensure output directory** — Make the results folder if it is missing.
- **Ensure evidence directory** — Make the photo folder if it is missing.
- **Create results schema** — Make an empty table with all column headings (run name, try number, what happened, marks, times, photo path, ...).
- **Initialize results CSV** — Save that empty table as a fresh result sheet, clearing any old run.
- **Set run id output** — Hand the run name back to the boss.
- **Set results output** — Hand the empty table back to the boss.
- **Set portal URL** — Remember the test website address.
- **Set dashboard URL** — Remember the picture board address.
- **Log run start** — Write "Run started" in the diary so we know it began.
