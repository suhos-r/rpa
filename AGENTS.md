# AutoChaos implementation rules

- Keep `Main.xaml` orchestration-only; business UI automation belongs in `Workflows/ProcessEmployee.xaml`.
- Use Windows + VisualBasic XAML and manage dependencies through `uip rpa`.
- Keep the campaign deterministic and isolate every scenario with a per-scenario Try/Catch.
- Never fabricate UI selectors. Targets must come from UiPath capture tooling; if capture is unavailable, keep real UIA activities with `TODO Indicate` markers.
- Preserve evidence, record counts, exception details, and the verdict for every enabled scenario.
- Validate edited workflows and build the whole project before delivery.

