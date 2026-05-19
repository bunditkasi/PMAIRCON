import { fileURLToPath } from "node:url";

import { buildBranchQrTarget } from "../src/app/api/qr/branch/[branchCode]/route";
import { buildUnitQrTarget } from "../src/app/api/qr/unit/[unitId]/route";

export interface GenerateQrRow {
  id: string;
  targetUrl: string;
  type: "branch" | "unit";
}

export function generateQrRows(
  appBaseUrl: string,
  branchCodes: string[],
  unitIds: string[],
): GenerateQrRow[] {
  return [
    ...branchCodes.map((branchCode) => ({
      id: branchCode,
      targetUrl: buildBranchQrTarget(appBaseUrl, branchCode),
      type: "branch" as const,
    })),
    ...unitIds.map((unitId) => ({
      id: unitId,
      targetUrl: buildUnitQrTarget(appBaseUrl, unitId),
      type: "unit" as const,
    })),
  ];
}

export async function main(argv: string[] = process.argv.slice(2)) {
  const [appBaseUrl, branchCodesArg = "", unitIdsArg = ""] = argv;

  if (!appBaseUrl) {
    throw new Error(
      "Usage: generate-qrs <app-base-url> [branch-codes-comma-separated] [unit-ids-comma-separated]",
    );
  }

  const branchCodes = branchCodesArg
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const unitIds = unitIdsArg
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  process.stdout.write(
    `${JSON.stringify(generateQrRows(appBaseUrl, branchCodes, unitIds), null, 2)}\n`,
  );
}

const entryPath = process.argv[1];

if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
