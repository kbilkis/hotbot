import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { users, type User, type NewUser } from "../schema.js";

/**
 * Create a new user or update existing user based on Clerk ID
 */
export async function upsertUser(userData: {
  clerkId: string;
  email: string;
}): Promise<User> {
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

/**
 * Get user by database ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user || null;
}

/**
 * Update user information
 */
export async function updateUser(
  id: number,
  updates: Partial<Pick<User, "email">>
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return user || null;
}

/**
 * Delete user and all associated data (cascading delete)
 */
export async function deleteUser(id: number): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id));
  return result.rowCount > 0;
}
