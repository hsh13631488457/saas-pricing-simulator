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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.airwallex.com https://static-demo.airwallex.com https://checkout-demo.airwallex.com https://o.alicdn.com",
              "style-src 'self' 'unsafe-inline' https://static.airwallex.com https://static-demo.airwallex.com https://checkout-demo.airwallex.com",
              "img-src 'self' data: https://static.airwallex.com https://static-demo.airwallex.com",
              "connect-src 'self' https://api.sandbox.airwallex.com https://threeds.airwallex.com https://pci-api.airwallex.com https://o11y-demo.airwallex.com",
              "frame-src 'self' https://threeds.airwallex.com https://pci-api.airwallex.com",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
