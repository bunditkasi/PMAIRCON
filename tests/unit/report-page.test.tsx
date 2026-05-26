import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReportPage from "../../src/app/report/page";

vi.mock("../../src/lib/services/app-data", () => ({
  loadAppDataCollections: vi.fn(async () => ({
    branches: [
      {
        branchCode: "BKK-01",
        outletName: "Bangkok Central",
        supplierName: "Supplier A",
        seniorName: "Senior A",
        fullStoreName: "Store A",
        state: "Bangkok",
        startBusinessDate: "2020-01-01",
        mapUrl: "",
        region: "Central",
        pmStartMonth: 1,
      },
      {
        branchCode: "CNX-01",
        outletName: "Chiang Mai North",
        supplierName: "Supplier B",
        seniorName: "Senior B",
        fullStoreName: "Store B",
        state: "Chiang Mai",
        startBusinessDate: "2020-02-01",
        mapUrl: "",
        region: "North",
        pmStartMonth: 2,
      },
    ],
    units: [
      { unitId: "BKK-01-CUR-01", branchCode: "BKK-01" },
      { unitId: "BKK-01-CT-01", branchCode: "BKK-01" },
      { unitId: "CNX-01-CS-01", branchCode: "CNX-01" },
    ],
    pmLogs: [
      {
        unitId: "BKK-01-CUR-01",
        serviceDate: "2026-05-10",
        serviceStatus: "DONE",
      },
    ],
    repairLogs: [
      {
        unitId: "CNX-01-CS-01",
        serviceDate: "2026-05-12",
        issueDetail: "Water leak",
        repairStatus: "IN_PROGRESS",
      },
    ],
  })),
}));

describe("ReportPage", () => {
  it("renders filter controls and report sections", async () => {
    const page = await ReportPage({
      searchParams: Promise.resolve({ year: "2026", month: "5", region: "Central" }),
    });

    render(page);

    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByLabelText("Month")).toBeInTheDocument();
    expect(screen.getByLabelText("Cycle")).toBeInTheDocument();
    expect(screen.getByText("Overdue units")).toBeInTheDocument();
    expect(screen.getByText("% PM success by supplier")).toBeInTheDocument();
    expect(screen.getByText("Branches needing PM attention")).toBeInTheDocument();
    expect(screen.getByText("Units needing PM attention")).toBeInTheDocument();
  });
});
