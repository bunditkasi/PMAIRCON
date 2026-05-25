import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import AdmZip from "adm-zip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { Resvg } from "@resvg/resvg-js";

import type { LiveSheetCollections } from "../google/sheets-live";
import { buildBranchQrTarget, buildUnitQrTarget } from "./targets";

export const DEFAULT_QR_EXPORT_BASE_URL = "https://pmaircon.vercel.app";

const QR_LABEL_WIDTH = 420;
const QR_LABEL_HEIGHT = 520;
const QR_FONT_FILE = path.join(
  process.cwd(),
  "node_modules",
  "@fontsource-variable",
  "inter",
  "files",
  "inter-latin-wght-normal.woff2",
);

export interface BranchQrExportRow {
  id: string;
  branchCode: string;
  outletName: string;
  region: string;
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
  outletName: string;
  region: string;
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
  zipPath?: string | null;
  manifestPath?: string | null;
}

export interface QrExportExecutionOptions {
  appBaseUrl?: string;
  outputRoot: string;
  branchCodes?: string[];
  unitIds?: string[];
  regions?: string[];
  includeBranches: boolean;
  includeUnits: boolean;
  zipOutputs?: boolean;
  manifestData?: Record<string, unknown>;
}

export interface QrExportExecutionResult {
  branchCount: number;
  unitCount: number;
  skippedBranchCount: number;
  skippedUnitCount: number;
  assetSummary: {
    branches: QrAssetSummary | null;
    units: QrAssetSummary | null;
  };
}

export interface QrRenderableRow {
  id: string;
  fileName: string;
  title: string;
  subtitle: string;
  badge: string;
  targetUrl: string;
}

interface RenderedQrLabel {
  row: QrRenderableRow;
  pngBuffer: Buffer;
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
      region: branch.region || "",
      targetUrl: buildBranchQrTarget(appBaseUrl, branch.branchCode),
      fileName: `${branch.branchCode}.png`,
      title: branch.branchCode,
      subtitle: formatBranchQrSubtitle(branch.outletName),
      badge: "BRANCH",
    });
  }

  const unitRows: UnitQrExportRow[] = [];
  let skippedUnitCount = 0;
  const regionByBranchCode = new Map(
    collections.branches.map((branch) => [branch.branchCode, branch.region || ""]),
  );
  const outletNameByBranchCode = new Map(
    collections.branches.map((branch) => [branch.branchCode, branch.outletName || ""]),
  );

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
      outletName: outletNameByBranchCode.get(unit.branchCode) || "",
      region: regionByBranchCode.get(unit.branchCode) || "",
      targetUrl: buildUnitQrTarget(appBaseUrl, unit.unitId),
      fileName: `${unit.unitId}.png`,
      title: unit.unitId,
      subtitle: formatUnitQrSubtitle(outletNameByBranchCode.get(unit.branchCode) || "", unit.branchCode),
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
  options: {
    branchCodes?: string[];
    regions?: string[];
  } = {},
): BranchQrExportRow[] {
  const selectedBranchCodes = normalizeSelection(options.branchCodes ?? []);
  const selectedRegions = normalizeSelection(options.regions ?? []);

  return rows.filter((row) => {
    const matchesBranchCode =
      selectedBranchCodes.size === 0 || selectedBranchCodes.has(row.branchCode.toUpperCase());
    const matchesRegion =
      selectedRegions.size === 0 || selectedRegions.has((row.region || "").trim().toUpperCase());

    return matchesBranchCode && matchesRegion;
  });
}

export function filterUnitQrExportRows(
  rows: UnitQrExportRow[],
  options: {
    branchCodes?: string[];
    unitIds?: string[];
    regions?: string[];
  } = {},
): UnitQrExportRow[] {
  const selectedUnits = normalizeSelection(options.unitIds ?? []);

  if (selectedUnits.size > 0) {
    const selectedRegions = normalizeSelection(options.regions ?? []);

    return rows.filter((row) => {
      const matchesUnit = selectedUnits.has(row.unitId.toUpperCase());
      const matchesRegion =
        selectedRegions.size === 0 || selectedRegions.has((row.region || "").trim().toUpperCase());

      return matchesUnit && matchesRegion;
    });
  }

  const selectedBranches = normalizeSelection(options.branchCodes ?? []);
  const selectedRegions = normalizeSelection(options.regions ?? []);

  return rows.filter((row) => {
    const matchesBranch =
      selectedBranches.size === 0 || selectedBranches.has(row.branchCode.toUpperCase());
    const matchesRegion =
      selectedRegions.size === 0 || selectedRegions.has((row.region || "").trim().toUpperCase());

    return matchesBranch && matchesRegion;
  });
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
  const renderedLabels = await renderQrLabelsInBatches(rows);

  return writeQrPdfSheetFromRenderedLabels(renderedLabels, pdfPath);
}

