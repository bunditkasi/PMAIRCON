import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardPage from "../../src/app/dashboard/page";

vi.mock("../../src/lib/services/app-data", () => ({
  loadAppDataCollections: vi.fn(async () => ({
    branches: [
      {
        branchCode: "BKK-01",
        outletName: "Bangkok Central",
        supplierName: "Supplier A",
        region: "Central",
        pmStartMonth: 1,
      },
      {
        branchCode: "CNX-01",
        outletName: "Chiang Mai North",
        supplierName: "Supplier B",
        region: "North",
        pmStartMonth: 2,
      },
    ],
    units: [
      { unitId: "BKK-01-01", branchCode: "BKK-01" },
      { unitId: "CNX-01-01", branchCode: "CNX-01" },
    ],
    pmLogs: [
      {
        unitId: "BKK-01-01",
        serviceDate: "2026-05-10",
        serviceStatus: "DONE",
      },
    ],
    repairLogs: [],
  })),
}));

describe("DashboardPage", () => {
  it("shows active region copy and filters the branch directory from search params", async () => {
    const page = await DashboardPage({
      searchParams: Promise.resolve({ region: "Central" }),
    });

    render(page);

    expect(
      screen.getByText("Showing branches in Central"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BKK-01" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "CNX-01" }),
    ).not.toBeInTheDocument();
  });
});
