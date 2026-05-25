# QR Export Implementation Plan

1. Add QR export dependencies and ignore generated assets.
   - Add rendering libraries for QR PNG generation and PDF composition.
   - Ignore `output/qrs/` so generated assets do not pollute git state.

2. Extend live sheet mapping for export metadata.
   - Include `unitType` in live unit collections.
   - Keep the branch and unit metadata needed for QR labels.

3. Build reusable QR export services.
   - Create data shaping helpers for branch and unit export rows.
   - Create label formatting helpers.
   - Add selection filtering for:
     - all rows
     - selected branch codes
     - selected unit ids
     - branch-only and unit-only export modes

4. Implement asset rendering.
   - Generate PNG labels for branches and units.
   - Generate print-friendly PDF sheets for branches and units.
   - Write outputs into:
     - `output/qrs/branches`
     - `output/qrs/units`
     - `output/qrs/branch-qr-sheet.pdf`
     - `output/qrs/unit-qr-sheet.pdf`

5. Add a new CLI entrypoint.
   - Add `scripts/export-qrs.ts`.
   - Support flags for:
     - app base URL override
     - branch-only
     - unit-only
     - selected branch codes
     - selected unit ids
     - output directory override
   - Print a concise summary of generated files and skipped rows.

6. Add tests.
   - Cover export row shaping and filtering.
   - Cover label formatting.
   - Cover CLI argument selection behavior.

7. Verify end to end locally.
   - Run targeted tests.
   - Run `lint`, `tsc`, and `build`.
   - Run the export script against live sheet data and confirm output files are created.
