import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

describe("HomePage", () => {
  it("renders dashboard links on the landing page", () => {
    render(createElement(HomePage));

    expect(
      screen.getByRole("heading", { name: /air conditioner pm system/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /find branch/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
