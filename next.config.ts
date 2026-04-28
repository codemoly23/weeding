import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint runs as a separate CI step; FlatCompat + eslint-plugin-react has
  // a known circular-reference serialisation bug that crashes next build.
  eslint: { ignoreDuringBuilds: true },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: "ceremoney.com", // Main domain
      },
      {
        protocol: "https",
        hostname: "cdn.ceremoney.com", // CDN for uploaded files
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com", // AWS S3 uploads
      },
      {
        protocol: "https",
        hostname: "flagcdn.com", // Flag images for language switcher
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash default images for widgets
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Blog post cover images
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // L29: strict-origin-when-cross-origin prevents full URL leaking to cross-origin requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // L28: HSTS — force HTTPS for 2 years, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // L27 + L30: CSP replaces X-Frame-Options via frame-ancestors directive
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' js.stripe.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' data: fonts.gstatic.com",
              "img-src 'self' data: blob: lh3.googleusercontent.com images.unsplash.com flagcdn.com cdn.ceremoney.com *.r2.cloudflarestorage.com *.amazonaws.com",
              "connect-src 'self' *.stripe.com wss: ws:",
              "frame-src 'self' js.stripe.com *.stripe.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
