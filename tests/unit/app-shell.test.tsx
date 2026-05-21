import React from "react";
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

    expect(
      screen.getByRole("link", { name: "Back to dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Aircon PM monitoring" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
