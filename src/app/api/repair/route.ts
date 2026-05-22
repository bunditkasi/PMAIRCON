import { createGoogleSheetLogWriter } from "../../../lib/google/sheet-log-writer";
import { saveRepairLog } from "../../../lib/services/repair-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const writer = createGoogleSheetLogWriter();
    const result = await saveRepairLog(
      {
        findExistingRepairLog: writer.findExistingRepairLog,
        createRepairLog: writer.appendRepairLog,
        deleteRepairLog: writer.deleteRepairLog,
        updateUnitLatestIssueSummary: (
          unitId,
          serviceDate,
          summary,
        ) => writer.updateUnitLatestRepair(unitId, serviceDate, summary),
      },
      payload,
    );

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save repair log";

    return Response.json({ error: message }, { status: 400 });
  }
}
