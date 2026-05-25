import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QrConsole } from "../../src/features/qr/qr-console";

describe("QrConsole", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits export filters and renders download links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            branchCount: 117,
            unitCount: 0,
            skippedBranchCount: 0,
            skippedUnitCount: 0,
            outputRoot: "C:/tmp/qr-console-downloads/test",
            downloads: {
              branchPdf: "/api/qr-console/download?file=branch.pdf",
              branchZip: "/api/qr-console/download?file=branch.zip",
              branchManifest: "/api/qr-console/download?file=branch.manifest.json",
              unitPdf: null,
              unitZip: null,
              unitManifest: null,
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    render(<QrConsole regions={["Central", "East"]} />);

    fireEvent.change(screen.getByLabelText("Region"), {
      target: { value: "East" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Generate QR export" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Output root: C:/tmp/qr-console-downloads/test")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Download branch PDF" })).toHaveAttribute(
      "href",
      "/api/qr-console/download?file=branch.pdf",
    );
    expect(screen.getByRole("link", { name: "Download branch ZIP" })).toHaveAttribute(
      "href",
      "/api/qr-console/download?file=branch.zip",
    );
  });
});
