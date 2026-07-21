/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost:3000', '192.168.1.245:3000', '192.168.1.245'],
};

export default nextConfig;
