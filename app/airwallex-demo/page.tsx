"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ────────── Airwallex SDK type shim ────────── */
declare global {
  interface Window {
    AirwallexComponentsSDK?: any;
    ApplePaySession?: any;
  }
}

/* ────────── 常量 ────────── */
const BUTTON_TYPES = [
  "buy", "check-out", "continue", "order", "pay", "plain", "subscribe",
  "add-money", "reload", "top-up", "book", "rent", "donate", "contribute",
  "support", "tip", "set-up",
] as const;

const CURRENCIES = ["USD", "HKD", "CNY", "SGD", "AUD", "GBP", "EUR", "JPY", "NZD", "CAD"];

const STORAGE_KEY = "awx-applepay-demo-v2";
const SKIP_PERSIST = new Set(["clientSecret", "apiKey", "tsAppSecret"]);

const DEFAULT_LINE_ITEMS = JSON.stringify(
  [
    {
      label: "Subscription",
      amount: "20.00",
      type: "final",
      paymentTiming: "recurring",
      recurringPaymentIntervalUnit: "month",
      recurringPaymentIntervalCount: 1,
    },
  ],
  null,
  2,
);

/* ────────── 表单默认值 ────────── */
interface FormState {
  method: "applePay" | "dropIn" | "card";
  env: "demo" | "sandbox" | "prod";
  mode: "payment" | "recurring";
  locale: string;
  clientId: string;
  apiKey: string;
  merchantOrderId: string;
  returnUrl: string;
  intentId: string;
  clientSecret: string;
  customerId: string;
  amountValue: string;
  currency: string;
  countryCode: string;
  totalPriceLabel: string;
  buttonType: string;
  buttonColor: "black" | "white" | "white-outline";
  totalPriceType: "final" | "pending";
  authorizationType: "final_auth" | "pre_auth";
  autoCapture: boolean;
  existingPaymentMethodRequired: boolean;
  reqBilling: boolean;
  reqShippingEmail: boolean;
  reqShippingName: boolean;
  reqShippingPhone: boolean;
  reqShippingAddress: boolean;
  consentEnabled: boolean;
  consentNextTriggeredBy: "customer" | "merchant";
  consentTriggerReason: "scheduled" | "unscheduled" | "installments";
  touEnabled: boolean;
  touAmountType: "FIXED" | "VARIABLE";
  touCurrency: string;
  touStartDate: string;
  touEndDate: string;
  touFixedAmount: string;
  touMaxAmount: string;
  touFirstAmount: string;
  touChargeDay: string;
  touPeriod: string;
  touPeriodUnit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  touTotalCycles: string;
  lineItemsEnabled: boolean;
  lineItemsJson: string;
  /* 天枢后端下单 */
  source: "airwallex" | "tianshu";
  tsAppKey: string;
  tsAppSecret: string;
  tsDeviceId: string;
  tsCommodityId: string;
  tsPayScene: string;
  tsTransferParameter: string;
}

const DEFAULTS: FormState = {
  method: "applePay",
  env: "demo",
  mode: "payment",
  locale: "",
  clientId: "",
  apiKey: "",
  merchantOrderId: "",
  returnUrl: "",
  intentId: "",
  clientSecret: "",
  customerId: "",
  amountValue: "100",
  currency: "USD",
  countryCode: "US",
  totalPriceLabel: "Demo Store",
  buttonType: "buy",
  buttonColor: "black",
  totalPriceType: "final",
  authorizationType: "final_auth",
  autoCapture: true,
  existingPaymentMethodRequired: false,
  reqBilling: false,
  reqShippingEmail: false,
  reqShippingName: false,
  reqShippingPhone: false,
  reqShippingAddress: false,
  consentEnabled: false,
  consentNextTriggeredBy: "customer",
  consentTriggerReason: "scheduled",
  touEnabled: false,
  touAmountType: "FIXED",
  touCurrency: "",
  touStartDate: "",
  touEndDate: "",
  touFixedAmount: "",
  touMaxAmount: "",
  touFirstAmount: "",
  touChargeDay: "",
  touPeriod: "1",
  touPeriodUnit: "MONTH",
  touTotalCycles: "",
  lineItemsEnabled: false,
  lineItemsJson: DEFAULT_LINE_ITEMS,
  source: "airwallex",
  tsAppKey: "",
  tsAppSecret: "",
  tsDeviceId: "",
  tsCommodityId: "",
  tsPayScene: "website",
  tsTransferParameter: "",
};

/* ────────── 日志 ────────── */
type LogLevel = "info" | "warn" | "error" | "success";
interface LogRow { id: number; time: string; level: LogLevel; msg: string; data?: unknown; }

/* ────────── 组装 config ────────── */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildConsent(f: FormState) {
  const pc: any = { next_triggered_by: f.consentNextTriggeredBy };
  if (f.consentNextTriggeredBy === "merchant") pc.merchant_trigger_reason = f.consentTriggerReason;
  if (f.touEnabled) {
    const tou: any = {
      payment_amount_type: f.touAmountType,
      payment_currency: (f.touCurrency || f.currency || "USD").toUpperCase(),
      start_date: f.touStartDate || todayISO(),
    };
    if (f.touAmountType === "FIXED" && f.touFixedAmount) tou.fixed_payment_amount = Number(f.touFixedAmount);
    if (f.touMaxAmount) tou.max_payment_amount = Number(f.touMaxAmount);
    if (f.touFirstAmount) tou.first_payment_amount = Number(f.touFirstAmount);
    if (f.touEndDate) tou.end_date = f.touEndDate;
    if (f.touChargeDay) tou.billing_cycle_charge_day = Number(f.touChargeDay);
    if (f.touPeriod) tou.payment_schedule = { period: Number(f.touPeriod), period_unit: f.touPeriodUnit };
    if (f.touTotalCycles) tou.total_billing_cycles = Number(f.touTotalCycles);
    pc.terms_of_use = tou;
  }
  return pc;
}

