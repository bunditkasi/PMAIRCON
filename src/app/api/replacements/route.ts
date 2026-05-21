import { createGoogleSheetLogWriter } from "../../../lib/google/sheet-log-writer";
import {
  recordReplacement,
  type RecordReplacementInput,
} from "../../../lib/services/replacement-service";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as RecordReplacementInput;
    const writer = createGoogleSheetLogWriter();
    const result = await recordReplacement(
      {
        createReplacementRecord: writer.appendReplacementRecord,
        deleteReplacementRecord: writer.deleteReplacementRecord,
        markUnitReplaced: writer.markUnitReplaced,
        createNewUnit: writer.createReplacementUnit,
        deleteNewUnit: writer.deleteReplacementUnit,
      },
      input,
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save replacement",
      },
      { status: 400 },
    );
  }
}
