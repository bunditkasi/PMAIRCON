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
    branches: detailBranchFixtures.map((branch) => ({
      ...branch,
      region: "",
      pmStartMonth: null,
      seniorName: branch.seniorName ?? "",
    })),
    units: detailUnitFixtures,
    pmLogs: detailPmFixtures.map((log) => ({
      ...log,
      serviceStatus: "DONE",
    })),
    repairLogs: detailRepairFixtures.map((log) => ({
      ...log,
      repairStatus: "IN_PROGRESS",
    })),
  };
}
