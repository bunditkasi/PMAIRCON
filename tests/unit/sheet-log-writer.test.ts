import { describe, expect, it, vi } from "vitest";

import { createGoogleSheetLogWriter } from "../../src/lib/google/sheet-log-writer";

describe("createGoogleSheetLogWriter", () => {
  it("appends a PM log row and returns a rollback token with the created row index", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            updates: {
              updatedRange: "PM_Logs!A2:R2",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const writer = createGoogleSheetLogWriter({
      fetchImpl,
      getAccessToken: async () => "token-123",
      now: () => new Date("2026-05-21T01:02:03.000Z"),
      randomId: () => "PM-ROW-1",
      spreadsheetId: "sheet-123",
    });

    const result = await writer.appendPmLog({
      branchCode: "BC01",
      unitId: "BC01-CS-01",
      serviceDate: "2026-05-21",
      technicianName: "Somchai",
      supplierName: "Klangsub Engineer",
      serviceStatus: "DONE",
    });

    expect(result).toEqual({ rowIndex: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain(
      "/values/PM_Logs!A%3AR:append",
    );
  });

  it("updates latest PM date and updated_at on the matching unit row", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            values: [
              ["unit_id", "branch_code", "unit_no", "unit_type", "unit_label", "brand", "btu", "model", "serial_no", "install_date", "warranty_end_date", "status", "data_source", "unit_qr_url", "latest_pm_date", "latest_repair_date", "latest_issue_summary", "replacement_flag", "note", "created_at", "updated_at"],
              ["BC01-CS-01", "BC01", "01", "CS", "Cassette Type 01", "", "", "", "", "", "", "ACTIVE", "GENERATED_FROM_AGGREGATE", "https://pmaircon.vercel.app/units/BC01-CS-01", "", "", "", "N", "note", "2026-05-19T06:21:56.671Z", "2026-05-19T06:21:56.671Z"],
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ totalUpdatedCells: 2 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const writer = createGoogleSheetLogWriter({
      fetchImpl,
      getAccessToken: async () => "token-123",
      now: () => new Date("2026-05-21T01:02:03.000Z"),
      randomId: () => "ignored",
      spreadsheetId: "sheet-123",
    });

    await writer.updateUnitLatestPmDate("BC01-CS-01", "2026-05-21");

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const updateCallBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body));

    expect(updateCallBody.data).toEqual([
      {
        range: "Units!O2",
        values: [["2026-05-21"]],
      },
      {
        range: "Units!U2",
        values: [["2026-05-21T01:02:03.000Z"]],
      },
    ]);
  });

  it("appends a repair log row and returns a rollback token with the created row index", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            updates: {
              updatedRange: "Repair_Logs!A7:R7",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const writer = createGoogleSheetLogWriter({
      fetchImpl,
      getAccessToken: async () => "token-123",
      now: () => new Date("2026-05-21T01:02:03.000Z"),
      randomId: () => "REPAIR-ROW-1",
      spreadsheetId: "sheet-123",
    });

    const result = await writer.appendRepairLog({
      branchCode: "BC01",
      unitId: "BC01-CS-01",
      serviceDate: "2026-05-21",
      issueCategory: "WATER_LEAK",
      issueDetail: "Leak from ceiling cassette",
      repairStatus: "DONE",
    });

    expect(result).toEqual({ rowIndex: 7 });
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain(
      "/values/Repair_Logs!A%3AR:append",
    );
  });

  it("updates latest repair date, issue summary, and updated_at on the matching unit row", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            values: [
              ["unit_id", "branch_code", "unit_no", "unit_type", "unit_label", "brand", "btu", "model", "serial_no", "install_date", "warranty_end_date", "status", "data_source", "unit_qr_url", "latest_pm_date", "latest_repair_date", "latest_issue_summary", "replacement_flag", "note", "created_at", "updated_at"],
              ["BC01-CS-01", "BC01", "01", "CS", "Cassette Type 01", "", "", "", "", "", "", "ACTIVE", "GENERATED_FROM_AGGREGATE", "https://pmaircon.vercel.app/units/BC01-CS-01", "", "", "", "N", "note", "2026-05-19T06:21:56.671Z", "2026-05-19T06:21:56.671Z"],
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ totalUpdatedCells: 3 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const writer = createGoogleSheetLogWriter({
      fetchImpl,
      getAccessToken: async () => "token-123",
      now: () => new Date("2026-05-21T01:02:03.000Z"),
      randomId: () => "ignored",
      spreadsheetId: "sheet-123",
    });

    await writer.updateUnitLatestRepair("BC01-CS-01", "2026-05-21", "Leak from ceiling cassette");

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const updateCallBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body));

    expect(updateCallBody.data).toEqual([
      {
        range: "Units!P2",
        values: [["2026-05-21"]],
      },
      {
        range: "Units!Q2",
        values: [["Leak from ceiling cassette"]],
      },
      {
        range: "Units!U2",
        values: [["2026-05-21T01:02:03.000Z"]],
      },
    ]);
  });
});
