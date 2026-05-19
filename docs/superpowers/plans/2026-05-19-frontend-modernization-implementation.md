# PMAIRCON Frontend Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the current PMAIRCON web app into a modern, calm, green-slate operations interface without changing the existing navigation or live data behavior.

**Architecture:** Build a small shared presentation layer first, then restyle the dashboard, branch detail, unit detail, and PM/repair forms on top of the existing routes and services. Keep the data flow unchanged and focus on extracting reusable shell, section, metric, and form primitives so the redesign is visually coherent and low-risk.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, Vitest, Testing Library

---

## File Structure

- Modify: `C:\CodexProject\PmQRcode\src\app\globals.css`
  - Add global theme tokens, base typography, background, and reusable utility classes.
- Modify: `C:\CodexProject\PmQRcode\src\app\layout.tsx`
  - Apply global body classes and any lightweight document-level improvements.
- Modify: `C:\CodexProject\PmQRcode\src\app\page.tsx`
  - Refresh the home/entry page so it visually matches the redesigned product.
- Modify: `C:\CodexProject\PmQRcode\src\app\dashboard\page.tsx`
  - Recompose the dashboard using the new shell and updated summary/list presentation.
- Modify: `C:\CodexProject\PmQRcode\src\app\branches\[branchCode]\page.tsx`
  - Place branch detail inside the new page shell.
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\page.tsx`
  - Place unit detail inside the new page shell.
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\pm\new\page.tsx`
  - Apply the redesigned form shell and page framing.
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\repair\new\page.tsx`
  - Apply the redesigned form shell and page framing.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\app-shell.tsx`
  - Shared outer shell, page header, and content container primitives.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\section-card.tsx`
  - Shared panel/container component for sections and content blocks.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\metric-card.tsx`
  - Shared metric card primitive for the dashboard summary.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\record-link-row.tsx`
  - Shared list row component for branch and unit navigation lists.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\status-panel.tsx`
  - Shared status panel component for PM/repair summary blocks.
- Create: `C:\CodexProject\PmQRcode\src\features\ui\form-field.tsx`
  - Shared field wrapper, fixed-value field, input, textarea, and action row primitives.
- Modify: `C:\CodexProject\PmQRcode\src\features\dashboard\summary-cards.tsx`
  - Replace inline styling with the shared metric component and new copy hierarchy.
- Modify: `C:\CodexProject\PmQRcode\src\features\branches\branch-detail.tsx`
  - Upgrade branch identity and unit listing with the shared section and record row primitives.
- Modify: `C:\CodexProject\PmQRcode\src\features\units\unit-detail.tsx`
  - Upgrade unit summary and actions with status panels and stronger CTAs.
- Modify: `C:\CodexProject\PmQRcode\src\features\pm\pm-form.tsx`
  - Replace ad hoc form layout with shared field primitives and modern action styling.
- Modify: `C:\CodexProject\PmQRcode\src\features\repairs\repair-form.tsx`
  - Same treatment as PM, plus textarea and status field polish.
- Create: `C:\CodexProject\PmQRcode\tests\unit\app-shell.test.tsx`
  - Regression coverage for shell rendering and page header behavior.
- Create: `C:\CodexProject\PmQRcode\tests\unit\summary-cards.test.tsx`
  - Regression coverage for metric card rendering.
- Create: `C:\CodexProject\PmQRcode\tests\unit\branch-detail-component.test.tsx`
  - Regression coverage for branch detail rendering and unit links.
- Create: `C:\CodexProject\PmQRcode\tests\unit\unit-detail-component.test.tsx`
  - Regression coverage for unit status rendering and action links.
- Create: `C:\CodexProject\PmQRcode\tests\unit\pm-form-component.test.tsx`
  - Regression coverage for PM form headings, fixed fields, and success state.
- Create: `C:\CodexProject\PmQRcode\tests\unit\repair-form-component.test.tsx`
  - Regression coverage for repair form headings, textarea, and success state.

---

### Task 1: Build The Shared Visual System

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\globals.css`
- Modify: `C:\CodexProject\PmQRcode\src\app\layout.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\app-shell.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\section-card.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\app-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "../../src/features/ui/app-shell";

