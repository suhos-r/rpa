# AutoChaos — RPA Resilience Testing & Fault-Injection Framework

**Product Requirements Document (PRD) + Implementation Handoff**  
**Target:** UiPath Studio Desktop, Windows XAML project  
**Primary objective:** Build the smallest credible end-to-end system that visually demonstrates automated resilience testing of an RPA workflow under controlled failures.  
**Implementation principle:** Prefer simple, deterministic, local components over enterprise infrastructure. The demo should look polished and product-like without requiring staging, production, cloud services, Test Manager, Orchestrator, databases, or real corporate systems.

---

## 0. Agent Handoff Contract — Read This First

This document is intended to be handed directly to a coding agent that can create files, run terminal commands, and ideally use UiPath's official agent skills / CLI.

### Agent operating rules

- [ ] Build the project in the phase order defined below.
- [ ] Do **not** add scope unless a later section explicitly marks it Optional.
- [ ] Do **not** replace the XAML workflow with a Python-only or web-only demo. The system under test and test harness must remain a UiPath RPA project.
- [ ] Do **not** require manual drag-and-drop activity authoring in Studio.
- [ ] Generate the UiPath workflows as `.xaml` files in the repository.
- [ ] Use `Main.xaml` only as orchestration. Keep the actual UI automation in a child XAML workflow.
- [ ] Use a **Windows** target framework and **VisualBasic** expression language for the fastest Studio Desktop path unless the existing environment proves incompatible.
- [ ] Use UiPath CLI to scaffold the project and install packages. Do not hand-create or casually hand-edit `project.json` dependencies.
- [ ] For UI Automation selectors/targets, follow UiPath's official authoring guidance: capture targets with the supported UIA tooling; do not invent selectors manually.
- [ ] If target capture is impossible in the agent environment, generate real UI Automation activities with clearly named `TODO Indicate` targets so the user only needs to indicate the small set of portal controls in Studio. The user should still never have to drag activities manually.
- [ ] Validate every generated XAML workflow and build the project before considering a phase complete.
- [ ] The test harness must continue to later scenarios even when the workflow under test fails.
- [ ] Preserve evidence for failures: screenshot, exception details, scenario metadata, final portal record count, and verdict.
- [ ] Keep the demo deterministic. Do not use random fault selection in the default campaign.
- [ ] Prefer readable names and obvious logic over reusable abstractions that add complexity.

### Definition of the product in one paragraph

Conventional RPA testing checks whether an automation behaves correctly under expected inputs and conditions. **AutoChaos deliberately injects controlled failures into the automation's environment—such as pop-ups, UI changes, delays, missing controls, and ambiguous post-commit failures—and then measures whether the RPA recovers, fails safely, preserves data integrity, captures evidence, and allows the overall test campaign to continue.**

---

# 1. Product Summary

## 1.1 Working name

**AutoChaos**  
Subtitle: **Automated Resilience Validation & Fault Injection for Robotic Process Automation**

Alternative presentation names if desired later:

- RPA Chaos Lab
- RPA Resilience Lab
- FlowFault
- BotBreak Lab
- ChaosRPA

Use **AutoChaos** throughout implementation for consistency.

## 1.2 What the project demonstrates

AutoChaos demonstrates three things at the same time:

1. A normal UiPath automation can complete a simple business process against a browser application.
2. A separate automated test harness can intentionally modify the target application's behavior in controlled ways.
3. The harness can keep executing and produce a resilience report even when individual RPA runs break.

The project is not trying to prove that every RPA failure can be auto-healed. A correct result may be any of the following:

- the bot succeeds normally;
- the bot automatically tolerates the injected fault;
- the bot detects the problem and exits safely without corrupting data;
- the bot behaves unsafely, and AutoChaos flags the weakness as a critical finding.

## 1.3 Why a local mock application is valid

The local mock portal is intentionally a controllable dependency. A resilience test needs deterministic ways to reproduce failures. The mock portal gives the test harness exact control over conditions such as delayed responses, changed button text, missing controls, and uncertain transaction completion. The point is to test the RPA's behavior under those conditions, not to prove that a particular production application is broken.

## 1.4 Core success story for the demo

A single run should visibly show:

1. **Baseline** — normal employee creation succeeds.
2. **Unexpected popup** — the bot handles it and still completes.
3. **Slow response** — the bot waits and completes.
4. **Button text drift** — the bot still succeeds because the UI target is robust.
5. **Missing submit button** — the bot cannot continue, but the scenario is captured as a safe failure and the campaign moves on.
6. **Post-commit UI failure** — the portal commits the employee but withholds success confirmation. The bot does not know the transaction completed. AutoChaos detects an integrity/transaction uncertainty issue and flags it as the critical finding.

That final failed scenario is desirable: a resilience tool that finds no weakness looks less credible than one that demonstrates a real failure mode.

---

# 2. Goals, Non-Goals, and Scope Control

## 2.1 MVP goals

- [ ] Build one UiPath **Process** project using XAML workflows.
- [ ] Build one local static mock web portal.
- [ ] Build one deterministic CSV-driven fault campaign.
- [ ] Run all scenarios automatically from `Main.xaml`.
- [ ] Continue the campaign after per-scenario exceptions.
- [ ] Capture structured results to CSV.
- [ ] Capture screenshots/evidence for scenarios.
- [ ] Render a polished browser dashboard from the CSV result file.
- [ ] Demonstrate at least one recovered fault, one safe failure, and one unsafe/critical failure.
- [ ] Keep all source code and XAML in one repository.
- [ ] Be runnable entirely on a developer laptop.

## 2.2 Explicit non-goals for MVP

Do **not** implement these in the main build:

- Orchestrator queues
- Test Manager
- Test Cloud
- REFramework
- Action Center
- SQL/database storage
- real Active Directory / SAP / ERP integration
- real email sending
- cloud hosting
- Docker requirement
- ML/LLM analysis
- self-healing AI
- distributed workers
- authentication / user management
- API backend for the mock portal
- complex CI/CD
- production deployment
- random fault selection

These are optional future enhancements only.

## 2.3 Why a normal Process project instead of a Test Automation project

The MVP needs a visible automated test campaign, not enterprise test-management infrastructure. A normal UiPath Process is sufficient to orchestrate scenario execution and call child XAML workflows. This minimizes licensing and setup assumptions. UiPath Test Cases may be added later as an optional integration phase.

---

# 3. Conceptual Difference from Regular Testing

## 3.1 Normal functional RPA test

Example:

