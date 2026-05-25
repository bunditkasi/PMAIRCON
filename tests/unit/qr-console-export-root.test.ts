import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

describe("QR_CONSOLE_EXPORT_ROOT", () => {
  afterEach(() => {
    delete process.env.VERCEL;
    vi.resetModules();
  });

  it("uses the local tmp folder outside Vercel", async () => {
    delete process.env.VERCEL;
    vi.resetModules();

    const exportConsole = await import("../../src/lib/qr/export-console");

    expect(exportConsole.QR_CONSOLE_EXPORT_ROOT).toBe(
      path.resolve(process.cwd(), "tmp/qr-console-downloads"),
    );
  });

  it("uses the writable /tmp folder on Vercel", async () => {
    process.env.VERCEL = "1";
    vi.resetModules();

    const exportConsole = await import("../../src/lib/qr/export-console");

    expect(exportConsole.QR_CONSOLE_EXPORT_ROOT).toBe(
      path.resolve("/tmp/qr-console-downloads"),
    );
  });
});
