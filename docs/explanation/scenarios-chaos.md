# Chaos by Scenario — Which Move Beats It (Internal)

One short note per try. Names in brackets are the exact step names from the workflows.

## CHAOS-000 — Baseline (fault: none)

- Steps used: Navigate to portal + three type-ins + Click submit button + Read status banner + Read record count + Verify success banner + Capture scenario evidence.
- Why: normal day, no trick. These steps just do the plain office work and prove one person was added with a happy message. Result wanted: SUCCESS / PASS.

## CHAOS-001 — Unexpected popup (fault: popup)

- Key steps: Check and close chaos popup (look for the message box) + Close popup (press DISMISS NOTICE).
- Why: the box covers the form, so the helper first checks "is it there?" and clears it before typing. Without this the clicks would hit the wrong place. Result wanted: RECOVERED_SUCCESS / PASS.

## CHAOS-002 — Slow submit (fault: slow_submit)

- Key steps: Click submit button (long 30-second patience) + Wait for submit response (1.5s) + Wait for slow submit response / Wait for portal commit (extra 3.5s only for this fault).
- Why: the site takes ~2.4 seconds to save, so the helper waits extra before reading the answer instead of reading too early and thinking it failed. Result wanted: RECOVERED_SUCCESS / PASS.

## CHAOS-003 — Button text drift (fault: rename_button)

- Key step: Click submit button aimed at the stable button ID (`submitBtn`), not the visible words.
- Why: the button looks different (REGISTER instead of CREATE) but is the same button underneath, so aiming at the hidden fixed name still hits it. This proves word-changes don't break us. Result wanted: RECOVERED_SUCCESS / PASS.

## CHAOS-004 — Submit button missing (fault: missing_button)

- Key steps: Check submit button availability + Record missing submit (write "Submit button missing") on the missing path.
- Why: instead of crashing when the button is gone, the helper looks first, skips the press, and notes why. The marking step then sees "no happy message + list still 0 + we know why" and gives a good SAFE_FAIL. Result wanted: SAFE_FAIL / PASS.

## CHAOS-005 — Post-commit response failure (fault: post_commit_error)

- Key steps: Read status banner + Read record count + Verify success banner, then the marking steps Classify successful transaction / Classify safe failure in RunScenario.
- Why: the site secretly saves (list = 1) but shows an error with no happy message. The reads catch this mismatch — list grew but screen looks failed — so the helper refuses to call it safe and marks UNSAFE_FAIL. Blindly trying again would add the person twice, so finding this danger is the win. Result wanted: UNSAFE_FAIL / FAIL (the one deliberate red mark).

All tries also use Build target URL (`?fault=...&reset=1`) to clear the list first, and Isolate scenario execution (safety box) so one try's crash never stops the rest.
