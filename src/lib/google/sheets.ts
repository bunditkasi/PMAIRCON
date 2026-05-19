import type { AppEnv } from "../env";
import {
  createGoogleAuthConfig,
  GOOGLE_SHEETS_SCOPE,
  type GoogleAuthConfig,
} from "./auth";

export type GoogleSheetsConfig = {
  spreadsheetId: string;
  auth: GoogleAuthConfig;
};

export function createGoogleSheetsConfig(
  env: Pick<
    AppEnv,
    "googleServiceAccountEmail" | "googlePrivateKey" | "googleSheetId"
  >,
): GoogleSheetsConfig {
  return {
    spreadsheetId: env.googleSheetId,
    auth: createGoogleAuthConfig(env, [GOOGLE_SHEETS_SCOPE]),
  };
}
