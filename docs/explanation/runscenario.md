# One Try, Kept Safe (Internal)

File: `Workflows/RunScenario.xaml`. Handles exactly one line from the try-list. Keeps problems inside this try so the whole run never stops early.

## Reading the line

- **Read scenario id** — Copy the short code like CHAOS-001.
- **Read scenario name** — Copy the friendly name like Unexpected popup.
- **Read fault mode** — Copy which break to turn on.
- **Read expected behavior** — Copy what we hope will happen.
- **Read employee id** — Copy the ID to type.
- **Read employee name** — Copy the name to type.
- **Read department** — Copy the department to type.
- **Read notes** — Copy our reminder note.

## Getting ready

- **Build target URL** — Make the web address with the break and try number in it, and ask the site to clear itself.
- **Build evidence path** — Decide the photo file name for this try (run name + try number + guess at outcome).
- **Set records before** — Start the before-count at 0 (list was just cleared).
- **Start timer** — Remember the start time to measure how long it takes.
- **Initialize visible success** — Assume "no happy message yet".
- **Initialize records after** — Assume "0 people saved" until proven otherwise.
- **Initialize exception type** — Clear any old crash name.
- **Initialize exception message** — Clear any old crash words.
- **Initialize status** — Clear the last screen words.

## Doing it safely

- **Isolate scenario execution** — A safety box: problems inside stay inside.
- **Process employee** — Ask the screen helper to actually fill the form and press save.
- **Catch scenario exception** — If the screen helper crashed, come here instead of stopping everything.
- **Capture exception type** — Write down what kind of crash it was.
- **Capture exception message** — Write down the crash words.
- **Log scenario exception** — Write the crash in the diary with the try number.

## Deciding the mark

- **Calculate duration** — Work out end time minus start time.
- **Default classification** — Start by assuming the worst: dangerous fail.
- **Default verdict** — Start by assuming FAIL.
- **Default integrity** — Start by assuming the list is wrong.
- **Classify successful transaction** — Check: happy message shown, list grew from 0 to 1, and no crash?
- **Set actual success** — If yes and it was a normal day, mark SUCCESS; if there was a break, mark RECOVERED_SUCCESS.
- **Set success verdict** — If yes, change the mark to PASS.
- **Set success integrity** — If yes, change list-cleanliness to PASS.
- **Check safe failure / Classify safe failure** — If not a success, check: did we expect a safe give-up, is there no happy message, is the list still 0, and is there some screen words or a crash?
- **Set safe failure** — If yes, mark SAFE_FAIL.
- **Set safe failure verdict** — If yes, mark PASS (giving up correctly is good).
- **Set safe failure integrity** — If yes, mark the list as PASS (nothing extra was saved).
- **Unsafe failure classification** — If neither box matched, keep the worst marks (dangerous fail).

## Saving the answer

- **Append scenario result** — Add this try as one new line in the memory table.
- **Write live results** — Save the whole table to the result sheet right now, so the picture board updates.
- **Log scenario result** — Write "CHAOS-001 means RECOVERED_SUCCESS / PASS" in the diary.
