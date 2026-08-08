import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global SaaS & App Revenue Simulator",
  description: "Simulate app store commissions, VAT, and withholding tax (WHT) across global markets in real time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5204624113781742"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
      <GoogleAnalytics gaId="G-ZF08SH29GM" />
    </html>
  );
}
