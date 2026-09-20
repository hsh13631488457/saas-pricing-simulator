import { NextRequest } from "next/server";
import { getAccessToken, clientIpFromHeaders } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  return handle(_req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

async function handle(_req: NextRequest) {
  const r = await getAccessToken();
  if (!r.ok) {
    return new Response(
      JSON.stringify({ error: r.error, detail: r.detail }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
  return new Response(
    JSON.stringify({
      accessToken: r.token,
      expiresAt: r.expiresAt,
      cached: r.cached,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
