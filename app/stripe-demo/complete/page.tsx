"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "stripe-demo-v1";

interface SessionInfo {
  id?: string;
  status?: string;
  paymentStatus?: string;
  mode?: string;
  amountTotal?: number;
  currency?: string;
  customerEmail?: string | null;
  paymentIntentId?: string | null;
  paymentIntentStatus?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
}

export default function StripeCompletePage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const query = async (sid: string, sk: string) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const r = await fetch("/api/stripe/session-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: sk, sessionId: sid }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? `查询失败 (${r.status})`);
      setInfo(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 自动读取 URL 里的 session_id
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const sid = new URLSearchParams(window.location.search).get("session_id") ?? "";
    setSessionId(sid);
  }, []);

  // 如果本次会话在测试台填过 Secret Key，尝试自动查询
  useEffect(() => {
    if (!sessionId) return;
    let sk = "";
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY + ":secret");
      if (raw) sk = raw;
    } catch {}
    if (sk) {
      setSecretKey(sk);
      query(sessionId, sk);
    }
  }, [sessionId]);

  const ok = info?.status === "complete";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <h1 className="text-base font-semibold tracking-tight sm:text-xl">
            Stripe 返回页 · 查询 session 状态
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Session 信息</h2>

          <label className="block text-xs text-slate-600">
            <span className="mb-1 block">session_id（已从 URL 自动读取）</span>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs outline-none focus:border-slate-900"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="cs_test_…"
            />
          </label>

          <label className="mt-3 block text-xs text-slate-600">
            <span className="mb-1 block">Secret Key（仅本页内存使用，用于查询状态）</span>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs outline-none focus:border-slate-900"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_…"
            />
          </label>

          <button
            onClick={() => query(sessionId, secretKey)}
            disabled={!sessionId || !secretKey || loading}
            className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            {loading ? "查询中…" : "查询 Session 状态"}
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Secret Key 不会写进本地存储；跳转后若未自动带上，粘贴一次即可。
          </p>
        </section>

        {(info || error) && (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            {error && <p className="text-sm font-medium text-red-700">{error}</p>}

            {info && (
              <>
                <p className={`text-sm font-semibold ${ok ? "text-emerald-700" : "text-amber-700"}`}>
                  {ok
                    ? "支付成功（session.status = complete）"
                    : `未完成（session.status = ${info.status ?? "?"}）`}
                </p>
                <dl className="mt-3 space-y-1 text-xs text-slate-600">
                  <Line k="session_id" v={info.id} />
                  <Line k="status" v={info.status} />
                  <Line k="payment_status" v={info.paymentStatus} />
                  <Line k="mode" v={info.mode} />
                  <Line
                    k="amount_total"
                    v={info.amountTotal != null
                      ? `${info.amountTotal} ${(info.currency ?? "").toUpperCase()}`
                      : undefined}
                  />
                  <Line k="customer_email" v={info.customerEmail} />
                  <Line k="payment_intent_id" v={info.paymentIntentId} />
                  <Line k="payment_intent_status" v={info.paymentIntentStatus} />
                  <Line k="subscription_id" v={info.subscriptionId} />
                  <Line k="subscription_status" v={info.subscriptionStatus} />
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                  生产环境请以 webhook 为准，前端查询只作参考。
                </p>
              </>
            )}
          </section>
        )}

        <a href="/stripe-demo" className="inline-block text-xs text-slate-500 hover:text-slate-800">
          ← 回到 Stripe 测试台
        </a>
      </main>
    </div>
  );
}

function Line({ k, v }: { k: string; v?: string | null }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div className="flex gap-2">
      <dt className="w-44 shrink-0 font-medium text-slate-700">{k}</dt>
      <dd className="break-all">{v}</dd>
    </div>
  );
}
