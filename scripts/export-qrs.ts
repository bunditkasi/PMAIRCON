import path from "node:path";
import { fileURLToPath } from "node:url";

import { fetchLiveSheetCollections } from "../src/lib/google/sheets-live";
import {
  buildQrExportRows,
  DEFAULT_QR_EXPORT_BASE_URL,
  exportQrAssets,
  filterBranchQrExportRows,
  filterUnitQrExportRows,
} from "../src/lib/qr/export";

export interface ExportQrCliOptions {
  appBaseUrl: string;
  branchCodes: string[];
  unitIds: string[];
  includeBranches: boolean;
  includeUnits: boolean;
  outputDir: string;
}

export function parseExportQrArgs(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env,
): ExportQrCliOptions {
  let appBaseUrl = env.APP_BASE_URL?.trim() || DEFAULT_QR_EXPORT_BASE_URL;
  let outputDir = path.resolve(process.cwd(), "output/qrs");
  let includeBranches = true;
  let includeUnits = true;
  let branchCodes: string[] = [];
  let unitIds: string[] = [];

  for (const arg of argv) {
    if (arg === "--branch-only") {
      includeBranches = true;
      includeUnits = false;
      continue;
    }

    if (arg === "--unit-only") {
      includeBranches = false;
      includeUnits = true;
      continue;
    }

    if (arg.startsWith("--app-base-url=")) {
      appBaseUrl = arg.slice("--app-base-url=".length).trim() || appBaseUrl;
      continue;
    }

    if (arg.startsWith("--output-dir=")) {
      const candidate = arg.slice("--output-dir=".length).trim();

      if (candidate) {
        outputDir = path.resolve(process.cwd(), candidate);
      }

      continue;
    }

    if (arg.startsWith("--branches=")) {
      branchCodes = splitArgList(arg.slice("--branches=".length));
      continue;
    }

    if (arg.startsWith("--units=")) {
      unitIds = splitArgList(arg.slice("--units=".length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    appBaseUrl,
    branchCodes,
    unitIds,
    includeBranches,
    includeUnits,
    outputDir,
  };
}

export async function main(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env,
) {
  const options = parseExportQrArgs(argv, env);
  const collections = await fetchLiveSheetCollections(env);

  if (!collections) {
    throw new Error(
      "Google Sheet credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID.",
    );
  }

  const exportRows = buildQrExportRows(collections, options.appBaseUrl);
  const branchRows = options.includeBranches
    ? filterBranchQrExportRows(exportRows.branchRows, options.branchCodes)
    : [];
  const unitRows = options.includeUnits
    ? filterUnitQrExportRows(exportRows.unitRows, {
        branchCodes: options.branchCodes,
        unitIds: options.unitIds,
      })
    : [];

  const assetSummary = await exportQrAssets({
    branchRows,
    unitRows,
    outputRoot: options.outputDir,
    includeBranches: options.includeBranches,
    includeUnits: options.includeUnits,
  });

  process.stdout.write(formatSummary({
    assetSummary,
    branchCount: branchRows.length,
    skippedBranchCount: exportRows.skippedBranchCount,
    skippedUnitCount: exportRows.skippedUnitCount,
    unitCount: unitRows.length,
  }));
}

export function formatSummary(input: {
  branchCount: number;
  unitCount: number;
  skippedBranchCount: number;
  skippedUnitCount: number;
  assetSummary: Awaited<ReturnType<typeof exportQrAssets>>;
}) {
  const lines = [
    "QR export complete",
    `Branch PNGs: ${input.assetSummary.branches?.pngCount ?? 0}`,
    `Unit PNGs: ${input.assetSummary.units?.pngCount ?? 0}`,
    `Branch PDF: ${input.assetSummary.branches?.pdfPath ?? "not generated"}`,
    `Unit PDF: ${input.assetSummary.units?.pdfPath ?? "not generated"}`,
    `Selected branches exported: ${input.branchCount}`,
    `Selected units exported: ${input.unitCount}`,
    `Skipped branch rows: ${input.skippedBranchCount}`,
    `Skipped unit rows: ${input.skippedUnitCount}`,
  ];

  return `${lines.join("\n")}\n`;
}

function splitArgList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const entryPath = process.argv[1];

if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
