# QR Console Design

## Summary

Add a browser-accessible QR Console page that lets the team generate scoped QR export bundles without using the command line.

## Goals

- Provide a simple internal page for QR export generation.
- Reuse the existing QR export pipeline so the web page and CLI stay consistent.
- Allow users to export by:
  - region
  - branch-only
  - unit-only
  - both
- Return downloadable links for:
  - PDF sheets
  - ZIP bundles
  - manifest files

## Scope

- This page is open-access for now.
- A future login/role layer can restrict access later.
- The first version is optimized for scoped exports, not unbounded nationwide unit runs from the browser.

## UX behavior

- Add a new page: `/admin/qr-console`
- Provide a compact form with:
  - region selector
  - export mode selector
  - ZIP toggle
  - optional branch code input
- On submit:
  - show a loading state
  - generate the export on the server
  - show a result card with counts and download links
- Include guidance text that very large full-unit exports should still use the CLI flow.

## Server behavior

- Add an API route for QR export requests.
- Reuse the live sheet loader and QR export service layer.
- Write generated files into a server-local temporary export directory.
- Return structured metadata including:
  - counts
  - generated file paths
  - download tokens or route paths

## Download behavior

- Add a download route that serves generated files by relative export path.
- Restrict downloads to the export root directory only.
- Support PDF, ZIP, and manifest downloads.

## Testing

- API route tests for request validation and success responses.
- UI tests for the QR Console form and result rendering.
- Download route tests for safe path handling.
