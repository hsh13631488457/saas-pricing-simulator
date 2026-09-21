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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.airwallex.com https://static-demo.airwallex.com https://checkout.airwallex.com https://checkout-demo.airwallex.com https://o.alicdn.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
              "style-src 'self' 'unsafe-inline' https://static.airwallex.com https://static-demo.airwallex.com https://checkout.airwallex.com https://checkout-demo.airwallex.com",
              "img-src 'self' data: https://static.airwallex.com https://static-demo.airwallex.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "connect-src 'self' https://api.sandbox.airwallex.com https://threeds.airwallex.com https://pci-api.airwallex.com https://o11y-demo.airwallex.com https://bws.sandbox.airwallex.com wss://bws.sandbox.airwallex.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.google.com https://ep1.adtrafficquality.google",
              "frame-src 'self' https://threeds.airwallex.com https://pci-api.airwallex.com https://checkout.airwallex.com https://checkout-demo.airwallex.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