describe("AppShell", () => {
  it("renders a page header, optional back link, and content region", () => {
    render(
      <AppShell
        backHref="/dashboard"
        backLabel="Back to dashboard"
        eyebrow="Central dashboard"
        title="Aircon PM monitoring"
        description="Calm operational overview for branch and unit records."
      >
        <div>Child content</div>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Back to dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aircon PM monitoring" })).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/app-shell.test.tsx`  
Expected: FAIL because `src/features/ui/app-shell.tsx` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

interface AppShellProps {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function AppShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <div className="app-shell__inner">
        {backHref && backLabel ? (
          <Link href={backHref} className="app-shell__back-link">
            {backLabel}
          </Link>
        ) : null}
        <header className="app-shell__hero">
          <p className="app-shell__eyebrow">{eyebrow}</p>
          <h1 className="app-shell__title">{title}</h1>
          {description ? <p className="app-shell__description">{description}</p> : null}
        </header>
        <div className="app-shell__content">{children}</div>
      </div>
    </main>
  );
}
```

```css
:root {
  --bg: #eef3ef;
  --surface: #ffffff;
  --surface-muted: #f4f7f4;
  --border: #d7e0d8;
  --text: #173128;
  --text-muted: #5e7168;
  --accent: #2c5b49;
  --accent-strong: #214638;
  --shadow-soft: 0 18px 40px rgba(29, 53, 44, 0.08);
}

html {
  font-family: "Segoe UI", "Trebuchet MS", Helvetica, Arial, sans-serif;
  background: var(--bg);
}

body {
  margin: 0;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(102, 144, 121, 0.12), transparent 28%),
    linear-gradient(180deg, #f5f8f5 0%, var(--bg) 100%);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/app-shell.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/features/ui/app-shell.tsx src/features/ui/section-card.tsx tests/unit/app-shell.test.tsx
git commit -m "feat: add frontend modernization shell"
```

### Task 2: Redesign The Dashboard Surface

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\dashboard\page.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\features\dashboard\summary-cards.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\metric-card.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\record-link-row.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\summary-cards.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "../../src/features/dashboard/summary-cards";

describe("SummaryCards", () => {
  it("renders all four operational metrics with readable labels", () => {
    render(
      <SummaryCards
        summary={{
          totalBranches: 955,
          totalUnits: 10925,
          pmLoggedUnits: 14,
          openRepairs: 6,
        }}
      />,
    );

    expect(screen.getByText("Total branches")).toBeInTheDocument();
    expect(screen.getByText("10925")).toBeInTheDocument();
    expect(screen.getByText("Open repairs")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/summary-cards.test.tsx`  
Expected: FAIL because the new test file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
    </article>
  );
}
```

```tsx
<AppShell
  backHref="/"
  backLabel="Back to home"
  eyebrow="Central dashboard"
  title="Aircon PM monitoring"
  description="Monitor branches, units, and current maintenance activity from one calm command center."
>
  <SummaryCards summary={summary} />
  <SectionCard
    eyebrow="Branch directory"
    title="Open a branch"
    aside={`${branchDirectory.length} branches`}
  >
    <div className="grid gap-3">
      {branchDirectory.map((branch) => (
        <RecordLinkRow
          key={branch.branchCode}
          href={`/branches/${branch.branchCode}`}
          title={branch.branchCode}
          subtitle={branch.outletName}
          meta={`Supplier: ${branch.supplierName || "Not assigned"}`}
        />
      ))}
    </div>
  </SectionCard>
</AppShell>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/summary-cards.test.tsx tests/unit/dashboard-service.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/features/dashboard/summary-cards.tsx src/features/ui/metric-card.tsx src/features/ui/record-link-row.tsx tests/unit/summary-cards.test.tsx
git commit -m "feat: redesign dashboard surface"
```

### Task 3: Redesign The Branch Detail Screen

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\branches\[branchCode]\page.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\features\branches\branch-detail.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\branch-detail-component.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BranchDetail } from "../../src/features/branches/branch-detail";

describe("BranchDetail", () => {
  it("renders branch identity and unit links", () => {
    render(
      <BranchDetail
        detail={{
          branch: {
            branchCode: "BC01",
            outletName: "SAPS",
            supplierName: "Klangsub Engineer",
          },
          units: [{ unitId: "BC01-CS-01" }, { unitId: "BC01-CT-01" }],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "BC01" })).toBeInTheDocument();
    expect(screen.getByText("Klangsub Engineer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BC01-CS-01" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/branch-detail-component.test.tsx`  
Expected: FAIL until the new test file and any required branch typing adjustments exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
<SectionCard eyebrow="Branch detail" title={detail.branch.branchCode}>
  <div className="grid gap-2 border-b border-[var(--border)] pb-5">
    <p className="text-lg text-[var(--text)]">{detail.branch.outletName}</p>
    <p className="text-sm text-[var(--text-muted)]">
      Supplier: {detail.branch.supplierName || "Not assigned"}
    </p>
  </div>

  <div className="mt-6 space-y-3">
    {detail.units.map((unit) => (
      <RecordLinkRow
        key={unit.unitId}
        href={`/units/${unit.unitId}`}
        title={unit.unitId}
        subtitle="Open unit detail"
      />
    ))}
  </div>
</SectionCard>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/branch-detail-component.test.tsx tests/unit/branch-service.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/branches/[branchCode]/page.tsx src/features/branches/branch-detail.tsx tests/unit/branch-detail-component.test.tsx
git commit -m "feat: redesign branch detail page"
```

### Task 4: Redesign The Unit Detail Screen

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\page.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\features\units\unit-detail.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\status-panel.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\unit-detail-component.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnitDetail } from "../../src/features/units/unit-detail";

describe("UnitDetail", () => {
  it("renders latest PM, latest repair, and action links", () => {
    render(
      <UnitDetail
        detail={{
          unit: { unitId: "BC01-CS-01", branchCode: "BC01" },
          latestPm: { serviceDate: "2026-05-19" },
          latestRepair: { serviceDate: "2026-05-18", issueDetail: "Water leak" },
          pmHistory: [{ serviceDate: "2026-05-19" }],
          repairHistory: [{ serviceDate: "2026-05-18", issueDetail: "Water leak" }],
        }}
      />,
    );

    expect(screen.getByText("Latest PM")).toBeInTheDocument();
    expect(screen.getByText("Water leak")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit PM" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/unit-detail-component.test.tsx`  
Expected: FAIL until the new test file exists.

- [ ] **Step 3: Write minimal implementation**

```tsx
export function StatusPanel({
  title,
  primary,
  secondary,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  primary: string;
  secondary: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <p className="mt-3 text-base text-[var(--text)]">{primary}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{secondary}</p>
      <Link href={ctaHref} className="mt-5 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
        {ctaLabel}
      </Link>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/unit-detail-component.test.tsx tests/unit/unit-service.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/units/[unitId]/page.tsx src/features/units/unit-detail.tsx src/features/ui/status-panel.tsx tests/unit/unit-detail-component.test.tsx
git commit -m "feat: redesign unit detail page"
```

### Task 5: Redesign The PM Form Experience

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\pm\new\page.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\features\pm\pm-form.tsx`
- Create: `C:\CodexProject\PmQRcode\src\features\ui\form-field.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\pm-form-component.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PmForm } from "../../src/features/pm/pm-form";

describe("PmForm", () => {
  it("shows fixed operational fields and success state after submit", () => {
    render(
      <PmForm
        initialValues={{
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-19",
          technicianName: "",
          supplierName: "Klangsub Engineer",
          serviceStatus: "DONE",
        }}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Save PM" }));

    expect(screen.getByText("Branch code")).toBeInTheDocument();
    expect(screen.getByText("PM saved")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/pm-form-component.test.tsx`  
Expected: FAIL until the new test file exists.

- [ ] **Step 3: Write minimal implementation**

```tsx
function FixedValueField({ label, name, value }: FixedValueFieldProps) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-[var(--text-muted)]">{label}</span>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)]">
        {value}
      </div>
      <input defaultValue={value} name={name} type="hidden" />
    </div>
  );
}

<SectionCard eyebrow="PM form" title="New preventive maintenance log">
  <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={...}>
    ...
    <div className="md:col-span-2 flex justify-end">
      <button className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white" type="submit">
        Save PM
      </button>
    </div>
  </form>
</SectionCard>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/pm-form-component.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/units/[unitId]/pm/new/page.tsx src/features/pm/pm-form.tsx src/features/ui/form-field.tsx tests/unit/pm-form-component.test.tsx
git commit -m "feat: redesign pm form experience"
```

### Task 6: Redesign The Repair Form And Entry Surface

**Files:**
- Modify: `C:\CodexProject\PmQRcode\src\app\units\[unitId]\repair\new\page.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\features\repairs\repair-form.tsx`
- Test: `C:\CodexProject\PmQRcode\tests\unit\repair-form-component.test.tsx`
- Modify: `C:\CodexProject\PmQRcode\src\app\page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RepairForm } from "../../src/features/repairs/repair-form";

describe("RepairForm", () => {
  it("renders issue detail textarea and success state", () => {
    render(
      <RepairForm
        initialValues={{
          branchCode: "BC01",
          unitId: "BC01-CS-01",
          serviceDate: "2026-05-19",
          issueCategory: "OTHER",
          issueDetail: "",
          repairStatus: "PENDING",
        }}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Save repair" }));

    expect(screen.getByPlaceholderText("Describe the issue found")).toBeInTheDocument();
    expect(screen.getByText("Repair saved")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/repair-form-component.test.tsx`  
Expected: FAIL until the new test file exists.

- [ ] **Step 3: Write minimal implementation**

```tsx
<AppShell
  backHref={`/units/${unit.unitId}`}
  backLabel="Back to unit"
  eyebrow="Repair log"
  title={`Repair for ${unit.unitId}`}
  description="Capture a repair issue in a focused, mobile-friendly workflow."
>
  <RepairForm initialValues={initialValues} />
</AppShell>
```

```tsx
<label className="grid gap-2 text-sm text-[var(--text-muted)] md:col-span-2">
  Issue detail
  <textarea
    className="min-h-32 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]"
    defaultValue={initialValues.issueDetail}
    name="issueDetail"
    placeholder="Describe the issue found"
    required
  />
</label>
```

```tsx
export default function HomePage() {
  return (
    <AppShell
      eyebrow="PMAIRCON"
      title="Air Conditioner PM System"
      description="QR-based preventive maintenance and repair logging for branch operations."
    >
      <SectionCard title="Open the workspace">
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
            Open dashboard
          </Link>
        </div>
      </SectionCard>
    </AppShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/repair-form-component.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/units/[unitId]/repair/new/page.tsx src/features/repairs/repair-form.tsx src/app/page.tsx tests/unit/repair-form-component.test.tsx
git commit -m "feat: redesign repair form and landing page"
```

### Task 7: Final Visual QA And Production Verification

**Files:**
- Modify: `C:\CodexProject\PmQRcode\README.md`

- [ ] **Step 1: Run targeted unit tests**

Run:

```bash
npm test -- tests/unit/app-shell.test.tsx tests/unit/summary-cards.test.tsx tests/unit/branch-detail-component.test.tsx tests/unit/unit-detail-component.test.tsx tests/unit/pm-form-component.test.tsx tests/unit/repair-form-component.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run typecheck and production build**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: PASS

- [ ] **Step 3: Run the app and inspect the redesigned routes manually**

Run:

```bash
npm run dev
```

Verify:

- `/dashboard`
- `/branches/BC01`
- `/units/BC01-CS-01`
- `/units/BC01-CS-01/pm/new`
- `/units/BC01-CS-01/repair/new`

Check desktop and mobile-width layouts in the browser.

- [ ] **Step 4: Update README if screen descriptions or preview instructions changed**

```md
## UI Notes

- Dashboard uses the calm green-slate operations theme.
- Branch and unit pages share the same visual shell.
- PM and Repair forms are optimized for clean operational data entry.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: refresh frontend verification notes"
```

---

## Self-Review

- Spec coverage:
  - Dashboard modernization: covered in Task 2.
  - Branch detail modernization: covered in Task 3.
  - Unit detail modernization: covered in Task 4.
  - PM and Repair form modernization: covered in Tasks 5 and 6.
  - Shared green-slate visual system and operational shell: covered in Task 1.
  - Responsive and verification pass: covered in Task 7.
- Placeholder scan:
  - No `TODO`, `TBD`, or vague implementation steps remain.
- Type consistency:
  - Shared component names are stable across tasks: `AppShell`, `SectionCard`, `MetricCard`, `RecordLinkRow`, `StatusPanel`, and `FixedValueField`/form primitives.

