# Air Conditioner PM System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MVP web application for branch and unit QR flows, PM logging, repair logging, central monitoring, and Google Sheet-backed master data for the air-conditioner maintenance operation.

**Architecture:** Use a Next.js App Router application as the web layer, with server actions and route handlers wrapping a storage service that reads and writes structured Google Sheets. Keep the domain model isolated from storage details so the system can later move from Google Sheet to a database without rewriting UI flows.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, Zod, Google Sheets API, Google Drive API, QR code library, Vitest, Testing Library, Playwright

---

## File Structure

The project starts from an empty workspace, so the implementation should create a clean file structure with clear boundaries.

- `package.json`
  - Project scripts and dependencies
- `tsconfig.json`
  - TypeScript configuration
- `next.config.ts`
  - Next.js configuration
- `postcss.config.mjs`
  - Tailwind/PostCSS integration
- `tailwind.config.ts`
  - Tailwind theme config
- `src/app/layout.tsx`
  - Root layout
- `src/app/page.tsx`
  - Landing page with links into dashboard/search
- `src/app/dashboard/page.tsx`
  - Central dashboard
- `src/app/branches/[branchCode]/page.tsx`
  - Branch detail page
- `src/app/units/[unitId]/page.tsx`
  - Unit detail page
- `src/app/units/[unitId]/pm/new/page.tsx`
  - PM submission page
- `src/app/units/[unitId]/repair/new/page.tsx`
  - Repair submission page
- `src/app/admin/replacements/new/page.tsx`
  - Central replacement submission page
- `src/app/api/health/route.ts`
  - Health check endpoint
- `src/app/api/qr/branch/[branchCode]/route.ts`
  - Branch QR image generator
- `src/app/api/qr/unit/[unitId]/route.ts`
  - Unit QR image generator
- `src/components/`
  - Shared UI pieces
- `src/features/dashboard/`
  - Dashboard widgets and selectors
- `src/features/branches/`
  - Branch view logic
- `src/features/units/`
  - Unit view logic
- `src/features/pm/`
  - PM form schema and actions
- `src/features/repairs/`
  - Repair form schema and actions
- `src/features/replacements/`
  - Replacement form schema and actions
- `src/lib/env.ts`
  - Environment variable parsing
- `src/lib/google/auth.ts`
  - Google auth client setup
- `src/lib/google/sheets.ts`
  - Low-level Google Sheets helpers
- `src/lib/google/drive.ts`
  - Low-level Google Drive helpers
- `src/lib/domain/types.ts`
  - Shared domain types
- `src/lib/domain/lookups.ts`
  - Lookup constants and helpers
- `src/lib/domain/ids.ts`
  - ID generation for branch, unit, logs, replacements
- `src/lib/domain/units.ts`
  - Generated unit rules from aggregate source data
- `src/lib/storage/types.ts`
  - Storage interface abstractions
- `src/lib/storage/google-sheet-store.ts`
  - Google Sheet-backed store implementation
- `src/lib/storage/memory-store.ts`
  - Test-only in-memory store
- `src/lib/services/dashboard-service.ts`
  - Dashboard aggregation logic
- `src/lib/services/branch-service.ts`
  - Branch query logic
- `src/lib/services/unit-service.ts`
  - Unit query logic
- `src/lib/services/pm-service.ts`
  - PM write/update logic
- `src/lib/services/repair-service.ts`
  - Repair write/update logic
- `src/lib/services/replacement-service.ts`
  - Replacement write/update logic
- `src/lib/services/seed-import-service.ts`
  - Import source spreadsheet and generate units
- `src/lib/validation/`
  - Zod schemas
- `scripts/bootstrap-google-sheet.ts`
  - Create headers for all required tabs
- `scripts/import-source-data.ts`
  - Import Excel/source sheet rows into normalized tabs
- `scripts/generate-qrs.ts`
  - Export QR image files or URLs
- `tests/unit/`
  - Domain and service tests
