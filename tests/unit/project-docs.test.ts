import fs from "node:fs";

import { describe, expect, it } from "vitest";

describe("project docs", () => {
  it("includes setup instructions for the MVP", () => {
    const readme = fs.readFileSync("README.md", "utf8");

    expect(readme).toMatch(/google sheet/i);
    expect(readme).toMatch(/qr/i);
    expect(readme).toMatch(/npm run dev/i);
  });
});
