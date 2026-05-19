import Link from "next/link";
import { notFound } from "next/navigation";

import { ReplacementForm } from "../../../../features/replacements/replacement-form";
import type { UnitId } from "../../../../lib/domain/types";
import { detailUnitFixtures } from "../../../../lib/fixtures/detail-fixtures";
import type { RecordReplacementInput } from "../../../../lib/services/replacement-service";

interface NewReplacementPageProps {
  searchParams: Promise<{
    oldUnitId?: string;
  }>;
}

export default async function NewReplacementPage({
  searchParams,
}: NewReplacementPageProps) {
  const { oldUnitId } = await searchParams;
  const fallbackUnit = detailUnitFixtures[0];
  const unit = oldUnitId
    ? detailUnitFixtures.find((item) => item.unitId === oldUnitId) ?? null
    : fallbackUnit;

  if (!unit) {
    notFound();
  }

  const initialValues: RecordReplacementInput = {
    oldUnitId: unit.unitId as UnitId,
    branchCode: unit.branchCode,
    decisionDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
    }).format(new Date()),
    reason: "",
    newUnitId: `${unit.unitId}R` as UnitId,
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
        <ReplacementForm initialValues={initialValues} />
      </div>
    </main>
  );
}
