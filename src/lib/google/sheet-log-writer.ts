import { createSign } from "node:crypto";

import { createGoogleAuthConfig } from "./auth";

import type { PmLogRollbackToken } from "../services/pm-service";
import type { SavePmLogInput } from "../services/pm-service";
import type {
  RecordReplacementInput,
  ReplacementRecordRollbackToken,
  ReplacementUnitRollbackToken,
} from "../services/replacement-service";
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
const REPLACEMENT_HEADERS = 13;
const UNIT_HEADERS = 21;

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
    async findExistingPmLog(input: SavePmLogInput) {
      const rows = await fetchSheetValues(
        fetchImpl,
        accessTokenProvider,
        resolvedSheetId,
        "PM_Logs!A:R",
      );

      return rows.slice(1).some((row) => {
        const unitId = normalizeSheetValue(row[2]);
        const serviceDate = normalizeSheetValue(row[6]);
        const serviceStatus = normalizeSheetValue(row[7]);
        const technicianName = normalizeSheetValue(row[8], true);

        return (
          unitId === normalizeSheetValue(input.unitId) &&
          serviceDate === normalizeSheetValue(input.serviceDate) &&
          serviceStatus === normalizeSheetValue(input.serviceStatus) &&
          technicianName === normalizeSheetValue(input.technicianName, true)
        );
      });
    },

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

    async findExistingRepairLog(input: SaveRepairLogInput) {
      const rows = await fetchSheetValues(
        fetchImpl,
        accessTokenProvider,
        resolvedSheetId,
        "Repair_Logs!A:R",
      );

      return rows.slice(1).some((row) => {
        const unitId = normalizeSheetValue(row[2]);
        const serviceDate = normalizeSheetValue(row[4]);
        const issueDetail = normalizeSheetValue(row[6], true);
        const repairStatus = normalizeSheetValue(row[8]);

        return (
          unitId === normalizeSheetValue(input.unitId) &&
          serviceDate === normalizeSheetValue(input.serviceDate) &&
          issueDetail === normalizeSheetValue(input.issueDetail, true) &&
          repairStatus === normalizeSheetValue(input.repairStatus)
        );
      });
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

    async appendReplacementRecord(
      input: RecordReplacementInput,
    ): Promise<ReplacementRecordRollbackToken> {
      const timestamp = now().toISOString();
      const replacementId = `REPLACE-${timestamp}-${randomId()}`;
      const response = await withAuthJson(
        `/values/${encodeURIComponent("Replacement_History!A:M")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          body: JSON.stringify({
            values: [[
              replacementId,
              input.oldUnitId,
              input.branchCode,
              input.decisionDate,
              input.reason,
              "webapp",
              "REPLACED",
              input.newUnitId,
              "",
              "",
              input.decisionDate,
              "",
              `Replacement for ${input.oldUnitId}`,
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
          "Replacement_History",
          REPLACEMENT_HEADERS,
        ),
      };
    },

    async deleteReplacementRecord(
      _input: RecordReplacementInput,
      rollbackToken?: ReplacementRecordRollbackToken,
    ) {
      await deleteSheetRow(
        fetchImpl,
        accessTokenProvider,
        resolvedSheetId,
        "Replacement_History",
        rollbackToken,
      );
    },

    async createReplacementUnit(
      input: RecordReplacementInput,
    ): Promise<ReplacementUnitRollbackToken> {
      const timestamp = now().toISOString();
      const unitDetails = parseUnitId(input.newUnitId);
      const response = await withAuthJson(
        `/values/${encodeURIComponent("Units!A:U")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          body: JSON.stringify({
            values: [[
              input.newUnitId,
              input.branchCode,
              unitDetails.unitNo,
              unitDetails.unitType,
              unitDetails.unitLabel,
              "",
              "",
              "",
              "",
              input.decisionDate,
              "",
              "ACTIVE",
              "REPLACEMENT",
              "",
              "",
              "",
              "",
              "",
              `Replacement for ${input.oldUnitId}`,
              timestamp,
              timestamp,
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
          "Units",
          UNIT_HEADERS,
        ),
      };
    },

    async deleteReplacementUnit(
      _input: RecordReplacementInput,
      rollbackToken?: ReplacementUnitRollbackToken,
    ) {
      await deleteSheetRow(
        fetchImpl,
        accessTokenProvider,
        resolvedSheetId,
        "Units",
        rollbackToken,
      );
    },

    async markUnitReplaced(oldUnitId: string, reason: string) {
      const rowIndex = await findUnitRowIndex(
        fetchImpl,
        accessTokenProvider,
        resolvedSheetId,
        oldUnitId,
      );
      await batchUpdateValues(fetchImpl, accessTokenProvider, resolvedSheetId, [
        { range: `Units!L${rowIndex}`, values: [["REPLACED"]] },
        { range: `Units!R${rowIndex}`, values: [["TRUE"]] },
        { range: `Units!S${rowIndex}`, values: [[reason]] },
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

async function fetchSheetValues(
  fetchImpl: typeof fetch,
  getAccessToken: () => Promise<string>,
  spreadsheetId: string,
  range: string,
) {
  const accessToken = await getAccessToken();
  const response = await fetchImpl(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read sheet values: ${response.status}`);
  }

  const payload = (await response.json()) as { values?: string[][] };

  return payload.values ?? [];
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
  sheetName: "PM_Logs" | "Repair_Logs" | "Replacement_History" | "Units",
  rollbackToken?: { rowIndex: number },
) {
  if (!rollbackToken) {
    return;
  }

  const accessToken = await getAccessToken();
  const sheetId = await findSheetId(
    fetchImpl,
    accessToken,
    spreadsheetId,
    sheetName,
  );
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

async function findSheetId(
  fetchImpl: typeof fetch,
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
) {
  const response = await fetchImpl(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read sheet metadata: ${response.status}`);
  }

  const payload = (await response.json()) as {
    sheets?: Array<{ properties?: { title?: string; sheetId?: number } }>;
  };
  const match = payload.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName,
  );

  if (match?.properties?.sheetId === undefined) {
    throw new Error(`Sheet not found in metadata: ${sheetName}`);
  }

  return match.properties.sheetId;
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

function parseUnitId(unitId: string) {
  const match = unitId.match(/^[^-]+-([A-Z]+)-(.+)$/);

  if (!match) {
    return {
      unitType: "",
      unitNo: "",
      unitLabel: "Replacement unit",
    };
  }

  const [, unitType, unitNo] = match;

  return {
    unitType,
    unitNo,
    unitLabel: `Replacement ${unitType} ${unitNo}`,
  };
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

function normalizeSheetValue(value: string | undefined, lowercase = false) {
  const normalized = String(value ?? "").trim();

  return lowercase ? normalized.toLowerCase() : normalized;
}