export async function writeQrPdfSheetFromRenderedLabels(
  renderedLabels: RenderedQrLabel[],
  pdfPath: string,
): Promise<string | null> {
  if (renderedLabels.length === 0) {
    return null;
  }

  await mkdir(path.dirname(pdfPath), { recursive: true });

  const pdf = await PDFDocument.create();
  const headingFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
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
  const cardPadding = 18;
  const titleSize = 16;
  const subtitleSize = 11;
  const imageTopGap = 56;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let slotIndex = 0;

  for (const renderedLabel of renderedLabels) {
    if (slotIndex > 0 && slotIndex % (columns * rowsPerPage) === 0) {
      page = pdf.addPage([pageWidth, pageHeight]);
    }

    const qrImage = await pdf.embedPng(renderedLabel.pngBuffer);
    const positionIndex = slotIndex % (columns * rowsPerPage);
    const column = positionIndex % columns;
    const line = Math.floor(positionIndex / columns);
    const x = marginX + column * (cardWidth + gapX);
    const y = pageHeight - marginTop - (line + 1) * cardHeight - line * gapY;
    const titleY = y + cardHeight - cardPadding - titleSize;
    const subtitleY = titleY - 18;
    const imageX = x + cardPadding;
    const imageY = y + cardPadding;
    const imageWidth = cardWidth - cardPadding * 2;
    const imageHeight = cardHeight - imageTopGap - cardPadding;

    page.drawText(renderedLabel.row.title, {
      x: x + cardPadding,
      y: titleY,
      size: titleSize,
      font: headingFont,
      color: rgb(0.06, 0.17, 0.15),
    });

    page.drawText(renderedLabel.row.subtitle, {
      x: x + cardPadding,
      y: subtitleY,
      size: subtitleSize,
      font: bodyFont,
      color: rgb(0.27, 0.38, 0.36),
    });

    page.drawImage(qrImage, {
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
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
  zipOutputs?: boolean;
  manifestData?: Record<string, unknown>;
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
        input.zipOutputs ?? false,
        input.manifestData ?? {},
      )
    : null;

  const units = input.includeUnits
    ? await exportQrAssetGroup(
        input.unitRows,
        unitsDirectory,
        path.join(input.outputRoot, "unit-qr-sheet.pdf"),
        input.zipOutputs ?? false,
        input.manifestData ?? {},
      )
    : null;

  return { branches, units };
}

export async function executeQrExport(
  collections: LiveSheetCollections,
  options: QrExportExecutionOptions,
): Promise<QrExportExecutionResult> {
  const exportRows = buildQrExportRows(
    collections,
    options.appBaseUrl ?? DEFAULT_QR_EXPORT_BASE_URL,
  );

  const branchRows = options.includeBranches
    ? filterBranchQrExportRows(exportRows.branchRows, {
        branchCodes: options.branchCodes ?? [],
        regions: options.regions ?? [],
      })
    : [];

  const unitRows = options.includeUnits
    ? filterUnitQrExportRows(exportRows.unitRows, {
        branchCodes: options.branchCodes ?? [],
        unitIds: options.unitIds ?? [],
        regions: options.regions ?? [],
      })
    : [];

  const assetSummary = await exportQrAssets({
    branchRows,
    unitRows,
    outputRoot: options.outputRoot,
    includeBranches: options.includeBranches,
    includeUnits: options.includeUnits,
    zipOutputs: options.zipOutputs ?? true,
    manifestData: options.manifestData ?? {},
  });

  return {
    branchCount: branchRows.length,
    unitCount: unitRows.length,
    skippedBranchCount: exportRows.skippedBranchCount,
    skippedUnitCount: exportRows.skippedUnitCount,
    assetSummary,
  };
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

export function formatUnitQrSubtitle(outletName: string, branchCode: string): string {
  return (outletName.trim() || branchCode.trim() || "UNKNOWN OUTLET").toUpperCase();
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
    font: {
      defaultFontFamily: "Inter",
      fontFiles: [QR_FONT_FILE],
      loadSystemFonts: false,
    },
  }).render();

  return rendered.asPng();
}

async function renderQrLabelsInBatches(
  rows: QrRenderableRow[],
  batchSize = 24,
): Promise<RenderedQrLabel[]> {
  const renderedLabels: RenderedQrLabel[] = [];

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const renderedBatch = await Promise.all(
      batch.map(async (row) => ({
        row,
        pngBuffer: await renderQrLabelPng(row),
      })),
    );

    renderedLabels.push(...renderedBatch);
  }

  return renderedLabels;
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
      <text x="32" y="48" font-size="12" font-family="Inter" fill="#46625B" font-weight="700" letter-spacing="2">${badge}</text>
      <text x="32" y="84" font-size="34" font-family="Inter" fill="#0F2B25" font-weight="700">${title}</text>
      <text x="32" y="116" font-size="18" font-family="Inter" fill="#46625B">${subtitle}</text>
      <rect x="70" y="144" width="280" height="280" rx="20" fill="#FFFFFF" stroke="#D9E5E0" stroke-width="2"/>
      <image x="86" y="160" width="248" height="248" href="${input.qrDataUrl}" />
      <text x="32" y="458" font-size="14" font-family="Inter" fill="#46625B" font-weight="700">Scan to open record</text>
      <text x="32" y="486" font-size="11" font-family="Inter" fill="#6C857D">${targetUrl}</text>
    </svg>
  `.trim();
}

async function exportQrAssetGroup(
  rows: Array<BranchQrExportRow | UnitQrExportRow>,
  pngDirectory: string,
  pdfPath: string,
  zipOutputs: boolean,
  manifestData: Record<string, unknown>,
): Promise<QrAssetSummary> {
  const renderableRows = toRenderableRows(rows);
  const renderedLabels = await renderQrLabelsInBatches(renderableRows);

  await mkdir(pngDirectory, { recursive: true });
  await Promise.all(
    renderedLabels.map((renderedLabel) =>
      writeFile(
        path.join(pngDirectory, renderedLabel.row.fileName),
        renderedLabel.pngBuffer,
      ),
    ),
  );

  const writtenPdfPath = await writeQrPdfSheetFromRenderedLabels(
    renderedLabels,
    pdfPath,
  );
  let zipPath: string | null = null;
  let manifestPath: string | null = null;

  if (zipOutputs) {
    const manifest = {
      ...manifestData,
      generatedAt: new Date().toISOString(),
      pngCount: renderedLabels.length,
      pdfPath: writtenPdfPath,
      pngDirectory,
      ids: rows.map((row) => row.id),
    };

    manifestPath = path.join(path.dirname(pdfPath), `${path.parse(pdfPath).name}.manifest.json`);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    zipPath = path.join(path.dirname(pdfPath), `${path.parse(pdfPath).name}.zip`);
    await writeZipBundle({
      pngDirectory,
      pdfPath: writtenPdfPath,
      manifestPath,
      zipPath,
    });
  }

  return {
    pngCount: renderedLabels.length,
    pdfPath: writtenPdfPath,
    pngDirectory,
    zipPath,
    manifestPath,
  };
}

async function writeZipBundle(input: {
  pngDirectory: string;
  pdfPath: string | null;
  manifestPath: string | null;
  zipPath: string;
}) {
  const zip = new AdmZip();

  zip.addLocalFolder(input.pngDirectory, path.basename(input.pngDirectory));

  if (input.pdfPath) {
    zip.addLocalFile(input.pdfPath, "", path.basename(input.pdfPath));
  }

  if (input.manifestPath) {
    zip.addLocalFile(input.manifestPath, "", path.basename(input.manifestPath));
  }

  await mkdir(path.dirname(input.zipPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    zip.writeZip(input.zipPath, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
