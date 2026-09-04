import Link from "next/link";

export const metadata = {
  title: "How to Integrate Stripe & PayPal in a Next.js SaaS: Complete Developer Guide",
  description: "Step-by-step guide to integrating Stripe and PayPal payments in a Next.js 14 App Router SaaS — Payment Intents, PayPal Orders API, webhooks, environment variables, and production pitfalls.",
};

export default function Post() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4v4h4V4H3z"/><path d="M10 8v4h4V8h-4z"/><path d="M17 12v4h4v-4h-4z"/><path d="M13 20v-4"/><path d="M19 16v4"/></svg>
          </div>
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
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-100 leading-tight">How to Integrate Stripe &amp; PayPal in a Next.js SaaS: Complete Developer Guide</h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500">Published August 8, 2026 · 13 min read</p>
          </header>

          <p className="text-lg text-zinc-200">
            Almost every web-based SaaS ends up needing both Stripe and PayPal — Stripe for its superior card economics and clean developer experience, PayPal for the customer segments that only complete a purchase when they see that familiar blue button. This guide walks through a production-ready integration of both platforms in a Next.js 14 App Router application: client-side checkout UIs, server-side verification, webhooks, environment variables, test mode, and the six pitfalls that take most teams hours to debug. You&apos;ll be able to ship a dual-provider checkout that handles subscriptions, one-time purchases, and webhook-driven fulfillment.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Prerequisites</h2>
          <p>
            Install the official SDKs for both platforms and confirm your Next.js version is 14+ with the App Router:
          </p>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>npm install @stripe/stripe-js @stripe/stripe-node @paypal/react-paypal-js

# Add your keys to .env.local (never commit these)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=test-client-id</code></pre>
          </div>
          <p>
            The rule that keeps you safe: anything starting with <code className="text-teal-300">NEXT_PUBLIC_</code> reaches the browser; anything without that prefix stays server-only. Keep your Stripe secret key, webhook secret, and anything that can move money out of client components.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Part 1: Stripe Integration (Payment Intents)</h2>
          <p>
            Stripe&apos;s recommended flow for tracking a payment through your own backend is Payment Intents. The pattern is: the client requests a payment intent from your server, the server creates it with the amount and currency, the client confirms it with the card details, and your server verifies the outcome via webhook. Never build the amount client-side — that is how overcharge and tampering bugs happen.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">1a. Create the Payment Intent (server)</h3>
          <p>
            In App Router, define a route handler at <code className="text-teal-300">app/api/create-payment-intent/route.ts</code>:
          </p>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>{`import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { amount, currency = "usd" } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,              // in cents: $20.00 -> 2000
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { source: "saas-checkout" },
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}`}</code></pre>
          </div>
          <p>
            The amount must be in the smallest currency unit — cents for USD, not dollars. A $20 subscription is <code className="text-teal-300">2000</code>, and getting this wrong produces payments that are a hundred times too large or too small.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">1b. Confirm on the client</h3>
          <p>
            On the checkout page, load Stripe.js and confirm the payment with the card element:
          </p>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>{`"use client";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function Checkout() {
  async function pay() {
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount: 2000 }),
    });
    const { clientSecret } = await res.json();
    const stripe = await stripePromise;
    await stripe!.confirmPayment({
      elements: stripe!.elements(),
      clientSecret,
      confirmParams: { return_url: window.location.origin + "/success" },
    });
  }
  return <button onClick={pay}>Pay $20.00</button>;
}`}</code></pre>
          </div>
          <p>
            The card input itself is typically a Stripe <code className="text-teal-300">PaymentElement</code> mounted into a container div, which handles PCI compliance by keeping card data inside Stripe&apos;s iframe. You never touch raw card numbers.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">1c. Verify with a webhook (server)</h3>
          <p>
            Webhooks are the source of truth for whether a payment actually succeeded. Never trust the client&apos;s return to the success page alone — the user can close the browser mid-confirmation. Handle <code className="text-teal-300">payment_intent.succeeded</code> in a route handler:
          </p>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>{`import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const event = stripe.webhooks.constructEvent(
    await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!
  );
  if (event.type === "payment_intent.succeeded") {
    // grant access / provision the account
  }
  return Response.json({ received: true });
}`}</code></pre>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Part 2: PayPal Integration (Orders API)</h2>
          <p>
            PayPal&apos;s modern flow uses the Orders API. The client fires a create-order request to your server, the server returns an order ID, the client renders the Smart Buttons which capture the payment, and your server verifies via webhook. The <code className="text-teal-300">@paypal/react-paypal-js</code> package provides the button UI as a React component.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">2a. Create an order (server)</h3>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>{`// app/api/create-paypal-order/route.ts
