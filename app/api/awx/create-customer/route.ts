import { NextRequest } from "next/server";
import { baseUrl, login, uuid, jsonError, type Env } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const env = (body?.env ?? "demo") as Env;
  const clientId = String(body?.clientId ?? "").trim();
  const apiKey = String(body?.apiKey ?? "").trim();
  const merchantCustomerId = String(body?.merchantCustomerId ?? "").trim() || `cust_${Date.now()}`;
  const email = String(body?.email ?? "").trim();

  if (!clientId || !apiKey) return jsonError(400, "clientId 和 apiKey 必填");

  const auth = await login(env, clientId, apiKey);
  if (!auth.ok || !auth.data?.token) {
    return new Response(
      JSON.stringify({ error: "login failed", detail: auth.data }),
      { status: auth.status || 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const payload: any = {
    request_id: uuid(),
    merchant_customer_id: merchantCustomerId,
  };
  if (email) payload.email = email;

  const res = await fetch(`${baseUrl(env)}/api/v1/pa/customers/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.data.token}`,
    },
    body: JSON.stringify(payload),
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
