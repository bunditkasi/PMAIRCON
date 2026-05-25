import { NextResponse } from "next/server";
import path from "node:path";

import {
  QR_CONSOLE_EXPORT_ROOT,
  runQrConsoleExport,
  type QrConsoleMode,
} from "../../../lib/qr/export-console";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      region?: string;
      branchCodes?: string;
      zipOutputs?: boolean;
      mode?: QrConsoleMode;
    };

    const mode = payload.mode ?? "branches";

    if (!["branches", "units", "both"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid export mode" },
        { status: 400 },
      );
    }

    const branchCodes = String(payload.branchCodes ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const result = await runQrConsoleExport({
      region: payload.region?.trim() || "",
      branchCodes,
      zipOutputs: payload.zipOutputs ?? true,
      mode,
    });

    return NextResponse.json({
      branchCount: result.branchCount,
      unitCount: result.unitCount,
      skippedBranchCount: result.skippedBranchCount,
      skippedUnitCount: result.skippedUnitCount,
      outputRoot: result.outputRoot,
      downloads: {
        branchPdf: toDownloadPath(result.assetSummary.branches?.pdfPath),
        branchZip: toDownloadPath(result.assetSummary.branches?.zipPath),
        branchManifest: toDownloadPath(result.assetSummary.branches?.manifestPath),
        unitPdf: toDownloadPath(result.assetSummary.units?.pdfPath),
        unitZip: toDownloadPath(result.assetSummary.units?.zipPath),
        unitManifest: toDownloadPath(result.assetSummary.units?.manifestPath),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate QR export",
      },
      { status: 500 },
    );
  }
}

function toDownloadPath(filePath: string | null | undefined) {
  if (!filePath) {
    return null;
  }

  const relativePath = path
    .relative(QR_CONSOLE_EXPORT_ROOT, filePath)
    .split(path.sep)
    .join("/");

  return `/api/qr-console/download?file=${encodeURIComponent(relativePath)}`;
}
