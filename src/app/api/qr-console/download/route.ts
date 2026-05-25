import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { QR_CONSOLE_EXPORT_ROOT } from "../../../../lib/qr/export-console";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relativeFile = searchParams.get("file")?.trim();

  if (!relativeFile) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const resolvedPath = path.resolve(QR_CONSOLE_EXPORT_ROOT, relativeFile);
  const exportRoot = path.resolve(QR_CONSOLE_EXPORT_ROOT);

  if (!resolvedPath.startsWith(exportRoot)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    await access(resolvedPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const content = await readFile(resolvedPath);
  const fileName = path.basename(resolvedPath);

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": getContentType(resolvedPath),
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".zip":
      return "application/zip";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}
