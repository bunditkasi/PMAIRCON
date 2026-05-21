import React from "react";
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
          serviceDate: "2026-05-21",
          issueCategory: "OTHER",
          issueDetail: "",
          repairStatus: "PENDING",
        }}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Save repair" }));

    expect(
      screen.getByPlaceholderText("Describe the issue found"),
    ).toBeInTheDocument();
    expect(screen.getByText("Repair saved")).toBeInTheDocument();
  });
});
