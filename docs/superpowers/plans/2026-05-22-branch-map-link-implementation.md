# Branch Map Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single `Open map` button to branch detail pages when a branch has a location link in the live Google Sheet.

**Architecture:** Extend the live branch sheet model with `mapUrl`, thread that field through branch detail services, and render one secondary action below `Start business` on the branch page. Keep dashboard cards unchanged and only expose the action on the branch detail surface.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Google Sheets live data loader

---

### Task 1: Add `mapUrl` to branch data mapping

**Files:**
- Modify: `C:/CodexProject/PmQRcode/tests/unit/sheets-live.test.ts`
- Modify: `C:/CodexProject/PmQRcode/src/lib/google/sheets-live.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("maps map_url from branch rows into live collections", () => {
  const collections = mapSheetRowsToCollections({
    branches: [
      ["branch_code", "outlet_name", "supplier_name", "map_url"],
      ["BC01", "SAPS", "Klangsub Engineer", "https://maps.app.goo.gl/example"],
    ],
    units: [["unit_id", "branch_code"]],
    pmLogs: [["unit_id", "service_date"]],
    repairLogs: [["unit_id", "service_date", "issue_detail", "repair_status"]],
  });

  expect(collections.branches).toEqual([
    {
      branchCode: "BC01",
      outletName: "SAPS",
      supplierName: "Klangsub Engineer",
      fullStoreName: "",
      state: "",
      startBusinessDate: "",
      mapUrl: "https://maps.app.goo.gl/example",
      region: "",
      pmStartMonth: null,
    },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/sheets-live.test.ts`
Expected: FAIL because `mapUrl` is not included in mapped branch rows yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface LiveSheetCollections {
  branches: Array<{
    branchCode: string;
    outletName: string;
    supplierName: string;
    fullStoreName: string;
    state: string;
    startBusinessDate: string;
    mapUrl: string;
    region: string;
    pmStartMonth: number | null;
  }>;
}

const branches = dedupeByKey(
  rowsToObjects(input.branches)
    .filter((row) => row.branch_code)
    .map((row) => ({
      branchCode: row.branch_code,
      outletName: row.outlet_name,
      supplierName: row.supplier_name,
      fullStoreName: row.full_store_name || "",
      state: row.state || "",
      startBusinessDate: row.start_business_date || "",
      mapUrl: row.map_url || "",
      region: row.region || "",
      pmStartMonth: parseSheetMonth(row.pm_start_month || row.month),
    })),
  (branch) => branch.branchCode,
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/unit/sheets-live.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/unit/sheets-live.test.ts src/lib/google/sheets-live.ts
git commit -m "feat: map branch map links from sheets"
```

### Task 2: Carry `mapUrl` through branch detail types

**Files:**
- Modify: `C:/CodexProject/PmQRcode/tests/unit/branch-service.test.ts`
- Modify: `C:/CodexProject/PmQRcode/src/lib/services/branch-service.ts`
- Modify: `C:/CodexProject/PmQRcode/src/lib/fixtures/detail-fixtures.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("returns mapUrl with branch detail data", () => {
  const detail = findBranchDetail("BC01", {
    branches: [
      {
        branchCode: "BC01",
        outletName: "SAPS",
        supplierName: "Klangsub Engineer",
        fullStoreName: "Seacon Bangkae, Bangkok",
        state: "Bangkok",
        startBusinessDate: "2016-01-15",
        mapUrl: "https://maps.app.goo.gl/example",
      },
    ],
    units: [{ unitId: "BC01-CS-01", branchCode: "BC01" }],
  });

  expect(detail?.branch.mapUrl).toBe("https://maps.app.goo.gl/example");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/branch-service.test.ts`
Expected: FAIL because `mapUrl` is not part of `BranchRecord` yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface BranchRecord {
  branchCode: string;
  outletName: string;
  supplierName: string;
  fullStoreName: string;
  state: string;
  startBusinessDate: string;
  mapUrl: string;
}
```

```ts
export const detailBranchFixtures = [
  {
    branchCode: "BC01",
    outletName: "SAPS",
    supplierName: "Klangsub Engineer",
    fullStoreName: "Seacon Bangkae, Bangkok",
    state: "Bangkok",
    startBusinessDate: "2016-01-15",
    mapUrl: "https://maps.app.goo.gl/example",
  },
] satisfies BranchRecord[];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/unit/branch-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/unit/branch-service.test.ts src/lib/services/branch-service.ts src/lib/fixtures/detail-fixtures.ts
git commit -m "feat: carry branch map links through detail service"
```

### Task 3: Render the `Open map` button on branch detail pages

**Files:**
- Modify: `C:/CodexProject/PmQRcode/tests/unit/branch-detail-component.test.tsx`
- Modify: `C:/CodexProject/PmQRcode/src/features/branches/branch-detail.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("shows an Open map button when branch mapUrl exists", () => {
  render(
    <BranchDetail
      detail={{
        branch: {
          branchCode: "BC01",
          outletName: "SAPS",
          supplierName: "Klangsub Engineer",
          fullStoreName: "Seacon Bangkae, Bangkok",
          state: "Bangkok",
          startBusinessDate: "2016-01-15",
          mapUrl: "https://maps.app.goo.gl/example",
        },
        units: [],
      }}
    />,
  );

  const link = screen.getByRole("link", { name: "Open map" });
  expect(link).toHaveAttribute("href", "https://maps.app.goo.gl/example");
  expect(link).toHaveAttribute("target", "_blank");
});
```

```tsx
it("hides the Open map button when branch mapUrl is missing", () => {
  render(
    <BranchDetail
      detail={{
        branch: {
          branchCode: "BC01",
          outletName: "SAPS",
          supplierName: "Klangsub Engineer",
          fullStoreName: "Seacon Bangkae, Bangkok",
          state: "Bangkok",
          startBusinessDate: "2016-01-15",
          mapUrl: "",
        },
        units: [],
      }}
    />,
  );

  expect(screen.queryByRole("link", { name: "Open map" })).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/unit/branch-detail-component.test.tsx`
Expected: FAIL because the button is not rendered yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
{detail.branch.mapUrl ? (
  <a
    className="inline-flex w-fit items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
    href={detail.branch.mapUrl}
    rel="noreferrer"
    target="_blank"
  >
    Open map
  </a>
) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/unit/branch-detail-component.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/unit/branch-detail-component.test.tsx src/features/branches/branch-detail.tsx
git commit -m "feat: show branch map action"
```

### Task 4: Verify the integrated flow

**Files:**
- Modify: none
- Test: `C:/CodexProject/PmQRcode/tests/unit/sheets-live.test.ts`
- Test: `C:/CodexProject/PmQRcode/tests/unit/branch-service.test.ts`
- Test: `C:/CodexProject/PmQRcode/tests/unit/branch-detail-component.test.tsx`

- [ ] **Step 1: Run the targeted unit suite**

Run: `npm.cmd test -- tests/unit/sheets-live.test.ts tests/unit/branch-service.test.ts tests/unit/branch-detail-component.test.tsx tests/unit/dashboard-page.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `npm.cmd run build`
Expected: Next.js production build completes successfully

- [ ] **Step 3: Run type-check**

Run: `npx.cmd tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit verification state**

```bash
git add -A
git commit -m "test: verify branch map link flow"
```