- `tests/e2e/`
  - Playwright flows

## Task 1: Scaffold the application shell

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `tests/unit/app-shell.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../../src/app/page";

describe("HomePage", () => {
  it("renders links for dashboard and branch lookup", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /air conditioner pm system/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /find branch/i })).toHaveAttribute("href", "/dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/app-shell.test.ts`
Expected: FAIL because project files and test runner config do not exist yet

- [ ] **Step 3: Write minimal implementation**

```json
{
  "name": "pm-qrcode",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

```tsx
// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Air Conditioner PM System</h1>
      <p>QR-based preventive maintenance and repair logging.</p>
      <nav>
        <Link href="/dashboard">Open Dashboard</Link>
        <Link href="/dashboard">Find Branch</Link>
      </nav>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/app-shell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts src/app tests/unit/app-shell.test.ts
git commit -m "feat: scaffold nextjs app shell"
```

## Task 2: Add environment parsing and Google client bootstrapping

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/google/auth.ts`
- Create: `src/lib/google/sheets.ts`
- Create: `src/lib/google/drive.ts`
- Test: `tests/unit/env.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/lib/env";

describe("loadEnv", () => {
  it("returns parsed required Google settings", () => {
    const env = loadEnv({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "bot@example.com",
      GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
      GOOGLE_SHEET_ID: "sheet-id",
      GOOGLE_DRIVE_FOLDER_ID: "drive-folder-id",
      APP_BASE_URL: "https://pm.example.com"
    });

    expect(env.googleSheetId).toBe("sheet-id");
    expect(env.appBaseUrl).toBe("https://pm.example.com");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/env.test.ts`
Expected: FAIL because `loadEnv` does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SHEET_ID: z.string().min(1),
  GOOGLE_DRIVE_FOLDER_ID: z.string().min(1),
  APP_BASE_URL: z.string().url()
});

