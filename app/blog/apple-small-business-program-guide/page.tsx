import Link from "next/link";

export const metadata = {
  title: "Apple App Store 30% vs 15%: Small Business Program Complete Guide",
  description: "Deep dive into Apple's Small Business Program: how the $1M threshold is measured, when the commission cliff hits, and revenue scenarios from $100K to $1.5M ARR.",
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
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-100 leading-tight">Apple App Store 30% vs 15%: The Complete Small Business Program Guide</h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500">Published August 8, 2026 · 9 min read</p>
          </header>

          <p className="text-lg text-zinc-200">
            The Apple Small Business Program (SBP) sounds simple: earn under $1 million a year, pay a 15% commission instead of 30%. In practice, the mechanics of the threshold — how it&apos;s measured, when it resets, and what triggers the cliff — trip up nearly every indie developer who scales past the mid-six-figure range. This guide walks through the program&apos;s real behavior with worked scenarios from $100K to $1.5M in annual App Store proceeds, so you can plan your growth trajectory without losing $150K to a policy footnote.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">The Basic Rule (And Why It&apos;s Not That Simple)</h2>
          <p>
            Apple announced the App Store Small Business Program in November 2020 and made it live on January 1, 2021. The headline is straightforward: developers earning up to $1 million USD in annual proceeds — that is, revenue <em>after</em> Apple&apos;s commission — pay a reduced 15% commission on paid apps, in-app purchases, and subscriptions. Google Play matched this within months, and the two programs now operate on nearly identical thresholds and mechanics.
          </p>
          <p>
            The nuance that catches everyone off guard is the word <em>proceeds</em>. Apple does not measure your gross App Store revenue, and it does not measure your list-price total. It measures what Apple actually paid out to you across the trailing calendar year — after commission, after refunds, after consumption tax remitted to local authorities. This distinction matters because a developer with $1.15M in gross App Store sales at the 15% rate is still receiving roughly $977K in proceeds — safely under the threshold, even though gross revenue is over $1M.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">How the Threshold Is Actually Measured</h2>
          <p>
            Apple evaluates the $1M threshold on a rolling calendar-year basis, not a trailing-twelve-month basis. The distinction matters most in December: if you cross $1M in proceeds on December 15, you finish the year at the standard 30% rate for the remainder of that calendar year, and your rate for the <em>following</em> calendar year is also 30%. The SBP rate only reactivates in the calendar year <em>after</em> you finish a full year under $1M in proceeds.
          </p>
          <p>
            Here is how the mechanic plays out over three years for a developer whose proceeds grow, spike over threshold, then normalize:
          </p>

          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead className="bg-zinc-800/70">
                <tr className="text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Calendar Year</th>
                  <th className="text-right px-4 py-2.5 font-medium">Proceeds</th>
                  <th className="text-right px-4 py-2.5 font-medium">Rate That Year</th>
                  <th className="text-left px-4 py-2.5 font-medium">Why</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">2024</td><td className="px-4 py-2.5 text-right tabular-nums">$680K</td><td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">15%</td><td className="px-4 py-2.5">Under $1M all year</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">2025</td><td className="px-4 py-2.5 text-right tabular-nums">$1.25M</td><td className="px-4 py-2.5 text-right tabular-nums text-orange-400">15% then 30%</td><td className="px-4 py-2.5">Rate flips to 30% within days of crossing $1M</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">2026</td><td className="px-4 py-2.5 text-right tabular-nums">$820K</td><td className="px-4 py-2.5 text-right tabular-nums text-orange-400">30% all year</td><td className="px-4 py-2.5">Prior year crossed threshold → 30% for full 2026</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">2027</td><td className="px-4 py-2.5 text-right tabular-nums">$820K</td><td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">15%</td><td className="px-4 py-2.5">Full clean year under $1M → SBP reactivates</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            The two-year penalty for briefly crossing the threshold is the single biggest cost trap in the program. A developer who lands $1.05M in a single year — perhaps from a one-time viral moment or a promotional discount that boosted a single quarter — surrenders 15 percentage points of margin for the remainder of that year <em>and</em> the entire following year, even if the following year&apos;s proceeds settle back to $700K. On $700K in proceeds, that extra 15 points is $105K of lost income, purely because of a temporary spike that has already ended.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Revenue Scenarios: What SBP Is Actually Worth</h2>
          <p>
            The intuition &ldquo;15% instead of 30% is a doubling of my take-home&rdquo; is close to correct on the App Store side, but it obscures the impact on total unit economics. Consumption tax, withholding tax in certain markets, and payment fees all layer on top. Below is a normalized comparison at four proceeds levels, assuming a global-average consumption tax of roughly 10% and no market-specific withholding tax:
          </p>

          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead className="bg-zinc-800/70">
                <tr className="text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Annual Gross</th>
                  <th className="text-right px-4 py-2.5 font-medium">Net @ 15% SBP</th>
                  <th className="text-right px-4 py-2.5 font-medium">Net @ 30% Standard</th>
                  <th className="text-right px-4 py-2.5 font-medium">SBP Advantage</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$100K</td><td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">$76,500</td><td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">$63,000</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">+$13,500 / +21.4%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$500K</td><td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">$382,500</td><td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">$315,000</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">+$67,500 / +21.4%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$1M</td><td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">$765,000</td><td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">$630,000</td><td className="px-4 py-2.5 text-right tabular-nums text-teal-300">+$135,000 / +21.4%</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5">$1.5M (over)</td><td className="px-4 py-2.5 text-right tabular-nums">N/A</td><td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">$945,000</td><td className="px-4 py-2.5 text-right tabular-nums text-red-400">Locked at 30% for 2 years</td></tr>
              </tbody>
            </table>
          </div>

          <p>
            The SBP advantage compounds meaningfully at higher proceeds — at $1M in gross App Store sales, the 15 percentage point difference is worth $135K of after-tax income. Over a five-year run at $1M annually with SBP intact, the program is worth roughly $675K to the developer versus the standard 30% path. This is why the two-year cliff on brief overages is so painful: a single $50K overage can cost $150K to $200K in the following calendar year.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Strategic Considerations at the Boundary</h2>
          <p>
            Developers approaching $1M in annual App Store proceeds face a genuine strategic decision that most founders never articulate: do you push through the threshold decisively (making the cliff hurt less as a percentage of total revenue), or do you engineer your business to stay comfortably under it? Both paths are defensible, and both require deliberate financial planning starting well before the threshold is reached.
          </p>
          <p>
            <strong className="text-zinc-100">Push-through strategy.</strong> If your growth trajectory suggests $2M+ in the following year, the SBP protection matters less — you were going to lose it anyway, and the incremental commission cost is offset by the incremental revenue. Push-through developers typically pull promotional discounting forward into Q3/Q4 of the threshold year to accelerate the cross, so the 30% rate applies to as small a portion of the current year as possible.
          </p>
          <p>
            <strong className="text-zinc-100">Stay-under strategy.</strong> If your growth is lumpy or reliant on a single flagship product, staying under $1M has enormous compounding value. Practical tactics include selectively raising prices (higher ARPU without triggering more transactions), pausing paid marketing in Q4 of a threshold year, or restructuring bundled purchases as separate SKUs distributed across multiple Apple developer accounts (only viable if you have legitimate multiple business entities — Apple prohibits gaming the threshold through shell entities).
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">What SBP Does Not Cover</h2>
          <p>
            The 15% rate applies exclusively to consumer transactions on the App Store. It does not extend to enterprise licensing (Volume Purchase Program is separately negotiated), advertising revenue paid through Apple Search Ads, or App Store affiliate commissions. Developers with mixed monetization models — say, a freemium app with in-app purchases plus a paid enterprise tier — need to track which revenue streams count toward the $1M ceiling. Only App Store proceeds count.
          </p>
          <p>
            SBP is also account-scoped, not app-scoped. If your Apple Developer account publishes five apps and their combined proceeds cross $1M, the 30% rate applies to <em>all five</em>, even the ones earning $10K. This is why publishing houses with a portfolio of small games often split them across multiple developer accounts (each with its own legal entity and tax filings) to preserve SBP eligibility on the successful ones without one hit pulling the entire portfolio to 30%.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">The Bottom Line</h2>
          <p>
            The Small Business Program is genuinely generous by industry standards, but it demands active financial management from developers scaling in the $700K–$1.2M range. The two-year lookback penalty makes December revenue timing surprisingly consequential, and the account-scoped nature means portfolio-level planning is often more important than any single app&apos;s trajectory.
          </p>
          <p>
            Use the <Link href="/" className="text-teal-400 hover:text-teal-300 underline">simulator on the home page</Link> to model your specific proceeds distribution across markets and see the SBP advantage in dollars, not percentages. Toggle the SBP switch and watch how the cliff appears — it automatically disables above the $1M annualized threshold, matching Apple&apos;s own logic.
          </p>

          <div className="mt-10 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400">
            <p><strong className="text-zinc-200">Disclaimer:</strong> This article is for informational purposes only and does not constitute tax, legal, or financial advice. Program terms and thresholds can change; verify current policy with Apple&apos;s official App Store Small Business Program documentation before making business decisions.</p>
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
