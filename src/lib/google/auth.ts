import type { AppEnv } from "../env";

export const GOOGLE_SHEETS_SCOPE =
  "https://www.googleapis.com/auth/spreadsheets";
export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

export type GoogleAuthConfig = {
  clientEmail: string;
  privateKey: string;
  scopes: string[];
};

export function createGoogleAuthConfig(
  env: Pick<AppEnv, "googleServiceAccountEmail" | "googlePrivateKey">,
  scopes: string[] = [GOOGLE_SHEETS_SCOPE, GOOGLE_DRIVE_SCOPE],
): GoogleAuthConfig {
  return {
    clientEmail: env.googleServiceAccountEmail,
    privateKey: env.googlePrivateKey,
    scopes: [...scopes],
  };
}
