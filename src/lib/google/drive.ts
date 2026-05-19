import type { AppEnv } from "../env";
import {
  createGoogleAuthConfig,
  GOOGLE_DRIVE_SCOPE,
  type GoogleAuthConfig,
} from "./auth";

export type GoogleDriveConfig = {
  folderId: string;
  auth: GoogleAuthConfig;
};

export function createGoogleDriveConfig(
  env: Pick<
    AppEnv,
    "googleServiceAccountEmail" | "googlePrivateKey" | "googleDriveFolderId"
  >,
): GoogleDriveConfig {
  return {
    folderId: env.googleDriveFolderId,
    auth: createGoogleAuthConfig(env, [GOOGLE_DRIVE_SCOPE]),
  };
}