- Input employee ID `1001`
- Expected result: employee created
- Actual result: employee created
- Verdict: PASS

This validates expected logic.

## 3.2 AutoChaos resilience test

Example:

- Same business input
- The portal deliberately delays the submit action by several seconds
- Observe whether the bot waits, times out, retries, corrupts state, or exits safely
- Preserve evidence and continue to the next test

This validates behavior when assumptions about the surrounding environment stop being true.

## 3.3 The most important design requirement

**A broken system-under-test must never break the test campaign itself.**

Every scenario must be isolated in its own `Try/Catch`. The harness records the failure, resets the target environment, and proceeds to the next scenario.

---

# 4. MVP Architecture

## 4.1 High-level architecture

```text
+---------------------------------------------------------------+
|                         AUTOCHAOS                              |
|                                                               |
|  Data/Input/scenarios.csv                                     |
|           |                                                   |
|           v                                                   |
|  +----------------------+                                     |
|  | Main.xaml            |  Test campaign orchestrator         |
|  +----------+-----------+                                     |
|             |                                                 |
|             v                                                 |
|  +----------------------+       fault query parameter          |
|  | RunScenario.xaml     | ------------------------------+      |
|  +----------+-----------+                               |      |
|             |                                           v      |
|             v                             +-------------------+ |
|  +----------------------+                 | Local ACME Portal | |
|  | ProcessEmployee.xaml | <--- UIA -----> | HTML/CSS/JS       | |
|  +----------+-----------+                 +-------------------+ |
|             |                                                 |
|             v                                                 |
|  Evidence/*.png + Data/Output/results.csv                      |
|             |                                                 |
|             v                                                 |
|  +---------------------------------------------------------+  |
|  | Dashboard/index.html                                    |  |
|  | Reads results.csv and renders resilience visuals        |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## 4.2 Runtime flow

```text
Initialize run
   |
Read scenarios.csv
   |
For each enabled scenario
   |
   +--> Reset portal state
   |
   +--> Open portal with ?fault=<mode>
   |
   +--> Run ProcessEmployee.xaml
   |       |
   |       +--> handle popup if present
   |       +--> fill form
   |       +--> submit
   |       +--> verify visible outcome
   |
   +--> Catch any exception
   |
   +--> Read portal record count / visible state
   |
   +--> Capture screenshot
   |
   +--> Classify actual outcome
   |
   +--> Compare against expected behavior
   |
   +--> Append result row
   |
   +--> Write results.csv immediately
   |
Continue next scenario regardless of prior result
   |
Open dashboard
```

---

# 5. Technology Choices

## 5.1 Required

| Component | Choice | Reason |
|---|---|---|
| RPA | UiPath Studio Desktop | Project requirement |
| Workflow representation | XAML | Agent can generate repo files; Studio can open visually |
| Target framework | Windows | Best fit for Studio Desktop and browser UI automation |
| Expression language | VisualBasic | Default/least-friction UiPath XAML path |
| Mock target | Static HTML/CSS/JS | No backend or DB needed |
| Fault control | URL query parameters | Deterministic and trivial to automate |
| Scenario data | CSV | Human-readable and easy for UiPath |
| Results | CSV | Simple and easy for dashboard to consume |
| Evidence | PNG screenshots | Visually useful in demo |
| Dashboard | Static HTML/CSS/JS | Fancy visual output with zero backend |
| Local hosting | Python built-in `http.server` | One command, no package install |

## 5.2 UiPath activity packages

Agent must resolve package versions using UiPath CLI instead of hard-coding versions in this PRD.

Minimum expected packages:

- `UiPath.System.Activities`
- `UiPath.UIAutomation.Activities`
- CSV/productivity package required for `Read CSV` / `Write CSV` in the installed activity set

Do not install Excel desktop interop unless the chosen CSV activity package requires it. Avoid Microsoft Office as a runtime prerequisite.

## 5.3 Browser

Use Chrome or Edge. Prefer whichever already has the UiPath browser integration working on the developer machine. Do not make the project depend on an experimental browser automation mode.

---

# 6. Repository Layout — Required Final Shape

The agent should produce a repository approximately like this:

```text
AutoChaos/
|
|-- project.json
|-- Main.xaml
|-- README.md
|-- AGENTS.md                       # brief coding-agent rules/context
|
|-- Workflows/
|   |-- InitRun.xaml
|   |-- RunScenario.xaml
|   |-- ProcessEmployee.xaml
|   `-- FinalizeRun.xaml
|
|-- Data/
|   |-- Input/
|   |   |-- scenarios.csv
|   |   `-- employee.csv
|   `-- Output/
|       |-- results.csv             # generated at runtime
|       `-- .gitkeep
|
|-- Evidence/
|   `-- .gitkeep                    # runtime screenshots go here
|
|-- Support/
|   |-- Portal/
|   |   |-- index.html
|   |   |-- styles.css
|   |   `-- app.js
|   |
|   |-- Dashboard/
|   |   |-- index.html
|   |   |-- styles.css
|   |   `-- dashboard.js
|   |
|   `-- Scripts/
|       |-- Start-Demo.ps1
|       `-- Reset-Demo.ps1
|
`-- docs/
    `-- PRD_HANDOFF.md              # this document
```

### Repository rules

- `Main.xaml` is orchestration only.
- Keep `.local/`, build output, and temporary UiPath folders out of source control.
- Runtime results and evidence can be gitignored, while `.gitkeep` preserves directories.
- Do not commit secrets. There should be no secrets in the MVP.

---

# 7. Mock Portal Specification

## 7.1 Business scenario

The mock portal represents a fictional internal HR application called **ACME Employee Portal**.

The RPA task is:

1. Open the portal.
2. Enter employee ID.
3. Enter employee name.
4. Enter department.
5. Click **CREATE EMPLOYEE**.
6. Confirm that the employee was created.

## 7.2 Required visual layout

The portal should look polished enough to present, but remain simple to implement.

Recommended layout:

```text
+--------------------------------------------------------------+
| ACME EMPLOYEE OPERATIONS                       DEV SIMULATOR |
|--------------------------------------------------------------|
| Fault mode: [ NONE / POPUP / DELAY / ... ]                  |
|                                                              |
| Create Employee                 System State                  |
| ------------------------------  ---------------------------- |
| Employee ID   [            ]    Records: 0                   |
| Name          [            ]    Last action: Ready           |
| Department    [            ]                                  |
|                                                              |
| [ CREATE EMPLOYEE ]                                          |
|                                                              |
| Status banner / error banner                                 |
|--------------------------------------------------------------|
| Employee Records                                             |
| ID       Name                 Department                      |
+--------------------------------------------------------------+
```

