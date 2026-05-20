/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Uncomment for static export (Capacitor)
  // distDir: 'dist',   // Ensure it matches Capacitor's webDir
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost:3000', '192.168.1.245:3000', '192.168.1.245'],
  experimental: {
    // any experimental features
  },
};

export default nextConfig;
