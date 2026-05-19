# PM QR Code

QR-based preventive maintenance and repair logging for branch air conditioners.
This MVP is designed for Google Sheet-backed operations with branch and unit QR
navigation, technician logging, and central monitoring.

## Features

- Google Sheet bootstrap for the core MVP tabs
- Branch QR and unit QR target generation
- Branch detail and unit detail pages
- PM logging and repair logging flows for technicians
- Replacement workflow placeholder for central team
- Central dashboard and health endpoint

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in the Google Sheet and Google Drive credentials
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://127.0.0.1:3000`

## Environment Variables

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_DRIVE_FOLDER_ID`
- `APP_BASE_URL`

## Useful Commands

- `npm run dev`
- `npm test`
- `npm run test:e2e`
- `npm run test:e2e:install`
- `npm run bootstrap:sheet`
- `npm run generate:qrs -- http://127.0.0.1:3000 BC01,BE01 BC01-CT-01,BC01-CS-01`

## QR and Google Sheet Workflow

1. Bootstrap the Google Sheet tab structure with `npm run bootstrap:sheet`
2. Import branch source data with `scripts/import-source-data.ts`
3. Generate branch and unit QR targets with `npm run generate:qrs`
4. Print QR stickers and link each QR to the matching branch or unit page

## Current Scope

This repo currently includes placeholder submit flows for PM, repair, and
replacement logging so the user journey can be tested end-to-end before Google
APIs are fully wired into writes.
