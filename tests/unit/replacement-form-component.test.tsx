import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReplacementForm } from "../../src/features/replacements/replacement-form";

describe("ReplacementForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits the replacement flow and shows success state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ oldUnitStatus: "REPLACED" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <ReplacementForm
        initialValues={{
          branchCode: "BC01",
          oldUnitId: "BC01-CS-01",
          decisionDate: "2026-05-21",
          reason: "",
          newUnitId: "BC01-CS-01R",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "repair not economical" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Save replacement" }));

    await waitFor(() => {
      expect(screen.getByText("Replacement saved")).toBeInTheDocument();
    });
  });
});
