import type { NextConfig } from "next";

const devOrigins = process.env.NODE_ENV === "development"
  ? [
      "http://192.168.1.3",
      "https://192.168.1.3",
      "http://192.168.1.3:3000",
      "https://192.168.1.3:3000",
      "192.168.1.3",
      "192.168.1.3:3000",
    ]
  : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