Use modern CSS: dark/navy header, cards, rounded corners, subtle shadows, green success, amber warning, red failure. No external CSS framework is required.

## 7.3 Deterministic DOM identifiers

The portal must provide stable HTML IDs for target capture:

- `employeeId`
- `employeeName`
- `department`
- `submitBtn`
- `successBanner`
- `errorBanner`
- `recordCount`
- `employeeTable`
- `faultBadge`
- `chaosPopup`
- `closePopupBtn`

The coding agent must still use supported UiPath target-capture tooling instead of manually fabricating selectors from these IDs. The IDs simply make capture stable and reproducible.

## 7.4 State model

Use `localStorage` for the portal's record list. No backend is required.

Suggested storage key:

`autochaos.employees`

Each record:

```json
{
  "id": "1001",
  "name": "Demo User",
  "department": "Engineering",
  "createdAt": "ISO_TIMESTAMP"
}
```

When the URL contains `reset=1`, clear the stored employee list before rendering the page.

## 7.5 Query parameters

The portal must understand:

- `fault=<fault_mode>`
- `reset=1|0`
- `scenario=<scenario_id>`

Example:

```text
http://localhost:8080/Support/Portal/index.html?fault=popup&reset=1&scenario=CHAOS-001
```

## 7.6 Required fault modes

### `none`

Normal operation.

Expected portal behavior:

- no popup
- form immediately available
- button visible
- submit responds normally
- record is added
- success message appears

### `popup`

Inject an unexpected modal shortly after page load.

Implementation:

- show overlay after roughly 500 ms
- overlay blocks interaction until closed
- provide `closePopupBtn`

Desired RPA behavior:

- detect popup if present
- close popup
- continue transaction

### `slow_submit`

Simulate a slow target system.

Implementation:

- clicking submit disables the button
- show spinner / `Processing...`
- wait several seconds
- then add record and show success

Desired RPA behavior:

- wait for completion rather than immediately timing out

### `rename_button`

Change visible text only.

Implementation:

`CREATE EMPLOYEE` -> `REGISTER EMPLOYEE`

Keep the underlying element stable.

Desired RPA behavior:

- robust target identification should still find the button

### `missing_button`

Remove or hide the submit button entirely.

Desired RPA behavior:

- the business workflow must not invent success
- it may timeout or throw
- the harness must catch the error
- no employee record should be created
- scenario should be classified as a safe failure if state remains unchanged

### `post_commit_error`

This is the most important scenario.

Implementation sequence:

1. user/bot clicks submit
2. portal writes the employee record to `localStorage`
3. portal does **not** show normal success confirmation
4. instead show a connection-loss / server-response error

This simulates an ambiguous real-world state: the business action committed, but the client did not receive confirmation.

Desired AutoChaos result:

- if the bot assumes nothing happened and retries blindly, this is unsafe
- even without a retry, AutoChaos should notice that the portal record count changed despite the UI reporting failure
- classify as `UNSAFE_FAIL` / `TRANSACTION_UNCERTAIN`
- surface as a critical finding

## 7.7 Optional fault modes — only after MVP is complete

- `duplicate_existing`
- `readonly_field`
- `session_expired`
- `random_banner`
- `page_500`
- `field_reordered`
- `validation_error`

Do not implement these before all required fault modes work.

---

# 8. Scenario Data Contract

Create `Data/Input/scenarios.csv` with these columns:

```text
scenario_id,enabled,scenario_name,fault_mode,expected_behavior,employee_id,employee_name,department,notes
```

Recommended initial contents:

```csv
scenario_id,enabled,scenario_name,fault_mode,expected_behavior,employee_id,employee_name,department,notes
CHAOS-000,true,Baseline,none,SUCCESS,1001,Alice Demo,Engineering,Control run
CHAOS-001,true,Unexpected popup,popup,RECOVERED_SUCCESS,1002,Bob Demo,Finance,Popup should be dismissed
CHAOS-002,true,Slow submit,slow_submit,RECOVERED_SUCCESS,1003,Carol Demo,Operations,Bot should wait
CHAOS-003,true,Button text drift,rename_button,RECOVERED_SUCCESS,1004,Dan Demo,Security,Selector should survive label change
CHAOS-004,true,Submit button missing,missing_button,SAFE_FAIL,1005,Eve Demo,Legal,No record must be created
CHAOS-005,true,Post-commit response failure,post_commit_error,SAFE_FAIL,1006,Frank Demo,Research,Expected to expose transaction uncertainty
```

Note: `CHAOS-005` is expected to become a **failed resilience check** if the record is committed. The scenario's expected behavior says the bot should fail safely; the portal intentionally violates that safety expectation to create a critical finding.

---

# 9. Results Data Contract

Create/overwrite `Data/Output/results.csv` at the beginning of every campaign, then rewrite it after each completed scenario so the dashboard can refresh live.

Required columns:

```text
run_id,
scenario_id,
scenario_name,
fault_mode,
expected_behavior,
actual_behavior,
verdict,
records_before,
records_after,
data_integrity,
duration_ms,
exception_type,
exception_message,
evidence_file,
notes
```

Recommended values:

### `actual_behavior`

- `SUCCESS`
- `RECOVERED_SUCCESS`
- `SAFE_FAIL`
- `UNSAFE_FAIL`
- `HARNESS_ERROR`

### `verdict`

- `PASS`
- `FAIL`

### `data_integrity`

- `PASS`
- `FAIL`
- `UNKNOWN`

---

# 10. Classification Rules

Keep classification deterministic and simple.

## 10.1 Baseline / recovery scenarios

For expected `SUCCESS` or `RECOVERED_SUCCESS`:

PASS if:

- no uncaught business error reaches the harness; AND
- final visible result indicates success; AND
- `records_after = records_before + 1`

For a scenario with a fault mode other than `none`, report `RECOVERED_SUCCESS` if it meets the success criteria.

## 10.2 Safe failure scenario

For expected `SAFE_FAIL`:

PASS if:

- the business action does not report success; AND
- `records_after = records_before`; AND
- the harness captured an error/failure state and evidence

Actual behavior = `SAFE_FAIL`.

## 10.3 Unsafe failure

Set actual behavior = `UNSAFE_FAIL` if any of these occur:

- visible business failure but record count increased;
- duplicate record is created unexpectedly;
- workflow reports success but portal state does not match;
- partial or contradictory state is detected.

