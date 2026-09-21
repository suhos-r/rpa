# AutoChaos Demo Instructions

## 1. Prerequisites

1. UiPath Studio/Robot and the UiPath Chrome extension must be installed and signed in.
2. Python 3 must be available on `PATH`.
3. The repository must be at `E:\RPA Project`.
4. Keep Chrome open with the UiPath Browser Automation extension enabled for `localhost`.
5. The project uses the Windows target framework, Visual Basic expressions, and modern UI Automation activities.

## 2. Start the demo server

Open Terminal 1 in `E:\RPA Project` and run:

```powershell
.\Support\Scripts\Start-Demo.ps1
```

This starts the static demo server on port `8080` and opens the dashboard.

URLs:

- Portal: <http://localhost:8080/Support/Portal/index.html?fault=none&reset=1>
- Dashboard: <http://localhost:8080/Support/Dashboard/index.html>

If `localhost` refuses the connection, rerun the script from the repository root and confirm that port `8080` is listening:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
```

The portal and dashboard are static files, so the server must remain running while the UiPath workflow executes.

## 3. Run the UiPath campaign

After Terminal 1 is running, use Terminal 2 in Current working directory:

```powershell
uip rpa run --file-path Main.xaml --project-dir "$PWD"
```

The workflow will:

1. Create a UTC run ID.
2. Prepare `Data\Output` and `Evidence`.
3. Read enabled rows from `Data\Input\scenarios.csv`.
4. Run each scenario in isolation.
5. Rewrite `Data\Output\results.csv` after every completed scenario.
6. Log the final dashboard URL.

For a fast rerun after the project has already been built:

```powershell
uip rpa run --file-path Main.xaml --project-dir "E:\RPA Project" --skip-build
```

## 4. Watch the dashboard in parallel

Terminal 3 is optional. Open or refresh:

```text
http://localhost:8080/Support/Dashboard/index.html
```

The dashboard polls `Data\Output\results.csv` every five seconds. Keep it open while Terminal 2 runs to see the campaign progress live.

## 5. Reset and rerun

Before a clean demonstration, use Terminal 1 or a separate terminal:

```powershell
.\Support\Scripts\Reset-Demo.ps1
```

Then rerun `Main.xaml`. The workflow also resets the portal per scenario through the URL query string, so each scenario starts with zero records.

## 6. Expected scenario results

| Order | ID | Fault | Expected result | Meaning |
|---:|---|---|---|---|
| 1 | CHAOS-000 | none | `SUCCESS / PASS` | Baseline transaction creates one record. |
| 2 | CHAOS-001 | popup | `RECOVERED_SUCCESS / PASS` | Popup is detected and dismissed. |
| 3 | CHAOS-002 | slow_submit | `RECOVERED_SUCCESS / PASS` | Extended UIA timeout allows the delayed submit. |
| 4 | CHAOS-003 | rename_button | `RECOVERED_SUCCESS / PASS` | The captured target survives the visible button-label drift. |
| 5 | CHAOS-004 | missing_button | `SAFE_FAIL / PASS` | Submit is unavailable and no record is created. |
| 6 | CHAOS-005 | post_commit_error | `UNSAFE_FAIL / FAIL` | The portal commits a record but reports an error; the result is transaction-uncertain. |

The exact output is written to:

```text
Data\Output\results.csv
```

Screenshots are written to:

```text
Evidence\<run_id>_<scenario_id>_<actual_behavior>.png
```

## 7. What the workflows do

1. `Main.xaml` orchestrates initialization, CSV loading, enabled-scenario iteration, and finalization.
2. `Workflows\InitRun.xaml` creates the run ID, result schema, output folders, and initial CSV.
3. `Workflows\RunScenario.xaml` reads one CSV row, builds the fault URL, catches scenario exceptions, classifies the outcome, appends the result row, and writes the live CSV.
4. `Workflows\ProcessEmployee.xaml` navigates the portal, closes the optional popup, fills the three fields, submits, reads status/record count, checks positive success evidence, and captures a screenshot.
5. `Workflows\FinalizeRun.xaml` writes the final CSV and logs the dashboard URL.
6. `Support\Portal` is the deterministic fault-injection target backed by browser `localStorage`.
7. `Support\Dashboard` reads only the generated CSV and renders KPIs, findings, timeline, and evidence links.

## 8. Validation and build checks

Run these from the repository root after XAML changes:

```powershell
uip rpa validate --file-path Main.xaml --project-dir "E:\RPA Project" --output json
uip rpa validate --file-path Workflows\InitRun.xaml --project-dir "E:\RPA Project" --output json
uip rpa validate --file-path Workflows\RunScenario.xaml --project-dir "E:\RPA Project" --output json
uip rpa validate --file-path Workflows\ProcessEmployee.xaml --project-dir "E:\RPA Project" --output json
uip rpa validate --file-path Workflows\FinalizeRun.xaml --project-dir "E:\RPA Project" --output json
uip rpa build "E:\RPA Project" --output json
```

If the C: drive is full, keep NuGet and temporary build files on E::

```powershell
$env:NUGET_PACKAGES = "E:\RPA Project\.cache\nuget"
$env:TEMP = "E:\RPA-BuildTemp"
$env:TMP = "E:\RPA-BuildTemp"
```

## 9. Scenario-by-scenario demo expectations

1. **CHAOS-000 — Baseline (`none`)**
   - Input: Alice Demo / Engineering.
   - Portal: normal form, normal submit, one employee record committed.
   - UiPath expectation: visible success evidence and `records_after = 1`.
   - Result: `SUCCESS / PASS`, `data_integrity = PASS`.

2. **CHAOS-001 — Unexpected popup (`popup`)**
   - Input: Bob Demo / Finance.
   - Portal: unexpected system-message popup appears.
   - UiPath expectation: detect popup, click DISMISS NOTICE, then submit one record.
   - Result: `RECOVERED_SUCCESS / PASS`, `records_after = 1`.

3. **CHAOS-002 — Slow submit (`slow_submit`)**
   - Input: Carol Demo / Operations.
   - Portal: response delayed about 2.4 seconds.
   - UiPath expectation: wait for the delayed commit before reading the result.
   - Result: `RECOVERED_SUCCESS / PASS`, `records_after = 1`.

4. **CHAOS-003 — Button text drift (`rename_button`)**
   - Input: Dan Demo / Security.
   - Portal: visible label changes from CREATE EMPLOYEE to REGISTER EMPLOYEE.
   - UiPath expectation: the stable captured target submits despite label drift.
   - Result: `RECOVERED_SUCCESS / PASS`, `records_after = 1`.

5. **CHAOS-004 — Submit button missing (`missing_button`)**
   - Input: Eve Demo / Legal.
   - Portal: the submit action is visibly unavailable and disabled.
   - UiPath expectation: the guarded submit check cannot commit a record, and the safe-failure evidence is captured.
   - Result: `SAFE_FAIL / PASS`, `records_after = 0`.

6. **CHAOS-005 — Post-commit response failure (`post_commit_error`)**
   - Input: Frank Demo / Research.
   - Portal: the record is committed, then the response is lost and an error is shown.
   - UiPath expectation: detect transaction uncertainty and do not classify it as a safe failure.
   - Result: `UNSAFE_FAIL / FAIL`, `records_after = 1`; this is the critical dashboard finding.

Expected final campaign: five passes and one deliberate resilience failure.
