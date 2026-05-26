import { createGoogleSheetLogWriter } from "../../../../lib/google/sheet-log-writer";
import { loadAppDataCollections } from "../../../../lib/services/app-data";
import { saveBranchPmLogs } from "../../../../lib/services/branch-pm-service";
import { savePmLog } from "../../../../lib/services/pm-service";
import { PM_SERVICE_STATUS } from "../../../../lib/validation/pm-schema";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const collections = await loadAppDataCollections();
    const unitIds = collections.units
      .filter((unit) => unit.branchCode === payload.branchCode)
      .map((unit) => unit.unitId);
    const writer = createGoogleSheetLogWriter();

    const result = await saveBranchPmLogs(
      {
        saveUnitPmLog: async (unitPayload) =>
          savePmLog(
            {
              findExistingPmLog: writer.findExistingPmLog,
              createPmLog: writer.appendPmLog,
              deletePmLog: writer.deletePmLog,
              updateUnitLatestPmDate: writer.updateUnitLatestPmDate,
            },
            unitPayload,
          ),
      },
      {
        branchCode: String(payload.branchCode ?? ""),
        unitIds,
        serviceDate: String(payload.serviceDate ?? ""),
        technicianName: String(payload.technicianName ?? ""),
        supplierName: String(payload.supplierName ?? ""),
        serviceStatus:
          String(payload.serviceStatus ?? PM_SERVICE_STATUS) === PM_SERVICE_STATUS
            ? PM_SERVICE_STATUS
            : PM_SERVICE_STATUS,
      },
    );

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save branch PM";

    return Response.json({ error: message }, { status: 400 });
  }
}