function buildConfig(f: FormState) {
  /* Drop-in：一次挂载，内部自带 Card / Apple Pay / Google Pay / 各地钱包 */
  if (f.method === "dropIn") {
    const c: any = {
      intent_id: f.intentId.trim(),
      client_secret: f.clientSecret.trim(),
      currency: (f.currency || "USD").toUpperCase(),
      countryCode: (f.countryCode || "US").toUpperCase(),
      methods: [
        { name: "card" },
        { name: "applepay", countryCode: (f.countryCode || "US").toUpperCase() },
        { name: "googlepay", countryCode: (f.countryCode || "US").toUpperCase() },
      ],
    };
    if (f.customerId.trim()) c.customer_id = f.customerId.trim();
    return c;
  }
  /* Card element：只渲染卡号 / 有效期 / CVC，需自行调 confirm() */
  if (f.method === "card") {
    const c: any = {
      intent_id: f.intentId.trim(),
      client_secret: f.clientSecret.trim(),
      currency: (f.currency || "USD").toUpperCase(),
    };
    if (f.customerId.trim()) c.customer_id = f.customerId.trim();
    return c;
  }

  /* Apple Pay element */
  const c: any = {
    amount: { value: f.amountValue, currency: (f.currency || "USD").toUpperCase() },
    countryCode: (f.countryCode || "US").toUpperCase(),
    totalPriceLabel: f.totalPriceLabel,
    buttonType: f.buttonType,
    buttonColor: f.buttonColor,
    autoCapture: f.autoCapture,
    authorizationType: f.authorizationType,
    existingPaymentMethodRequired: f.existingPaymentMethodRequired,
    totalPriceType: f.totalPriceType,
  };
  if (f.mode === "recurring") c.mode = "recurring";
  if (f.intentId.trim()) c.intent_id = f.intentId.trim();
  if (f.clientSecret.trim()) c.client_secret = f.clientSecret.trim();
  if (f.customerId.trim()) c.customer_id = f.customerId.trim();
  if (f.reqBilling) c.requiredBillingContactFields = ["postalAddress"];
  const ship: string[] = [];
  if (f.reqShippingEmail) ship.push("email");
  if (f.reqShippingName) ship.push("name");
  if (f.reqShippingPhone) ship.push("phone");
  if (f.reqShippingAddress) ship.push("postalAddress");
  if (ship.length) c.requiredShippingContactFields = ship;
  if (f.consentEnabled) c.payment_consent = buildConsent(f);
  if (f.lineItemsEnabled) {
    try { c.lineItems = JSON.parse(f.lineItemsJson); } catch { /* err shown in UI */ }
  }
  return c;
}

