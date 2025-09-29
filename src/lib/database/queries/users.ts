import { eq } from "drizzle-orm";

import { db } from "../client";
import { User, users } from "../schema";

/**
 * Create a new user or update existing user based on Clerk ID
 */
export async function upsertUser(userData: {
  clerkId: string;
  email: string;
}): Promise<User> {
  // First check if user exists and if data has changed
  const existingUser = await getUserByClerkId(userData.clerkId);

  if (existingUser && existingUser.email === userData.email) {
    // No changes needed, return existing user
    return existingUser;
  }

  const [user] = await db
    .insert(users)
    .values({
      clerkId: userData.clerkId,
      email: userData.email,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: userData.email,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user || null;
}
