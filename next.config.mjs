/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow three/webgpu and three/tsl ESM subpath exports to be bundled
  transpilePackages: ["three"],
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    esmExternals: "loose",
  },
}

export default nextConfig
