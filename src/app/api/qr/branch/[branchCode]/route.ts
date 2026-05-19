import { buildBranchQrTarget } from "../../../../../lib/qr/targets";

interface BranchQrRouteProps {
  params: Promise<{
    branchCode: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: BranchQrRouteProps,
) {
  const { branchCode } = await params;
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return Response.redirect(buildBranchQrTarget(appBaseUrl, branchCode));
}
