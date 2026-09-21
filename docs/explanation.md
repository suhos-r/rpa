# AutoChaos — Plain Words Explanation (Internal)

This folder explains what the demo does, in simple everyday words. No coding words. For our own team only.

## The big idea in one paragraph

We pretend to be an office worker adding new people to a company list. Before each try, we break the screen a little on purpose (a surprise message, a slow button, a missing button). Then we watch: did our helper still do the right thing, give up safely, or leave a mess? All answers go into one result sheet, and the picture board reads that sheet.

How to run it: see [instructions.md](./instructions.md).

## Where to read next

All detail pages live under `./docs/explanation/`:

1. [Picture board — what each card and word means](./explanation/dashboard.md)
2. [Test website and list of tries](./explanation/portal-and-data.md)
3. [Main plan — the boss list](./explanation/main.md)
4. [Setup step](./explanation/initrun.md)
5. [One try, kept safe](./explanation/runscenario.md)
6. [Filling the form on screen](./explanation/processemployee.md)
7. [Closing step](./explanation/finalizerun.md)
8. [Architecture picture — what each box and arrow means](./explanation/architecture.md)
9. [Chaos by scenario — which move beats it](./explanation/scenarios-chaos.md)

## The 6 tries in short

| Try | What we break | What good looks like |
|---|---|---|
| CHAOS-000 | Nothing, normal day | One person added, happy message shown |
| CHAOS-001 | Surprise message pops up | Close the message, then add one person |
| CHAOS-002 | Save button is very slow | Wait longer, then check one person was added |
| CHAOS-003 | Button words look different | Still press the same button, one person added |
| CHAOS-004 | Save button is gone | Add nobody, say clearly the button was missing |
| CHAOS-005 | Screen says "failed" but it secretly saved | Mark this as dangerous: screen and list do not agree |

End result we want: 5 good marks, 1 danger mark found on purpose.
