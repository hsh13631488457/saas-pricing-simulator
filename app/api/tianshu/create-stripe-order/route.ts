import { NextRequest } from "next/server";
import {
  TIANSHU_BASE,
  getAccessToken,
  buildAuthorization,
  buildDistinctId,
  clientIpFromHeaders,
  jsonError,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 天枢支付渠道：5 = Stripe */
const STORE_STRIPE = 5;

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "Invalid JSON body"); }

  const appKey = String(body?.appKey ?? "").trim();
  const appSecret = String(body?.appSecret ?? "").trim();
  const deviceId = String(body?.deviceId ?? "").trim();
  const commodityId = String(body?.commodityId ?? "").trim();
  const payScene = String(body?.payScene ?? "website").trim();
  const transferParameter = String(body?.transferParameter ?? "").trim();

  if (!appKey || !appSecret) return jsonError(400, "appKey 和 appSecret 必填");
  if (!deviceId) return jsonError(400, "deviceId 必填");
  if (!commodityId) return jsonError(400, "commodityId 必填");

  const auth = await getAccessToken({ appKey, appSecret });
  if (!auth.ok || !auth.token) {
    return jsonError(502, auth.error ?? "获取 access-token 失败", auth.detail);
  }

  const authorization = buildAuthorization(deviceId, clientIpFromHeaders(req.headers));

  const payload = {
    data: {
      commodityId,
      distinctId: buildDistinctId(deviceId),
      prdId: authorization.prdId,
      store: STORE_STRIPE,
      payScene,
      ...(transferParameter ? { transferParameter } : {}),
    },
  };

  let res: Response;
  try {
    res = await fetch(`${TIANSHU_BASE}/overseas_store_service/s2s/purchase/createStripeSubscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": auth.token,
        Authorization: JSON.stringify(authorization),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (e: any) {
    return jsonError(502, `请求天枢失败：${e?.message ?? String(e)}`);
  }

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  const failed = !res.ok || (data && typeof data.code === "number" && data.code !== 0);
  const out = failed
    ? {
        ...(data ?? {}),
        _debug: {
          upstreamStatus: res.status,
          traceId: data?.traceId ?? res.headers.get("traceid") ?? null,
          requestSent: {
            payload,
            authorization,
            tokenCached: auth.cached,
            appKey: appKey.slice(0, 4) + "…",
          },
        },
      }
    : data;

  return new Response(JSON.stringify(out), {
    status: res.ok ? 200 : res.status || 502,
    headers: { "Content-Type": "application/json" },
  });
}
