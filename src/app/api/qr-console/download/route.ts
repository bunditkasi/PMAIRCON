import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  runQrConsoleExport,
  type QrConsoleMode,
} from "../../../../lib/qr/export-console";

type DownloadAsset =
  | "branchPdf"
  | "branchZip"
  | "branchManifest"
  | "unitPdf"
  | "unitZip"
  | "unitManifest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset")?.trim() as DownloadAsset | null;

  if (!asset || !isDownloadAsset(asset)) {
    return NextResponse.json({ error: "Invalid asset" }, { status: 400 });
  }

  const branchCodes = String(searchParams.get("branchCodes") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const mode = asset.startsWith("branch") ? "branches" : "units";
  const zipOutputs = asset.endsWith("Zip") || asset.endsWith("Manifest");

  const result = await runQrConsoleExport({
    region: searchParams.get("region")?.trim() || "",
    branchCodes,
    mode,
    zipOutputs,
  });

  const filePath = resolveAssetPath(result, asset);

  if (!filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const content = await readFile(filePath);

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": getContentType(asset),
      "Content-Disposition": `attachment; filename="${getFileName(filePath)}"`,
    },
  });
}

function isDownloadAsset(value: string): value is DownloadAsset {
  return [
    "branchPdf",
    "branchZip",
    "branchManifest",
    "unitPdf",
    "unitZip",
    "unitManifest",
  ].includes(value);
}

function resolveAssetPath(
  result: Awaited<ReturnType<typeof runQrConsoleExport>>,
  asset: DownloadAsset,
) {
  switch (asset) {
    case "branchPdf":
      return result.assetSummary.branches?.pdfPath ?? null;
    case "branchZip":
      return result.assetSummary.branches?.zipPath ?? null;
    case "branchManifest":
      return result.assetSummary.branches?.manifestPath ?? null;
    case "unitPdf":
      return result.assetSummary.units?.pdfPath ?? null;
    case "unitZip":
      return result.assetSummary.units?.zipPath ?? null;
    case "unitManifest":
      return result.assetSummary.units?.manifestPath ?? null;
    default:
      return null;
  }
}

function getContentType(asset: DownloadAsset) {
  if (asset.endsWith("Pdf")) {
    return "application/pdf";
  }

  if (asset.endsWith("Zip")) {
    return "application/zip";
  }

  return "application/json";
}

function getFileName(filePath: string) {
  const segments = filePath.replaceAll("\\", "/").split("/");

  return segments[segments.length - 1] || "download";
}
