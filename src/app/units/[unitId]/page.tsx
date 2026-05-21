import { notFound } from "next/navigation";

import { UnitDetail } from "../../../features/units/unit-detail";
import { AppShell } from "../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../lib/services/app-data";
import { findUnitDetail } from "../../../lib/services/unit-service";

interface UnitDetailPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { unitId } = await params;
  const collections = await loadAppDataCollections();
  const branchPmStartMonthByCode = new Map(
    collections.branches.map((branch) => [
      branch.branchCode,
      branch.pmStartMonth ?? undefined,
    ]),
  );
  const detail = findUnitDetail(unitId, {
    units: collections.units.map((unit) => ({
      ...unit,
      pmStartMonth: branchPmStartMonthByCode.get(unit.branchCode),
    })),
    pmLogs: collections.pmLogs,
    repairLogs: collections.repairLogs,
  });

  if (!detail) {
    notFound();
  }

  return (
    <AppShell
      backHref={`/branches/${detail.unit.branchCode}`}
      backLabel="Back to branch"
      description="Review the latest preventive maintenance and repair activity for this unit."
      eyebrow="Unit record"
      title={detail.unit.unitId}
    >
        <UnitDetail detail={detail} />
    </AppShell>
  );
}