Verdict = `FAIL`.

## 10.4 Harness error

If the test infrastructure itself breaks—for example results cannot be written or the portal cannot be opened at all—classify `HARNESS_ERROR` rather than pretending the RPA failed.

---

# 11. UiPath Project Authoring Strategy

## 11.1 Mandatory file-based XAML output

The repository must contain real `.xaml` workflows that Studio can open visually.

Required outputs:

- `Main.xaml`
- `Workflows/InitRun.xaml`
- `Workflows/RunScenario.xaml`
- `Workflows/ProcessEmployee.xaml`
- `Workflows/FinalizeRun.xaml`

The implementation agent should create/edit these files programmatically and validate them using UiPath tooling.

## 11.2 Do not manually construct project scaffolding

Use UiPath CLI to initialize the project. The official UiPath agent guidance recommends `uip rpa init` for new projects and CLI-based dependency management.

Preferred initialization shape:

```powershell
uip rpa init --name "AutoChaos" --location "<PARENT_DIR>" --template-id BlankTemplate --expression-language VisualBasic --target-framework Windows --output json
```

If CLI syntax differs in the installed version, query `--help` and adapt; do not replace the operation with a hand-written `project.json`.

## 11.3 Install official UiPath agent skills if the coding agent supports them

Recommended setup:

```powershell
npm -g install @uipath/cli
uip skills install
```

The official `UiPath/skills` repository includes `uipath-rpa` guidance for creating, editing, validating, running, and debugging XAML workflows.

## 11.4 Dependency management

Use CLI package discovery/install. Do not directly type package versions into `project.json`.

Workflow for each required package:

```powershell
uip rpa packages versions --package-id <PACKAGE_ID> --include-prerelease --project-dir "<PROJECT_DIR>" --output json
uip rpa packages install --packages 'id=<PACKAGE_ID>,version=<CHOSEN_VERSION>' --project-dir "<PROJECT_DIR>" --output json
```

Prefer stable versions unless only a preview exposes a required activity. Do not force-upgrade an already working package without need.

## 11.5 XAML architecture rules

- `Main.xaml` is an orchestrator.
- Use child workflows through `Invoke Workflow File`.
- Keep one responsibility per workflow.
- Use relative workflow paths.
- Use clear `in_`, `out_`, and `io_` argument prefixes.
- Use `Log Message`, not `Write Line`, for final implementation logging.
- Use `Try/Catch` around each scenario execution.
- Do not put a campaign-wide `Try/Catch` around the entire `For Each` in a way that stops execution after the first scenario.

## 11.6 UI Automation selector rule

Do not hand-write UI selectors simply because the portal exposes known IDs.

Preferred order:

1. use UiPath's supported UI target-capture tooling from the official RPA skill / installed UI Automation package;
2. create the resulting UIA activities in XAML;
3. validate/build;
4. if target capture cannot run in the agent environment, use the official placeholder-selector/stub pattern with `TODO Indicate` in activity display names.

The fallback should require only indication of targets, not activity authoring.

---

# 12. Workflow Specifications

# 12.1 `Main.xaml`

## Responsibility

Campaign orchestration only.

## High-level activity sequence

```text
Sequence: AutoChaos Main
|
|-- Invoke Workflow File: Workflows/InitRun.xaml
|
|-- Read CSV: Data/Input/scenarios.csv -> dtScenarios
|
|-- For Each Row in dtScenarios
|     |
|     |-- If enabled = true
|           |
|           `-- Invoke Workflow File: Workflows/RunScenario.xaml
|
`-- Invoke Workflow File: Workflows/FinalizeRun.xaml
```

## Variables

Suggested:

- `runId` — String
- `dtScenarios` — DataTable
- `dtResults` — DataTable
- `projectRoot` — String
- `basePortalUrl` — String
- `dashboardUrl` — String

## Arguments

None required for MVP.

## Acceptance checks

- [ ] Disabled scenarios are skipped.
- [ ] An exception in one scenario does not exit the loop.
- [ ] Results DataTable contains one row per enabled scenario.
- [ ] Finalization runs even when one or more scenarios fail.

---

# 12.2 `Workflows/InitRun.xaml`

## Responsibility

Prepare paths, run ID, result schema, and clean output state.

## Inputs

- `in_ProjectRoot` — String (optional if Main calculates it)

## Outputs

- `out_RunId` — String
- `out_Results` — DataTable
- `out_BasePortalUrl` — String
- `out_DashboardUrl` — String

## Required logic

1. Generate run ID, e.g. `yyyyMMdd-HHmmss`.
2. Ensure `Data/Output/` exists.
3. Ensure `Evidence/` exists.
4. Delete old `results.csv` if present.
5. Optionally delete old screenshot files for a clean demo.
6. Create `dtResults` with the exact schema in Section 9.
7. Assign:
   - portal URL = `http://localhost:8080/Support/Portal/index.html`
   - dashboard URL = `http://localhost:8080/Support/Dashboard/index.html`
8. Log run start.

## Acceptance checks

- [ ] Re-running the project produces a clean campaign.
- [ ] No manual folder creation is required.

---

# 12.3 `Workflows/ProcessEmployee.xaml`

## Responsibility

This is the actual RPA workflow under test. It interacts with the ACME portal.

## Inputs

- `in_TargetUrl` — String
- `in_EmployeeId` — String
- `in_EmployeeName` — String
- `in_Department` — String
- `in_FaultMode` — String

## Outputs

- `out_VisibleSuccess` — Boolean
- `out_StatusText` — String
- `out_RecordCount` — Int32

## Required interaction sequence

