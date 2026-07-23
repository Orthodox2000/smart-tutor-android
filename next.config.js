/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost:3000', '192.168.1.245:3000', '192.168.1.38'],
};

export default nextConfig;
