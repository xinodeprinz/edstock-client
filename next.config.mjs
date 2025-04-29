/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true, // 301 redirect (SEO-friendly)
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "edstock-server.vercel.app",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "edstock-server.onrender.com",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5500",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