```text
Use Application/Browser: in_TargetUrl
|
|-- If chaos popup exists
|     `-- Click close popup
|
|-- Type Into employeeId
|-- Type Into employeeName
|-- Type Into department
|-- Click submitBtn
|
|-- Wait/check for either:
|     |-- successBanner
|     `-- errorBanner / timeout
|
`-- Get Text recordCount
```

## Design requirements

- `popup` should be recoverable.
- `slow_submit` must have enough timeout/wait behavior to complete.
- `rename_button` should succeed if target capture is robust.
- `missing_button` may throw; that is acceptable.
- `post_commit_error` should not be treated as success merely because the click happened.
- Do not hide exceptions with `ContinueOnError=True` everywhere.
- Do not return success unless positive evidence exists.

## Target capture inventory

The agent should capture or leave `TODO Indicate` markers for at most these portal elements:

1. Browser/application scope
2. employee ID input
3. employee name input
4. department input
5. submit button
6. close popup button
7. success status/banner
8. error status/banner or generic status area
9. record count text

If an element can be handled using one stable common status container, reduce the count.

## Acceptance checks

- [ ] Baseline succeeds.
- [ ] Popup is dismissed.
- [ ] Slow submission completes.
- [ ] Button text rename does not break the click target.
- [ ] Missing button does not generate false success.
- [ ] Post-commit error does not generate false success.

---

# 12.4 `Workflows/RunScenario.xaml`

## Responsibility

Run one scenario in isolation, catch failures, classify the observed behavior, capture evidence, and append a result row.

## Inputs

- scenario fields from current DataRow, or a single `DataRow` argument
- `in_RunId` — String
- `in_BasePortalUrl` — String

## In/Out

- `io_Results` — DataTable

## Required algorithm

```text
startTime = UtcNow
recordsBefore = 0
recordsAfter = 0
visibleSuccess = false
exceptionType = ""
exceptionMessage = ""

Build target URL:
  ?fault=<fault>&reset=1&scenario=<id>

TRY
    Invoke ProcessEmployee.xaml
    capture outputs
CATCH Exception ex
    store ex type/message
FINALLY
    attempt evidence screenshot
    attempt final record count/state capture if available

Classify actual behavior
Compare to expected behavior
Append result row
Write Data/Output/results.csv
Continue caller
```

## Important isolation rule

No exception from `ProcessEmployee.xaml` may escape in a way that stops `Main.xaml` from running the remaining scenarios, except a genuine unrecoverable harness failure.

## Evidence naming

Use deterministic filenames:

```text
Evidence/<run_id>_<scenario_id>_<actual_behavior>.png
```

Example:

```text
Evidence/20260918-123000_CHAOS-004_SAFE_FAIL.png
```

## Duration

Calculate milliseconds using `DateTime.UtcNow` before/after execution.

## Acceptance checks

- [ ] Every enabled scenario produces exactly one result row.
- [ ] Exception text is captured but does not stop the campaign.
- [ ] Screenshot failures do not overwrite the primary scenario result; record the screenshot issue in notes if needed.
- [ ] `results.csv` is updated after each scenario.

---

# 12.5 `Workflows/FinalizeRun.xaml`

## Responsibility

Finalize results and open/present the dashboard.

## Inputs

- `in_Results` — DataTable
- `in_DashboardUrl` — String
- `in_RunId` — String

## Required logic

1. Write final `results.csv`.
2. Log total scenarios / passes / failures.
3. Open dashboard URL or log the exact URL if browser opening is intentionally omitted.

Do not generate PDF reports in MVP.

---

# 13. UI Automation Authoring and XAML Handoff Rules

## 13.1 Why this section matters

XAML generation is not the same as writing generic XML. UiPath activities have package-specific class names, namespaces, target descriptors, and serialization details. The implementation agent must use UiPath's own tooling/documentation rather than guessing activity tags.

## 13.2 Official UiPath agent workflow

When the agent has access to the official UiPath skills:

1. detect/create the project using `uip rpa init`;
2. install packages with `uip rpa packages install`;
3. read the `uipath-rpa` skill and the XAML rules it references;
4. for UI Automation, read the UIA starter guide and the installed UI Automation package guide;
5. use the supported target capture command/workflow;
6. author the XAML;
7. validate and build;
8. only then run/debug.

## 13.3 Never fabricate activity class names

Before introducing an unfamiliar activity, use UiPath activity discovery tooling or package documentation to determine the actual class name / serialized XAML form.

## 13.4 Validation gates

At minimum, after meaningful XAML authoring:

```powershell
uip rpa validate --file-path "Main.xaml" --project-dir "<PROJECT_DIR>" --output json
uip rpa build "<PROJECT_DIR>" --output json
```

Also run validation for any additional entry point files defined in `project.json`.

Recommended quality gate:

```powershell
uip rpa analyze --project-dir "<PROJECT_DIR>" --output json
```

A clean `validate` does not replace `build`; both should pass.

## 13.5 Manual-indication fallback

If the coding agent cannot interact with the desktop/browser to capture targets:

- generate the complete workflow structure;
- use real UIA activities;
- mark each unresolved target with `TODO Indicate: <element name>` in `DisplayName`;
- provide the user a short checklist containing only target indications;
- do not ask the user to recreate sequences, variables, arguments, loops, catches, or activities manually.

The fallback is acceptable because the user's goal is to avoid drag/drop workflow construction, not necessarily every single selector indication.

---

# 14. Dashboard Specification

## 14.1 Goal

The dashboard is the visual "sell" layer. It must make a technically simple project look like a coherent resilience engineering product.

## 14.2 Data source

`Support/Dashboard/dashboard.js` should fetch:

```text
/Data/Output/results.csv
```

Because the entire project folder is served by the same Python HTTP server, there should be no cross-origin requirement.

Use a cache-busting query string when refreshing:

```text
results.csv?t=<timestamp>
```

## 14.3 Auto refresh

Refresh data every 2–3 seconds while the page is open.

No WebSocket is required.

## 14.4 Required visual sections

### Hero/header

- AutoChaos logo/text
- subtitle: `RPA Resilience Validation & Fault Injection`
- current run ID
- live status dot

### KPI cards

- Scenarios executed
- Passed
- Recovered successes
- Safe failures
- Critical/unsafe failures
- Resilience score

### Resilience score

Use the deliberately simple formula:

```text
Resilience Score = round(PASS scenarios / executed scenarios * 100)
```

Do not pretend it is an industry-standard metric.

### Sub-metrics

Render simple horizontal bars for:

- Campaign continuity = executed / enabled scenarios
- Data integrity = rows with data_integrity PASS / executed
- Recovery coverage = recovered-success scenarios / recovery-expected scenarios
- Safe failure coverage = safe-fail passes / safe-fail expected scenarios

### Scenario results table

Columns:

- ID
- scenario
- injected fault
- expected
- observed
- verdict
- duration
- evidence

### Critical findings panel

For rows with `verdict=FAIL`, display a red card.

For `post_commit_error`, suggested generated description:

> Transaction uncertainty detected: the portal state changed despite the automation receiving a failure response. Blind retries could duplicate the business action.

### Visual timeline

Optional but cheap: render each scenario as a colored node in execution order.

```text
Baseline -> Popup -> Slow -> UI Drift -> Missing -> Post-Commit
  PASS      PASS     PASS      PASS         PASS        FAIL
