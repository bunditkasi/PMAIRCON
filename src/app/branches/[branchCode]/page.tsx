import Link from "next/link";
import { notFound } from "next/navigation";

import { BranchDetail } from "../../../features/branches/branch-detail";
import {
  detailBranchFixtures,
  detailUnitFixtures,
} from "../../../lib/fixtures/detail-fixtures";
import {
  findBranchDetail,
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
    branches: detailBranchFixtures,
    units: detailUnitFixtures,
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
