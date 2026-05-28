import type { NextConfig } from "next";

// Set REPO_NAME env var to your GitHub repo name if deploying to username.github.io/repo-name
// Leave empty if deploying to username.github.io (root)
const basePath = process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
