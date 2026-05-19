import {
  mapSourceRowsToBranches,
  type ImportedBranch,
  type SourceRow,
} from "../src/lib/services/seed-import-service";
import { fileURLToPath } from "node:url";

import * as XLSX from "xlsx";

export function normalizeSourceRows(rows: SourceRow[]): ImportedBranch[] {
  return mapSourceRowsToBranches(rows);
}

export interface ImportSourceOptions {
  worksheetName?: string;
}

export async function importBranchesFromExcel(
  workbookPath: string,
  options: ImportSourceOptions = {},
): Promise<ImportedBranch[]> {
  const workbook = XLSX.readFile(workbookPath);
  const worksheetName = options.worksheetName ?? workbook.SheetNames[0];

  if (!worksheetName) {
    throw new Error(`No worksheets found in workbook: ${workbookPath}`);
  }

  const worksheet = workbook.Sheets[worksheetName];

  if (!worksheet) {
    throw new Error(`Worksheet not found: ${worksheetName}`);
  }

  const rows = XLSX.utils.sheet_to_json<SourceRow>(worksheet, {
    defval: "",
    raw: true,
  });

  return normalizeSourceRows(rows);
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const [workbookPath, worksheetName] = argv;

  if (!workbookPath) {
    throw new Error("Usage: import-source-data <workbook-path> [worksheet-name]");
  }

  const branches = await importBranchesFromExcel(workbookPath, { worksheetName });

  process.stdout.write(`${JSON.stringify(branches, null, 2)}\n`);
}

const entryPath = process.argv[1];

if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
