"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────── Stripe.js 类型占位 ────────── */
declare global {
  interface Window {
    Stripe?: (pk: string) => any;
  }
}

const STORAGE_KEY = "stripe-demo-v1";
const SKIP_PERSIST = new Set(["secretKey"]);

const CURRENCIES = ["usd", "hkd", "cny", "sgd", "aud", "gbp", "eur", "jpy", "nzd", "cad"];

type LogLevel = "info" | "warn" | "error" | "success";
interface LogRow { id: number; time: string; level: LogLevel; msg: string; data?: unknown; }

interface FormState {
  publishableKey: string;
  secretKey: string;
  amount: string;
  currency: string;
  productName: string;
  quantity: string;
  mode: "payment" | "subscription";
  interval: "day" | "week" | "month" | "year";
  intervalCount: string;
  customerEmail: string;
  locale: string;
  returnUrl: string;
  redirectIfRequired: boolean;
}

const DEFAULTS: FormState = {
  publishableKey: "",
  secretKey: "",
  amount: "1000",
  currency: "usd",
  productName: "Demo product",
  quantity: "1",
  mode: "payment",
  interval: "month",
  intervalCount: "1",
  customerEmail: "",
  locale: "",
  returnUrl: "",
  redirectIfRequired: true,
};

export default function StripeDemoPage() {
  const [f, setF] = useState<FormState>(DEFAULTS);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [restored, setRestored] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<"loading" | "ok" | "err">("loading");
  const [mounted, setMounted] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [totalLabel, setTotalLabel] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const logIdRef = useRef(1);
  const stripeRef = useRef<any>(null);
  const checkoutRef = useRef<any>(null);
  const paymentElRef = useRef<any>(null);
  const actionsRef = useRef<any>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const pushLog = (level: LogLevel, msg: string, data?: unknown) =>
    setLogs((prev) => [
      ...prev,
      { id: logIdRef.current++, time: new Date().toLocaleTimeString(), level, msg, data },
    ]);

  /* ── 本地存储 ── */
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

  useEffect(() => {
    if (!restored) return;
    const toSave: Record<string, unknown> = {};
    (Object.keys(f) as (keyof FormState)[]).forEach((k) => {
      if (SKIP_PERSIST.has(k as string)) return;
      toSave[k as string] = f[k];
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); } catch {}
  }, [f, restored]);

  /* ── Stripe.js 就绪检测 ── */
  useEffect(() => {
    if (window.Stripe) { setSdkReady("ok"); return; }
    const t = setInterval(() => {
      if (window.Stripe) { setSdkReady("ok"); clearInterval(t); }
    }, 400);
    const timeout = setTimeout(() => {
      if (!window.Stripe) setSdkReady("err");
      clearInterval(t);
    }, 15000);
    return () => { clearInterval(t); clearTimeout(timeout); };
  }, []);

  useEffect(() => () => { try { paymentElRef.current?.destroy?.(); } catch {} }, []);

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

  const effectiveReturnUrl = useMemo(() => {
    if (f.returnUrl.trim()) return f.returnUrl.trim();
    if (!browserInfo) return "";
    return `${window.location.origin}/stripe-demo/complete?session_id={CHECKOUT_SESSION_ID}`;
  }, [f.returnUrl, browserInfo]);

  /** 挂载后才渲染依赖 location 的内容，避免 SSR / 客户端不一致 */
  const displayReturnUrl = browserInfo
    ? (effectiveReturnUrl || "—")
    : "…";

  /* ── 创建 Checkout Session ── */
  const createSession = async () => {
    if (!f.secretKey.trim()) return pushLog("error", "Secret Key 必填（服务端使用，不会暴露给前端）");
    if (!f.publishableKey.trim()) return pushLog("error", "Publishable Key 必填（客户端初始化 Stripe.js 用）");
    if (!effectiveReturnUrl) return pushLog("error", "returnUrl 无法确定");

    setBusy("session");
    pushLog("info", "POST /api/stripe/create-session …");
    const r = await callApi("/api/stripe/create-session", {
      secretKey: f.secretKey.trim(),
      amount: Number(f.amount) || 1000,
      currency: (f.currency || "usd").toLowerCase(),
      productName: f.productName.trim() || "Demo product",
      quantity: Number(f.quantity) || 1,
      mode: f.mode,
      interval: f.interval,
      intervalCount: Number(f.intervalCount) || 1,
      customerEmail: f.customerEmail.trim() || undefined,
      locale: f.locale.trim() || undefined,
      returnUrl: effectiveReturnUrl,
    });
    setBusy(null);
    if (!r.ok) return pushLog("error", `创建 Session 失败 (${r.status})`, r.data);

    setSessionId(r.data?.id ?? "");
    // 存一份到 sessionStorage，供 /stripe-demo/complete 自动查询状态；
    // 仅当前标签页有效，关闭即清除，且不进 localStorage。
    try { sessionStorage.setItem(STORAGE_KEY + ":secret", f.secretKey.trim()); } catch {}
    pushLog("success", `Checkout Session 已创建 · ${r.data?.id ?? "?"}`, {
      id: r.data?.id,
      mode: r.data?.mode,
      amount: r.data?.amount,
      currency: r.data?.currency,
    });
    return r.data;
  };

  /* ── 挂载 Payment Element ── */
  const mountElements = async () => {
    if (!window.Stripe) return pushLog("error", "Stripe.js 尚未加载完成");
    if (!f.publishableKey.trim()) return pushLog("error", "Publishable Key 必填");
    if (!f.secretKey.trim()) return pushLog("error", "Secret Key 必填");

    try {
      setBusy("mount");
      if (paymentElRef.current) { try { paymentElRef.current.destroy(); } catch {} paymentElRef.current = null; }
      actionsRef.current = null;

      // 1) 先拿 client_secret（已有则可复用）
      let clientSecret: string | undefined;
      if (checkoutRef.current && sessionId) {
        pushLog("info", `复用已有 Session · ${sessionId}`);
      } else {
        const created = await createSession();
        if (!created?.clientSecret) { setBusy(null); return; }
        clientSecret = created.clientSecret;
      }

      // 2) 初始化 Stripe.js
      if (!stripeRef.current) {
        stripeRef.current = window.Stripe(f.publishableKey.trim());
        pushLog("info", "Stripe(publishableKey) 已初始化");
      }

      // 3) 初始化 Checkout Elements SDK
      const secretForInit = clientSecret ?? checkoutRef.current?.clientSecret;
      const csPromise = secretForInit
        ? Promise.resolve(secretForInit)
        : fetch("/api/stripe/create-session", { method: "POST" }).then(() => undefined);

      pushLog("info", "stripe.initCheckoutElementsSdk({ clientSecret })");
      checkoutRef.current = stripeRef.current.initCheckoutElementsSdk({
        clientSecret: secretForInit ?? csPromise,
      });

      checkoutRef.current.on("change", (session: any) => {
        const label = session?.total?.total?.amount ?? "";
        setTotalLabel(label);
        setCanConfirm(!!session?.canConfirm);
        pushLog("info", `event: change — total=${label || "?"} canConfirm=${!!session?.canConfirm}`);
      });

      // 4) 挂载 Payment Element
      pushLog("info", "checkout.createPaymentElement() + mount()");
      const pe = checkoutRef.current.createPaymentElement();
      pe.mount("#stripe-payment-element");
      paymentElRef.current = pe;

      // 5) 载入 actions（confirm 用）
      const loaded = await checkoutRef.current.loadActions();
      if (loaded?.type === "error") {
        pushLog("error", "loadActions 失败", loaded.error);
        setBusy(null);
        return;
      }
      actionsRef.current = loaded.actions ?? loaded;
      setMounted(true);
      pushLog("success", "Payment Element 已挂载，actions 已就绪");
    } catch (e: any) {
      pushLog("error", "挂载失败：" + (e?.message || String(e)));
    } finally {
      setBusy(null);
    }
  };

  /* ── 提交支付 ── */
  const confirmPayment = async () => {
    const actions = actionsRef.current;
    if (!actions) return pushLog("error", "请先挂载 Payment Element");

    try {
      setBusy("confirm");
      const opts: any = {};
      if (f.redirectIfRequired) opts.redirect = "if_required";
      pushLog("info", `actions.confirm(${JSON.stringify(opts)}) …`);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("confirm() 超过 60 秒未返回")), 60000)
      );
      const result: any = await Promise.race([actions.confirm(opts), timeout]);

      if (result?.type === "error") {
        pushLog("error", `支付失败 — ${result.error?.message ?? "unknown"}`, result.error);
      } else {
        pushLog("success", "confirm 返回成功（无即时错误）", result);
        if (sessionId) {
          const st = await callApi("/api/stripe/session-status", {
            secretKey: f.secretKey.trim(),
            sessionId,
          });
          if (st.ok) pushLog("info", `Session 状态：${st.data?.status} / payment_status=${st.data?.paymentStatus}`, st.data);
        }
      }
    } catch (e: any) {
      pushLog("error", "confirm 失败：" + (e?.message || String(e)));
    } finally {
      setBusy(null);
    }
  };

  const resetFlow = () => {
    try { paymentElRef.current?.destroy?.(); } catch {}
    paymentElRef.current = null;
    checkoutRef.current = null;
    actionsRef.current = null;
    setMounted(false);
    setCanConfirm(false);
    setTotalLabel("");
    setSessionId("");
    pushLog("info", "已重置（下次挂载会创建新的 Session）");
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    } catch (e: any) { pushLog("warn", "复制失败：" + e.message); }
  };

  const diag = useMemo(() => {
    if (!browserInfo) return null;
    return [
      { ok: true, label: "Stripe.js", detail: sdkReady === "ok" ? "已加载" : sdkReady === "err" ? "加载失败" : "加载中" },
      { ok: !!f.publishableKey.trim(), label: "Publishable Key", detail: f.publishableKey.trim() ? "已填写" : "未填写" },
      { ok: !!f.secretKey.trim(), label: "Secret Key", detail: f.secretKey.trim() ? "已填写（仅存内存）" : "未填写" },
      { ok: window.location.protocol === "https:", label: "HTTPS", detail: window.location.origin },
    ];
  }, [browserInfo, sdkReady, f.publishableKey, f.secretKey]);

  const fieldCls = "input";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="mt-1 text-base font-semibold tracking-tight sm:text-xl">
              Stripe Checkout Sessions + Payment Element · 测试台
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs">
            <span className={`rounded px-2 py-1 ${
              sdkReady === "ok" ? "bg-emerald-100 text-emerald-700"
              : sdkReady === "err" ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
            }`}>
              {sdkReady === "ok" ? "Stripe.js 已就绪" : sdkReady === "err" ? "Stripe.js 加载失败" : "Stripe.js 加载中…"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 左：表单 */}
        <div className="min-w-0 space-y-4">
          <Card title="Stripe 密钥（Secret Key 只 POST 给本项目的 /api/stripe/*，不会进前端 SDK）">
            <Row>
              <Field label="Publishable Key">
                <input className="input font-mono" value={f.publishableKey}
                  onChange={(e) => set("publishableKey", e.target.value)}
                  placeholder="pk_test_…" autoComplete="off" spellCheck={false} />
              </Field>
              <Field label="Secret Key（不写入本地存储）">
                <input className="input font-mono" type="password" value={f.secretKey}
                  onChange={(e) => set("secretKey", e.target.value)}
                  placeholder="sk_test_…" autoComplete="off" spellCheck={false} />
              </Field>
            </Row>
          </Card>

          <Card title="商品与金额">
            <Row>
              <Field label="productName">
                <input className="input" value={f.productName}
                  onChange={(e) => set("productName", e.target.value)} />
              </Field>
              <Field label="amount（最小货币单位，1000 = $10.00）">
                <input className="input" value={f.amount}
                  onChange={(e) => set("amount", e.target.value)} />
              </Field>
              <Field label="currency">
                <select className="input" value={f.currency}
                  onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </Field>
              <Field label="quantity">
                <input className="input" value={f.quantity}
                  onChange={(e) => set("quantity", e.target.value)} />
              </Field>
              <Field label="mode">
                <select className="input" value={f.mode}
                  onChange={(e) => set("mode", e.target.value as any)}>
                  <option value="payment">payment（单次付款）</option>
                  <option value="subscription">subscription（订阅）</option>
                </select>
              </Field>
              {f.mode === "subscription" && (
                <>
                  <Field label="recurring.interval">
                    <select className="input" value={f.interval}
                      onChange={(e) => set("interval", e.target.value as any)}>
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                  </Field>
                  <Field label="recurring.interval_count">
                    <input className="input" value={f.intervalCount}
                      onChange={(e) => set("intervalCount", e.target.value)} />
                  </Field>
                </>
              )}
              <Field label="customer_email（可选）">
                <input className="input" value={f.customerEmail}
                  onChange={(e) => set("customerEmail", e.target.value)}
                  placeholder="customer@example.com" />
              </Field>
              <Field label="locale（可选）">
                <input className="input" value={f.locale}
                  onChange={(e) => set("locale", e.target.value)}
                  placeholder="zh / en / auto" />
              </Field>
            </Row>
          </Card>

          <Card title="结算">
            <Field label="return_url（留空则自动使用本页域名下的 /stripe-demo/complete）">
              <input className="input font-mono" value={f.returnUrl}
                onChange={(e) => set("returnUrl", e.target.value)}
                placeholder="/stripe-demo/complete?session_id={CHECKOUT_SESSION_ID}" />
            </Field>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={createSession} disabled={busy === "session"} className="btn-secondary">
                {busy === "session" ? "…" : "① 创建 Checkout Session"}
              </button>
              <button onClick={mountElements} disabled={busy === "mount"} className="btn-primary">
                {busy === "mount" ? "…" : "② 创建并挂载 Payment Element"}
              </button>
              <button onClick={resetFlow} className="btn">重置</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              ② 会先建 Session 再挂载。若已有 Session 则会复用；换金额请先点「重置」。
            </p>
          </Card>

          <Card title="支付">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={confirmPayment}
                disabled={!mounted || busy === "confirm"}
                className="btn-primary"
              >
                {busy === "confirm" ? "…" : totalLabel ? `支付 ${totalLabel}` : "提交支付 confirm()"}
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={f.redirectIfRequired}
                  onChange={(e) => set("redirectIfRequired", e.target.checked)} />
                redirect: &quot;if_required&quot;（卡支付不跳转）
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              不勾选时，Stripe 默认**总是**跳转到 return_url。测试卡付款建议勾选。
            </p>
          </Card>
        </div>

        {/* 右：预览 + 日志 */}
        <aside className="min-w-0 space-y-4">
          <Card title="Payment Element 预览">
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-3">
              <div id="stripe-payment-element" className="min-h-[120px]" />
              {!mounted && (
                <p className="py-6 text-center text-xs text-slate-400">
                  挂载后 Stripe 的支付表单会出现在这里
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {mounted
                ? `已挂载${totalLabel ? ` · 金额 ${totalLabel}` : ""}${canConfirm ? " · 可提交" : " · 信息未填完"}`
                : "填好密钥后点左侧「② 创建并挂载 Payment Element」"}
            </p>
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
            action={<button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-800">清空</button>}>
            <div className="max-h-72 space-y-2 overflow-auto text-xs">
              {logs.length === 0 && <p className="text-slate-400">还没有事件…</p>}
              {logs.map((l) => (
                <div key={l.id} className="rounded border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                      l.level === "error" ? "bg-red-100 text-red-700"
                      : l.level === "warn" ? "bg-amber-100 text-amber-700"
                      : l.level === "success" ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                    }`}>{l.level}</span>
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

          <Card title="当前会话">
            <div className="space-y-1 text-xs text-slate-600">
              <div><b>session_id</b>：{sessionId || "—"}</div>
              <div><b>total</b>：{totalLabel || "—"}</div>
              <div><b>canConfirm</b>：{String(canConfirm)}</div>
              <div className="break-all"><b>return_url</b>：{displayReturnUrl}</div>
            </div>
            <button
              onClick={() => copyText("sid", sessionId)}
              disabled={!sessionId}
              className="mt-2 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-40"
            >{copiedKey === "sid" ? "已复制" : "复制 session_id"}</button>
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
      <div className="mb-3 flex items-center justify-between gap-2">
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
