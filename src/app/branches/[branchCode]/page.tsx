import { notFound } from "next/navigation";

import { BranchDetail } from "../../../features/branches/branch-detail";
import { AppShell } from "../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../lib/services/app-data";
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
  const collections = await loadAppDataCollections();
  const detail = findBranchDetail(branchCode, {
    branches: collections.branches,
    units: collections.units,
  });

  if (!detail) {
    notFound();
  }

  return (
    <AppShell
      backHref="/dashboard"
      backLabel="Back to dashboard"
      description="Review branch identity and move quickly into unit-level maintenance records."
      eyebrow="Branch record"
      title={detail.branch.branchCode}
    >
        <BranchDetail detail={detail} />
    </AppShell>
  );
}
