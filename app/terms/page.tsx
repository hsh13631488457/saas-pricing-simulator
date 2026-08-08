import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Global App & SaaS Revenue Simulator",
  description: "Terms of service for the Global App & SaaS Revenue Simulator.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-sm text-slate-900 shrink-0">G$</div>
          <h1 className="text-lg font-semibold tracking-tight">Global App &amp; SaaS Revenue Simulator</h1>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">← Back to Simulator</Link>

        <article className="mt-6 space-y-6 text-zinc-300 leading-relaxed">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Terms of Service</h1>
            <p className="text-sm text-zinc-500 mt-2">Last updated: August 8, 2026</p>
          </div>

          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Global App &amp; SaaS Revenue Simulator (&ldquo;the Service&rdquo;). By using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">1. Purpose of the Service</h2>
          <p>
            The Service is a free, browser-based calculator that models the revenue waterfall for digital goods sold through Apple App Store, Google Play, Stripe, and PayPal across multiple international markets. It is intended solely as an informational and planning aid for software developers, indie publishers, and business operators evaluating platform economics.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">2. No Professional Advice</h2>
          <p>
            The Service does not provide tax advice, legal advice, accounting advice, or financial advice of any kind. Consumption tax rates, withholding tax rules, and platform commission schedules change frequently and vary by jurisdiction, entity structure, and business circumstances. You must consult a qualified tax professional, accountant, or attorney licensed in the relevant jurisdiction before making any decisions based on the calculator&apos;s output.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">3. Accuracy of Data</h2>
          <p>
            We strive to keep the tax rates and platform commission data accurate, but we make no representations or warranties regarding accuracy, completeness, or timeliness. The Service&apos;s calculations are illustrative estimates based on published rates as of the &ldquo;Last updated&rdquo; date. Actual withheld amounts, remitted taxes, and net payouts may differ materially due to bilateral tax treaties, promotional rate changes, currency conversion, platform-specific rounding, and other factors outside the scope of the calculator.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">4. Permitted Use</h2>
          <p>
            You may use the Service for personal, commercial, or educational purposes free of charge. You may reference the calculator&apos;s output in your own planning documents or share links to the Service. You may not: (a) attempt to reverse engineer or scrape the underlying data at scale for competing commercial redistribution; (b) misrepresent the Service&apos;s output as official guidance from Apple, Google, Stripe, PayPal, or any tax authority; (c) use the Service in any way that violates applicable law.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">5. Intellectual Property</h2>
          <p>
            The Service&apos;s interface design, source code, and editorial content (including the SEO article and country breakdown methodology) are the property of the site operator. Trademarks referenced in the interface — including &ldquo;App Store&rdquo;, &ldquo;Google Play&rdquo;, &ldquo;Stripe&rdquo;, and &ldquo;PayPal&rdquo; — remain the property of their respective owners. Reference to these platforms is nominative and does not imply endorsement or affiliation.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. In no event shall the site operator be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or reliance on, the Service — including but not limited to lost revenue, tax underpayment penalties, or business decisions made in reliance on calculator output.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">7. Modifications to the Service</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. Tax rates, supported countries, supported platforms, and calculation methodology may be updated to reflect regulatory changes or improved accuracy.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">8. Changes to These Terms</h2>
          <p>
            We may revise these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms. Material changes will be highlighted on the home page for a reasonable notice period.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which the site operator resides, without regard to conflict of law principles. Any disputes shall be resolved in the competent courts of that jurisdiction.
          </p>
        </article>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
        <p>&copy; 2026 Global App &amp; SaaS Revenue Simulator. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
        </div>
      </footer>
    </div>
  );
}
