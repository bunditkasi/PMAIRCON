import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BranchPmForm } from "../../src/features/pm/branch-pm-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("BranchPmForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits branch PM once and renders saved counts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "saved",
        savedCount: 8,
        duplicateCount: 1,
        totalUnits: 9,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <BranchPmForm
        initialValues={{
          branchCode: "B007",
          unitCount: 9,
          serviceDate: "2026-05-26",
          technicianName: "",
          supplierName: "Nisa Really Cool",
          serviceStatus: "DONE",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Technician name"), {
      target: { value: "Somchai" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save branch PM" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Saved branch PM to Google Sheet")).toBeInTheDocument();
    expect(
      screen.getByText(/Saved 8 of 9 units\./i),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