```

## 14.5 No external front-end dependency

Do not require React, npm, Chart.js, Bootstrap, or internet access for the dashboard. Vanilla HTML/CSS/JS is enough.

CSS may use:

- CSS Grid
- CSS variables
- gradients
- `conic-gradient()` for score ring
- inline SVG if useful

---

# 15. PowerShell Demo Scripts

# 15.1 `Support/Scripts/Start-Demo.ps1`

Required behavior:

1. resolve repository/project root;
2. verify `python` or `py` exists;
3. start a local server on port 8080 with project root as web root;
4. print:
   - portal URL
   - dashboard URL
5. open dashboard in default browser if convenient;
6. leave server running independently enough for UiPath execution.

Preferred host command concept:

```powershell
py -m http.server 8080 --directory "<PROJECT_ROOT>"
```

The exact process-spawn syntax can be chosen by the implementation agent.

# 15.2 `Support/Scripts/Reset-Demo.ps1`

Optional convenience script that:

- deletes `Data/Output/results.csv`;
- removes screenshots in `Evidence/`;
- opens portal with `?reset=1&fault=none` once to clear localStorage, if useful.

Do not block MVP completion if reset is already handled by `InitRun.xaml` and per-scenario URLs.

---

# 16. Implementation Phases and Checkpoints

The agent should implement phases sequentially. Do not start fancy polish until the phase gate passes.

---

## PHASE 0 — Repository + UiPath Scaffold

### Tasks

- [ ] Create repository/project root.
- [ ] Initialize UiPath project using `uip rpa init`.
- [ ] Explicitly set target framework `Windows`.
- [ ] Explicitly set expression language `VisualBasic`.
- [ ] Create folder structure from Section 6.
- [ ] Add `.gitignore` for `.local/`, build output, generated evidence/results.
- [ ] Add minimal `README.md`.
- [ ] Add `AGENTS.md` containing the critical handoff rules from Section 0.
- [ ] Resolve/install required activity packages using UiPath CLI.
- [ ] Confirm blank project validates/builds.

### Gate

- [ ] `project.json` exists and opens in UiPath Studio.
- [ ] `Main.xaml` exists.
- [ ] `uip rpa validate` passes.
- [ ] `uip rpa build` passes.

Stop and fix before Phase 1 if this gate fails.

---

## PHASE 1 — Build the Mock Portal

### Tasks

- [ ] Implement `Support/Portal/index.html`.
- [ ] Implement `styles.css`.
- [ ] Implement `app.js`.
- [ ] Add form fields and stable IDs.
- [ ] Store employee records in localStorage.
- [ ] Display record count.
- [ ] Display employee records table.
- [ ] Parse `fault`, `reset`, and `scenario` query params.
- [ ] Implement `none`.
- [ ] Implement `popup`.
- [ ] Implement `slow_submit`.
- [ ] Implement `rename_button`.
- [ ] Implement `missing_button`.
- [ ] Implement `post_commit_error`.
- [ ] Add visible developer-only fault badge so presenter can see the active injection.
- [ ] Create `Start-Demo.ps1`.

### Manual test checklist

Verify URLs manually in browser:

- [ ] `fault=none` adds a record and shows success.
- [ ] `fault=popup` blocks the form until popup is closed.
- [ ] `fault=slow_submit` visibly waits and then commits.
- [ ] `fault=rename_button` changes text only.
- [ ] `fault=missing_button` cannot submit.
- [ ] `fault=post_commit_error` increments record count but shows failure.
- [ ] `reset=1` resets state.

### Gate

The portal must be completely deterministic before any UiPath selector work begins.

---

## PHASE 2 — Build the Baseline Business RPA

### Tasks

- [ ] Create `Workflows/ProcessEmployee.xaml`.
- [ ] Add inputs/outputs defined in Section 12.3.
- [ ] Create Use Application/Browser activity.
- [ ] Capture portal target.
- [ ] Add Type Into for three fields.
- [ ] Add submit click.
- [ ] Add success/error state check.
- [ ] Read visible record count.
- [ ] Add optional popup check/close path.
- [ ] Set sensible wait/timeout behavior.
- [ ] Validate/build.

### Baseline test

Use URL:

```text
http://localhost:8080/Support/Portal/index.html?fault=none&reset=1
```

Expected:

- one employee created;
- `out_VisibleSuccess=True`;
- `out_RecordCount=1`.

### Gate

Do not begin the chaos runner until baseline automation works repeatedly.

---

## PHASE 3 — Build the Scenario Harness

### Tasks

- [ ] Create `Data/Input/scenarios.csv`.
- [ ] Create `InitRun.xaml`.
- [ ] Create result DataTable schema.
- [ ] Read scenarios from CSV in `Main.xaml`.
- [ ] Add enabled filter.
- [ ] Add `For Each Row` campaign loop.
- [ ] Create `RunScenario.xaml`.
- [ ] Build fault URL from scenario row.
- [ ] Wrap the invocation in per-scenario `Try/Catch`.
- [ ] Capture exception type/message.
- [ ] Read final portal record count/state.
- [ ] Classify result.
- [ ] Append row to results DataTable.
- [ ] Write `results.csv` after every scenario.
- [ ] Ensure caller continues.

### Gate test

Temporarily force `missing_button` to throw.

Expected campaign sequence:

```text
CHAOS-000 -> executes
CHAOS-001 -> executes
CHAOS-002 -> executes
CHAOS-003 -> executes
CHAOS-004 -> fails safely / captured
CHAOS-005 -> STILL EXECUTES
```

If `CHAOS-005` does not run, the phase is not complete.

---

## PHASE 4 — Evidence Capture + Integrity Detection

### Tasks

- [ ] Add modern Take Screenshot activity or supported equivalent.
- [ ] Save one screenshot per scenario.
- [ ] Capture record count before/after where possible.
- [ ] Set data-integrity classification.
- [ ] Implement `UNSAFE_FAIL` classification.
- [ ] Ensure post-commit error becomes a visible critical finding.
- [ ] Make screenshot path clickable/usable by dashboard.

### Gate

`CHAOS-005` should demonstrate:

```text
UI reports failure
records_before = 0
records_after = 1
data_integrity = FAIL
actual_behavior = UNSAFE_FAIL
verdict = FAIL
```

This is the main technical story of the project.

---

## PHASE 5 — Dashboard / Presentation Layer

### Tasks

- [ ] Build static dashboard HTML/CSS/JS.
- [ ] Parse CSV robustly enough for expected output.
- [ ] Add live refresh.
- [ ] Add score ring.
- [ ] Add KPI cards.
- [ ] Add scenario table.
- [ ] Add critical findings panel.
- [ ] Add execution timeline.
- [ ] Add evidence links/thumbnails where practical.
- [ ] Add empty-state view before a run starts.
- [ ] Add `FinalizeRun.xaml` to open dashboard or log URL.

### Gate

A viewer with no UiPath knowledge should understand within a few seconds:

- what was tested;
- which faults were injected;
- which scenarios survived;
- which failed safely;
- which exposed a dangerous condition.

---

## PHASE 6 — Hardening and Demo Polish

### Tasks

- [ ] Run full campaign multiple times.
- [ ] Ensure results are deterministic.
- [ ] Clean activity display names.
- [ ] Remove dead variables and unused imports.
- [ ] Add useful `Log Message` entries.
- [ ] Confirm no secrets or machine-specific absolute paths.
- [ ] Validate every entry point.
- [ ] Build project.
- [ ] Run Workflow Analyzer.
- [ ] Fix all blocking errors and obvious warnings.
- [ ] Update README with one-command/one-script startup instructions.
- [ ] Document any remaining `TODO Indicate` targets.
- [ ] Commit final screenshots of the dashboard only if desired for README.

### Final gate

All Definition of Done items in Section 21 must be satisfied.

---

# 17. Detailed Test Matrix

| ID | Fault | Expected RPA Behavior | Expected State Delta | Expected AutoChaos Verdict |
|---|---|---|---:|---|
| CHAOS-000 | none | normal success | +1 | PASS |
| CHAOS-001 | popup | close popup and continue | +1 | PASS |
| CHAOS-002 | slow_submit | wait and complete | +1 | PASS |
| CHAOS-003 | rename_button | target still found | +1 | PASS |
| CHAOS-004 | missing_button | fail without commit | 0 | PASS as SAFE_FAIL |
| CHAOS-005 | post_commit_error | should fail without unsafe state change | should be 0 | intentionally FAIL if +1 |

## 17.1 What not to fake

Synthetic data and deterministic fault injection are the intended design. However, do not fabricate a passing result row without actually running the UiPath workflow. The dashboard should visualize genuine output produced by the local run.

---

# 18. Logging Requirements

Use concise structured log messages.

Recommended events:

```text
[AUTOCHAOS] Run started: <run_id>
[AUTOCHAOS] Scenario start: CHAOS-001 | popup
[AUTOCHAOS] Business workflow success
[AUTOCHAOS] Scenario exception: <type> | <message>
[AUTOCHAOS] Scenario verdict: PASS | RECOVERED_SUCCESS
[AUTOCHAOS] Evidence: <path>
[AUTOCHAOS] Scenario end: CHAOS-001 | <duration>ms
[AUTOCHAOS] Campaign complete: 6 executed, 5 pass, 1 fail
```

Avoid logging every trivial assignment.

---

# 19. Error Handling Rules

## 19.1 Business errors vs harness errors

Business/workflow-under-test failure:

- missing submit control
- timeout waiting for success
- portal error banner

These are valid test observations and should become result rows.

Harness/infrastructure failure:

- scenarios.csv cannot be read
- result CSV cannot be written
- no local web server is reachable at all
- result schema is broken

These should be logged separately as harness errors.

## 19.2 Never swallow everything

Do not use blanket `ContinueOnError=True` as the strategy. It can make the workflow appear successful while doing nothing.

## 19.3 Cleanup

Each scenario uses `reset=1` so the target starts from a known state. Keep browser/session cleanup minimal unless it is needed for deterministic runs.

---

# 20. Demo Script for Presentation

Use this exact narrative.

## Step 1 — Introduce the concept

> Normal RPA testing checks whether a bot works under expected conditions. AutoChaos deliberately changes the environment around the bot and verifies whether it recovers, fails safely, preserves data integrity, and allows the rest of the test campaign to continue.

## Step 2 — Start local environment

Run:

```powershell
.\Support\Scripts\Start-Demo.ps1
```

Open/keep visible:

- UiPath Studio
- browser portal when automation runs
- AutoChaos dashboard

## Step 3 — Run `Main.xaml`

The viewer should visibly see scenarios being executed.

## Step 4 — Point out key moments

### Popup

> The target application changed unexpectedly, but the automation recovered.

### Slow submit

> The response is delayed; the bot waits rather than incorrectly declaring failure.

### Missing button

> The transaction cannot continue, but the bot fails safely and the test campaign continues to the next scenario.

### Post-commit error

> This is the dangerous case. The UI reports failure after the transaction has actually committed. AutoChaos detects that the business state changed despite the failed interaction, so it marks a transaction-integrity problem instead of treating this as an ordinary timeout.

## Step 5 — Dashboard

Show:

- resilience score
- scenario timeline
- PASS / safe failure / critical failure
- screenshot evidence
- critical finding

## Step 6 — Close with the value statement

> The project is not just checking whether an RPA works. It checks whether the RPA behaves safely when its assumptions about the surrounding application stop being true.

---

# 21. Definition of Done

The project is complete only when all of the following are true.

## 21.1 Repository / XAML

- [ ] UiPath project opens successfully in Studio Desktop.
- [ ] `Main.xaml` exists in source control.
- [ ] All required child workflows exist as `.xaml` files.
- [ ] No manual drag/drop implementation is required.
- [ ] Any unavoidable manual target capture is clearly marked and minimal.
- [ ] Project validates.
- [ ] Project builds.

## 21.2 Portal

- [ ] Local portal runs from Python HTTP server.
- [ ] All required fault modes are implemented.
- [ ] State resets deterministically.
- [ ] Portal clearly displays active fault mode.

## 21.3 RPA

- [ ] Baseline employee creation succeeds.
- [ ] Popup scenario recovers.
- [ ] Slow-submit scenario recovers.
- [ ] Rename-button scenario recovers.
- [ ] Missing-button scenario fails safely.
- [ ] Post-commit scenario exposes transaction uncertainty / unsafe state.

## 21.4 Harness

- [ ] Scenario failures do not abort the campaign.
- [ ] Every enabled scenario produces one results row.
- [ ] Result CSV is written after each scenario.
- [ ] Exceptions are recorded.
- [ ] Screenshots are recorded.
- [ ] Data-integrity status is recorded.

## 21.5 Dashboard

- [ ] Dashboard renders from real results.csv.
- [ ] Shows total, pass, recovery, safe failure, critical failure.
- [ ] Shows resilience score.
- [ ] Shows individual scenario details.
- [ ] Shows critical finding for unsafe transaction behavior.
- [ ] Visually polished enough for a demo/video/screenshot.

## 21.6 Reproducibility

- [ ] Full run works after clearing outputs.
- [ ] No staging/prod system required.
- [ ] No cloud connection required after UiPath packages are available.
- [ ] No real business data required.
- [ ] No hard-coded machine-specific absolute paths.

---

# 22. Optional Enhancements — Only After Definition of Done

## Tier A — Low effort / high visual value

- add a manual fault selector to portal
- add scenario filtering on dashboard
- evidence thumbnail modal
- downloadable JSON summary
- compare current run to previous run
- animated timeline

## Tier B — More technical value

- convert scenarios into UiPath Test Case XAML files
- integrate Test Explorer/Test Manager if licensing is available
- add retry-specific experiments
- add a duplicate-payment style mock process instead of employee creation
- add browser crash / process kill injection
- add network-offline simulation
- add a second mock target application

## Tier C — Research / advanced

- automatic generation of new resilience test scenarios
- selector mutation testing
- probabilistic fault campaigns
- LLM-generated incident summaries
- CI pipeline execution
- Orchestrator-based scheduled chaos campaign
- automatic regression test creation after a discovered failure

None of these are needed for the MVP presentation.

---

# 23. Known Risks and Simplest Mitigations

## Risk: Agent-generated XAML validates poorly

Mitigation:

- use official UiPath agent skill guidance;
- discover real activity class names;
- install packages before authoring dependent activities;
- validate and build after each meaningful workflow.

## Risk: UI selectors cannot be captured by coding agent

Mitigation:

- generate full XAML with supported placeholder target pattern;
- user performs only the short `TODO Indicate` checklist.

## Risk: Browser extension/integration issue

Mitigation:

- use whichever supported browser is already functional in UiPath Studio;
- do not make the MVP depend on preview browser features.

## Risk: CSV comma inside exception message breaks parser

Mitigation:

- use UiPath Write CSV so quoting is handled;
- dashboard parser must support quoted CSV fields, or sanitize line breaks and commas in exception text.

## Risk: Results dashboard reads stale browser cache

Mitigation:

- dashboard fetches `results.csv?t=Date.now()`.

## Risk: screenshot capture itself fails after browser problem

Mitigation:

- evidence capture gets its own small `Try/Catch`;
- primary scenario result remains intact;
- notes record `screenshot unavailable`.

## Risk: post-commit error state is hard to inspect

Mitigation:

- always render visible `recordCount` in portal even after failure;
- avoid hidden-only state for the MVP.

---

# 24. Agent Progress Checklist / Handoff Status Template

The implementation agent should maintain this section or an equivalent issue/checklist during build.

```text
[ ] Phase 0 — project scaffold validated
[ ] Phase 1 — portal complete
[ ] Phase 2 — baseline RPA complete
[ ] Phase 3 — campaign harness complete
[ ] Phase 4 — evidence + integrity detection complete
[ ] Phase 5 — dashboard complete
[ ] Phase 6 — validation + polish complete

