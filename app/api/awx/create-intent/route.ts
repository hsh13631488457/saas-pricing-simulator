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
  const amount = Number(body?.amount);
  const currency = String(body?.currency ?? "").trim().toUpperCase();
  const merchantOrderId = String(body?.merchantOrderId ?? "").trim() || `D${Date.now()}`;
  const returnUrl = String(body?.returnUrl ?? "").trim() || "https://example.com/payment-return";
  const customerId = String(body?.customerId ?? "").trim();

  if (!clientId || !apiKey) return jsonError(400, "clientId 和 apiKey 必填");
  if (!Number.isFinite(amount) || amount <= 0) return jsonError(400, "amount 必须是正数（最小单位，如 100 表示 1.00 USD）");
  if (!currency) return jsonError(400, "currency 必填");

  const auth = await login(env, clientId, apiKey);
  if (!auth.ok || !auth.data?.token) {
    return new Response(
      JSON.stringify({ error: "login failed", detail: auth.data }),
      { status: auth.status || 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const payload: any = {
    request_id: uuid(),
    amount,
    currency,
    merchant_order_id: merchantOrderId,
    return_url: returnUrl,
  };
  if (customerId) payload.customer_id = customerId;

  const res = await fetch(`${baseUrl(env)}/api/v1/pa/payment_intents/create`, {
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
