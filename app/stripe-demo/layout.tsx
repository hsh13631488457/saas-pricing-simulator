import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stripe Checkout Demo",
  description: "Sandbox tester for the Stripe Checkout Sessions API with Elements",
  robots: { index: false, follow: false },
};

/**
 * Stripe 官方要求 Stripe.js 必须从 js.stripe.com 加载，不能自行打包托管。
 * 这里用 beforeInteractive 保证它在页面脚本执行前就绪。
 */
export default function StripeDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://js.stripe.com/dahlia/stripe.js" strategy="beforeInteractive" />
      <nav className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-7xl gap-1 px-4">
          <Link
            href="/airwallex-demo"
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm text-slate-500 hover:text-slate-800"
          >
            Airwallex
          </Link>
          <span className="whitespace-nowrap border-b-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900">
            Stripe
          </span>
        </div>
      </nav>
      {children}
    </>
  );
}
