/**
 * Stripe 服务端接入
 *
 * 不依赖 stripe npm 包，直接用 fetch 调 Stripe REST API
 * （沙箱内无法访问 npm registry，且 REST 调用足够简单）。
 */

export const STRIPE_API = "https://api.stripe.com/v1";

/**
 * `ui_mode: "elements"`（Checkout Sessions + Elements）需要这个 API 版本，
 * 否则 Stripe 会报 "Invalid ui_mode: elements"。
 */
export const STRIPE_API_VERSION = "2026-03-25.dahlia";

/** Stripe 的 REST API 用 form-urlencoded，不是 JSON */
export function formEncode(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") {
          parts.push(formEncode(item, `${key}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof v === "object") {
      parts.push(formEncode(v, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

export async function stripeRequest(
  secretKey: string,
  path: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, any>,
) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_API_VERSION,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: formEncode(body) } : {}),
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

export function jsonError(status: number, message: string, detail?: unknown) {
  return new Response(
    JSON.stringify({ error: message, detail: detail ?? null }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
