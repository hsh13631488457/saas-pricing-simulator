import { NextRequest } from "next/server";
import { stripeRequest, jsonError } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const secretKey = String(body?.secretKey ?? "").trim();
  const sessionId = String(body?.sessionId ?? "").trim();
  if (!secretKey) return jsonError(400, "secretKey 必填");
  if (!sessionId) return jsonError(400, "sessionId 必填");

  const r = await stripeRequest(
    secretKey,
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent&expand[]=subscription`,
    "GET",
  );

  if (!r.ok) {
    return jsonError(r.status || 502, r.data?.error?.message ?? "查询 Checkout Session 失败", r.data);
  }

  const session = r.data;
  const pi = session?.payment_intent;
  const sub = session?.subscription;

  return Response.json({
    id: session?.id,
    status: session?.status,
    paymentStatus: session?.payment_status,
    mode: session?.mode,
    amountTotal: session?.amount_total,
    currency: session?.currency,
    customerEmail: session?.customer_details?.email ?? null,
    paymentIntentId: pi?.id ?? null,
    paymentIntentStatus: pi?.status ?? null,
    subscriptionId: sub?.id ?? null,
    subscriptionStatus: sub?.status ?? null,
  });
}
