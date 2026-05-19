import { fileURLToPath } from "node:url";

export const requiredSheetTabs = [
  "Branches",
  "Units",
  "PM_Logs",
  "Repair_Logs",
  "Replacement_History",
  "Lookup",
] as const;

export async function main(): Promise<void> {
  process.stdout.write(`${JSON.stringify(requiredSheetTabs, null, 2)}\n`);
}

const entryPath = process.argv[1];

if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
