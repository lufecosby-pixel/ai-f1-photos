/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Allow Gamma to embed this site
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://gamma.app https://*.gamma.site;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
