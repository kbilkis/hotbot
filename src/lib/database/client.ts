import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

// Create the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required but not provided"
  );
}

// Create Neon serverless pool
const pool = new Pool({ connectionString });

// Create Drizzle database instance with schema
export const db = drizzle(pool, { schema });

// Export the pool for direct access if needed
export { pool };

// Type-safe database instance
export type Database = typeof db;

// Connection health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown utility
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log("Database connection pool closed gracefully");
  } catch (error) {
    console.error("Error closing database connection pool:", error);
  }
}
