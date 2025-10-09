import { Hono } from "hono";

// Extract Sentry configuration from environment
const FE_SENTRY_DSN = process.env.SENTRY_FE_DSN;
const sentryUrl = FE_SENTRY_DSN ? new URL(FE_SENTRY_DSN) : null;
const SENTRY_HOST = sentryUrl?.hostname || "";
const SENTRY_PROJECT_ID = sentryUrl?.pathname?.replace("/", "") || "";

const tunnel = new Hono().post("/", async (c) => {
  try {
    // Get the raw request body as ArrayBuffer
    const envelopeBytes = await c.req.arrayBuffer();
    const envelope = new TextDecoder().decode(envelopeBytes);

    // Parse the first line to get the header
    const piece = envelope.split("\n")[0];
    const header = JSON.parse(piece);
    const dsn = new URL(header["dsn"]);
    const project_id = dsn.pathname?.replace("/", "");
    // Validate the Sentry hostname
    if (dsn.hostname !== SENTRY_HOST) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
    }

    // Validate the project ID
    if (!project_id || project_id !== SENTRY_PROJECT_ID) {
      throw new Error(`Invalid sentry project id: ${project_id}`);
    }

    // Forward the request to Sentry
    const upstream_sentry_url = `https://${SENTRY_HOST}/api/${project_id}/envelope/`;

    const response = await fetch(upstream_sentry_url, {
      method: "POST",
      body: envelopeBytes,
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
    });

    if (!response.ok) {
      throw new Error(`Sentry API responded with status: ${response.status}`);
    }

    return c.json({}, { status: 200 });
  } catch (e) {
    console.error("Error tunneling to sentry:", e);
    return c.json({ error: "Error tunneling to sentry" }, { status: 500 });
  }
});

export default tunnel;
