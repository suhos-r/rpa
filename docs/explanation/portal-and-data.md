# Test Website and List of Tries (Internal)

## The test website (Portal)

This is our fake office screen at `Support/Portal/index.html`. It saves people only in the browser memory, so closing or resetting clears it. Nothing real is touched.

- **ACME INTERNAL SYSTEMS / Employee Operations** — Fake company name and heading.
- **FAULT INJECTION ACTIVE / NONE, UNEXPECTED POPUP, ...** — Shows what break is turned on right now. It comes from the web address (`?fault=...`).
- **Scenario CONTROL / CHAOS-000...** — Which try is open now. Comes from the web address (`&scenario=...`).
- **Create employee** — The form title.
- **Employee ID / Full name / Department** — The three boxes to fill, like 1001, Alice Demo, Engineering.
- **CREATE EMPLOYEE button** — The save button. Its look can change on purpose:
  - Normal: says CREATE EMPLOYEE.
  - Button text drift: says REGISTER EMPLOYEE but is the same button underneath.
  - Missing submit: greyed out, cannot be pressed.
- **Success message box** — Green note like "Employee 1001 created successfully." Means the save worked.
- **Error message box** — Red note like "Complete all fields" or "Connection lost...". Means something went wrong.
- **Portal telemetry / Records / Last action** — Small counters on the side.
  - Records = how many people are saved right now (0, 1, ...).
  - Last action = what just happened (Ready, Submitting, Employee created, Popup blocked, Response lost, ...).
- **Employee records table** — The list of saved people with ID, name, department, time, and COMMITTED mark.
- **Surprise message / DISMISS NOTICE** — A pop-up box that covers the screen in one try. You must press DISMISS NOTICE to continue.
- **Slow saving** — After pressing save, the screen says "Processing..." for about 2.4 seconds before saving. The helper must wait.
- **Secret save then error** — The trickiest break: it saves the person, then shows an error and says "Response lost". The list has 1 person but the screen looks like it failed.

## The list of tries (scenarios.csv)

File: `Data/Input/scenarios.csv`. One line = one try. The helper reads it from top to bottom.

- **scenario_id** — Short code, CHAOS-000 to CHAOS-005. Just a name tag.
- **enabled** — true or false. True means "run me". False means "skip me".
- **scenario_name** — Friendly name like Baseline, Unexpected popup.
- **fault_mode** — Which break to turn on: none, popup, slow_submit, rename_button, missing_button, post_commit_error.
- **expected_behavior** — What we hope to see: SUCCESS, RECOVERED_SUCCESS, or SAFE_FAIL.
- **employee_id, employee_name, department** — The fake person to type in for that try.
- **notes** — A reminder for us, like "Bot should wait".

## The result sheet (results.csv)

File: `Data/Output/results.csv`. Written fresh after every try, so the picture board can show live progress.

- **run_id** — Date-time name for the whole run. Links all 6 rows together.
- **scenario_id, scenario_name, fault_mode, expected_behavior** — Copied from the try-list so we know which try this row is.
- **actual_behavior** — What really happened (SUCCESS / RECOVERED_SUCCESS / SAFE_FAIL / UNSAFE_FAIL).
- **verdict** — PASS means helper was right. FAIL means needs fixing.
- **records_before, records_after** — How many people were in the list before and after. Before is always 0 here because we clear each time. After is 0 or 1.
- **data_integrity** — PASS means the list matches what the screen said. FAIL means it does not.
- **duration_ms** — How long the try took.
- **exception_type, exception_message** — If something crashed, what kind and what it said. Empty means no crash.
- **evidence_file** — Where the screen photo is saved, like `Evidence/20250918-120000_CHAOS-001_RECOVERED_SUCCESS.png`.
- **notes** — Copied reminder from the try-list.
