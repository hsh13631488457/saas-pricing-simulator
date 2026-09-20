import { NextRequest } from "next/server";
import { getAccessToken, jsonError } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const appKey = String(body?.appKey ?? "").trim();
  const appSecret = String(body?.appSecret ?? "").trim();
  if (!appKey || !appSecret) return jsonError(400, "appKey 和 appSecret 必填");

  const r = await getAccessToken({ appKey, appSecret });
  if (!r.ok) {
    return jsonError(502, r.error ?? "刷新 token 失败", r.detail);
  }

  return Response.json({
    accessToken: r.token,
    expiresAt: r.expiresAt,
    cached: r.cached,
  });
}
