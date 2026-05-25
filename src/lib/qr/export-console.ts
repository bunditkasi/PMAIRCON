import { mkdir } from "node:fs/promises";
import path from "node:path";

import { fetchLiveSheetCollections } from "../google/sheets-live";
import {
  DEFAULT_QR_EXPORT_BASE_URL,
  executeQrExport,
  type QrExportExecutionResult,
} from "./export";

export type QrConsoleMode = "branches" | "units" | "both";

export interface QrConsoleRequest {
  region?: string;
  branchCodes?: string[];
  zipOutputs?: boolean;
  mode?: QrConsoleMode;
}

export interface QrConsoleResponse extends QrExportExecutionResult {
  outputRoot: string;
}

export const QR_CONSOLE_EXPORT_ROOT = path.resolve(
  process.cwd(),
  "tmp/qr-console-downloads",
);

export async function runQrConsoleExport(
  input: QrConsoleRequest,
  env: Record<string, string | undefined> = process.env,
): Promise<QrConsoleResponse> {
  const collections = await fetchLiveSheetCollections(env);

  if (!collections) {
    throw new Error(
      "Google Sheet credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID.",
    );
  }

  const safeRegion = input.region?.trim() ?? "";
  const mode = input.mode ?? "branches";
  const includeBranches = mode === "branches" || mode === "both";
  const includeUnits = mode === "units" || mode === "both";
  const outputRoot = path.join(
    QR_CONSOLE_EXPORT_ROOT,
    buildExportFolderName({
      branchCodes: input.branchCodes ?? [],
      mode,
      region: safeRegion,
    }),
  );

  await mkdir(outputRoot, { recursive: true });

  const result = await executeQrExport(collections, {
    appBaseUrl: env.APP_BASE_URL?.trim() || DEFAULT_QR_EXPORT_BASE_URL,
    outputRoot,
    branchCodes: input.branchCodes ?? [],
    regions: safeRegion ? [safeRegion] : [],
    includeBranches,
    includeUnits,
    zipOutputs: input.zipOutputs ?? true,
    manifestData: {
      region: safeRegion,
      branchCodes: input.branchCodes ?? [],
      mode,
      source: "qr-console",
    },
  });

  return {
    ...result,
    outputRoot,
  };
}

function buildExportFolderName(input: {
  region: string;
  mode: QrConsoleMode;
  branchCodes: string[];
}) {
  const now = new Date();
  const timestamp = [
    now.getFullYear().toString().padStart(4, "0"),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
    "-",
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join("");
  const regionPart = input.region
    ? input.region.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
    : "all-regions";
  const branchPart =
    input.branchCodes.length > 0
      ? `${input.branchCodes.slice(0, 3).join("-").toLowerCase()}${input.branchCodes.length > 3 ? "-more" : ""}`
      : "all-branches";

  return `${timestamp}-${input.mode}-${regionPart}-${branchPart}`;
}
