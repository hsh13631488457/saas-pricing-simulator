import Link from "next/link";

export const metadata = {
  title: "Blog — Global App & SaaS Revenue Simulator",
  description: "In-depth guides on app store commissions, withholding tax, and payment platform economics for indie developers.",
};

const POSTS = [
  {
    slug: "apple-small-business-program-guide",
    title: "Apple App Store 30% vs 15%: The Complete Small Business Program Guide",
    excerpt: "How the $1M threshold works, when it resets, and what independent developers get wrong about the cliff — with real revenue scenarios from $100K to $1.5M ARR.",
    date: "August 8, 2026",
    readTime: "9 min read",
  },
  {
    slug: "google-play-brazil-wht-deep-dive",
    title: "Google Play Brazil's 35% Withholding Tax: A Deep Dive for Foreign Developers",
    excerpt: "Why Brazil is the world's most expensive market for HK-based developers on Google Play, how the WHT stacks with ISS and platform commission, and what non-HK entity restructuring actually saves.",
    date: "August 8, 2026",
    readTime: "11 min read",
  },
  {
    slug: "stripe-vs-paypal-saas-independent",
    title: "Stripe vs PayPal for SaaS: Which Payment Platform Actually Costs Less?",
    excerpt: "A break-even analysis of 2.9% + $0.30 vs 3.49% + $0.49 across pricing tiers, plus the hidden fees — currency conversion, chargebacks, dispute rates — that separate the two platforms.",
    date: "August 8, 2026",
    readTime: "10 min read",
  },
];

export default function BlogIndexPage() {
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">← Back to Simulator</Link>

        <div className="mt-6 mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100">Blog</h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            Deep-dive guides on platform economics, cross-border taxation, and payment infrastructure for independent software developers and SaaS founders.
          </p>
        </div>

        <div className="space-y-4">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-4 sm:p-6 hover:border-teal-500/50 hover:bg-zinc-800/90 transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-zinc-500 mb-2 flex-wrap">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 group-hover:text-teal-300 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{post.excerpt}</p>
              <div className="mt-3 text-sm text-teal-400 group-hover:text-teal-300 transition-colors">Read article →</div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-800 px-4 sm:px-6 py-6 text-center text-sm text-zinc-500">
        <p className="text-xs sm:text-sm">&copy; 2026 Global App &amp; SaaS Revenue Simulator. All rights reserved.</p>
        <p className="text-[11px] sm:text-xs text-zinc-600 mt-1 px-2">
          Estimates only — not tax, legal, or financial advice. See <Link href="/disclaimer" className="underline hover:text-zinc-400">Disclaimer</Link>.
        </p>
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
