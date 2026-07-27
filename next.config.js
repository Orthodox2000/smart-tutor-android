import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, 'src', 'app', 'api');
const apiExists = fs.existsSync(apiDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: (process.env.CAPACITOR_BUILD === 'true' && !apiExists) ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost:3000', '192.168.1.38'],
};

export default nextConfig;
