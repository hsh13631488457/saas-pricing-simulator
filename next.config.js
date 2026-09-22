/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/airwallex-demo",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.airwallex.com https://o.alicdn.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
              "style-src 'self' 'unsafe-inline' https://*.airwallex.com",
              "img-src 'self' data: https://*.airwallex.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "connect-src 'self' https://*.airwallex.com wss://*.airwallex.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "frame-src 'self' https://*.airwallex.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
      {
        // Stripe 官方要求 Stripe.js 只能从 js.stripe.com 加载
        source: "/stripe-demo/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
              "style-src 'self' 'unsafe-inline' https://*.stripe.com",
              "img-src 'self' data: https://*.stripe.com https://*.stripe.network https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.stripe.network https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "frame-src 'self' https://js.stripe.com https://*.stripe.com https://hooks.stripe.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
