# QR Export Design

## Summary

Add a script-first QR export pipeline that reads live branch and unit data, then produces both printable PDF sheets and PNG assets for operational rollout.

## Goals

- Export QR codes for both branches and units from the current master data.
- Produce output in two formats:
  - `PNG` files for reuse in other layouts or messaging
  - `PDF` sheets for direct printing
- Keep labels minimal and operationally useful:
  - Branch QR: `branch_code` + `outlet_name`
  - Unit QR: `unit_id` + `unit_type` + `branch_code`
- Support exporting:
  - all branches and units
  - selected branch codes
  - selected unit ids

## Recommended approach

- Implement the first version as a local export script.
- Reuse the existing Google Sheet access pattern and QR target builders.
- Generate files into a predictable local output structure.
- Keep the QR generation logic reusable so a future admin UI can call the same export layer later.

## Output structure

- `output/qrs/branches/*.png`
- `output/qrs/units/*.png`
- `output/qrs/branch-qr-sheet.pdf`
- `output/qrs/unit-qr-sheet.pdf`

Each PNG should contain:
- the QR image
- the identifier label
- the supporting text label

Each PDF should lay out multiple QR labels per page in a print-friendly grid.

## Data rules

- Branch export source:
  - `branch_code`
  - `outlet_name`
- Unit export source:
  - `unit_id`
  - `unit_type`
  - `branch_code`
- Skip rows that do not have the minimum required fields for their export type.
- Use the production app base URL by default unless an explicit override is passed in.

## CLI behavior

The export command should support:
- exporting all branch and unit QR codes
- exporting only selected branch codes
- exporting only selected unit ids
- exporting only branch QR codes or only unit QR codes
- exporting by `region`
- packaging exported assets into ZIP files for handoff

The command should print a short summary at the end, including:
- how many branch PNGs were generated
- how many unit PNGs were generated
- the PDF file paths
- the ZIP file paths
- any skipped rows

## Region and packaging behavior

- Region filtering should use the `region` field from the `Branches` sheet.
- Region selection should filter:
  - branch QR rows directly
  - unit QR rows through their parent branch membership
- If `--regions` is combined with `--branches`, the result should be the intersection of both filters.
- After export, the script should optionally create:
  - `branch-qrs.zip`
  - `unit-qrs.zip`
- Each ZIP should contain:
  - PNG files
  - the matching PDF sheet when generated
  - a `manifest.json` file with export metadata

## Technical shape

- Keep `scripts/generate-qrs.ts` focused on URL row generation.
- Add a new export script for rendering QR assets and PDF sheets.
- Use a small reusable service layer for:
  - loading exportable branch/unit rows
  - rendering QR images
  - composing PDF pages

## Testing

- Unit tests for export row shaping and filtering.
- Unit tests for label formatting.
- Script-level tests for branch/unit selection logic.
- One smoke-path verification that confirms the script writes expected output files locally.
