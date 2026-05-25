import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { Resvg } from "@resvg/resvg-js";

import type { LiveSheetCollections } from "../google/sheets-live";
import { buildBranchQrTarget, buildUnitQrTarget } from "./targets";

export const DEFAULT_QR_EXPORT_BASE_URL = "https://pmaircon.vercel.app";

const QR_LABEL_WIDTH = 420;
const QR_LABEL_HEIGHT = 520;

export interface BranchQrExportRow {
  id: string;
  branchCode: string;
  outletName: string;
  targetUrl: string;
  fileName: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface UnitQrExportRow {
  id: string;
  unitId: string;
  unitType: string;
  branchCode: string;
  targetUrl: string;
  fileName: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface QrExportBuildResult {
  branchRows: BranchQrExportRow[];
  unitRows: UnitQrExportRow[];
  skippedBranchCount: number;
  skippedUnitCount: number;
}

export interface QrSelectionOptions {
  branchCodes?: string[];
  unitIds?: string[];
  includeBranches?: boolean;
  includeUnits?: boolean;
}

export interface QrAssetSummary {
  pngCount: number;
  pdfPath: string | null;
  pngDirectory: string;
}

export interface QrRenderableRow {
  id: string;
  fileName: string;
  title: string;
  subtitle: string;
  badge: string;
  targetUrl: string;
}

export function buildQrExportRows(
  collections: LiveSheetCollections,
  appBaseUrl = DEFAULT_QR_EXPORT_BASE_URL,
): QrExportBuildResult {
  const branchRows: BranchQrExportRow[] = [];
  let skippedBranchCount = 0;

  for (const branch of collections.branches) {
    if (!branch.branchCode) {
      skippedBranchCount += 1;
      continue;
    }

    branchRows.push({
      id: branch.branchCode,
      branchCode: branch.branchCode,
      outletName: branch.outletName || "",
      targetUrl: buildBranchQrTarget(appBaseUrl, branch.branchCode),
      fileName: `${branch.branchCode}.png`,
      title: branch.branchCode,
      subtitle: formatBranchQrSubtitle(branch.outletName),
      badge: "BRANCH",
    });
  }

  const unitRows: UnitQrExportRow[] = [];
  let skippedUnitCount = 0;

  for (const unit of collections.units) {
    if (!unit.unitId || !unit.branchCode) {
      skippedUnitCount += 1;
      continue;
    }

    const unitType = normalizeUnitType(unit.unitType || extractUnitType(unit.unitId));

    unitRows.push({
      id: unit.unitId,
      unitId: unit.unitId,
      unitType,
      branchCode: unit.branchCode,
      targetUrl: buildUnitQrTarget(appBaseUrl, unit.unitId),
      fileName: `${unit.unitId}.png`,
      title: unit.unitId,
      subtitle: formatUnitQrSubtitle(unitType, unit.branchCode),
      badge: "UNIT",
    });
  }

  return {
    branchRows,
    unitRows,
    skippedBranchCount,
    skippedUnitCount,
  };
}

export function filterBranchQrExportRows(
  rows: BranchQrExportRow[],
  branchCodes: string[] = [],
): BranchQrExportRow[] {
  const selected = normalizeSelection(branchCodes);

  if (selected.size === 0) {
    return rows;
  }

  return rows.filter((row) => selected.has(row.branchCode.toUpperCase()));
}

export function filterUnitQrExportRows(
  rows: UnitQrExportRow[],
  options: {
    branchCodes?: string[];
    unitIds?: string[];
  } = {},
): UnitQrExportRow[] {
  const selectedUnits = normalizeSelection(options.unitIds ?? []);

  if (selectedUnits.size > 0) {
    return rows.filter((row) => selectedUnits.has(row.unitId.toUpperCase()));
  }

  const selectedBranches = normalizeSelection(options.branchCodes ?? []);

  if (selectedBranches.size === 0) {
    return rows;
  }

  return rows.filter((row) => selectedBranches.has(row.branchCode.toUpperCase()));
}

export async function writeQrPngAssets(
  rows: QrRenderableRow[],
  outputDirectory: string,
): Promise<number> {
  await mkdir(outputDirectory, { recursive: true });

  let pngCount = 0;

  for (const row of rows) {
    const pngBuffer = await renderQrLabelPng(row);
    await writeFile(path.join(outputDirectory, row.fileName), pngBuffer);
    pngCount += 1;
  }

  return pngCount;
}

export async function writeQrPdfSheet(
  rows: QrRenderableRow[],
  pdfPath: string,
): Promise<string | null> {
  if (rows.length === 0) {
    return null;
  }

  await mkdir(path.dirname(pdfPath), { recursive: true });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const columns = 2;
  const rowsPerPage = 3;
  const marginX = 24;
  const marginTop = 40;
  const marginBottom = 32;
  const gapX = 16;
  const gapY = 18;
  const cardWidth = (pageWidth - marginX * 2 - gapX) / columns;
  const cardHeight = (pageHeight - marginTop - marginBottom - gapY * (rowsPerPage - 1)) / rowsPerPage;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let slotIndex = 0;

  for (const row of rows) {
    if (slotIndex > 0 && slotIndex % (columns * rowsPerPage) === 0) {
      page = pdf.addPage([pageWidth, pageHeight]);
    }

    const pngBytes = await renderQrLabelPng(row);
    const qrImage = await pdf.embedPng(pngBytes);
    const positionIndex = slotIndex % (columns * rowsPerPage);
    const column = positionIndex % columns;
    const line = Math.floor(positionIndex / columns);
    const x = marginX + column * (cardWidth + gapX);
    const y = pageHeight - marginTop - (line + 1) * cardHeight - line * gapY;

    page.drawRectangle({
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      borderColor: rgb(0.78, 0.84, 0.82),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 0.985),
    });

    page.drawImage(qrImage, {
      x: x + 12,
      y: y + 12,
      width: cardWidth - 24,
      height: cardHeight - 24,
    });

    page.drawText(row.badge, {
      x: x + 16,
      y: y + cardHeight - 20,
      size: 7,
      font: boldFont,
      color: rgb(0.27, 0.35, 0.33),
    });

    page.drawText(row.title, {
      x: x + 16,
      y: y + cardHeight - 34,
      size: 11,
      font: boldFont,
      color: rgb(0.06, 0.12, 0.11),
    });

    page.drawText(row.subtitle, {
      x: x + 16,
      y: y + cardHeight - 48,
      size: 8,
      font,
      color: rgb(0.27, 0.35, 0.33),
      maxWidth: cardWidth - 32,
    });

    slotIndex += 1;
  }

  await writeFile(pdfPath, await pdf.save());
  return pdfPath;
}

export async function exportQrAssets(input: {
  branchRows: BranchQrExportRow[];
  unitRows: UnitQrExportRow[];
  outputRoot: string;
  includeBranches: boolean;
  includeUnits: boolean;
}): Promise<{
  branches: QrAssetSummary | null;
  units: QrAssetSummary | null;
}> {
  const branchesDirectory = path.join(input.outputRoot, "branches");
  const unitsDirectory = path.join(input.outputRoot, "units");

  const branches = input.includeBranches
    ? await exportQrAssetGroup(
        input.branchRows,
        branchesDirectory,
        path.join(input.outputRoot, "branch-qr-sheet.pdf"),
      )
    : null;

  const units = input.includeUnits
    ? await exportQrAssetGroup(
        input.unitRows,
        unitsDirectory,
        path.join(input.outputRoot, "unit-qr-sheet.pdf"),
      )
    : null;

  return { branches, units };
}

export function toRenderableRows(
  rows: Array<BranchQrExportRow | UnitQrExportRow>,
): QrRenderableRow[] {
  return rows.map((row) => ({
    id: row.id,
    fileName: row.fileName,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    targetUrl: row.targetUrl,
  }));
}

export function formatBranchQrSubtitle(outletName: string): string {
  return outletName.trim() || "UNKNOWN OUTLET";
}

export function formatUnitQrSubtitle(unitType: string, branchCode: string): string {
  return `${normalizeUnitType(unitType)} • ${branchCode}`.trim();
}

export function extractUnitType(unitId: string): string {
  const segments = unitId.split("-");

  return normalizeUnitType(segments[1] ?? "UNIT");
}

function normalizeUnitType(value: string): string {
  const normalized = value.trim().toUpperCase();

  return normalized || "UNIT";
}

function normalizeSelection(values: string[]): Set<string> {
  return new Set(
    values
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function renderQrLabelPng(row: QrRenderableRow): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(row.targetUrl, {
    width: 280,
    margin: 1,
    color: {
      dark: "#14332C",
      light: "#FFFFFFFF",
    },
  });

  const svg = createQrLabelSvg({
    badge: row.badge,
    qrDataUrl,
    subtitle: row.subtitle,
    targetUrl: row.targetUrl,
    title: row.title,
  });

  const rendered = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: QR_LABEL_WIDTH,
    },
  }).render();

  return rendered.asPng();
}

