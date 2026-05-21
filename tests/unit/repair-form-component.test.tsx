import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RepairForm } from "../../src/features/repairs/repair-form";

describe("RepairForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders issue detail textarea and success state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ latestIssueSummary: "Leak from ceiling cassette" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    render(
      <RepairForm
        initialValues={{
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-21",
          issueCategory: "OTHER",
          issueDetail: "",
          repairStatus: "PENDING",
        }}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Save repair" }));

    expect(
      screen.getByPlaceholderText("Describe the issue found"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Repair saved")).toBeInTheDocument();
    });
  });
});
