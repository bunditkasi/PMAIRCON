import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RepairForm } from "../../src/features/repairs/repair-form";

describe("RepairForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders locked success state after submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            latestIssueSummary: "Leak from ceiling cassette",
            status: "saved",
          }),
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
      expect(screen.getByText("Saved to Google Sheet")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Back to unit" })).toHaveAttribute(
      "href",
      "/units/BC01-CS-01",
    );
  });

  it("shows a duplicate-safe message when the repair record already exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            latestIssueSummary: "Leak from ceiling cassette",
            status: "duplicate",
          }),
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

    await waitFor(() => {
      expect(
        screen.getByText("This repair record was already saved"),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  });
});
