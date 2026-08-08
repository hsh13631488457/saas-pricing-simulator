import Link from "next/link";

export const metadata = {
  title: "Stripe vs PayPal for SaaS: Which Payment Platform Actually Costs Less?",
  description: "A break-even analysis of 2.9% + $0.30 vs 3.49% + $0.49 across pricing tiers, plus the hidden fees — currency conversion, chargebacks, dispute rates — that separate the two platforms.",
};

export default function Post() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-900 shrink-0">G$</div>
          <h1 className="text-sm sm:text-lg font-semibold tracking-tight truncate">
            <span className="sm:hidden">Revenue Simulator</span>
            <span className="hidden sm:inline">Global App &amp; SaaS Revenue Simulator</span>
          </h1>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/blog" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">← Back to Blog</Link>

        <article className="mt-6 space-y-5 sm:space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <header>
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-100 leading-tight">Stripe vs PayPal for SaaS: Which Payment Platform Actually Costs Less?</h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500">Published August 8, 2026 · 10 min read</p>
          </header>

          <p className="text-lg text-zinc-200">
            Stripe and PayPal are the two default payment platforms for web-based SaaS and indie software businesses, and the pricing looks superficially similar. Stripe charges 2.9% + $0.30 per successful card transaction; PayPal charges 3.49% + $0.49 for its commercial transaction rate. On a $20 subscription payment, Stripe takes $0.88 and PayPal takes $1.19 — a $0.31 difference that feels trivial. But the real cost gap between the two platforms only becomes visible when you look at the pricing curve across transaction sizes, factor in the operational realities of currency conversion, dispute handling, and account stability, and account for the customer segments each platform genuinely serves better. This article works through all of that with numbers, not vibes.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">The Headline Rates — And What They Miss</h2>
          <p>
            Both platforms publish clean-looking domestic rate cards that assume a US-based business processing US-issued cards in US dollars. In that narrow scenario, the comparison is exactly what the pricing pages say:
          </p>

          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead className="bg-zinc-800/70">
                <tr className="text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Platform</th>
                  <th className="text-right px-4 py-2.5 font-medium">Percentage</th>
                  <th className="text-right px-4 py-2.5 font-medium">Fixed Fee</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">Stripe (domestic card)</td><td className="px-4 py-2.5 text-right tabular-nums">2.9%</td><td className="px-4 py-2.5 text-right tabular-nums">$0.30</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">PayPal (commercial)</td><td className="px-4 py-2.5 text-right tabular-nums">3.49%</td><td className="px-4 py-2.5 text-right tabular-nums">$0.49</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            Stripe wins on both dimensions. But those numbers don&apos;t answer the question SaaS founders actually care about: which platform costs less <em>on the transactions I actually process</em>?
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">The Break-Even Analysis Across Pricing Tiers</h2>
          <p>
            The percentage-plus-fixed structure means the two platforms&apos; fee curves have very different shapes. At micro-transaction sizes, the fixed fee dominates and both platforms look expensive relative to the transaction. At larger transaction sizes, the percentage dominates and the fixed fee becomes negligible. Here&apos;s what the fees look like across the range of SaaS pricing that most independent businesses actually charge:
          </p>

          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead className="bg-zinc-800/70">
                <tr className="text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Transaction Amount</th>
                  <th className="text-right px-4 py-2.5 font-medium">Stripe Fee</th>
                  <th className="text-right px-4 py-2.5 font-medium">PayPal Fee</th>
                  <th className="text-right px-4 py-2.5 font-medium">Diff</th>
                  <th className="text-right px-4 py-2.5 font-medium">Stripe Effective %</th>
                  <th className="text-right px-4 py-2.5 font-medium">PayPal Effective %</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$5.00</td><td className="px-4 py-2.5 text-right tabular-nums">$0.45</td><td className="px-4 py-2.5 text-right tabular-nums">$0.66</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$0.22</td><td className="px-4 py-2.5 text-right tabular-nums">8.90%</td><td className="px-4 py-2.5 text-right tabular-nums text-red-400">13.24%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$10.00</td><td className="px-4 py-2.5 text-right tabular-nums">$0.59</td><td className="px-4 py-2.5 text-right tabular-nums">$0.84</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$0.25</td><td className="px-4 py-2.5 text-right tabular-nums">5.90%</td><td className="px-4 py-2.5 text-right tabular-nums">8.39%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$20.00</td><td className="px-4 py-2.5 text-right tabular-nums">$0.88</td><td className="px-4 py-2.5 text-right tabular-nums">$1.19</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$0.31</td><td className="px-4 py-2.5 text-right tabular-nums">4.40%</td><td className="px-4 py-2.5 text-right tabular-nums">5.94%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$49.00</td><td className="px-4 py-2.5 text-right tabular-nums">$1.72</td><td className="px-4 py-2.5 text-right tabular-nums">$2.20</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$0.48</td><td className="px-4 py-2.5 text-right tabular-nums">3.51%</td><td className="px-4 py-2.5 text-right tabular-nums">4.49%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$99.00</td><td className="px-4 py-2.5 text-right tabular-nums">$3.17</td><td className="px-4 py-2.5 text-right tabular-nums">$3.94</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$0.77</td><td className="px-4 py-2.5 text-right tabular-nums">3.20%</td><td className="px-4 py-2.5 text-right tabular-nums">3.98%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$499.00</td><td className="px-4 py-2.5 text-right tabular-nums">$14.77</td><td className="px-4 py-2.5 text-right tabular-nums">$17.90</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">−$3.13</td><td className="px-4 py-2.5 text-right tabular-nums">2.96%</td><td className="px-4 py-2.5 text-right tabular-nums">3.59%</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            The pattern is unambiguous: Stripe is cheaper at every transaction size. On a $10 monthly subscription, PayPal costs 43% more per transaction than Stripe ($0.84 vs $0.59). On a $99 annual plan, the gap narrows to 24% ($3.94 vs $3.17). At scale — say, 1,000 monthly $20 subscriptions — the fee difference alone is $310/month, or $3,720/year. For a bootstrapped indie SaaS, that&apos;s more than the annual salary of a part-time contractor.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">The Hidden Costs: Where the Real Gap Widens</h2>
          <p>
            The headline rates only apply to a specific transaction profile. Once you introduce international customers, currency conversion, disputes, and micropayments, the platforms diverge substantially.
          </p>

          <p>
            <strong className="text-zinc-100">International cards.</strong> Stripe adds 1.5% for international cards (cards issued outside your account country) plus another 1% if currency conversion is required. PayPal adds 1.5% for international commercial transactions plus 3–4% currency conversion spread built into the FX rate. For a US-based SaaS serving 30% international customers, Stripe&apos;s all-in international cost is roughly 5.4% (2.9% + 1.5% + 1%); PayPal&apos;s is closer to 8.5% once the FX spread is included. On $100K of international revenue, that&apos;s a $3,100/year difference.
          </p>

          <p>
            <strong className="text-zinc-100">Currency conversion.</strong> Stripe uses mid-market rates plus a fixed 1% conversion fee. PayPal uses its own inflated conversion rate (typically 3–4% worse than mid-market) and does not itemize the spread as a separate fee — it&apos;s hidden inside the exchange rate you receive. This makes PayPal look artificially cheaper on invoices while being materially more expensive in practice. Multi-currency SaaS businesses often discover this only after year one, when they reconcile Stripe payouts to PayPal payouts and find the &ldquo;equivalent&rdquo; revenue produced dramatically different USD deposits.
          </p>

          <p>
            <strong className="text-zinc-100">Chargebacks and disputes.</strong> Stripe charges $15 per chargeback (waived if you win the dispute). PayPal charges $20 per chargeback plus keeps the transaction fee even if you win. PayPal&apos;s dispute resolution process is notoriously buyer-favorable — many merchants report win rates below 30%, versus 60%+ on Stripe with proper documentation. For a SaaS with a 0.5% chargeback rate, this shifts annual cost by another 20–40 basis points of gross revenue.
          </p>

          <p>
            <strong className="text-zinc-100">Micropayment pricing.</strong> PayPal offers a specific &ldquo;micropayments&rdquo; tier of 4.99% + $0.09 for transactions under $10, which is genuinely cheaper than Stripe for very small purchases (below roughly $5). Stripe does not offer an equivalent tier without a custom deal. For a business selling $1–$3 in-app top-ups at high volume, PayPal micropayments is one of the few scenarios where PayPal is unambiguously cheaper.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Account Stability: The Cost You Can&apos;t Model</h2>
          <p>
            Every SaaS founder eventually hears the horror story: PayPal froze the account, held 30% of the balance for 180 days, and offered no explanation beyond a generic risk-review email. These stories are not folklore — PayPal&apos;s account holds and rolling reserves affect a meaningful minority of merchants, particularly those in high-risk categories (digital goods, subscription services, cross-border sales) or those experiencing rapid revenue growth. The financial impact is severe: a 30% rolling reserve on $50K/month in revenue means $15K/month tied up for six months, or $90K of working capital effectively frozen.
          </p>
          <p>
            Stripe is not immune to account issues — it also freezes funds and closes accounts, particularly for merchants who fail its Know Your Customer (KYC) verification or trigger fraud model heuristics. But Stripe&apos;s reputation for communication and predictability during risk reviews is materially better than PayPal&apos;s among indie developer communities. This is a soft factor that doesn&apos;t show up in fee tables but shapes long-term platform selection for any business planning to scale past $50K/month.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Where PayPal Still Wins</h2>
          <p>
            Despite Stripe&apos;s pricing and stability advantages, PayPal remains the correct choice in specific segments — and dismissing it entirely leaves money on the table.
          </p>
          <p>
            <strong className="text-zinc-100">Customer preference in certain regions.</strong> PayPal has dominant checkout share in Germany, the Netherlands, and much of Latin America. A SaaS targeting German small businesses that removes PayPal from checkout can see conversion rates drop 15–30% overnight. The extra 0.6% per transaction is worth paying if it&apos;s the difference between a sale and no sale.
          </p>
          <p>
            <strong className="text-zinc-100">Consumer trust for one-time purchases.</strong> First-time buyers of digital goods (indie games, ebooks, courses) often trust PayPal more than they trust an unfamiliar merchant handling their card directly. If your customer acquisition depends on cold traffic converting on first visit, PayPal-as-option (not PayPal-as-only) is standard practice — even Stripe-first businesses typically offer PayPal as a secondary checkout option specifically for the trust anchor.
          </p>
          <p>
            <strong className="text-zinc-100">Micropayment volume.</strong> As noted above, PayPal&apos;s dedicated micropayments tier (4.99% + $0.09) is cheaper than Stripe for transactions under $5. High-volume, low-ticket businesses genuinely benefit.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Practical Recommendation for Independent SaaS</h2>
          <p>
            For the typical bootstrapped SaaS charging $10–$99/month, targeting a global customer base, and prioritizing account stability, the pragmatic default is: <strong className="text-zinc-100">Stripe as primary, PayPal as an optional secondary checkout</strong>. This captures Stripe&apos;s superior economics on the bulk of transactions while preserving conversion on the segment of customers who prefer PayPal specifically. The engineering overhead to support both is modest — Stripe&apos;s and PayPal&apos;s SDKs are both mature, and most modern checkout libraries (or Stripe&apos;s own Checkout link) can present both options side-by-side.
          </p>
          <p>
            If you&apos;re just starting out and want to launch with one platform, Stripe is the safer default across almost every axis: lower fees, more predictable payouts, better documentation, cleaner dispute handling, and better developer tooling. Only pick PayPal-first if your target audience is specifically PayPal-heavy (mainland Germany, informal marketplaces, high consumer-trust dependency).
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Model Your Own Scenario</h2>
          <p>
            The <Link href="/" className="text-teal-400 hover:text-teal-300 underline">simulator on the home page</Link> lets you toggle between Stripe and PayPal as your platform, set a specific transaction count and unit price, and see the exact commission impact on your revenue waterfall across the countries you sell into. Try setting Platform to Stripe with your typical monthly subscription price and transaction count, then switch to PayPal — the Commission line updates in real time. On any non-trivial revenue base, the difference is usually much larger than founders expect.
          </p>

          <div className="mt-10 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400">
            <p><strong className="text-zinc-200">Disclaimer:</strong> Rates cited reflect published US-domestic standard pricing as of the publish date and may not apply to your specific account, region, or transaction profile. Custom pricing is negotiable at scale on both platforms. Verify current terms directly with Stripe and PayPal before finalizing platform decisions.</p>
          </div>
        </article>
      </main>

      <footer className="border-t border-zinc-800 px-4 sm:px-6 py-6 text-center text-sm text-zinc-500">
        <p className="text-xs sm:text-sm">&copy; 2026 Global App &amp; SaaS Revenue Simulator. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm">
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
        </div>
      </footer>
    </div>
  );
}