/* ────────── 组件 ────────── */
export default function AirwallexDemoPage() {
  const [f, setF] = useState<FormState>(DEFAULTS);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [sdkReady, setSdkReady] = useState<"loading" | "ok" | "err">("loading");
  const [mounted, setMounted] = useState(false);
  const [restored, setRestored] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const elementRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(1);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  /* ── 恢复本地存储 ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setF((prev) => {
          const merged: FormState = { ...prev };
          Object.keys(saved).forEach((k) => {
            if (SKIP_PERSIST.has(k) || !(k in merged)) return;
            (merged as any)[k] = saved[k];
          });
          return merged;
        });
      }
    } catch {}
    setBrowserInfo(true);
    setRestored(true);
  }, []);

  /* ── 保存本地存储 ── */
  useEffect(() => {
    if (!restored) return;
    const toSave: Record<string, unknown> = {};
    (Object.keys(f) as (keyof FormState)[]).forEach((k) => {
      if (SKIP_PERSIST.has(k as string)) return;
      toSave[k as string] = f[k];
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); } catch {}
  }, [f, restored]);

  /* ── SDK 就绪检测 ── */
  useEffect(() => {
    if (window.AirwallexComponentsSDK) { setSdkReady("ok"); return; }
    const t = setInterval(() => {
      if (window.AirwallexComponentsSDK) { setSdkReady("ok"); clearInterval(t); }
    }, 400);
    const timeout = setTimeout(() => {
      if (!window.AirwallexComponentsSDK) setSdkReady("err");
      clearInterval(t);
    }, 15000);
    return () => { clearInterval(t); clearTimeout(timeout); };
  }, []);

  /* ── 环境自检 ── */
  const diag = useMemo(() => {
    if (!browserInfo) return null;
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(ua);
    const hasSession = typeof window.ApplePaySession !== "undefined";
    let canPay: boolean | null = null;
    try { canPay = hasSession ? window.ApplePaySession.canMakePayments() : false; } catch { canPay = null; }
    const https = window.location.protocol === "https:" || window.location.hostname === "localhost";
    return [
      { ok: https, label: "HTTPS / localhost", detail: https ? window.location.origin : "Apple Pay 会拒绝非安全上下文" },
      { ok: isSafari, label: "Safari 环境", detail: isSafari ? "是" : "非 Safari — Apple Pay 按钮不会渲染（卡支付仍可用）" },
      { ok: hasSession, label: "ApplePaySession", detail: hasSession ? "可用" : "不存在" },
      { ok: !!canPay, label: "canMakePayments()", detail: String(canPay) },
    ];
  }, [browserInfo]);

  /* ── 日志 ── */
  const pushLog = (level: LogLevel, msg: string, data?: unknown) => {
    setLogs((prev) => [
      ...prev,
      { id: logIdRef.current++, time: new Date().toLocaleTimeString(), level, msg, data },
    ]);
  };

  /* ── lineItems JSON 校验 ── */
  const lineItemsError = useMemo(() => {
    if (!f.lineItemsEnabled) return null;
    try { JSON.parse(f.lineItemsJson); return null; }
    catch (e: any) { return "lineItems JSON 解析失败：" + e.message; }
  }, [f.lineItemsEnabled, f.lineItemsJson]);

  const config = useMemo(() => buildConfig(f), [f]);

  /* ── curl 参考 ── */
  const curlToken = useMemo(() => {
    const host = f.env === "prod" ? "api.airwallex.com" : "api.sandbox.airwallex.com";
    return `curl -X POST https://${host}/api/v1/authentication/login \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: {{YOUR_API_KEY}}' \\
  -H 'x-client-id: {{YOUR_CLIENT_ID}}'`;
  }, [f.env]);

  const curlIntent = useMemo(() => {
    const host = f.env === "prod" ? "api.airwallex.com" : "api.sandbox.airwallex.com";
    const body: any = {
      request_id: "{{GEN_A_UUID}}",
      amount: Number(f.amountValue) || 100,
      currency: (f.currency || "USD").toUpperCase(),
      merchant_order_id: "D" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "001",
      return_url: browserInfo ? window.location.origin + "/airwallex-demo" : "{{YOUR_RETURN_URL}}",
    };
    if (f.customerId.trim()) body.customer_id = f.customerId.trim();
    return `curl -X POST https://${host}/api/v1/pa/payment_intents/create \\
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(body)}'`;
  }, [f.env, f.amountValue, f.currency, f.customerId, browserInfo]);

  /* ── 后端 API 调用 ── */
  const [busy, setBusy] = useState<string | null>(null);

  const callApi = async (path: string, body: any) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    return { ok: res.ok, status: res.status, data };
  };

  const createIntent = async () => {
    if (!f.clientId.trim() || !f.apiKey.trim()) {
      return pushLog("error", "Client ID 和 API Key 必填（会 POST 到 /api/awx/create-intent，不会暴露给前端 SDK）");
    }
    setBusy("intent");
    pushLog("info", "POST /api/awx/create-intent …");
    const r = await callApi("/api/awx/create-intent", {
      env: f.env,
      clientId: f.clientId.trim(),
      apiKey: f.apiKey.trim(),
      amount: Number(f.amountValue) || 100,
      currency: (f.currency || "USD").toUpperCase(),
      merchantOrderId: f.merchantOrderId.trim() || undefined,
      returnUrl: f.returnUrl.trim() || (typeof window !== "undefined" ? window.location.origin + "/airwallex-demo" : undefined),
      customerId: f.customerId.trim() || undefined,
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `创建 intent 失败 (${r.status})`, r.data);
    const id = r.data?.id;
    const cs = r.data?.client_secret;
    if (id) set("intentId", id);
    if (cs) set("clientSecret", cs);
    pushLog("success", `PaymentIntent 已创建 · ${id ?? "?"} · status=${r.data?.status ?? "?"}`, r.data);
  };

  const getIntent = async () => {
    if (!f.clientId.trim() || !f.apiKey.trim()) return pushLog("error", "Client ID 和 API Key 必填");
    if (!f.intentId.trim()) return pushLog("error", "intent_id 必填");
    setBusy("get");
    pushLog("info", "POST /api/awx/get-intent …");
    const r = await callApi("/api/awx/get-intent", {
      env: f.env, clientId: f.clientId.trim(), apiKey: f.apiKey.trim(), intentId: f.intentId.trim(),
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `查询失败 (${r.status})`, r.data);
    pushLog("success", `PaymentIntent 状态：${r.data?.status ?? "?"}`, r.data);
  };

  const createCustomer = async () => {
    if (!f.clientId.trim() || !f.apiKey.trim()) return pushLog("error", "Client ID 和 API Key 必填");
    setBusy("cust");
    pushLog("info", "POST /api/awx/create-customer …");
    const r = await callApi("/api/awx/create-customer", {
      env: f.env, clientId: f.clientId.trim(), apiKey: f.apiKey.trim(),
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `创建 customer 失败 (${r.status})`, r.data);
    const id = r.data?.id;
    if (id) set("customerId", id);
    pushLog("success", `Customer 已创建 · ${id ?? "?"}`, r.data);
  };

  const testLogin = async () => {
    if (!f.clientId.trim() || !f.apiKey.trim()) return pushLog("error", "Client ID 和 API Key 必填");
    setBusy("login");
    pushLog("info", "POST /api/awx/login …");
    const r = await callApi("/api/awx/login", {
      env: f.env, clientId: f.clientId.trim(), apiKey: f.apiKey.trim(),
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `登录失败 (${r.status})`, r.data);
    pushLog("success", `凭证有效 · expires_at=${r.data?.expires_at ?? "?"}`);
  };

  /* ── 天枢后端：刷新 token / 下单 ── */
  const tsCredsError = () =>
    !f.tsAppKey.trim() || !f.tsAppSecret.trim()
      ? "App Key 和 App Secret 必填"
      : null;

  const tianshuToken = async () => {
    const credErr = tsCredsError();
    if (credErr) return pushLog("error", credErr);
    setBusy("ts-token");
    pushLog("info", "POST /api/tianshu/refresh-token …");
    const r = await callApi("/api/tianshu/refresh-token", {
      appKey: f.tsAppKey.trim(),
      appSecret: f.tsAppSecret.trim(),
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `刷新 token 失败 (${r.status})`, r.data);
    pushLog("success",
      `token 已${r.data?.cached ? "复用缓存" : "刷新"} · 过期于 ${r.data?.expiresAt ? new Date(r.data.expiresAt).toLocaleString() : "?"}`,
      r.data);
  };

  const tianshuCreateOrder = async () => {
    const credErr = tsCredsError();
    if (credErr) return pushLog("error", credErr);
    if (!f.tsDeviceId.trim()) return pushLog("error", "设备 ID 必填");
    if (!f.tsCommodityId.trim()) return pushLog("error", "商品 ID (commodityId) 必填");
    setBusy("ts-order");
    pushLog("info", "POST /api/tianshu/create-order …");
    const r = await callApi("/api/tianshu/create-order", {
      appKey: f.tsAppKey.trim(),
      appSecret: f.tsAppSecret.trim(),
      deviceId: f.tsDeviceId.trim(),
      commodityId: f.tsCommodityId.trim(),
      payScene: f.tsPayScene,
      transferParameter: f.tsTransferParameter.trim() || undefined,
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `下单失败 (${r.status})`, r.data);

    const d = r.data?.data ?? {};
    if (r.data?.code !== 0 || !d.clientSecret) {
      return pushLog("error", `天枢返回异常：${r.data?.msg ?? "code≠0"}`, r.data);
    }

    if (d.clientSecret) set("clientSecret", d.clientSecret);
    if (d.customerId) set("customerId", d.customerId);
    if (d.orderId) set("intentId", d.orderId);
    if (d.orderAmount != null) {
      set("amountValue", String(Math.round(Number(d.orderAmount) * 100)));
    }
    if (d.commodityName) set("totalPriceLabel", d.commodityName);

    // 天枢 createAirwallexOrder 走的固定是 demo/sandbox 环境
    set("env", "demo");
    set("method", "applePay");

    pushLog("success",
      `下单成功 · orderId=${d.orderId ?? "?"} · 金额 $${d.orderAmount ?? "?"} · 已回填 intent_id / client_secret / customer_id`,
      r.data);
  };

  /* ── 挂载 ── */
  const mountBtn = async () => {
    const sdk = window.AirwallexComponentsSDK;
    if (!sdk) return pushLog("error", "SDK 尚未加载完成");
    if (lineItemsError) return pushLog("error", lineItemsError);
    if (!f.clientSecret.trim()) return pushLog("error", "client_secret 不能为空");
    if (!f.intentId.trim()) return pushLog("error", "intent_id 必填");
    if (f.method === "applePay" && f.mode === "recurring" && !f.customerId.trim())
      return pushLog("error", "mode=recurring 时 customer_id 必填");

    try {
      if (elementRef.current) {
        try { elementRef.current.destroy(); } catch {}
        elementRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = "";

      const initOpts: any = { env: f.env, enabledElements: ["payments"] };
      if (f.locale.trim()) initOpts.locale = f.locale.trim();
      pushLog("info", `init({ env: '${f.env}'${f.locale ? `, locale: '${f.locale}'` : ""} })`);
      await sdk.init(initOpts);

      const elType = f.method === "applePay" ? "applePayButton" : f.method;
      pushLog("info", `createElement('${elType}', {…})`, config);
      const el = await sdk.createElement(elType, config);
      if (!el) return pushLog("error", "createElement 返回 null，参数可能不合法或环境不支持");

      if (f.method === "applePay") {
        el.on("ready",             ()  => pushLog("info", "event: ready"));
        el.on("click",             ()  => pushLog("info", "event: click"));
        el.on("validateMerchant",  (e: any) => pushLog("info", "event: validateMerchant", e?.detail));
        el.on("authorized",        (e: any) => pushLog("info", "event: authorized", {
          transactionIdentifier: e?.detail?.paymentData?.transactionIdentifier,
          paymentMethod: e?.detail?.paymentData?.paymentMethod,
        }));
        el.on("shippingMethodChange",  (e: any) => pushLog("info", "event: shippingMethodChange", e?.detail));
        el.on("shippingAddressChange", (e: any) => pushLog("info", "event: shippingAddressChange", e?.detail));
        el.on("cancel",  ()          => pushLog("warn", "event: cancel — 用户取消"));
      }

      el.on("ready", () => pushLog("info", "event: ready"));
      el.on("change", (e: any) => pushLog("info", "event: change", {
        complete: e?.detail?.complete,
        error: e?.detail?.error,
      }));
      el.on("focus", (e: any) => pushLog("info", `event: focus — ${e?.detail?.field ?? e?.detail?.type ?? "?"}`));
      el.on("blur",  (e: any) => pushLog("info", `event: blur — ${e?.detail?.field ?? e?.detail?.type ?? "?"}`));
      el.on("success", (e: any) => pushLog("success",
        `event: success — intent.status=${e?.detail?.intent?.status ?? "?"}`, e?.detail));
      el.on("error", (e: any) => pushLog("error",
        `event: error — ${e?.detail?.error?.code ?? "UNKNOWN"}`, e?.detail));

      el.mount(containerRef.current!);
      elementRef.current = el;
      setMounted(true);
      pushLog("info", `element.mount() 完成（${elType}）`);
    } catch (e: any) {
      pushLog("error", "挂载失败：" + (e?.message || String(e)));
    }
  };

  /* ── Card / Drop-in 提交支付 ── */
  const confirmBtn = async () => {
    if (!elementRef.current) return pushLog("error", "请先挂载组件");
    try {
      setBusy("confirm");
      pushLog("info", "element.confirm({…}) …");

      // 官方 Card element 的 confirm 只接受 intent_id / client_secret
      const opts = {
        intent_id: f.intentId.trim(),
        client_secret: f.clientSecret.trim(),
      };

      // 超时保护：卡住时给出明确提示，而不是无限等待
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("confirm() 超过 60 秒未返回，可能是 3DS 弹窗被拦截，或网络请求被拒")), 60000)
      );
      const intent: any = await Promise.race([elementRef.current.confirm(opts), timeout]);
      pushLog("success", `支付完成 — intent.status=${intent?.status ?? "?"}`, intent);
    } catch (e: any) {
      pushLog("error", "confirm 失败：" + (e?.message || String(e)), e?.details ?? e?.error);
    } finally {
      setBusy(null);
    }
  };

  const unmountBtn = () => {
    if (!elementRef.current) return;
    try { elementRef.current.unmount(); pushLog("info", "element.unmount() 已调用"); }
    catch (e: any) { pushLog("error", "unmount 失败：" + e.message); }
  };

  const destroyBtn = () => {
    if (!elementRef.current) return;
    try { elementRef.current.destroy(); } catch {}
    elementRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = "";
    setMounted(false);
    pushLog("info", "element.destroy() 已调用");
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    } catch (e: any) { pushLog("warn", "复制失败：" + e.message); }
  };

  /* ═════════════ 渲染 ═════════════ */
  const TABS = [
    { id: "applePay", label: "Apple Pay", hint: "applePayButton element" },
    { id: "dropIn",   label: "Drop-in",   hint: "卡 + Apple Pay + Google Pay 一体" },
    { id: "card",     label: "Card",      hint: "纯卡号 / 有效期 / CVC" },
  ] as const;

  const switchMethod = (m: FormState["method"]) => {
    if (elementRef.current) { try { elementRef.current.destroy(); } catch {} elementRef.current = null; }
    if (containerRef.current) containerRef.current.innerHTML = "";
    setMounted(false);
    set("method", m);
    pushLog("info", `切换到 ${m} 组件`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 顶栏 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">← 回到 Simulator</Link>
            <h1 className="mt-1 text-base font-semibold tracking-tight sm:text-xl">
              Airwallex Payment Elements · Sandbox 测试台
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs">
            <SdkBadge status={sdkReady} />
          </div>
        </div>

        {/* 支付方式 Tab */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = f.method === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => switchMethod(t.id)}
                  className={
                    "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "border-slate-900 font-medium text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800")
                  }
                  title={t.hint}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 左：表单 */}
        <div className="min-w-0 space-y-4">
          <Card title="订单来源">
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  checked={f.source === "airwallex"}
                  onChange={() => set("source", "airwallex")}
                />
                <span>直连 Airwallex（用下面的 Client ID / API Key 自己建 intent）</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="source"
                  checked={f.source === "tianshu"}
                  onChange={() => set("source", "tianshu")}
                />
                <span>天枢后端下单（走你们自己的服务，返回 clientSecret 直接挂载）</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {f.source === "airwallex"
                ? "当前：用下方「服务端凭证」区块的 Client ID / API Key 调 /api/awx/* 建单。"
                : "当前：调 /api/tianshu/create-order 建单，App Key / Secret 在下方填写，不会写进代码或本地存储。"}
            </p>
          </Card>

          {f.source === "tianshu" && (
          <Card title="天枢后端下单（测试环境）">
            <Row>
              <Field label="App Key">
                <input className="input font-mono" value={f.tsAppKey}
                  onChange={(e) => set("tsAppKey", e.target.value)}
                  placeholder="ef7o…" autoComplete="off" spellCheck={false} />
              </Field>
              <Field label="App Secret（不写入本地存储）">
                <input className="input font-mono" type="password" value={f.tsAppSecret}
                  onChange={(e) => set("tsAppSecret", e.target.value)}
                  placeholder="•••" autoComplete="off" spellCheck={false} />
              </Field>
            </Row>
            <Row>
              <Field label="设备 ID（deviceId）">
                <input className="input font-mono" value={f.tsDeviceId}
                  onChange={(e) => set("tsDeviceId", e.target.value)}
                  placeholder="例如 20220615-001" />
              </Field>
              <Field label="商品 ID（commodityId）">
                <input className="input font-mono" value={f.tsCommodityId}
                  onChange={(e) => set("tsCommodityId", e.target.value)}
                  placeholder="例如 10001" />
              </Field>
              <Field label="payScene">
                <select className="input" value={f.tsPayScene} onChange={(e) => set("tsPayScene", e.target.value)}>
                  <option value="website">website（官网）</option>
                  <option value="inapp">inapp（应用内）</option>
                </select>
              </Field>
              <Field label="transferParameter（可选，透传）">
                <input className="input font-mono" value={f.tsTransferParameter}
                  onChange={(e) => set("tsTransferParameter", e.target.value)}
                  placeholder="留空不传" />
              </Field>
            </Row>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={tianshuToken} disabled={busy === "ts-token"} className="btn-secondary">
                {busy === "ts-token" ? "…" : "刷新 Access-Token"}
              </button>
              <button onClick={tianshuCreateOrder} disabled={busy === "ts-order"} className="btn-primary">
                {busy === "ts-order" ? "…" : "④ 天枢下单 → 回填 intent_id + client_secret"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              下单成功后会自动把 intent_id / client_secret / customer_id / 金额 填进下方表单，再点右上「挂载」即可。
              固定参数：prdId=99999962、包名 com.faxing.open、渠道 61、store=6（Airwallex）。
            </p>
          </Card>
          )}

          {f.source === "airwallex" && (
          <>
          <Card title="Airwallex.js init">
            <Row>
              <Field label="env">
                <select className="input" value={f.env} onChange={(e) => set("env", e.target.value as any)}>
                  <option value="demo">demo</option>
                  <option value="sandbox">sandbox</option>
                  <option value="prod">prod</option>
                </select>
              </Field>
              <Field label="locale（可选，如 zh、en）">
                <input className="input" value={f.locale} onChange={(e) => set("locale", e.target.value)} placeholder="留空使用浏览器语言" />
              </Field>
              <Field label="mode">
                <select className="input" value={f.mode} onChange={(e) => set("mode", e.target.value as any)}>
                  <option value="payment">payment（默认 · 单次收款）</option>
                  <option value="recurring">recurring（仅创建 consent，不收款）</option>
                </select>
              </Field>
            </Row>
          </Card>

          <Card title="服务端凭证（仅在本页 POST 给你自己的 /api/awx/* route，不会传给前端 SDK）">
            <Row>
              <Field label="Client ID">
                <input className="input font-mono" value={f.clientId} onChange={(e) => set("clientId", e.target.value)} placeholder="BxnI...（Developer → API keys）" />
              </Field>
              <Field label="API Key">
                <input className="input font-mono" type="password" value={f.apiKey} onChange={(e) => set("apiKey", e.target.value)} placeholder="•••（不会存 localStorage）" />
              </Field>
              <Field label="merchant_order_id（可选）">
                <input className="input font-mono" value={f.merchantOrderId} onChange={(e) => set("merchantOrderId", e.target.value)} placeholder="留空自动生成 D{timestamp}" />
              </Field>
              <Field label="return_url（可选）">
                <input className="input font-mono" value={f.returnUrl} onChange={(e) => set("returnUrl", e.target.value)} placeholder="留空使用当前页地址" />
              </Field>
            </Row>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={testLogin} disabled={busy === "login"} className="btn-secondary">
                {busy === "login" ? "…" : "① 测试登录 / 拿 token"}
              </button>
              <button onClick={createCustomer} disabled={busy === "cust"} className="btn-secondary">
                {busy === "cust" ? "…" : "② 创建 Customer → 回填 customer_id"}
              </button>
              <button onClick={createIntent} disabled={busy === "intent"} className="btn-primary">
                {busy === "intent" ? "…" : "③ 创建 PaymentIntent → 回填 intent_id + client_secret"}
              </button>
              <button onClick={getIntent} disabled={busy === "get"} className="btn-secondary">
                {busy === "get" ? "…" : "查询当前 intent 状态"}
              </button>
            </div>
          </Card>
          </>
          )}

          <Card title="PaymentIntent（来自你的服务端）">
            <Row>
              <Field label={<>intent_id <span className="text-slate-400">{f.mode === "recurring" && "（recurring 时可空）"}</span></>}>
                <input className="input font-mono" value={f.intentId} onChange={(e) => set("intentId", e.target.value)} placeholder="int_hkpg..." />
              </Field>
              <Field label="client_secret（每次都要新的）">
                <input className="input font-mono" value={f.clientSecret} onChange={(e) => set("clientSecret", e.target.value)} placeholder="替换成刚创建 intent 拿到的" />
              </Field>
              <Field label={<>customer_id <span className="text-slate-400">{f.mode === "recurring" && "（必填）"}</span></>}>
                <input className="input font-mono" value={f.customerId} onChange={(e) => set("customerId", e.target.value)} placeholder="cus_..." />
              </Field>
            </Row>
          </Card>

          {f.method === "applePay" && (
          <Card title="金额与外观（Apple Pay 专属）">
            <Row>
              <Field label="amount.value（字符串，与 intent 一致）">
                <input className="input" value={f.amountValue} onChange={(e) => set("amountValue", e.target.value)} placeholder='"100"' />
              </Field>
              <Field label="currency">
                <select className="input" value={f.currency} onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="countryCode（ISO2）">
                <input className="input uppercase" maxLength={2} value={f.countryCode} onChange={(e) => set("countryCode", e.target.value.toUpperCase())} />
              </Field>
              <Field label="totalPriceLabel">
                <input className="input" value={f.totalPriceLabel} onChange={(e) => set("totalPriceLabel", e.target.value)} />
              </Field>
              <Field label="totalPriceType">
                <select className="input" value={f.totalPriceType} onChange={(e) => set("totalPriceType", e.target.value as any)}>
                  <option value="final">final</option>
                  <option value="pending">pending</option>
                </select>
              </Field>
              <Field label="buttonType">
                <select className="input" value={f.buttonType} onChange={(e) => set("buttonType", e.target.value)}>
                  {BUTTON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="buttonColor">
                <select className="input" value={f.buttonColor} onChange={(e) => set("buttonColor", e.target.value as any)}>
                  <option value="black">black</option>
                  <option value="white">white</option>
                  <option value="white-outline">white-outline</option>
                </select>
              </Field>
              <Field label="authorizationType">
                <select className="input" value={f.authorizationType} onChange={(e) => set("authorizationType", e.target.value as any)}>
                  <option value="final_auth">final_auth</option>
                  <option value="pre_auth">pre_auth</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Toggle label="autoCapture" checked={f.autoCapture} onChange={(v) => set("autoCapture", v)} />
              <Toggle label="existingPaymentMethodRequired" checked={f.existingPaymentMethodRequired} onChange={(v) => set("existingPaymentMethodRequired", v)} />
            </Row>
          </Card>
          )}

          {f.method !== "applePay" && (
          <Card title="基础参数">
            <Row>
              <Field label="amount.value（仅用于创建 intent 时的参考值）">
                <input className="input" value={f.amountValue} onChange={(e) => set("amountValue", e.target.value)} placeholder='"100"' />
              </Field>
              <Field label="currency">
                <select className="input" value={f.currency} onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="countryCode（ISO2）">
                <input className="input uppercase" maxLength={2} value={f.countryCode} onChange={(e) => set("countryCode", e.target.value.toUpperCase())} />
              </Field>
            </Row>
            {f.method === "dropIn" && (
              <p className="mt-2 text-xs text-slate-500">
                挂载后会同时出现卡号输入框、Apple Pay 按钮、Google Pay 按钮 —— 具体显示哪些取决于你的 Airwallex 账户开通了哪些支付方式。
              </p>
            )}
            {f.method === "card" && (
              <p className="mt-2 text-xs text-slate-500">
                只渲染卡号 / 有效期 / CVC。填完后点下方「提交支付」触发 confirm()。
              </p>
            )}
          </Card>
          )}

          {f.method === "applePay" && (
          <>
          <Card title="联系人字段">
            <div className="flex flex-wrap gap-3 text-sm">
              <Toggle label="Billing.postalAddress" checked={f.reqBilling} onChange={(v) => set("reqBilling", v)} />
              <Toggle label="Shipping.email" checked={f.reqShippingEmail} onChange={(v) => set("reqShippingEmail", v)} />
              <Toggle label="Shipping.name" checked={f.reqShippingName} onChange={(v) => set("reqShippingName", v)} />
              <Toggle label="Shipping.phone" checked={f.reqShippingPhone} onChange={(v) => set("reqShippingPhone", v)} />
              <Toggle label="Shipping.postalAddress" checked={f.reqShippingAddress} onChange={(v) => set("reqShippingAddress", v)} />
            </div>
          </Card>

          <Card title="payment_consent（save & reuse）">
            <Toggle label="启用 payment_consent" checked={f.consentEnabled} onChange={(v) => set("consentEnabled", v)} />
            {f.consentEnabled && (
              <>
                <Row>
                  <Field label="next_triggered_by">
                    <select className="input" value={f.consentNextTriggeredBy} onChange={(e) => set("consentNextTriggeredBy", e.target.value as any)}>
                      <option value="customer">customer（CIT）</option>
                      <option value="merchant">merchant（MIT）</option>
                    </select>
                  </Field>
                  {f.consentNextTriggeredBy === "merchant" && (
                    <Field label="merchant_trigger_reason">
                      <select className="input" value={f.consentTriggerReason} onChange={(e) => set("consentTriggerReason", e.target.value as any)}>
                        <option value="scheduled">scheduled</option>
                        <option value="unscheduled">unscheduled</option>
                        <option value="installments">installments</option>
                      </select>
                    </Field>
                  )}
                </Row>
                <Toggle label="启用 terms_of_use（Apple Pay 定期扣款条款）" checked={f.touEnabled} onChange={(v) => set("touEnabled", v)} />
                {f.touEnabled && <TermsOfUse f={f} set={set} />}
              </>
            )}
          </Card>

          <Card title="lineItems（可选，Apple Pay 明细行）">
            <Toggle label="启用 lineItems" checked={f.lineItemsEnabled} onChange={(v) => set("lineItemsEnabled", v)} />
            {f.lineItemsEnabled && (
              <>
                <textarea
                  className="input h-40 font-mono text-xs"
                  value={f.lineItemsJson}
                  onChange={(e) => set("lineItemsJson", e.target.value)}
                />
                {lineItemsError && <p className="mt-1 text-xs text-red-600">{lineItemsError}</p>}
              </>
            )}
          </Card>
          </>
          )}
        </div>

        {/* 右：预览 + 日志 + curl */}
        <aside className="min-w-0 space-y-4">
          <Card title={
            f.method === "applePay" ? "Apple Pay 按钮预览"
            : f.method === "dropIn" ? "Drop-in 组件预览"
            : "卡号输入组件预览"
          }>
            <div ref={containerRef} id="applePayButton" className="min-h-[52px] overflow-x-auto rounded-md border border-dashed border-slate-300 p-2" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={mountBtn} className="btn-primary">挂载 / 重新挂载</button>
              {f.method !== "applePay" && (
                <button onClick={confirmBtn} disabled={!mounted || busy === "confirm"} className="btn-primary">
                  {busy === "confirm" ? "…" : "提交支付 confirm()"}
                </button>
              )}
              <button onClick={unmountBtn} disabled={!mounted} className="btn">unmount</button>
              <button onClick={destroyBtn} disabled={!mounted} className="btn">destroy</button>
            </div>
            {f.method === "applePay" && (
              <p className="mt-2 text-xs text-slate-500">
                按钮只在 Safari + HTTPS + 域名已注册 + 支持地区显示。其他浏览器请切到 Drop-in 或 Card 标签测卡支付。
              </p>
            )}
            {f.method === "dropIn" && (
              <p className="mt-2 text-xs text-slate-500">
                卡号部分在 Chrome / Safari 都能渲染。Apple Pay / Google Pay 取决于浏览器与地区。
              </p>
            )}
          </Card>

          <Card title="环境自检">
            <ul className="space-y-1 text-xs">
              {diag?.map((d) => (
                <li key={d.label} className="flex items-start gap-2">
                  <span className={d.ok ? "text-emerald-600" : "text-red-600"}>{d.ok ? "✓" : "✗"}</span>
                  <span className="text-slate-600"><b>{d.label}</b>：{d.detail}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="事件日志"
            action={
              <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-800">清空</button>
            }
          >
            <div className="max-h-72 space-y-2 overflow-auto text-xs">
              {logs.length === 0 && <p className="text-slate-400">还没有事件…</p>}
              {logs.map((l) => (
                <div key={l.id} className="rounded border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2">
                    <LevelPill level={l.level} />
                    <span className="text-slate-500">{l.time}</span>
                    <span className="text-slate-800">{l.msg}</span>
                  </div>
                  {l.data !== undefined && (
                    <pre className="mt-1 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-4 text-slate-700">
{JSON.stringify(l.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="服务端 curl 参考"
            action={<span className="text-[10px] text-slate-400">API Key / Client ID 只能放服务端</span>}
          >
            <div className="space-y-2">
              <CurlBlock label="① 获取 access token" cmd={curlToken} copied={copiedKey === "token"} onCopy={() => copyText("token", curlToken)} />
              <CurlBlock label="② 创建 PaymentIntent" cmd={curlIntent} copied={copiedKey === "intent"} onCopy={() => copyText("intent", curlIntent)} />
            </div>
          </Card>

          <Card title="当前 createElement 参数">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">复制后可直接粘进 createElement 第二参</span>
              <button
                onClick={() => copyText("cfg", JSON.stringify(config, null, 2))}
                className="text-xs text-slate-500 hover:text-slate-800"
              >{copiedKey === "cfg" ? "已复制" : "复制"}</button>
            </div>            <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-900 p-3 text-[11px] leading-4 text-slate-100">
{browserInfo ? JSON.stringify(config, null, 2) : "…"}
            </pre>
          </Card>
        </aside>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 6px;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 6px 10px;
          font-size: 13px;
          outline: none;
        }
        .input:focus { border-color: rgb(15 23 42); box-shadow: 0 0 0 2px rgba(15,23,42,0.08); }
        .btn {
          border-radius: 6px; border: 1px solid rgb(203 213 225);
          padding: 6px 12px; font-size: 13px; background: white;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary {
          border-radius: 6px; padding: 6px 12px; font-size: 13px;
          background: rgb(15 23 42); color: white; border: 1px solid rgb(15 23 42);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          border-radius: 6px; padding: 6px 12px; font-size: 13px;
          background: white; color: rgb(15 23 42); border: 1px solid rgb(203 213 225);
        }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

/* ────────── 辅助组件 ────────── */
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-slate-600">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function LevelPill({ level }: { level: LogLevel }) {
  const cls =
    level === "error"   ? "bg-red-100 text-red-700"
  : level === "warn"    ? "bg-amber-100 text-amber-700"
  : level === "success" ? "bg-emerald-100 text-emerald-700"
  :                       "bg-slate-100 text-slate-700";
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${cls}`}>{level}</span>;
}

function SdkBadge({ status }: { status: "loading" | "ok" | "err" }) {
  const map = {
    loading: { text: "SDK 加载中…", cls: "bg-slate-100 text-slate-700" },
    ok:      { text: "SDK 已就绪",  cls: "bg-emerald-100 text-emerald-700" },
    err:     { text: "SDK 加载失败", cls: "bg-red-100 text-red-700" },
  }[status];
  return <span className={`rounded px-2 py-1 ${map.cls}`}>{map.text}</span>;
}

function CurlBlock({ label, cmd, copied, onCopy }: { label: string; cmd: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <button onClick={onCopy} className="text-xs text-slate-500 hover:text-slate-800">{copied ? "已复制" : "复制"}</button>
      </div>
      <pre className="overflow-auto rounded bg-slate-900 p-3 text-[11px] leading-4 text-slate-100">{cmd}</pre>
    </div>
  );
}

function TermsOfUse({ f, set }: {
  f: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="mt-3 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <Row>
        <Field label="payment_amount_type">
          <select className="input" value={f.touAmountType} onChange={(e) => set("touAmountType", e.target.value as any)}>
            <option value="FIXED">FIXED</option>
            <option value="VARIABLE">VARIABLE</option>
          </select>
        </Field>
        <Field label="payment_currency（留空则用主币种）">
          <input className="input uppercase" maxLength={3} value={f.touCurrency} onChange={(e) => set("touCurrency", e.target.value.toUpperCase())} />
        </Field>
        <Field label="start_date">
          <input className="input" type="date" value={f.touStartDate} onChange={(e) => set("touStartDate", e.target.value)} />
        </Field>
        <Field label="end_date（可选）">
          <input className="input" type="date" value={f.touEndDate} onChange={(e) => set("touEndDate", e.target.value)} />
        </Field>
        {f.touAmountType === "FIXED" && (
          <Field label="fixed_payment_amount">
            <input className="input" type="number" value={f.touFixedAmount} onChange={(e) => set("touFixedAmount", e.target.value)} />
          </Field>
        )}
        <Field label="max_payment_amount（可选）">
          <input className="input" type="number" value={f.touMaxAmount} onChange={(e) => set("touMaxAmount", e.target.value)} />
        </Field>
        <Field label="first_payment_amount（可选）">
          <input className="input" type="number" value={f.touFirstAmount} onChange={(e) => set("touFirstAmount", e.target.value)} />
        </Field>
        <Field label="billing_cycle_charge_day（可选）">
          <input className="input" type="number" value={f.touChargeDay} onChange={(e) => set("touChargeDay", e.target.value)} />
        </Field>
        <Field label="payment_schedule.period">
          <input className="input" type="number" value={f.touPeriod} onChange={(e) => set("touPeriod", e.target.value)} />
        </Field>
        <Field label="payment_schedule.period_unit">
          <select className="input" value={f.touPeriodUnit} onChange={(e) => set("touPeriodUnit", e.target.value as any)}>
            <option value="DAY">DAY</option>
            <option value="WEEK">WEEK</option>
            <option value="MONTH">MONTH</option>
            <option value="YEAR">YEAR</option>
          </select>
        </Field>
        <Field label="total_billing_cycles（可选）">
          <input className="input" type="number" value={f.touTotalCycles} onChange={(e) => set("touTotalCycles", e.target.value)} />
        </Field>
      </Row>
    </div>
  );
}

