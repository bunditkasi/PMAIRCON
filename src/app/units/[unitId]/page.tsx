import Link from "next/link";
import { notFound } from "next/navigation";

import { UnitDetail } from "../../../features/units/unit-detail";
import { detailUnitFixtures } from "../../../lib/fixtures/detail-fixtures";
import {
  findUnitDetail,
  type UnitPmRecord,
  type UnitRepairRecord,
} from "../../../lib/services/unit-service";

interface UnitDetailPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { unitId } = await params;
  const detail = findUnitDetail(unitId, {
    units: detailUnitFixtures,
    pmLogs: pmFixtures,
    repairLogs: repairFixtures,
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

const pmFixtures: UnitPmRecord[] = [
  { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
  { unitId: "BC01-CT-01", serviceDate: "2026-05-01" },
  { unitId: "BC01-CT-02", serviceDate: "2026-04-15" },
];

const repairFixtures: UnitRepairRecord[] = [
  {
    unitId: "BC01-CT-01",
    serviceDate: "2026-03-01",
    issueDetail: "water leak",
  },
  {
    unitId: "BC01-CT-01",
    serviceDate: "2026-04-20",
    issueDetail: "fan noise",
  },
];
