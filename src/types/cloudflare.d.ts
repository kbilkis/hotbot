// Cloudflare Workers global types
declare module "__STATIC_CONTENT_MANIFEST" {
  const value: string;
  export default value;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<{ keys: { name: string }[] }>;
}
