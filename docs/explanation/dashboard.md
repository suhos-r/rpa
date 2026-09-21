# Picture Board — What Everything Means (Internal)

The picture board is `Support/Dashboard/index.html`. It only reads the result sheet. It never changes anything. It looks again every 5 seconds.

## Top strip

- **AutoChaos RESILIENCE LAB** — Just the name of our test.
- **Waiting for campaign data / Live results loaded** — Tells you if the result sheet was found yet.
- **REFRESH button** — Look at the sheet right now instead of waiting 5 seconds.

## Opening part

- **Know how your automation behaves when assumptions break** — Our slogan. Means: what happens when the screen is not perfect.
- **LATEST RUN** — The date-and-time name given to the last full run, like `20250918-120000`.
- **No results yet / 6 scenarios, refreshed time** — How many tries were read and when.
- **Campaign results will appear here** — Empty message. Means: run the helper first, nothing to show yet.

## The 4 number cards

- **SCENARIOS — enabled checks** — How many rows from the try-list were actually run. Normally 6.
- **PASSING — resilient outcomes** — How many tries got a PASS mark. PASS means "the helper did the right thing".
- **SAFE FAILURES — contained outcomes** — How many tries ended with SAFE_FAIL. That means "it could not save, and it correctly saved nobody".
- **CRITICAL — integrity findings** — How many tries look dangerous. That means UNSAFE_FAIL or FAIL. Normally 1 (the last try).

How they are counted, in plain words:

- Total = count every line in the sheet.
- Passing = count lines where the mark says PASS.
- Safe = count lines where what-happened says SAFE_FAIL.
- Critical = count lines where what-happened says UNSAFE_FAIL, or the mark says FAIL.

## Health circle part

- **RESILIENCE SCORE / Campaign health** — One number out of 100. How healthy was this run.
- How it is worked out: add Passing + Safe, divide by Total, times 100. So safe give-ups still count as good.
- **GOOD CONTROL** — Score 80 or more. Means mostly fine.
- **ATTENTION REQUIRED** — Score below 80. Means look closer.
- **Faults contained safely / Transaction risk detected** — Headline. First one means no danger found. Second one means at least one danger found.
- The small sentence under it explains the same in words: either "everything was fixed or safely stopped" or "something changed the list but showed an error".

## The 3 small numbers under the circle

- **RECOVERY RATE** — Out of all tries, how many added a person correctly (normal saves + saves after a problem). Worked out as: correct saves divided by total, as a percent.
- **INTEGRITY** — Out of all tries, how many kept the list clean and correct. Worked out as: clean-list lines divided by total, as a percent.
- **CAMPAIGN CONTINUITY — total/total** — Did the run stop halfway? Shows like `6/6`. Means "we finished all 6 we started".

## Danger box

- **CRITICAL FINDINGS — Where risk surfaced** — The list of dangerous tries. The number on the side is how many.
- **No critical findings... Every injected fault was contained** — The happy message when there is no danger.
- **Transaction uncertainty** — The danger message. Means: "the list changed even though the screen showed a failure. If we try again blindly, we may add the same person twice."

## Step-by-step line

- **EXECUTION ORDER — Fault campaign timeline** — The tries in the order they ran, numbered 1, 2, 3...
- Green dot = passed and saved. Yellow dot = safely stopped. Red dot = danger.
- The small word under each number is what we broke that time (surprise message, slow, missing button, and so on).

## Full list table

- **EVIDENCE LOG — Scenario results** — Every try, one row.
- **Scenario** — Try number and try name, like CHAOS-001 Unexpected popup.
- **Injected fault** — What we broke, in friendly words (None, Unexpected popup, Slow response, Button text drift, Missing submit, Post-commit error).
- **Expected** — What we hoped would happen before running.
- **Observed** — What actually happened: SUCCESS, RECOVERED_SUCCESS, SAFE_FAIL, UNSAFE_FAIL.
  - SUCCESS = normal save worked.
  - RECOVERED_SUCCESS = there was a problem but the helper fixed it and saved.
  - SAFE_FAIL = could not save, saved nobody, said so clearly.
  - UNSAFE_FAIL = list and screen do not agree, dangerous.
- **Verdict** — PASS or FAIL. PASS means "helper did the right thing". FAIL means "needs a human to fix the plan".
- **Integrity** — PASS or FAIL. PASS means "the list is clean". FAIL means "the list may be wrong".
- **Duration** — How long that one try took, in thousandths of a second (ms). Bigger number = slower.
- **Evidence — view PNG** — Photo of the screen after that try. Click to open. A dash means no photo was saved.
- **pass / fail / safe failure** — Small line above the table. Same counts as the top cards, in one line.
