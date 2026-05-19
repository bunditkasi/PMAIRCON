import Link from "next/link";
import { notFound } from "next/navigation";

import { PmForm } from "../../../../../features/pm/pm-form";
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
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          href={`/units/${unit.unitId}`}
        >
          Back to unit
        </Link>
        <PmForm initialValues={initialValues} />
      </div>
    </main>
  );
}
