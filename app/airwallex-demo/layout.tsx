import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Airwallex Apple Pay Demo",
  description: "Sandbox tester for Airwallex applePayButton element",
  robots: { index: false, follow: false },
};

export default function AirwallexDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://static.airwallex.com/components/sdk/v1/index.js" strategy="beforeInteractive" />
      <nav className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-7xl gap-1 px-4">
          <span className="whitespace-nowrap border-b-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900">
            Airwallex
          </span>
          <Link
            href="/stripe-demo"
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm text-slate-500 hover:text-slate-800"
          >
            Stripe
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
