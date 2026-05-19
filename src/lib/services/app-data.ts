import {
  detailBranchFixtures,
  detailPmFixtures,
  detailRepairFixtures,
  detailUnitFixtures,
} from "../fixtures/detail-fixtures";
import {
  fetchLiveSheetCollections,
  type LiveSheetCollections,
} from "../google/sheets-live";

export async function loadAppDataCollections(): Promise<LiveSheetCollections> {
  return (await fetchLiveSheetCollections()) ?? {
    branches: detailBranchFixtures,
    units: detailUnitFixtures,
    pmLogs: detailPmFixtures,
    repairLogs: detailRepairFixtures.map((log) => ({
      ...log,
      repairStatus: "IN_PROGRESS",
    })),
  };
}
