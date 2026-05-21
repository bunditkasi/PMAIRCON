import { notFound } from "next/navigation";

import { PmForm } from "../../../../../features/pm/pm-form";
import { AppShell } from "../../../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../../../lib/services/app-data";
import type { SavePmLogInput } from "../../../../../lib/services/pm-service";
import { PM_SERVICE_STATUS } from "../../../../../lib/validation/pm-schema";

interface NewPmPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function NewPmPage({ params }: NewPmPageProps) {
  const { unitId } = await params;
  const collections = await loadAppDataCollections();
  const unit = collections.units.find((item) => item.unitId === unitId);

  if (!unit) {
    notFound();
  }

  const branch =
    collections.branches.find((item) => item.branchCode === unit.branchCode) ??
    null;

  const initialValues: SavePmLogInput = {
    branchCode: unit.branchCode,
    unitId: unit.unitId,
    serviceDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
    }).format(new Date()),
    technicianName: "",
    supplierName: branch?.supplierName ?? "Klangsub Engineer",
    serviceStatus: PM_SERVICE_STATUS,
  };

  return (
    <AppShell
      backHref={`/units/${unit.unitId}`}
      backLabel="Back to unit"
      description="Capture a preventive maintenance record in a calm, operational workflow."
      eyebrow="PM log"
      title={`PM for ${unit.unitId}`}
    >
        <PmForm initialValues={initialValues} />
    </AppShell>
  );
}
