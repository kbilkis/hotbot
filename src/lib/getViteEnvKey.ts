/**
 * Universal environment variable getter for Vite apps
 * Works in both client (browser) and server (Node.js/Cloudflare Workers) contexts
 */
export const getViteEnvKey = (key: string): string => {
  // Client-side (browser) - use import.meta.env
  if (typeof window !== "undefined") {
    return (import.meta.env as any)[key];
  }

  // Server-side (Node.js/Cloudflare Workers) - try both process.env and import.meta.env
  return process.env[key] || (import.meta.env as any)?.[key];
};
