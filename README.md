# AutoChaos

Automated resilience validation and fault injection for robotic process automation.

AutoChaos runs a deterministic UiPath campaign against a local ACME Employee Portal. The portal injects controlled faults, the XAML harness continues after business failures, and the dashboard highlights recovery, safe failure, and transaction-integrity risk.

## Prerequisites

- Windows with UiPath Studio Desktop and working Chrome or Edge UI Automation integration.
- Python 3 (`py` or `python`) for the local static server.
- UiPath packages restored by the project.

## Quick start

```powershell
.\Support\Scripts\Start-Demo.ps1
```

Open the project in UiPath Studio and run `Main.xaml`. If Studio shows `TODO Indicate` targets, indicate the small set of portal controls listed in `Workflows/ProcessEmployee.xaml` once. Then open:

http://localhost:8080/Support/Dashboard/index.html

The expected campaign has recovered successes for the popup, delay, and button-drift scenarios; a safe failure for the missing button; and an intentional critical finding for the post-commit error.

## Useful commands

```powershell
uip rpa validate --file-path Workflows/ProcessEmployee.xaml --project-dir . --output json
uip rpa build . --output json
.\Support\Scripts\Reset-Demo.ps1
```

The mock portal stores only synthetic employee records in browser `localStorage`. No cloud service, database, credential, or production system is required.

