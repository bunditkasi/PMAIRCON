import { notFound } from "next/navigation";

import { RepairForm } from "../../../../../features/repairs/repair-form";
import { AppShell } from "../../../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../../../lib/services/app-data";
import type { SaveRepairLogInput } from "../../../../../lib/services/repair-service";

interface NewRepairPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function NewRepairPage({ params }: NewRepairPageProps) {
  const { unitId } = await params;
  const collections = await loadAppDataCollections();
  const unit = collections.units.find((item) => item.unitId === unitId);

  if (!unit) {
    notFound();
  }

  const initialValues: SaveRepairLogInput = {
    branchCode: unit.branchCode,
    unitId: unit.unitId,
    serviceDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
    }).format(new Date()),
    issueCategory: "OTHER",
    issueDetail: "",
    repairStatus: "PENDING",
  };

  return (
    <AppShell
      backHref={`/units/${unit.unitId}`}
      backLabel="Back to unit"
      description="Capture a repair issue in a focused, mobile-friendly workflow."
      eyebrow="Repair log"
      title={`Repair for ${unit.unitId}`}
    >
        <RepairForm initialValues={initialValues} />
    </AppShell>
  );
}
