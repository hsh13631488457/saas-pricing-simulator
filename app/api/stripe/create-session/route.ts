import { NextRequest } from "next/server";
import { stripeRequest, jsonError } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomId(prefix: string) {
  const g: any = globalThis;
  if (g.crypto?.randomUUID) return `${prefix}_${g.crypto.randomUUID().replace(/-/g, "")}`;
  return `${prefix}_${Date.now()}${Math.random().toString(16).slice(2, 10)}`;
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const secretKey = String(body?.secretKey ?? "").trim();
  if (!secretKey) return jsonError(400, "secretKey 必填");

  const amount = Number(body?.amount);
  const currency = String(body?.currency ?? "usd").trim().toLowerCase();
  const productName = String(body?.productName ?? "Test product").trim();
  const mode = (body?.mode === "subscription" ? "subscription" : "payment") as "payment" | "subscription";
  const quantity = Number(body?.quantity) > 0 ? Number(body.quantity) : 1;
  const customerEmail = String(body?.customerEmail ?? "").trim();
  const returnUrl = String(body?.returnUrl ?? "").trim();
  const locale = String(body?.locale ?? "").trim();
  const interval = String(body?.interval ?? "month").trim();
  const intervalCount = Number(body?.intervalCount) > 0 ? Number(body.intervalCount) : 1;

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError(400, "amount 必须是正数（最小货币单位，如 1000 表示 $10.00）");
  }
  if (!returnUrl) return jsonError(400, "returnUrl 必填");

  const priceData: any = {
    currency,
    unit_amount: Math.round(amount),
    product_data: { name: productName },
  };
  if (mode === "subscription") {
    priceData.recurring = { interval, interval_count: intervalCount };
  }

  const payload: any = {
    ui_mode: "elements",
    mode,
    return_url: returnUrl,
    line_items: [{ price_data: priceData, quantity }],
  };
  if (customerEmail) payload.customer_email = customerEmail;
  if (locale) payload.locale = locale;
  if (mode === "payment") payload.customer_creation = "always";

  const r = await stripeRequest(secretKey, "/checkout/sessions", "POST", payload);
  if (!r.ok || !r.data?.client_secret) {
    return jsonError(r.status || 502, r.data?.error?.message ?? "创建 Checkout Session 失败", r.data);
  }

  return Response.json({
    id: r.data.id,
    clientSecret: r.data.client_secret,
    mode: r.data.mode,
    amount,
    currency,
    requestId: randomId("req"),
  });
}