export function loadEnv(input: Record<string, string | undefined>) {
  const parsed = envSchema.parse(input);

  return {
    googleServiceAccountEmail: parsed.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: parsed.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    googleSheetId: parsed.GOOGLE_SHEET_ID,
    googleDriveFolderId: parsed.GOOGLE_DRIVE_FOLDER_ID,
    appBaseUrl: parsed.APP_BASE_URL
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/env.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/env.ts src/lib/google tests/unit/env.test.ts
git commit -m "feat: add google environment bootstrap"
```

## Task 3: Define domain types, lookups, and ID generation

**Files:**
- Create: `src/lib/domain/types.ts`
- Create: `src/lib/domain/lookups.ts`
- Create: `src/lib/domain/ids.ts`
- Test: `tests/unit/domain-ids.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildUnitId, buildQuarterYear } from "../../src/lib/domain/ids";

describe("domain ids", () => {
  it("builds unit ids with zero-padded unit numbers", () => {
    expect(buildUnitId("BC01", "CT", 1)).toBe("BC01-CT-01");
    expect(buildUnitId("BC01", "CS", 12)).toBe("BC01-CS-12");
  });

  it("maps month to quarter label", () => {
    expect(buildQuarterYear(new Date("2026-02-15"))).toBe("2026-Q1");
    expect(buildQuarterYear(new Date("2026-10-15"))).toBe("2026-Q4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/domain-ids.test.ts`
Expected: FAIL because domain helpers do not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export type UnitType = "CUR" | "AHU" | "CT" | "CS";

export function buildUnitId(branchCode: string, unitType: UnitType, unitNumber: number) {
  return `${branchCode}-${unitType}-${String(unitNumber).padStart(2, "0")}`;
}

export function buildQuarterYear(value: Date) {
  const quarter = Math.floor(value.getMonth() / 3) + 1;
  return `${value.getFullYear()}-Q${quarter}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/domain-ids.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain tests/unit/domain-ids.test.ts
git commit -m "feat: add domain ids and lookup types"
```

## Task 4: Implement aggregate-to-unit generation rules

**Files:**
- Create: `src/lib/domain/units.ts`
- Test: `tests/unit/unit-generation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { generateUnitsForBranch } from "../../src/lib/domain/units";

describe("generateUnitsForBranch", () => {
  it("expands aggregate counts into unit rows", () => {
    const result = generateUnitsForBranch({
      branchCode: "BC01",
      curtainCount: 2,
      ahuCount: 1,
      ceilingTypeCount: 2,
      cassetteTypeCount: 1
    });

    expect(result.map((unit) => unit.unitId)).toEqual([
      "BC01-CUR-01",
      "BC01-CUR-02",
      "BC01-AHU-01",
      "BC01-CT-01",
      "BC01-CT-02",
      "BC01-CS-01"
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/unit-generation.test.ts`
Expected: FAIL because generation logic does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
import { buildUnitId, type UnitType } from "./ids";

type Input = {
  branchCode: string;
  curtainCount: number;
  ahuCount: number;
  ceilingTypeCount: number;
  cassetteTypeCount: number;
};

function createUnits(branchCode: string, unitType: UnitType, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    unitId: buildUnitId(branchCode, unitType, index + 1),
    branchCode,
    unitType,
    unitNo: index + 1,
    dataSource: "GENERATED_FROM_AGGREGATE" as const
  }));
}

export function generateUnitsForBranch(input: Input) {
  return [
    ...createUnits(input.branchCode, "CUR", input.curtainCount),
    ...createUnits(input.branchCode, "AHU", input.ahuCount),
    ...createUnits(input.branchCode, "CT", input.ceilingTypeCount),
    ...createUnits(input.branchCode, "CS", input.cassetteTypeCount)
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/unit-generation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain/units.ts tests/unit/unit-generation.test.ts
git commit -m "feat: add generated unit expansion rules"
```

## Task 5: Define storage interface and in-memory implementation

**Files:**
- Create: `src/lib/storage/types.ts`
- Create: `src/lib/storage/memory-store.ts`
- Test: `tests/unit/memory-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../../src/lib/storage/memory-store";

describe("memory store", () => {
  it("persists branches, units, pm logs, and repair logs in memory", async () => {
    const store = createMemoryStore();

    await store.saveBranch({ branchCode: "BC01", outletName: "SAPS" });
    await store.saveUnit({ unitId: "BC01-CT-01", branchCode: "BC01" });

    expect(await store.getBranchByCode("BC01")).toMatchObject({ outletName: "SAPS" });
    expect(await store.getUnitById("BC01-CT-01")).toMatchObject({ branchCode: "BC01" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/memory-store.test.ts`
Expected: FAIL because storage abstraction does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export interface StorageStore {
  saveBranch(branch: { branchCode: string; outletName: string }): Promise<void>;
  saveUnit(unit: { unitId: string; branchCode: string }): Promise<void>;
  getBranchByCode(branchCode: string): Promise<{ branchCode: string; outletName: string } | null>;
  getUnitById(unitId: string): Promise<{ unitId: string; branchCode: string } | null>;
}

export function createMemoryStore(): StorageStore {
  const branches = new Map<string, { branchCode: string; outletName: string }>();
  const units = new Map<string, { unitId: string; branchCode: string }>();

  return {
    async saveBranch(branch) {
      branches.set(branch.branchCode, branch);
    },
    async saveUnit(unit) {
      units.set(unit.unitId, unit);
    },
    async getBranchByCode(branchCode) {
      return branches.get(branchCode) ?? null;
    },
    async getUnitById(unitId) {
      return units.get(unitId) ?? null;
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/memory-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage tests/unit/memory-store.test.ts
git commit -m "feat: add storage abstraction and memory store"
```

## Task 6: Implement Google Sheet storage adapter

**Files:**
- Create: `src/lib/storage/google-sheet-store.ts`
- Test: `tests/unit/google-sheet-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { createGoogleSheetStore } from "../../src/lib/storage/google-sheet-store";

describe("google sheet store", () => {
  it("maps branch writes to the Branches tab", async () => {
    const appendRow = vi.fn().mockResolvedValue(undefined);
    const store = createGoogleSheetStore({ appendRow } as never);

    await store.saveBranch({ branchCode: "BC01", outletName: "SAPS" });

    expect(appendRow).toHaveBeenCalledWith("Branches", expect.arrayContaining(["BC01", "SAPS"]));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/google-sheet-store.test.ts`
Expected: FAIL because Google Sheet store does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
type SheetsGateway = {
  appendRow: (sheetName: string, values: string[]) => Promise<void>;
};

export function createGoogleSheetStore(gateway: SheetsGateway) {
  return {
    async saveBranch(branch: { branchCode: string; outletName: string }) {
      await gateway.appendRow("Branches", [branch.branchCode, branch.outletName]);
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/google-sheet-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/google-sheet-store.ts tests/unit/google-sheet-store.test.ts
git commit -m "feat: add google sheet storage adapter"
```

## Task 7: Build import service for source Excel and sheet data

**Files:**
- Create: `src/lib/services/seed-import-service.ts`
- Create: `scripts/import-source-data.ts`
- Test: `tests/unit/seed-import-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mapSourceRowToBranch } from "../../src/lib/services/seed-import-service";

describe("mapSourceRowToBranch", () => {
  it("normalizes source branch fields", () => {
    const branch = mapSourceRowToBranch({
      Code: "BC01",
      "Outlet Name": "SAPS",
      "Code-Name": "BC01 SAPS",
      State: "Saraburi",
      Region: "Central",
      Senior: "Apisit Neerawong",
      Suplier: "Klangsub Engineer",
      Month: 3,
      Curtain: 0,
      AHU: 0,
      "Ceiling Type": 6,
      "cassette type": 0
    });

    expect(branch.branchCode).toBe("BC01");
    expect(branch.pmStartMonth).toBe(3);
    expect(branch.ceilingTypeCount).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/seed-import-service.test.ts`
Expected: FAIL because mapping service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export function mapSourceRowToBranch(row: Record<string, string | number | null | undefined>) {
  return {
    branchCode: String(row.Code ?? ""),
    outletName: String(row["Outlet Name"] ?? ""),
    codeName: String(row["Code-Name"] ?? ""),
    state: String(row.State ?? ""),
    region: String(row.Region ?? ""),
    seniorName: String(row.Senior ?? ""),
    supplierName: String(row.Suplier ?? ""),
    pmStartMonth: Number(row.Month ?? 0),
    curtainCount: Number(row.Curtain ?? 0),
    ahuCount: Number(row.AHU ?? 0),
    ceilingTypeCount: Number(row["Ceiling Type"] ?? 0),
    cassetteTypeCount: Number(row["cassette type"] ?? 0)
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/seed-import-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/seed-import-service.ts scripts/import-source-data.ts tests/unit/seed-import-service.test.ts
git commit -m "feat: add source import normalization service"
```

## Task 8: Build dashboard aggregation service

**Files:**
- Create: `src/lib/services/dashboard-service.ts`
- Create: `src/features/dashboard/summary-cards.tsx`
- Test: `tests/unit/dashboard-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { summarizeDashboard } from "../../src/lib/services/dashboard-service";

describe("summarizeDashboard", () => {
  it("counts due PM and open repairs", () => {
    const result = summarizeDashboard({
      branches: [{ branchCode: "BC01" }, { branchCode: "BE01" }],
      units: [{ unitId: "BC01-CT-01" }, { unitId: "BE01-CT-01" }],
      pmLogs: [{ unitId: "BC01-CT-01", serviceDate: "2026-01-10" }],
      repairLogs: [{ unitId: "BE01-CT-01", repairStatus: "IN_PROGRESS" }]
    });

    expect(result.totalBranches).toBe(2);
    expect(result.totalUnits).toBe(2);
    expect(result.openRepairs).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/dashboard-service.test.ts`
Expected: FAIL because dashboard service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export function summarizeDashboard(input: {
  branches: Array<{ branchCode: string }>;
  units: Array<{ unitId: string }>;
  pmLogs: Array<{ unitId: string; serviceDate: string }>;
  repairLogs: Array<{ unitId: string; repairStatus: string }>;
}) {
  return {
    totalBranches: input.branches.length,
    totalUnits: input.units.length,
    pmLoggedUnits: new Set(input.pmLogs.map((item) => item.unitId)).size,
    openRepairs: input.repairLogs.filter((item) => item.repairStatus !== "DONE").length
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/dashboard-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/dashboard-service.ts src/features/dashboard/summary-cards.tsx tests/unit/dashboard-service.test.ts
git commit -m "feat: add dashboard summary service"
```

## Task 9: Build branch query service and branch detail page

**Files:**
- Create: `src/lib/services/branch-service.ts`
- Create: `src/app/branches/[branchCode]/page.tsx`
- Create: `src/features/branches/branch-detail.tsx`
- Test: `tests/unit/branch-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { assembleBranchDetail } from "../../src/lib/services/branch-service";

describe("assembleBranchDetail", () => {
  it("returns branch info and related units", () => {
    const detail = assembleBranchDetail(
      { branchCode: "BC01", outletName: "SAPS", supplierName: "Klangsub Engineer" },
      [{ unitId: "BC01-CT-01", branchCode: "BC01" }, { unitId: "BE01-CT-01", branchCode: "BE01" }]
    );

    expect(detail.branch.branchCode).toBe("BC01");
    expect(detail.units).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/branch-service.test.ts`
Expected: FAIL because branch service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export function assembleBranchDetail(
  branch: { branchCode: string; outletName: string; supplierName?: string },
  units: Array<{ unitId: string; branchCode: string }>
) {
  return {
    branch,
    units: units.filter((unit) => unit.branchCode === branch.branchCode)
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/branch-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/branch-service.ts src/app/branches/[branchCode]/page.tsx src/features/branches/branch-detail.tsx tests/unit/branch-service.test.ts
git commit -m "feat: add branch detail flow"
```

## Task 10: Build unit query service and unit detail page

**Files:**
- Create: `src/lib/services/unit-service.ts`
- Create: `src/app/units/[unitId]/page.tsx`
- Create: `src/features/units/unit-detail.tsx`
- Test: `tests/unit/unit-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { assembleUnitDetail } from "../../src/lib/services/unit-service";

describe("assembleUnitDetail", () => {
  it("collects the latest pm and repair entries for a unit", () => {
    const detail = assembleUnitDetail(
      { unitId: "BC01-CT-01", branchCode: "BC01" },
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-01-01" },
        { unitId: "BC01-CT-01", serviceDate: "2026-05-01" }
      ],
      [
        { unitId: "BC01-CT-01", serviceDate: "2026-03-01", issueDetail: "water leak" }
      ]
    );

    expect(detail.latestPm?.serviceDate).toBe("2026-05-01");
    expect(detail.latestRepair?.issueDetail).toBe("water leak");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/unit-service.test.ts`
Expected: FAIL because unit service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export function assembleUnitDetail(
  unit: { unitId: string; branchCode: string },
  pmLogs: Array<{ unitId: string; serviceDate: string }>,
  repairLogs: Array<{ unitId: string; serviceDate: string; issueDetail: string }>
) {
  const pmForUnit = pmLogs.filter((item) => item.unitId === unit.unitId).sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
  const repairForUnit = repairLogs.filter((item) => item.unitId === unit.unitId).sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));

  return {
    unit,
    latestPm: pmForUnit[0] ?? null,
    latestRepair: repairForUnit[0] ?? null,
    pmHistory: pmForUnit,
    repairHistory: repairForUnit
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/unit-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/unit-service.ts src/app/units/[unitId]/page.tsx src/features/units/unit-detail.tsx tests/unit/unit-service.test.ts
git commit -m "feat: add unit detail flow"
```

## Task 11: Add PM validation, form page, and write service

**Files:**
- Create: `src/lib/validation/pm-schema.ts`
- Create: `src/lib/services/pm-service.ts`
- Create: `src/app/units/[unitId]/pm/new/page.tsx`
- Create: `src/features/pm/pm-form.tsx`
- Test: `tests/unit/pm-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { savePmLog } from "../../src/lib/services/pm-service";

describe("savePmLog", () => {
  it("writes a pm log and returns latest pm date", async () => {
    const writes: unknown[] = [];

    const result = await savePmLog(
      {
        createPmLog: async (payload) => {
          writes.push(payload);
        },
        updateUnitLatestPmDate: async () => {}
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        technicianName: "Somchai",
        supplierName: "Klangsub Engineer",
        serviceStatus: "DONE"
      }
    );

    expect(writes).toHaveLength(1);
    expect(result.latestPmDate).toBe("2026-05-18");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/pm-service.test.ts`
Expected: FAIL because PM service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export async function savePmLog(
  deps: {
    createPmLog: (payload: Record<string, unknown>) => Promise<void>;
    updateUnitLatestPmDate: (unitId: string, serviceDate: string) => Promise<void>;
  },
  input: {
    branchCode: string;
    unitId: string;
    serviceDate: string;
    technicianName: string;
    supplierName: string;
    serviceStatus: string;
  }
) {
  await deps.createPmLog(input);
  await deps.updateUnitLatestPmDate(input.unitId, input.serviceDate);

  return { latestPmDate: input.serviceDate };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/pm-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/pm-schema.ts src/lib/services/pm-service.ts src/app/units/[unitId]/pm/new/page.tsx src/features/pm/pm-form.tsx tests/unit/pm-service.test.ts
git commit -m "feat: add pm logging flow"
```

## Task 12: Add repair validation, form page, and write service

**Files:**
- Create: `src/lib/validation/repair-schema.ts`
- Create: `src/lib/services/repair-service.ts`
- Create: `src/app/units/[unitId]/repair/new/page.tsx`
- Create: `src/features/repairs/repair-form.tsx`
- Test: `tests/unit/repair-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { saveRepairLog } from "../../src/lib/services/repair-service";

describe("saveRepairLog", () => {
  it("writes a repair log and updates the latest issue summary", async () => {
    const writes: unknown[] = [];

    const result = await saveRepairLog(
      {
        createRepairLog: async (payload) => {
          writes.push(payload);
        },
        updateUnitLatestRepair: async () => {}
      },
      {
        branchCode: "BC01",
        unitId: "BC01-CT-01",
        serviceDate: "2026-05-18",
        issueCategory: "WATER_LEAK",
        issueDetail: "leak from indoor unit",
        repairStatus: "DONE"
      }
    );

    expect(writes).toHaveLength(1);
    expect(result.latestIssueSummary).toBe("leak from indoor unit");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/repair-service.test.ts`
Expected: FAIL because repair service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export async function saveRepairLog(
  deps: {
    createRepairLog: (payload: Record<string, unknown>) => Promise<void>;
    updateUnitLatestRepair: (unitId: string, serviceDate: string, summary: string) => Promise<void>;
  },
  input: {
    branchCode: string;
    unitId: string;
    serviceDate: string;
    issueCategory: string;
    issueDetail: string;
    repairStatus: string;
  }
) {
  await deps.createRepairLog(input);
  await deps.updateUnitLatestRepair(input.unitId, input.serviceDate, input.issueDetail);

  return {
    latestRepairDate: input.serviceDate,
    latestIssueSummary: input.issueDetail
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/repair-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/repair-schema.ts src/lib/services/repair-service.ts src/app/units/[unitId]/repair/new/page.tsx src/features/repairs/repair-form.tsx tests/unit/repair-service.test.ts
git commit -m "feat: add repair logging flow"
```

## Task 13: Add replacement workflow for central team

**Files:**
- Create: `src/lib/validation/replacement-schema.ts`
- Create: `src/lib/services/replacement-service.ts`
- Create: `src/app/admin/replacements/new/page.tsx`
- Create: `src/features/replacements/replacement-form.tsx`
- Test: `tests/unit/replacement-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { recordReplacement } from "../../src/lib/services/replacement-service";

describe("recordReplacement", () => {
  it("records the replacement and marks the old unit as replaced", async () => {
    const writes: unknown[] = [];

    const result = await recordReplacement(
      {
        createReplacementRecord: async (payload) => {
          writes.push(payload);
        },
        markUnitReplaced: async () => {},
        createNewUnit: async () => {}
      },
      {
        oldUnitId: "BC01-CT-01",
        branchCode: "BC01",
        decisionDate: "2026-05-18",
        reason: "repair not economical",
        newUnitId: "BC01-CT-01R"
      }
    );

    expect(writes).toHaveLength(1);
    expect(result.oldUnitStatus).toBe("REPLACED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/replacement-service.test.ts`
Expected: FAIL because replacement service does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export async function recordReplacement(
  deps: {
    createReplacementRecord: (payload: Record<string, unknown>) => Promise<void>;
    markUnitReplaced: (oldUnitId: string) => Promise<void>;
    createNewUnit: (payload: Record<string, unknown>) => Promise<void>;
  },
  input: {
    oldUnitId: string;
    branchCode: string;
    decisionDate: string;
    reason: string;
    newUnitId: string;
  }
) {
  await deps.createReplacementRecord(input);
  await deps.markUnitReplaced(input.oldUnitId);
  await deps.createNewUnit({ branchCode: input.branchCode, unitId: input.newUnitId });

  return { oldUnitStatus: "REPLACED" as const };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/replacement-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/replacement-schema.ts src/lib/services/replacement-service.ts src/app/admin/replacements/new/page.tsx src/features/replacements/replacement-form.tsx tests/unit/replacement-service.test.ts
git commit -m "feat: add replacement workflow"
```

## Task 14: Add QR generation endpoints

**Files:**
- Create: `src/app/api/qr/branch/[branchCode]/route.ts`
- Create: `src/app/api/qr/unit/[unitId]/route.ts`
- Create: `scripts/generate-qrs.ts`
- Test: `tests/unit/qr-route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildUnitQrTarget } from "../../src/app/api/qr/unit/[unitId]/route";

describe("buildUnitQrTarget", () => {
  it("builds a unit URL from the configured base url", () => {
    expect(buildUnitQrTarget("https://pm.example.com", "BC01-CT-01")).toBe(
      "https://pm.example.com/units/BC01-CT-01"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/qr-route.test.ts`
Expected: FAIL because QR route helper does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildUnitQrTarget(appBaseUrl: string, unitId: string) {
  return `${appBaseUrl}/units/${unitId}`;
}

export function buildBranchQrTarget(appBaseUrl: string, branchCode: string) {
  return `${appBaseUrl}/branches/${branchCode}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/qr-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/qr scripts/generate-qrs.ts tests/unit/qr-route.test.ts
git commit -m "feat: add qr target generation"
```

## Task 15: Add dashboard page wiring and health endpoint

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/api/health/route.ts`
- Test: `tests/unit/health-route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/health/route";

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload.status).toBe("ok");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/health-route.test.ts`
Expected: FAIL because health route does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export async function GET() {
  return Response.json({ status: "ok" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/health-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/api/health/route.ts tests/unit/health-route.test.ts
git commit -m "feat: add dashboard page and health route"
```

## Task 16: Create Google Sheet bootstrap script

**Files:**
- Create: `scripts/bootstrap-google-sheet.ts`
- Test: `tests/unit/bootstrap-google-sheet.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { requiredSheetTabs } from "../../scripts/bootstrap-google-sheet";

describe("requiredSheetTabs", () => {
  it("lists all required tabs for the MVP", () => {
    expect(requiredSheetTabs).toEqual([
      "Branches",
      "Units",
      "PM_Logs",
      "Repair_Logs",
      "Replacement_History",
      "Lookup"
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/bootstrap-google-sheet.test.ts`
Expected: FAIL because bootstrap script does not exist

- [ ] **Step 3: Write minimal implementation**

```ts
export const requiredSheetTabs = [
  "Branches",
  "Units",
  "PM_Logs",
  "Repair_Logs",
  "Replacement_History",
  "Lookup"
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/bootstrap-google-sheet.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/bootstrap-google-sheet.ts tests/unit/bootstrap-google-sheet.test.ts
git commit -m "feat: add google sheet bootstrap script"
```

## Task 17: Add end-to-end coverage for core technician flows

**Files:**
- Create: `tests/e2e/technician-pm.spec.ts`
- Create: `tests/e2e/technician-repair.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("technician can open a unit page and submit PM", async ({ page }) => {
  await page.goto("/units/BC01-CT-01");
  await page.getByRole("link", { name: /submit pm/i }).click();
  await page.getByLabel(/service date/i).fill("2026-05-18");
  await page.getByLabel(/technician name/i).fill("Somchai");
  await page.getByRole("button", { name: /save pm/i }).click();
  await expect(page.getByText(/pm saved/i)).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- --grep "submit PM"`
Expected: FAIL because pages and forms are not fully wired yet

- [ ] **Step 3: Write minimal implementation**

```tsx
// Example success state to add to PM and repair submission flows
{isSuccess ? <p>PM saved</p> : null}
```

```tsx
// Add visible "Submit PM" and "Submit Repair" links on unit detail page
<Link href={`/units/${unitId}/pm/new`}>Submit PM</Link>
<Link href={`/units/${unitId}/repair/new`}>Submit Repair</Link>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- --grep "submit PM|submit repair"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/e2e playwright.config.ts src/app src/features
git commit -m "test: add technician end-to-end flows"
```

## Task 18: Final verification and deployment readiness

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("project docs", () => {
  it("includes setup instructions for the MVP", () => {
    const readme = fs.readFileSync("README.md", "utf8");
    expect(readme).toMatch(/google sheet/i);
    expect(readme).toMatch(/qr/i);
    expect(readme).toMatch(/npm run dev/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/project-docs.test.ts`
Expected: FAIL because project documentation does not exist yet

- [ ] **Step 3: Write minimal implementation**

```md
# PM QR Code

## Setup

1. Copy `.env.example` to `.env.local`
2. Configure Google Sheet and Drive credentials
3. Run `npm install`
4. Run `npm run dev`

## Features

- Branch and unit QR navigation
- PM logging
- Repair logging
- Central dashboard
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/project-docs.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md .env.example package.json tests/unit/project-docs.test.ts
git commit -m "docs: add setup and deployment guidance"
```

## Plan Self-Review

### Spec coverage

- Branch and unit master data: covered by Tasks 3, 4, 5, 6, 7, 9, 10
- PM logging: covered by Task 11
- Repair logging: covered by Task 12
- Replacement history: covered by Task 13
- QR generation: covered by Task 14
- Dashboard monitoring: covered by Tasks 8 and 15
- Google Sheet bootstrap and source import: covered by Tasks 7 and 16
- Pilot-ready testing and verification: covered by Tasks 17 and 18

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation markers remain in task instructions
- Each task includes explicit files, a failing test, a concrete implementation direction, a run command, and a commit step

### Type consistency

- Unit IDs use the same `BC01-CT-01` style throughout
- PM flow consistently updates `latestPmDate`
- Repair flow consistently updates `latestRepairDate` and `latestIssueSummary`
- Replacement flow consistently marks the old unit as `REPLACED`
