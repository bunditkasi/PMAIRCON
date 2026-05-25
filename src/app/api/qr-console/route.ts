import { NextResponse } from "next/server";

import {
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
        branchPdf:
          result.assetSummary.branches?.pdfPath
            ? buildDownloadPath({
                asset: "branchPdf",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
        branchZip:
          result.assetSummary.branches?.zipPath
            ? buildDownloadPath({
                asset: "branchZip",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
        branchManifest:
          result.assetSummary.branches?.manifestPath
            ? buildDownloadPath({
                asset: "branchManifest",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
        unitPdf:
          result.assetSummary.units?.pdfPath
            ? buildDownloadPath({
                asset: "unitPdf",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
        unitZip:
          result.assetSummary.units?.zipPath
            ? buildDownloadPath({
                asset: "unitZip",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
        unitManifest:
          result.assetSummary.units?.manifestPath
            ? buildDownloadPath({
                asset: "unitManifest",
                region: payload.region?.trim() || "",
                branchCodes,
              })
            : null,
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

function buildDownloadPath(input: {
  asset:
    | "branchPdf"
    | "branchZip"
    | "branchManifest"
    | "unitPdf"
    | "unitZip"
    | "unitManifest";
  region: string;
  branchCodes: string[];
}) {
  const params = new URLSearchParams({
    asset: input.asset,
  });

  if (input.region) {
    params.set("region", input.region);
  }

  if (input.branchCodes.length > 0) {
    params.set("branchCodes", input.branchCodes.join(","));
  }

  return `/api/qr-console/download?${params.toString()}`;
}
