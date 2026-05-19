import Link from "next/link";
import { notFound } from "next/navigation";

import { PmForm } from "../../../../../features/pm/pm-form";
import {
  detailBranchFixtures,
  detailUnitFixtures,
} from "../../../../../lib/fixtures/detail-fixtures";
import type { SavePmLogInput } from "../../../../../lib/services/pm-service";
import { pmSchema } from "../../../../../lib/validation/pm-schema";

interface NewPmPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function NewPmPage({ params }: NewPmPageProps) {
  const { unitId } = await params;
  const unit = detailUnitFixtures.find((item) => item.unitId === unitId);

  if (!unit) {
    notFound();
  }

  const branch =
    detailBranchFixtures.find((item) => item.branchCode === unit.branchCode) ??
    null;

  const initialValues: SavePmLogInput = pmSchema.parse({
    branchCode: unit.branchCode,
    unitId: unit.unitId,
    serviceDate: "2026-05-18",
    technicianName: "Somchai",
    supplierName: branch?.supplierName ?? "Klangsub Engineer",
    serviceStatus: "DONE",
  });

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
