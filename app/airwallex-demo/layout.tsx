import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Airwallex Apple Pay Demo",
  description: "Sandbox tester for Airwallex applePayButton element",
  robots: { index: false, follow: false },
};

export default function AirwallexDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://static.airwallex.com/components/sdk/v1/index.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
