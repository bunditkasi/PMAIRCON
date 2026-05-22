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
      { unitId: "BKK-01-CUR-01", branchCode: "BKK-01" },
      { unitId: "BKK-01-CT-01", branchCode: "BKK-01" },
      { unitId: "BKK-01-CT-02", branchCode: "BKK-01" },
      { unitId: "CNX-01-CS-01", branchCode: "CNX-01" },
    ],
    pmLogs: [
      {
        unitId: "BKK-01-CUR-01",
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
    expect(screen.getByText("Branch List")).toBeInTheDocument();
    expect(screen.getByText("MR.D.I.Y Maintenance team")).toBeInTheDocument();
    expect(
      screen.queryByText("Bundit Kasicheewin (Know)"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BKK-01" })).toBeInTheDocument();
    expect(screen.getByText("CT = 2")).toBeInTheDocument();
    expect(screen.getByText("CUR = 1")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "CNX-01" }),
    ).not.toBeInTheDocument();
  });

  it("canonicalizes case-mismatched region params and ignores unknown regions", async () => {
    const filteredPage = await DashboardPage({
      searchParams: Promise.resolve({ region: "central" }),
    });

    const rendered = render(filteredPage);

    expect(
      screen.getByText("Showing branches in Central"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BKK-01" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "CNX-01" }),
    ).not.toBeInTheDocument();

    rendered.unmount();

    const unfilteredPage = await DashboardPage({
      searchParams: Promise.resolve({ region: "Unknown" }),
    });

    render(unfilteredPage);

    expect(
      screen.queryByText("Showing branches in Unknown"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BKK-01" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CNX-01" })).toBeInTheDocument();
    expect(screen.getByText("CS = 1")).toBeInTheDocument();
  });
});
