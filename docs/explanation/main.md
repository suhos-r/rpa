# Main Plan — The Boss List (Internal)

File: `Main.xaml`. This is the boss. It does not touch the screen itself. It just calls the other helpers in order.

- **Resolve project root** — Remember which folder we are working in.
- **Initialize campaign** — Call the setup helper to get a run name, empty result table, and web addresses.
- **Read scenarios** — Open the try-list sheet and keep all rows in memory.
- **For each enabled scenario** — Go through the try-list one line at a time.
- **If enabled** — Check the on/off switch for that line. Only true lines continue.
- **Run isolated scenario** — Hand this one line to the one-try helper. If it fails, the loop still continues to the next line.
- **Skipped scenario** — Do nothing for off lines. Just move on.
- **Finalize campaign** — After all lines are done, call the closing helper to save the final sheet and show the picture-board link.
