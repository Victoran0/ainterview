import type { NextConfig } from "next";

// next.config.mjs (if you're using ES Modules for config)
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    // This option allows you to opt-out specific packages from being bundled by Webpack.
    // They will be resolved at runtime from node_modules.
    serverExternalPackages: ['pdf-parse', 'mammoth', 'formidable', 'canvas'],
    // 'canvas' is often a hidden dependency for pdfjs-dist (used by pdf-parse) on the server.
    // 'mammoth' and 'formidable' might also benefit from this if they cause similar issues,
    // though pdf-parse is the most common culprit for this specific error pattern.
  // ... any other configurations you have
};

export default nextConfig;