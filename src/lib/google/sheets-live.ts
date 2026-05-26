import { createSign } from "node:crypto";

import { createGoogleAuthConfig } from "./auth";

type RuntimeConfig = {
  spreadsheetId: string;
  auth: ReturnType<typeof createGoogleAuthConfig>;
};

type SheetRowRecord = Record<string, string>;

export interface LiveSheetCollections {
  branches: Array<{
    branchCode: string;
    outletName: string;
    supplierName: string;
    seniorName?: string;
    fullStoreName: string;
    state: string;
    startBusinessDate: string;
    mapUrl: string;
    region: string;
    pmStartMonth: number | null;
  }>;
  units: Array<{
    unitId: string;
    branchCode: string;
    unitType?: string;
  }>;
  pmLogs: Array<{
    unitId: string;
    serviceDate: string;
    serviceStatus: string;
  }>;
  repairLogs: Array<{
    unitId: string;
    serviceDate: string;
    issueDetail: string;
    repairStatus: string;
  }>;
}

const SHEET_RANGES = {
  branches: "Branches!A:T",
  units: "Units!A:U",
  pmLogs: "PM_Logs!A:R",
  repairLogs: "Repair_Logs!A:R",
} as const;

export function rowsToObjects(rows: string[][]): SheetRowRecord[] {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow || headerRow.length === 0) {
    return [];
  }

  const headers = headerRow.map((header) => header.trim());

  return dataRows
    .filter((row) => row.some((value) => value?.trim?.()))
    .map((row) => {
      const record: SheetRowRecord = {};

      headers.forEach((header, index) => {
        if (!header) {
          return;
        }

        record[header] = String(row[index] ?? "").trim();
      });

      return record;
    });
}

export function mapSheetRowsToCollections(input: {
  branches: string[][];
  units: string[][];
  pmLogs: string[][];
  repairLogs: string[][];
}): LiveSheetCollections {
  const branches = dedupeByKey(
    rowsToObjects(input.branches)
      .filter((row) => row.branch_code)
      .map((row) => ({
        branchCode: row.branch_code,
        outletName: row.outlet_name,
        supplierName: row.supplier_name,
        seniorName: row.senior_name || row.senior || "",
        fullStoreName: row.full_store_name || "",
        state: row.state || "",
        startBusinessDate: row.start_business_date || "",
        mapUrl: row.map_url || "",
        region: row.region || "",
        pmStartMonth: parseSheetMonth(row.pm_start_month || row.month),
      })),
    (branch) => branch.branchCode,
  );

  const units = dedupeByKey(
    rowsToObjects(input.units)
      .filter((row) => row.unit_id && row.branch_code)
      .map((row) => ({
        unitId: row.unit_id,
        branchCode: row.branch_code,
        unitType: row.unit_type || "",
      })),
    (unit) => unit.unitId,
  );

  return {
    branches,
    units,
    pmLogs: rowsToObjects(input.pmLogs)
      .filter((row) => row.unit_id && row.service_date)
      .map((row) => ({
        unitId: row.unit_id,
        serviceDate: row.service_date,
        serviceStatus: row.service_status || "DONE",
      })),
    repairLogs: rowsToObjects(input.repairLogs)
      .filter((row) => row.unit_id && row.service_date)
      .map((row) => ({
        unitId: row.unit_id,
        serviceDate: row.service_date,
        issueDetail: row.issue_detail,
        repairStatus: row.repair_status,
      })),
  };
}

export function readGoogleSheetsRuntimeConfig(
  input: Record<string, string | undefined> = process.env,
): RuntimeConfig | null {
  const clientEmail = input.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = input.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n");
  const spreadsheetId = input.GOOGLE_SHEET_ID?.trim();

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  return {
    spreadsheetId,
    auth: createGoogleAuthConfig({
      googleServiceAccountEmail: clientEmail,
      googlePrivateKey: privateKey,
    }),
  };
}

export async function fetchLiveSheetCollections(
  env: Record<string, string | undefined> = process.env,
): Promise<LiveSheetCollections | null> {
  const config = readGoogleSheetsRuntimeConfig(env);

  if (!config) {
    return null;
  }

  const accessToken = await fetchServiceAccountAccessToken(config.auth);
  const [branches, units, pmLogs, repairLogs] = await Promise.all([
    fetchSheetValues(config.spreadsheetId, SHEET_RANGES.branches, accessToken),
    fetchSheetValues(config.spreadsheetId, SHEET_RANGES.units, accessToken),
    fetchSheetValues(config.spreadsheetId, SHEET_RANGES.pmLogs, accessToken),
    fetchSheetValues(config.spreadsheetId, SHEET_RANGES.repairLogs, accessToken),
  ]);

  return mapSheetRowsToCollections({
    branches,
    units,
    pmLogs,
    repairLogs,
  });
}

async function fetchServiceAccountAccessToken(
  auth: RuntimeConfig["auth"],
): Promise<string> {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      alg: "RS256",
      typ: "JWT",
    },
    {
      iss: auth.clientEmail,
      scope: auth.scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      exp: nowInSeconds + 3600,
      iat: nowInSeconds,
    },
    auth.privateKey,
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google access token: ${response.status}`);
  }

  const payload = (await response.json()) as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("Google access token response did not include access_token");
  }

  return payload.access_token;
}

async function fetchSheetValues(
  spreadsheetId: string,
  range: string,
  accessToken: string,
): Promise<string[][]> {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
  );

  url.searchParams.set("valueRenderOption", "FORMATTED_VALUE");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet range ${range}: ${response.status}`);
  }

  const payload = (await response.json()) as { values?: string[][] };

  return payload.values ?? [];
}

function dedupeByKey<T>(rows: T[], getKey: (row: T) => string): T[] {
  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = getKey(row);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseSheetMonth(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const month = Number(normalizedValue);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return month;
}

function signJwt(
  header: Record<string, string>,
  claims: Record<string, string | number>,
  privateKey: string,
): string {
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedClaims = encodeBase64Url(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedClaims}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(privateKey, "base64url");

  return `${unsignedToken}.${signature}`;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}
