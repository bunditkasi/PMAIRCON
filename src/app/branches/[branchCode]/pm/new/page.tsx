import { notFound } from "next/navigation";

import { BranchPmForm } from "../../../../../features/pm/branch-pm-form";
import { AppShell } from "../../../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../../../lib/services/app-data";
import { findBranchDetail } from "../../../../../lib/services/branch-service";
import { PM_SERVICE_STATUS } from "../../../../../lib/validation/pm-schema";

interface NewBranchPmPageProps {
  params: Promise<{
    branchCode: string;
  }>;
}

export default async function NewBranchPmPage({
  params,
}: NewBranchPmPageProps) {
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
      backHref={`/branches/${detail.branch.branchCode}`}
      backLabel="Back to branch"
      description="Submit one preventive maintenance round for every unit in this branch."
      eyebrow="Branch PM"
      title={`PM for ${detail.branch.branchCode}`}
    >
      <BranchPmForm
        initialValues={{
          branchCode: detail.branch.branchCode,
          unitCount: detail.units.length,
          serviceDate: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Bangkok",
          }).format(new Date()),
          technicianName: "",
          supplierName: detail.branch.supplierName ?? "Klangsub Engineer",
          serviceStatus: PM_SERVICE_STATUS,
        }}
      />
    </AppShell>
  );
}