const PAYPAL_BASE = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getToken() {
  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
  ).toString("base64");
  const res = await fetch(PAYPAL_BASE + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + auth },
    body: "grant_type=client_credentials",
  });
  return (await res.json()).access_token;
}

export async function POST() {
  const token = await getToken();
  const res = await fetch(PAYPAL_BASE + "/v2/checkout/orders", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: "20.00" },
      }],
    }),
  });
  const order = await res.json();
  return Response.json({ id: order.id });
}`}</code></pre>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">2b. Render the Smart Buttons (client)</h3>
          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <pre className="text-xs sm:text-sm p-4 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-relaxed"><code>{`"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function PayPalCheckout() {
  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: "USD",
    }}>
      <PayPalButtons
        createOrder={async () => {
          const r = await fetch("/api/create-paypal-order", { method: "POST" });
          const { id } = await r.json();
          return id;
        }}
        onApprove={async (data) => {
          await fetch("/api/capture-paypal-order", {
            method: "POST",
            body: JSON.stringify({ orderId: data.orderID }),
          });
          window.location.href = "/success";
        }}
      />
    </PayPalScriptProvider>
  );
}`}</code></pre>
          </div>
          <p>
            The capture step (<code className="text-teal-300">/api/capture-paypal-order</code>) should be idempotent on your side and only grant access after PayPal confirms the capture succeeded. Like Stripe, treat the webhook as your source of truth for fulfillment.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Part 3: The Six Pitfalls That Break Integrations</h2>
          <p>
            These are the issues that consistently trip up developers on their first dual-provider rollout:
          </p>

          <div className="overflow-x-auto my-6 border border-zinc-700/50 rounded-lg -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead className="bg-zinc-800/70">
                <tr className="text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Pitfall</th>
                  <th className="text-left px-4 py-2.5 font-medium">Why It Happens</th>
                  <th className="text-left px-4 py-2.5 font-medium">Fix</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">Trusting the client success page</td><td className="px-4 py-2.5">User may close the tab mid-payment</td><td className="px-4 py-2.5">Verify via webhook, not page redirect</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">Hardcoding amount client-side</td><td className="px-4 py-2.5">Easier to write, but tamperable</td><td className="px-4 py-2.5">Always derive amount on the server</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">Forgetting test vs live modes</td><td className="px-4 py-2.5">Sandbox keys and live keys look identical</td><td className="px-4 py-2.5">Separate env vars per environment</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">No webhook verification</td><td className="px-4 py-2.5">Anyone can POST a fake event</td><td className="px-4 py-2.5">Verify signature on both platforms</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">Webhook endpoint not secured</td><td className="px-4 py-2.5">Missing auth on the route</td><td className="px-4 py-2.5">Check signature in every POST handler</td></tr>
                <tr className="border-t border-zinc-700/30"><td className="px-4 py-2.5 text-zinc-200">Not idempotent capture</td><td className="px-4 py-2.5">Double-tap on the pay button</td><td className="px-4 py-2.5">Guard with order-id lookup before granting</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 pt-4">Choosing Which to Default To</h2>
          <p>
            As covered in our <Link href="/blog/stripe-vs-paypal-saas-independent" className="text-teal-400 hover:text-teal-300 underline">Stripe vs PayPal cost comparison</Link>, the economics usually favor Stripe by roughly 0.6% + $0.19 per transaction. The practical pattern for most SaaS is: show Stripe as the primary option and PayPal as a secondary "or pay with PayPal" button below it. This captures Stripe&apos;s better pricing on most transactions while preserving conversion for the significant minority of buyers — heavily concentrated in Germany, the Netherlands, and Latin America — who will only complete a purchase if PayPal is available.
          </p>
          <p>
            Once your checkout is live, you&apos;ll want to know what different providers actually cost you end-to-end. That&apos;s exactly what the <Link href="/" className="text-teal-400 hover:text-teal-300 underline">home-page revenue simulator</Link> models: toggle Platform between Stripe and PayPal, set your typical unit price and transaction count, and the commission line updates in real time so you can see the fee delta across your pricing tiers.
          </p>

          <div className="mt-10 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400">
            <p><strong className="text-zinc-200">Disclaimer:</strong> This guide is for informational purposes only and reflects the SDKs and API patterns as of the publish date. Payment platform APIs evolve; always verify against the current official Stripe and PayPal documentation before shipping. Test all flows thoroughly in sandbox mode before going live.</p>
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
