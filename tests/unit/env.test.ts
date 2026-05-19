import { describe, expect, it } from "vitest";

import { createGoogleAuthConfig } from "../../src/lib/google/auth";
import { loadEnv } from "../../src/lib/env";

describe("loadEnv", () => {
  it("returns parsed required Google settings", () => {
    const env = loadEnv({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "bot@example.com",
      GOOGLE_PRIVATE_KEY:
        "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
      GOOGLE_SHEET_ID: "sheet-id",
      GOOGLE_DRIVE_FOLDER_ID: "drive-folder-id",
      APP_BASE_URL: "https://pm.example.com/app/",
    });

    expect(env).toEqual({
      googleServiceAccountEmail: "bot@example.com",
      googlePrivateKey:
        "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
      googleSheetId: "sheet-id",
      googleDriveFolderId: "drive-folder-id",
      appBaseUrl: "https://pm.example.com/app/",
    });
  });

  it("rejects an invalid app base url", () => {
    expect(() =>
      loadEnv({
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "bot@example.com",
        GOOGLE_PRIVATE_KEY:
          "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
        GOOGLE_SHEET_ID: "sheet-id",
        GOOGLE_DRIVE_FOLDER_ID: "drive-folder-id",
        APP_BASE_URL: "not-a-url",
      }),
    ).toThrowError("Invalid URL for environment variable: APP_BASE_URL");
  });
});

describe("createGoogleAuthConfig", () => {
  it("returns a defensive copy of scopes", () => {
    const scopes = ["scope:a", "scope:b"];
    const config = createGoogleAuthConfig(
      {
        googleServiceAccountEmail: "bot@example.com",
        googlePrivateKey: "private-key",
      },
      scopes,
    );

    scopes.push("scope:c");

    expect(config.scopes).toEqual(["scope:a", "scope:b"]);
  });
});
