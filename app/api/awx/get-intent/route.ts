import { NextRequest } from "next/server";
import { baseUrl, login, jsonError, type Env } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const env = (body?.env ?? "demo") as Env;
  const clientId = String(body?.clientId ?? "").trim();
  const apiKey = String(body?.apiKey ?? "").trim();
  const intentId = String(body?.intentId ?? "").trim();

  if (!clientId || !apiKey) return jsonError(400, "clientId 和 apiKey 必填");
  if (!intentId) return jsonError(400, "intentId 必填");

  const auth = await login(env, clientId, apiKey);
  if (!auth.ok || !auth.data?.token) {
    return new Response(
      JSON.stringify({ error: "login failed", detail: auth.data }),
      { status: auth.status || 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const res = await fetch(`${baseUrl(env)}/api/v1/pa/payment_intents/${encodeURIComponent(intentId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.data.token}` },
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return new Response(JSON.stringify(data ?? {}), {
    status: res.ok ? 200 : res.status || 502,
    headers: { "Content-Type": "application/json" },
  });
}
