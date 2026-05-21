import { createSign } from "node:crypto";

import { createGoogleAuthConfig } from "./auth";

import type { PmLogRollbackToken } from "../services/pm-service";
import type { SavePmLogInput } from "../services/pm-service";
import type { RepairLogRollbackToken } from "../services/repair-service";
import type { SaveRepairLogInput } from "../services/repair-service";

type WriterDeps = {
  fetchImpl?: typeof fetch;
  getAccessToken?: () => Promise<string>;
  now?: () => Date;
  randomId?: () => string;
  spreadsheetId?: string;
  env?: Record<string, string | undefined>;
};

const PM_LOG_HEADERS = 18;
const REPAIR_LOG_HEADERS = 18;

export function createGoogleSheetLogWriter({
  fetchImpl = fetch,
  getAccessToken,
  now = () => new Date(),
  randomId = () => crypto.randomUUID(),
  spreadsheetId,
  env = process.env,
}: WriterDeps = {}) {
  const resolvedSheetId = spreadsheetId ?? env.GOOGLE_SHEET_ID?.trim();

  if (!resolvedSheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const accessTokenProvider =
    getAccessToken ??
    (() =>
      fetchServiceAccountAccessToken(fetchImpl, {
        clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "",
        privateKey: env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n") ?? "",
      }));

  async function withAuthJson(
    path: string,
    init: RequestInit = {},
  ) {
    const accessToken = await accessTokenProvider();
    const response = await fetchImpl(
      `https://sheets.googleapis.com/v4/spreadsheets/${resolvedSheetId}${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Google Sheets write failed: ${response.status}`);
    }

    return response;
  }

  return {
    async appendPmLog(input: SavePmLogInput): Promise<PmLogRollbackToken> {
      const timestamp = now().toISOString();
      const pmLogId = `PM-${timestamp}-${randomId()}`;
      const response = await withAuthJson(
        `/values/${encodeURIComponent("PM_Logs!A:R")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          body: JSON.stringify({
            values: [[
              pmLogId,
              input.branchCode,
              input.unitId,
              deriveQuarterYear(input.serviceDate),
              deriveScheduledMonth(input.serviceDate),
              "",
              input.serviceDate,
              input.serviceStatus,
              input.technicianName,
              input.supplierName,
              "",
              "",
              "",
              "",
              "",
              "",
              timestamp,
              "webapp",
            ]],
          }),
        },
      );
      const payload = (await response.json()) as {
        updates?: { updatedRange?: string };
      };

      return {
        rowIndex: parseUpdatedRowIndex(
          payload.updates?.updatedRange,
          "PM_Logs",
          PM_LOG_HEADERS,
        ),
      };
    },

    async deletePmLog(
      _input: SavePmLogInput,
      rollbackToken?: PmLogRollbackToken,
    ) {
      await deleteSheetRow(fetchImpl, accessTokenProvider, resolvedSheetId, "PM_Logs", rollbackToken);
    },

    async updateUnitLatestPmDate(unitId: string, serviceDate: string) {
      const rowIndex = await findUnitRowIndex(fetchImpl, accessTokenProvider, resolvedSheetId, unitId);
      await batchUpdateValues(fetchImpl, accessTokenProvider, resolvedSheetId, [
        { range: `Units!O${rowIndex}`, values: [[serviceDate]] },
        { range: `Units!U${rowIndex}`, values: [[now().toISOString()]] },
      ]);
    },

    async appendRepairLog(input: SaveRepairLogInput): Promise<RepairLogRollbackToken> {
      const timestamp = now().toISOString();
      const repairLogId = `REPAIR-${timestamp}-${randomId()}`;
      const response = await withAuthJson(
        `/values/${encodeURIComponent("Repair_Logs!A:R")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          body: JSON.stringify({
            values: [[
              repairLogId,
              input.branchCode,
              input.unitId,
              input.serviceDate,
              input.serviceDate,
              input.issueCategory,
              input.issueDetail,
              "",
              input.repairStatus,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              timestamp,
              "webapp",
            ]],
          }),
        },
      );
      const payload = (await response.json()) as {
        updates?: { updatedRange?: string };
      };

      return {
        rowIndex: parseUpdatedRowIndex(
          payload.updates?.updatedRange,
          "Repair_Logs",
          REPAIR_LOG_HEADERS,
        ),
      };
    },

    async deleteRepairLog(
      _input: SaveRepairLogInput,
      rollbackToken?: RepairLogRollbackToken,
    ) {
      await deleteSheetRow(fetchImpl, accessTokenProvider, resolvedSheetId, "Repair_Logs", rollbackToken);
    },

    async updateUnitLatestRepair(
      unitId: string,
      serviceDate: string,
      issueDetail: string,
    ) {
      const rowIndex = await findUnitRowIndex(fetchImpl, accessTokenProvider, resolvedSheetId, unitId);
      await batchUpdateValues(fetchImpl, accessTokenProvider, resolvedSheetId, [
        { range: `Units!P${rowIndex}`, values: [[serviceDate]] },
        { range: `Units!Q${rowIndex}`, values: [[issueDetail]] },
        { range: `Units!U${rowIndex}`, values: [[now().toISOString()]] },
      ]);
    },
  };
}

