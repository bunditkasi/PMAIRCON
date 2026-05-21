import React from "react";
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
          serviceDate: "2026-05-21",
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
