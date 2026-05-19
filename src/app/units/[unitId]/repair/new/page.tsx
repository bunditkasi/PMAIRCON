import Link from "next/link";
import { notFound } from "next/navigation";

import { RepairForm } from "../../../../../features/repairs/repair-form";
import { detailUnitFixtures } from "../../../../../lib/fixtures/detail-fixtures";
import type { SaveRepairLogInput } from "../../../../../lib/services/repair-service";

interface NewRepairPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function NewRepairPage({ params }: NewRepairPageProps) {
  const { unitId } = await params;
  const unit = detailUnitFixtures.find((item) => item.unitId === unitId);

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
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          href={`/units/${unit.unitId}`}
        >
          Back to unit
        </Link>
        <RepairForm initialValues={initialValues} />
      </div>
    </main>
  );
}
