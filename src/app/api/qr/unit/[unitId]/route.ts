import { buildUnitQrTarget } from "../../../../../lib/qr/targets";

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