async function fetchServiceAccountAccessToken(
  fetchImpl: typeof fetch,
  input: { clientEmail: string; privateKey: string },
): Promise<string> {
  if (!input.clientEmail || !input.privateKey) {
    throw new Error("Missing Google service account credentials");
  }

  const auth = createGoogleAuthConfig({
    googleServiceAccountEmail: input.clientEmail,
    googlePrivateKey: input.privateKey,
  });
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

  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
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

async function findUnitRowIndex(
  fetchImpl: typeof fetch,
  getAccessToken: () => Promise<string>,
  spreadsheetId: string,
  unitId: string,
) {
  const accessToken = await getAccessToken();
  const response = await fetchImpl(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Units!A:U")}?valueRenderOption=FORMATTED_VALUE`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to lookup unit row: ${response.status}`);
  }

  const payload = (await response.json()) as { values?: string[][] };
  const rows = payload.values ?? [];
  const index = rows.findIndex((row, rowIndex) => rowIndex > 0 && row[0] === unitId);

  if (index === -1) {
    throw new Error(`Unit not found in sheet: ${unitId}`);
  }

  return index + 1;
}

async function batchUpdateValues(
  fetchImpl: typeof fetch,
  getAccessToken: () => Promise<string>,
  spreadsheetId: string,
  data: Array<{ range: string; values: string[][] }>,
) {
  const accessToken = await getAccessToken();
  const response = await fetchImpl(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update sheet values: ${response.status}`);
  }
}

async function deleteSheetRow(
  fetchImpl: typeof fetch,
  getAccessToken: () => Promise<string>,
  spreadsheetId: string,
  sheetName: "PM_Logs" | "Repair_Logs",
  rollbackToken?: { rowIndex: number },
) {
  if (!rollbackToken) {
    return;
  }

  const accessToken = await getAccessToken();
  const sheetId = sheetName === "PM_Logs" ? 2 : 3;
  const response = await fetchImpl(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rollbackToken.rowIndex - 1,
                endIndex: rollbackToken.rowIndex,
              },
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete sheet row: ${response.status}`);
  }
}

function parseUpdatedRowIndex(
  updatedRange: string | undefined,
  sheetName: string,
  _columnCount: number,
) {
  const match = updatedRange?.match(new RegExp(`^${sheetName}!A(\\d+):`));

  if (!match) {
    throw new Error(`Unable to parse updated range: ${updatedRange ?? "missing"}`);
  }

  return Number(match[1]);
}

function deriveQuarterYear(serviceDate: string) {
  const [yearText, monthText] = serviceDate.split("-");
  const month = Number(monthText);
  const quarter = Math.ceil(month / 3);

  return `${yearText}-Q${quarter}`;
}

function deriveScheduledMonth(serviceDate: string) {
  return serviceDate.split("-")[1] ?? "";
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
