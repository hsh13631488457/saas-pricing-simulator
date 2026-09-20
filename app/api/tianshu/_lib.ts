/**
 * 天枢（TianShu）后端服务接入
 *
 * 固定使用测试环境。appKey / appSecret 由调用方从前端表单传入，
 * 不在代码或环境变量里保存。
 */

export const TIANSHU_BASE = "https://open-test.ibestfanli.com";

/** 固定的 Authorization 参数 */
const PRD_ID = "99999962";
const PACKAGE_NAME = "com.faxing.open";
const APP_VERSION_CODE = 100;
const APP_VERSION = "1.0.0";
const MANUFACTURER = "Apple";
const MODEL = "iPhone 16 Plus";
const CURRENT_CHANNEL = "61";
/** 网页场景没有真实设备 IP，用文档示例值占位 */
const FALLBACK_IP = "58.63.48.166";

/* ────────── Access-Token 缓存 ────────── */

interface TokenCache {
  token: string;
  /** 毫秒时间戳，来自接口的 expiresIn */
  expiresAt: number;
  /** 上一次成功刷新的时间（毫秒），用于实现 1 分钟内复用 */
  fetchedAt: number;
}

/** 按 appKey 分别缓存，避免不同凭证之间串用 token */
const tokenCache = new Map<string, TokenCache>();
/** 并发锁：同一 appKey 同一时刻只允许一次刷新在飞 */
const inflight = new Map<string, Promise<TokenResult>>();

export interface TokenResult {
  ok: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
  detail?: unknown;
  /** 是否复用了缓存 */
  cached?: boolean;
}

export interface AppCreds {
  appKey: string;
  appSecret: string;
}

/**
 * 刷新 / 获取 access-token。
 *
 * 遵循接口约束：
 *  - token 默认 24h 有效
 *  - 两次刷新间隔 < 1 分钟会返回同一个 token，因此这里直接复用缓存，不重复请求
 *  - 并发调用共享同一次刷新（in-flight 锁）
 */
export async function getAccessToken(creds: AppCreds, force = false): Promise<TokenResult> {
  const now = Date.now();
  const { appKey, appSecret } = creds;

  const cached = tokenCache.get(appKey);
  if (!force && cached && now < cached.expiresAt) {
    return { ok: true, token: cached.token, expiresAt: cached.expiresAt, cached: true };
  }

  const pending = inflight.get(appKey);
  if (pending) return pending;

  const task = (async (): Promise<TokenResult> => {
    try {
      const res = await fetch(`${TIANSHU_BASE}/overseas_developer_service/refreshAccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appKey, appSecret }),
        cache: "no-store",
      });

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

      if (!data || data.code !== 0 || !data.data?.accessToken) {
        return {
          ok: false,
          error: data?.msg ?? `刷新 token 失败 (HTTP ${res.status})`,
          detail: data,
        };
      }

      const expiresAt = Number(data.data.expiresIn) || now + 24 * 3600 * 1000;
      tokenCache.set(appKey, {
        token: data.data.accessToken,
        expiresAt,
        fetchedAt: now,
      });

      return { ok: true, token: data.data.accessToken, expiresAt, cached: false };
    } catch (e: any) {
      return { ok: false, error: `请求天枢失败：${e?.message ?? String(e)}` };
    } finally {
      inflight.delete(appKey);
    }
  })();

  inflight.set(appKey, task);
  return task;
}

/* ────────── Authorization 头 ────────── */

export function buildAuthorization(deviceId: string, ip?: string) {
  const numericDevice = deviceId.replace(/\D/g, "");
  return {
    prdId: PRD_ID,
    deviceId,
    timestamp: Date.now(),
    appVersionCode: APP_VERSION_CODE,
    ip: ip || FALLBACK_IP,
    /** 中台用户 id；未登录场景下退化为 prdId + 设备数字部分 */
    userId: Number(`${PRD_ID}${numericDevice}`.slice(0, 18)) || 0,
    packageName: PACKAGE_NAME,
    model: MODEL,
    appVersion: APP_VERSION,
    manufacturer: MANUFACTURER,
    currentChannel: CURRENT_CHANNEL,
  };
}

export function buildDistinctId(deviceId: string) {
  return `${PRD_ID}-${deviceId}`;
}

/* ────────── 从请求里解析用户公网 IP ────────── */

export function clientIpFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first && /^\d{1,3}(\.\d{1,3}){3}$/.test(first)) return first;
  }
  const real = h.get("x-real-ip");
  if (real && /^\d{1,3}(\.\d{1,3}){3}$/.test(real)) return real;
  return FALLBACK_IP;
}

export function jsonError(status: number, message: string, detail?: unknown) {
  return new Response(
    JSON.stringify({ error: message, detail: detail ?? null }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
