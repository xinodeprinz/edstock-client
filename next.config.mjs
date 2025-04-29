/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true, // 301 redirect (SEO-friendly)
      },
    ];
  },

  typescript: {
    ignoreBuildErrors:true
  },
  eslint: {
    ignoreDuringBuilds:true
  }
};

export default nextConfig;
