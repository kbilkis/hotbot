import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: process.env.ENV_FILE || ".env",
  override: true,
});

export default defineConfig({
  schema: "./src/lib/database/schema.ts",
  out: "./drizzle/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
});
