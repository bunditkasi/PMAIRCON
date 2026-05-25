import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { QR_CONSOLE_EXPORT_ROOT } from "../../src/lib/qr/export-console";
import { GET } from "../../src/app/api/qr-console/download/route";

describe("GET /api/qr-console/download", () => {
  afterEach(async () => {
    await rm(QR_CONSOLE_EXPORT_ROOT, { recursive: true, force: true });
  });

  it("serves a generated file from the export root", async () => {
    const filePath = path.join(QR_CONSOLE_EXPORT_ROOT, "sample", "test.json");

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, '{"ok":true}', "utf8");

    const response = await GET(
      new Request(
        "http://localhost/api/qr-console/download?file=sample%2Ftest.json",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("rejects path traversal attempts", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/qr-console/download?file=..%2F..%2Fsecret.txt",
      ),
    );

    expect(response.status).toBe(400);
  });
});
