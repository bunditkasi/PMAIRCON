import { describe, expect, it } from "vitest";

import { GET } from "../../src/app/api/health/route";

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload.status).toBe("ok");
  });
});
