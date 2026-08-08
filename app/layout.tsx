import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global SaaS & App Revenue Simulator",
  description: "Simulate app store commissions, VAT, and withholding tax (WHT) across global markets in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
