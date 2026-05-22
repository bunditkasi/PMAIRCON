import { createGoogleSheetLogWriter } from "../../../lib/google/sheet-log-writer";
import { savePmLog } from "../../../lib/services/pm-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const writer = createGoogleSheetLogWriter();
    const result = await savePmLog(
      {
        findExistingPmLog: writer.findExistingPmLog,
        createPmLog: writer.appendPmLog,
        deletePmLog: writer.deletePmLog,
        updateUnitLatestPmDate: writer.updateUnitLatestPmDate,
      },
      payload,
    );

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save PM log";

    return Response.json({ error: message }, { status: 400 });
  }
}
