/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Type errors still fail the build (we want correctness); skip lint-only failures.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
