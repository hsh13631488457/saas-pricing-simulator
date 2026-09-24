import { NextRequest } from "next/server";
import { baseUrl, login, uuid, jsonError, type Env } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 创建 Airwallex Payment Link（托管收银台链接）。
 * 注意：amount 用【主单位】（165.15 = 165.15 美元），
 * 与 PaymentIntent 的最小单位不同。
 */
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const env = (body?.env ?? "demo") as Env;
  const clientId = String(body?.clientId ?? "").trim();
  const apiKey = String(body?.apiKey ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const reusable = !!body?.reusable;

  if (!clientId || !apiKey) return jsonError(400, "clientId 和 apiKey 必填");
  if (!title) return jsonError(400, "title 必填");

  const amount = body?.amount === "" || body?.amount == null ? undefined : Number(body.amount);
  const currency = String(body?.currency ?? "").trim().toUpperCase();

  // Fixed pricing（定死金额）时必须同时给 amount 和 currency
  if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) {
    return jsonError(400, "amount 必须是正数（主单位，如 165.15 表示 165.15 美元）");
  }
  if (amount !== undefined && !currency) {
    return jsonError(400, "给了 amount 就必须给 currency（Fixed pricing）");
  }

  const auth = await login(env, clientId, apiKey);
  if (!auth.ok || !auth.data?.token) {
    return new Response(
      JSON.stringify({ error: "login failed", detail: auth.data }),
      { status: auth.status || 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const payload: any = { reusable, title };

  if (amount !== undefined) {
    payload.amount = amount;
    payload.currency = currency;
  }

  // 顾客需要填写的信息
  const info = body?.collectable_shopper_info ?? {};
  payload.collectable_shopper_info = {
    billing_address: !!info.billing_address,
    message: info.message === undefined ? true : !!info.message,
    phone_number: !!info.phone_number,
    reference: !!info.reference,
    shipping_address: !!info.shipping_address,
  };

  const description = String(body?.description ?? "").trim();
  if (description) payload.description = description;

  const reference = String(body?.reference ?? "").trim();
  if (reference) payload.reference = reference;

  const customerId = String(body?.customerId ?? "").trim();
  if (customerId) payload.customer_id = customerId;

  const expiresAt = String(body?.expires_at ?? "").trim();
  if (expiresAt) payload.expires_at = expiresAt;

  // 元数据：按 key=value 逐行解析
  const metadataRaw = String(body?.metadata ?? "").trim();
  if (metadataRaw) {
    const md: Record<string, string> = {};
    metadataRaw.split("\n").forEach((line) => {
      const i = line.indexOf("=");
      if (i > 0) md[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    if (Object.keys(md).length) payload.metadata = md;
  }

  const res = await fetch(`${baseUrl(env)}/api/v1/pa/payment_links/create`, {
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

  const out = res.ok
    ? { ...(data ?? {}), _request: payload, _requestId: uuid() }
    : { error: data?.message ?? data?.code ?? `创建失败 (HTTP ${res.status})`, detail: data, _request: payload };

  return new Response(JSON.stringify(out), {
    status: res.ok ? 200 : res.status || 502,
    headers: { "Content-Type": "application/json" },
  });
}
