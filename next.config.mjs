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
};

export default nextConfig;
