import { NextRequest } from "next/server";
import { login, jsonError, type Env } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const env = (body?.env ?? "demo") as Env;
  const clientId = String(body?.clientId ?? "").trim();
  const apiKey = String(body?.apiKey ?? "").trim();
  if (!clientId || !apiKey) return jsonError(400, "clientId 和 apiKey 必填");

  const r = await login(env, clientId, apiKey);
  return new Response(JSON.stringify(r.data ?? {}), {
    status: r.ok ? 200 : r.status || 502,
    headers: { "Content-Type": "application/json" },
  });
}
