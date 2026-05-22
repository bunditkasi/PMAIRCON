# PM and Repair Anti-Double-Submit Design

## Summary

Prevent duplicate PM and Repair submissions by improving both the form UX and the API save behavior.

## Goals

- Stop users from double-clicking `Save PM` and `Save repair` because the page feels uncertain.
- Show a clear success state after save.
- Treat duplicate submissions as safe outcomes instead of appending duplicate rows.
- Apply the same behavior to both PM and Repair pages.

## UX behavior

- When submit starts, disable the whole form and show `Saving...`.
- When save succeeds, show a clear success banner and change the primary button to `Saved`.
- Keep the form disabled after success for that page session.
- Show a secondary `Back to unit` action after success.
- If the API reports a duplicate submission, show a non-error success-style message such as `This record was already saved`.

## Server behavior

- PM duplicate rule:
  - `unitId`
  - `serviceDate`
  - `technicianName`
  - `serviceStatus`
- Repair duplicate rule:
  - `unitId`
  - `serviceDate`
  - `issueDetail`
  - `repairStatus`
- Before append, the system should check the relevant Google Sheet log for an existing matching row.
- If a match exists, skip append and skip summary update, then return a duplicate-safe response.

## Response model

- PM returns:
  - `status: "saved" | "duplicate"`
  - `latestPmDate`
- Repair returns:
  - `status: "saved" | "duplicate"`
  - `latestIssueSummary`

## Testing

- Service tests for duplicate detection behavior.
- API route tests for duplicate-safe responses.
- Form tests for:
  - disabling while saving
  - success banner after save
  - duplicate banner without error styling
  - locked form after success
