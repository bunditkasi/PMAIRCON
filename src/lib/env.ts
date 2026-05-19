export type AppEnv = {
  googleServiceAccountEmail: string;
  googlePrivateKey: string;
  googleSheetId: string;
  googleDriveFolderId: string;
  appBaseUrl: string;
};

type EnvInput = Record<string, string | undefined>;

function requireValue(input: EnvInput, key: keyof EnvInput): string {
  const value = input[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseEmail(value: string, key: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`Invalid email for environment variable: ${key}`);
  }

  return value;
}

function parseUrl(value: string, key: string): string {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Invalid URL for environment variable: ${key}`);
  }
}

export function loadEnv(input: EnvInput = process.env): AppEnv {
  const googleServiceAccountEmail = parseEmail(
    requireValue(input, "GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  );
  const googlePrivateKey = requireValue(input, "GOOGLE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );
  const googleSheetId = requireValue(input, "GOOGLE_SHEET_ID");
  const googleDriveFolderId = requireValue(input, "GOOGLE_DRIVE_FOLDER_ID");
  const appBaseUrl = parseUrl(
    requireValue(input, "APP_BASE_URL"),
    "APP_BASE_URL",
  );

  return {
    googleServiceAccountEmail,
    googlePrivateKey,
    googleSheetId,
    googleDriveFolderId,
    appBaseUrl,
  };
}
