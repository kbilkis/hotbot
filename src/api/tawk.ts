import { Hono } from "hono";

import { getCurrentUser } from "../lib/auth/clerk";

const tawkRoutes = new Hono().post("/hash", async (c) => {
  const user = getCurrentUser(c);

  if (!user?.email) {
    throw "User not authenticated or email not available";
  }

  const tawkApiKey = process.env.TAWK_API_KEY;
  if (!tawkApiKey) {
    console.error("TAWK_API_KEY not configured");
    throw "Tawk.to not configured";
  }

  // Generate HMAC-SHA256 hash as per Tawk.to documentation
  const encoder = new TextEncoder();
  const keyData = encoder.encode(tawkApiKey);
  const emailData = encoder.encode(user.email);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, emailData);
  const hash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return c.json({ success: true, userId: user.id, hash });
});

export default tawkRoutes;
