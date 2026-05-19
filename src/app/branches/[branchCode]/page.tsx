import Link from "next/link";
import { notFound } from "next/navigation";

import { BranchDetail } from "../../../features/branches/branch-detail";
import {
  findBranchDetail,
  type BranchRecord,
  type BranchUnitRecord,
} from "../../../lib/services/branch-service";

interface BranchDetailPageProps {
  params: Promise<{
    branchCode: string;
  }>;
}

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const { branchCode } = await params;
  const detail = findBranchDetail(branchCode, {
    branches: branchFixtures,
    units: unitFixtures,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
        <BranchDetail detail={detail} />
      </div>
    </main>
  );
}

const branchFixtures: BranchRecord[] = [
  {
    branchCode: "BC01",
    outletName: "SAPS",
    supplierName: "Klangsub Engineer",
  },
  {
    branchCode: "BE01",
    outletName: "Ayutthaya",
    supplierName: "Cooling Partner",
  },
];

const unitFixtures: BranchUnitRecord[] = [
  { unitId: "BC01-CT-01", branchCode: "BC01" },
  { unitId: "BC01-CT-02", branchCode: "BC01" },
  { unitId: "BC01-CS-01", branchCode: "BC01" },
  { unitId: "BE01-AHU-01", branchCode: "BE01" },
];
