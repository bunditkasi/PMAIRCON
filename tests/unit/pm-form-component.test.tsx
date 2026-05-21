import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PmForm } from "../../src/features/pm/pm-form";

describe("PmForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows fixed operational fields and success state after submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ latestPmDate: "2026-05-21" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <PmForm
        initialValues={{
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-21",
          technicianName: "",
          supplierName: "Klangsub Engineer",
          serviceStatus: "DONE",
        }}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Save PM" }));

    expect(screen.getByText("Branch code")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("PM saved")).toBeInTheDocument();
    });
  });
});