Current blocking issue:
<none / description>

Outstanding TODO Indicate targets:
<list or none>

Latest validation:
validate: <pass/fail>
build:    <pass/fail>
analyze:  <errors/warnings/info>

Latest full campaign:
executed: <n>
pass:     <n>
fail:     <n>
critical: <n>
```

---

# 25. Recommended README Quick Start

The repository README should eventually contain a concise path similar to:

```text
Prerequisites
- Windows
- UiPath Studio Desktop
- Chrome/Edge with working UiPath browser automation
- Python 3

1. Start the local demo server
   .\Support\Scripts\Start-Demo.ps1

2. Open the AutoChaos project in UiPath Studio.

3. If any activities are marked TODO Indicate, indicate those portal controls once.

4. Run Main.xaml.

5. Open:
   http://localhost:8080/Support/Dashboard/index.html

Expected demo result:
- baseline/recovery tests pass
- missing-button test is recorded as safe failure
- post-commit error is flagged as an unsafe transaction-integrity finding
```

---

# 26. Research / Implementation References

These references are implementation guidance, not runtime dependencies.

1. **UiPath official Agent Skills repository** — supports external coding agents creating/editing/building/running `.xaml` and coded UiPath workflows.  
   https://github.com/UiPath/skills

2. **UiPath `uipath-rpa` skill** — project initialization, XAML authoring rules, UI Automation capture rules, package management, validation/build flow.  
   https://github.com/UiPath/skills/blob/main/skills/uipath-rpa/SKILL.md

3. **UiPath project structure reference** — `project.json`, `Main.xaml`, workflow files, dependencies, entry points, CLI-first initialization/package rules.  
   https://github.com/UiPath/skills/blob/main/skills/uipath-rpa/references/project-structure.md

4. **Invoke Workflow File activity** — supports modular `.xaml` workflows referenced by relative path.  
   https://docs.uipath.com/activities/other/latest/workflow/invoke-workflow-file

5. **Use Application/Browser activity** — modern browser/application automation container.  
   https://docs.uipath.com/activities/other/latest/ui-automation/n-application-card

6. **Take Screenshot activity** — screenshot capture usable for application or desktop evidence.  
   https://docs.uipath.com/activities/other/latest/ui-automation/n-take-screenshot

7. **Read CSV activity**  
   https://docs.uipath.com/activities/other/latest/productivity/read-csv-file

8. **Write CSV activity**  
   https://docs.uipath.com/activities/other/latest/productivity/write-csv-file

9. **UiPath Test Cases documentation** — useful only for the optional later conversion to formal test cases.  
   https://docs.uipath.com/studio/standalone/2025.10/user-guide/application-testing-test-cases

---

# 27. Final Instruction to the Implementation Agent

Build the **smallest deterministic version that satisfies the Definition of Done**. Do not optimize for enterprise architecture. Optimize for:

1. reproducibility;
2. XAML-first UiPath implementation;
3. visible fault injection;
4. campaign continuity after failures;
5. data-integrity detection;
6. compelling dashboard presentation.

If a design decision has two valid options, choose the one with fewer dependencies and fewer moving parts unless it reduces the quality of the demo.

**The project is finished when a viewer can run one UiPath workflow, watch several controlled failures occur, and immediately understand from the dashboard which failures were tolerated, which failed safely, and which exposed a dangerous automation weakness.**
