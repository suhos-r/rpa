# Filling the Form on Screen (Internal)

File: `Workflows/ProcessEmployee.xaml`. The only helper that touches the website. Opens the page, types, presses save, reads back what happened, takes a photo.

## Starting fresh

- **Initialize success state** — Assume "no happy message" at the start.
- **Initialize record count** — Assume "0 people saved" at the start.
- **TODO Indicate — ACME Employee Portal** — Open and hold the browser tab for the test site.

## Opening the page

- **TODO Indicate — Navigate to portal** — Go to the web address made for this try (includes which break to turn on).
- **Wait for portal fault rendering** — Pause 1.5 seconds so the break has time to appear.

## The surprise message

- **TODO Indicate — Check and close chaos popup** — Look to see if a pop-up box is covering the screen.
- **TODO Indicate — Close popup** — If the box is there, press DISMISS NOTICE.
- **No popup / Popup exists** — Just the two paths: box was there or it was not.

## Typing the person

- **TODO Indicate — Employee ID input** — Click the ID box, clear it, type the ID.
- **TODO Indicate — Employee name input** — Click the name box, clear it, type the name.
- **TODO Indicate — Department input** — Click the department box, clear it, type the department.

## Pressing save

- **Check submit button availability** — Look to see if the save button can be pressed.
- **Click submit button** — If it can, press it (waits up to 30 seconds if needed).
- **Wait for submit response** — Pause 1.5 seconds for the site to answer.
- **Wait for slow submit response** — Ask: is this the slow try?
- **Wait for portal commit** — If slow, pause 3.5 more seconds so the late save can finish.
- **No slow submit wait** — If not slow, do nothing extra.
- **Record missing submit** — If the button was gone, write down "Submit button missing".

## Reading back the answer

- **TODO Indicate — Read status banner** — Copy the small status words (like Employee created, Response lost, Ready).
- **TODO Indicate — Read record count** — Copy the number showing how many people are saved.
- **TODO Indicate — Verify success banner** — Look for the green happy message.
- **Mark success** — If the green message is there, remember "yes, happy message seen".
- **Mark failure** — If it is not there, remember "no happy message".
- **Publish success evidence** — Hand the yes/no answer back.
- **Publish status text** — Hand the status words back.
- **Publish record count** — Turn the saved-people text into a number and hand it back.
- **TODO Indicate — Capture scenario evidence** — Take a photo of the screen and save it under the planned file name.
