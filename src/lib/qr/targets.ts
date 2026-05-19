function buildQrTarget(
  appBaseUrl: string,
  pathname: string,
) {
  return new URL(pathname, `${appBaseUrl}/`).toString();
}

export function buildUnitQrTarget(appBaseUrl: string, unitId: string) {
  return buildQrTarget(appBaseUrl, `units/${encodeURIComponent(unitId)}`);
}

export function buildBranchQrTarget(appBaseUrl: string, branchCode: string) {
  return buildQrTarget(
    appBaseUrl,
    `branches/${encodeURIComponent(branchCode)}`,
  );
}
