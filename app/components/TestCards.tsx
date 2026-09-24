"use client";

import { useState } from "react";

export interface TestCard {
  label: string;
  number: string;
  expiry: string;
  cvc: string;
  note?: string;
  /** 是否需要在卡号输入框里逐段键入（用于把卡号复制进 iframe） */
  highlight?: boolean;
}

/**
 * 测试卡号速查表。点击某一行会把卡号复制到剪贴板，
 * 因为 Airwallex / Stripe 的卡号输入框都在 iframe 里，脚本无法直接填值。
 */
export function TestCards({ cards, title }: { cards: TestCard[]; title?: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (c: TestCard) => {
    try {
      await navigator.clipboard.writeText(c.number.replace(/\s/g, ""));
      setCopied(c.number);
      setTimeout(() => setCopied((v) => (v === c.number ? null : v)), 1500);
    } catch {}
  };

  return (
    <div>
      {title && <p className="mb-2 text-xs font-medium text-slate-700">{title}</p>}
      <div className="space-y-1">
        {cards.map((c) => (
          <div
            key={c.number + c.label}
            className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
          >
            <span className="min-w-[7rem] font-medium text-slate-700">{c.label}</span>
            <code className="font-mono text-slate-900">{c.number}</code>
            <span className="text-slate-500">
              {c.expiry} · CVV {c.cvc}
            </span>
            {c.note && <span className="text-slate-400">{c.note}</span>}
            <button
              onClick={() => copy(c)}
              className="ml-auto shrink-0 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-slate-400"
            >
              {copied === c.number ? "已复制" : "复制卡号"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        卡号输入框在第三方 iframe 内，脚本无法代填 —— 点「复制卡号」后手动粘贴即可。
        过期日期与 CVC 在沙箱不校验，填任意未来日期和 3 位数字都行。
      </p>
    </div>
  );
}

/* ────────── 两家的测试卡 ────────── */

export const AIRWALLEX_CARDS: TestCard[] = [
  { label: "支付成功", number: "4012000300001003", expiry: "12/34", cvc: "123" },
  { label: "触发 3DS", number: "4012001038443335", expiry: "12/34", cvc: "123" },
  { label: "余额不足", number: "4000000000000010", expiry: "12/34", cvc: "123" },
];

export const STRIPE_CARDS: TestCard[] = [
  { label: "支付成功", number: "4242424242424242", expiry: "12/34", cvc: "123", note: "邮编任意" },
  { label: "需要 3DS",  number: "4000002500003155", expiry: "12/34", cvc: "123", note: "邮编任意" },
  { label: "被拒绝",    number: "4000000000009995", expiry: "12/34", cvc: "123", note: "邮编任意" },
];
