# QR Console Implementation Plan

1. Extend QR export services for web consumption.
   - Add helpers for export root resolution.
   - Add response shaping that returns relative file paths and counts.

2. Add QR Console API route.
   - Validate region, mode, ZIP toggle, and optional branch code inputs.
   - Run scoped export generation server-side.
   - Return download metadata for generated assets.

3. Add secure download route.
   - Serve files from the export root only.
   - Reject path traversal or missing file requests.

4. Build the QR Console page and form.
   - Add `/admin/qr-console`.
   - Provide a region selector, export mode selector, ZIP toggle, and branch input.
   - Show loading and result states.

5. Add navigation entry.
   - Link the console from the home page.

6. Add tests.
   - API route tests
   - download route tests
   - QR Console component tests

7. Verify end to end.
   - Run targeted tests.
   - Run lint, tsc, and build.
   - Generate at least one live scoped export and confirm download files exist.
