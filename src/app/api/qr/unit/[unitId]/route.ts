function buildQrTarget(
  appBaseUrl: string,
  pathname: string,
) {
  return new URL(pathname, `${appBaseUrl}/`).toString();
}

export function buildUnitQrTarget(appBaseUrl: string, unitId: string) {
  return buildQrTarget(appBaseUrl, `units/${encodeURIComponent(unitId)}`);
}

interface UnitQrRouteProps {
  params: Promise<{
    unitId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: UnitQrRouteProps,
) {
  const { unitId } = await params;
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return Response.redirect(buildUnitQrTarget(appBaseUrl, unitId));
}
