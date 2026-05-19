import Link from "next/link";
import { notFound } from "next/navigation";

import { UnitDetail } from "../../../features/units/unit-detail";
import {
  detailPmFixtures,
  detailRepairFixtures,
  detailUnitFixtures,
} from "../../../lib/fixtures/detail-fixtures";
import { findUnitDetail } from "../../../lib/services/unit-service";

interface UnitDetailPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { unitId } = await params;
  const detail = findUnitDetail(unitId, {
    units: detailUnitFixtures,
    pmLogs: detailPmFixtures,
    repairLogs: detailRepairFixtures,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          href={`/branches/${detail.unit.branchCode}`}
        >
          Back to branch
        </Link>
        <UnitDetail detail={detail} />
      </div>
    </main>
  );
}
