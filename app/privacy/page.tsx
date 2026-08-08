import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Global App & SaaS Revenue Simulator",
  description: "Privacy policy for the Global App & SaaS Revenue Simulator.",
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-zinc-100">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 mt-2">Last updated: August 8, 2026</p>
          </div>

          <p>
            This Privacy Policy describes how the Global App &amp; SaaS Revenue Simulator (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) handles information when you use our web-based calculator. We designed the Service with privacy as a first principle: it runs entirely in your browser and does not require any account, login, or personal information to function.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">1. Information We Do Not Collect</h2>
          <p>
            We do not collect, store, or transmit any of the values you enter into the simulator — including unit price, transaction count, selected markets, developer entity, or platform choice. All calculations are performed locally in your browser using JavaScript, and no computed results are sent to any server.
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>We do not require registration or an account.</li>
            <li>We do not collect names, email addresses, or contact details.</li>
            <li>We do not use tracking cookies or fingerprinting techniques.</li>
            <li>We do not sell, share, or transfer any user data to third parties, because we do not collect any.</li>
          </ul>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">2. Server Logs</h2>
          <p>
            Like most websites, our hosting provider may automatically record standard access logs when you visit the Service — including your IP address, browser type, referring page, and timestamp of requests. These logs are used solely for security monitoring, abuse prevention, and aggregate traffic analysis. They are not linked to any personal identity and are retained only for the period required by our hosting provider&apos;s standard configuration.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">3. Cookies &amp; Local Storage</h2>
          <p>
            The Service does not set any cookies. We do not use local storage or session storage to persist your inputs between visits — reloading the page resets all fields to their defaults. If a future version introduces optional preference persistence (such as a &ldquo;save my defaults&rdquo; toggle), such data would be stored exclusively in your browser&apos;s local storage and would never be transmitted to us.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">4. Third-Party Services</h2>
          <p>
            The Service does not embed third-party analytics, advertising networks, social media widgets, or tracking pixels. No external scripts run on the calculator page beyond the Next.js runtime and React framework required to render the interface.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">5. Children&apos;s Privacy</h2>
          <p>
            The Service is a professional tool intended for software developers and business operators. It is not directed at children under the age of 13, and we do not knowingly collect information from any user in that age group. Because we collect no personal information from any user, no special handling is required.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in the Service or applicable regulations. The &ldquo;Last updated&rdquo; date at the top of this page will always indicate the effective version. Material changes will be highlighted on the home page for a reasonable notice period.
          </p>

          <h2 className="text-xl font-semibold text-zinc-100 pt-4">7. Contact</h2>
          <p>
            Questions about this Privacy Policy can be directed to the site operator via the contact information published on the home page footer. Because we do not maintain a user database, we cannot respond to requests for data access, correction, or deletion — there is simply no personal data associated with your visits.
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