function createQrLabelSvg(input: {
  badge: string;
  qrDataUrl: string;
  subtitle: string;
  targetUrl: string;
  title: string;
}): string {
  const badge = escapeXml(input.badge);
  const title = escapeXml(input.title);
  const subtitle = escapeXml(input.subtitle);
  const targetUrl = escapeXml(input.targetUrl);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${QR_LABEL_WIDTH}" height="${QR_LABEL_HEIGHT}" viewBox="0 0 ${QR_LABEL_WIDTH} ${QR_LABEL_HEIGHT}">
      <rect x="8" y="8" width="${QR_LABEL_WIDTH - 16}" height="${QR_LABEL_HEIGHT - 16}" rx="28" fill="#FCFDFC" stroke="#C9D7D0" stroke-width="2"/>
      <text x="32" y="48" font-size="12" font-family="Arial, sans-serif" fill="#46625B" font-weight="700" letter-spacing="2">${badge}</text>
      <text x="32" y="84" font-size="34" font-family="Arial, sans-serif" fill="#0F2B25" font-weight="700">${title}</text>
      <text x="32" y="116" font-size="18" font-family="Arial, sans-serif" fill="#46625B">${subtitle}</text>
      <rect x="70" y="144" width="280" height="280" rx="20" fill="#FFFFFF" stroke="#D9E5E0" stroke-width="2"/>
      <image x="86" y="160" width="248" height="248" href="${input.qrDataUrl}" />
      <text x="32" y="458" font-size="14" font-family="Arial, sans-serif" fill="#46625B" font-weight="700">Scan to open record</text>
      <text x="32" y="486" font-size="11" font-family="Arial, sans-serif" fill="#6C857D">${targetUrl}</text>
    </svg>
  `.trim();
}

async function exportQrAssetGroup(
  rows: Array<BranchQrExportRow | UnitQrExportRow>,
  pngDirectory: string,
  pdfPath: string,
): Promise<QrAssetSummary> {
  const renderableRows = toRenderableRows(rows);
  const pngCount = await writeQrPngAssets(renderableRows, pngDirectory);
  const writtenPdfPath = await writeQrPdfSheet(renderableRows, pdfPath);

  return {
    pngCount,
    pdfPath: writtenPdfPath,
    pngDirectory,
  };
}
