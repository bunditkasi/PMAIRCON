import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PmForm } from "../../src/features/pm/pm-form";

describe("PmForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows locked success state after submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ latestPmDate: "2026-05-21", status: "saved" }), {
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
      expect(screen.getByText("Saved to Google Sheet")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Back to unit" })).toHaveAttribute(
      "href",
      "/units/BC01-CS-01",
    );
  });

  it("shows a duplicate-safe message when the PM record already exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ latestPmDate: "2026-05-21", status: "duplicate" }), {
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

    await waitFor(() => {
      expect(
        screen.getByText("This PM record was already saved"),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  });
});
