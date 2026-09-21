# Architecture Picture — What Each Box and Arrow Means (Internal)

Source picture: `AutoChaos-architecture.html` (made from `AutoChaos.architecture.json`).
Open that file in a browser to see the drawing. This page explains it in plain words.

## What the picture is for

It shows one full run: someone starts the helper, the helper reads a list of tries, opens a fake office website, breaks it a little on purpose, writes answers in a sheet, and shows them on a picture board. Nothing leaves your computer.

## The boxes (one by one)

### 1. Operator (UiPath Robot)
- Who this is: you, the person who presses start.
- What it does: starts the whole run and watches it finish.

### 2. Scenario CSV (Data/Input/scenarios.csv)
- What this is: the list of 6 tries written in a sheet.
- What it holds: try name, what break to turn on, which fake person to type, on/off switch.

### 3. Main.xaml (boss plan)
- What this is: the boss list.
- What it does: reads the try-list, calls setup once, hands each switched-on line to the one-try helper, then calls the closing helper.

### 4. InitRun.xaml (setup helper)
- What this is: the cleaner who comes first.
- What it does: makes a date-time run name, makes the results and photo folders if missing, clears the old result sheet, remembers the website and board addresses.

### 5. RunScenario.xaml (one-try helper)
- What this is: the safety box for a single try.
- What it does: reads one line, builds the web address for that break, asks the screen helper to do the work, catches any crash so the run continues, decides the mark (good save / safe stop / danger), saves the line right away.

### 6. ProcessEmployee.xaml (screen worker)
- What this is: the only one who touches the screen.
- What it does: opens the test website, closes any surprise message, types ID + name + department, presses save (waiting longer if slow), reads the small status words and saved-count, looks for the green happy message, takes a photo.

### 7. ACME Employee Portal (localhost:8080, test website)
- What this is: our fake office screen.
- What it does: shows the form, pretends to break (surprise message, slow save, changed button words, missing button, secret save then error), shows happy or error notes.

### 8. Browser localStorage (saved people memory)
- What this is: the website's own notebook, kept inside the browser.
- What it does: remembers how many fake people are saved (0 or 1 per try). Cleared at the start of each try.

### 9. Evidence (photo folder)
- What this is: a folder of screen photos.
- What it does: keeps one photo per try, named with run name + try number + what happened. This is our proof.

### 10. FinalizeRun.xaml (closing helper)
- What this is: the tidier who comes last.
- What it does: saves the final result sheet one more time and writes where to open the picture board.

### 11. Results CSV (Data/Output/results.csv)
- What this is: the one true answer sheet.
- What it does: holds one row per try with what we hoped, what really happened, PASS/FAIL, list-clean mark, time taken, crash words, photo path. Written after every try so the board updates live.

### 12. Resilience Dashboard (picture board)
- What this is: the screen you show to others.
- What it does: only reads the answer sheet every 5 seconds and draws number cards, health circle, danger list, step line, and full table. It never changes the answers. Detail of each card is in [dashboard.md](./dashboard.md).

## The two big outlines

- **Local AutoChaos UiPath project** — Everything that lives in our project folder: boss, helpers, try-list, answer sheet, photos. Means: all our own files.
- **Local browser demo boundary** — Everything that lives inside the browser: test website, its notebook memory, picture board. Means: the demo world, no real company system.

## The arrows (how things flow)

1. **launch campaign** (You to try-list) — You press start and point at the list.
2. **read enabled rows** (Try-list to boss) — Boss reads only switched-on lines.
3. **initialize** (Boss to setup) — Boss asks the cleaner to get ready first.
4. **invoke per row** (Boss to one-try helper) — Boss hands over lines one at a time.
5. **run scenario** (One-try helper to screen worker) — One-try helper asks the screen worker to do the typing and clicking.
6. **UI Automation** (Screen worker to test website) — The screen worker operates the website like a person would.
7. **commit record** (Website to notebook memory) — If save works, the website writes one person in its notebook.
8. **capture screenshot** (Screen worker to photo folder) — After reading the answer, take a photo as proof.
9. **write live result** (One-try helper to answer sheet) — Save this try's row right now, so the board moves live.
10. **complete campaign** (One-try helper to closing helper, via boss) — After the last line, hand over to the tidier.
11. **write final CSV** (Closing helper to answer sheet) — Save the finished sheet one last time.
12. **poll results.csv** (Answer sheet to picture board, dotted line) — The board keeps re-reading the sheet every 5 seconds. Dotted means "just looking, not changing".

## The three story buttons in the picture

The drawing has 3 views that light up only part of the picture:

- **Campaign path** — Follow one switched-on line from the sheet, through the boss and helpers, to the website. Use this to answer "how does a try run?"
- **Fault and state** — Focus on screen worker, website, notebook memory, and photos. Use this to answer "where does the break change things and where is the proof?"
- **Reporting** — Follow one-try helper, closing helper, answer sheet, and picture board. Use this to answer "how do answers reach the board?"
